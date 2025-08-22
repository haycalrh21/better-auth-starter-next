"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { promoteStudentsSchema, type PromoteStudentsInput } from "../schema";
import { Jenjang } from "@/interface/enums";

/**
 * Fisher-Yates shuffle algorithm for random distribution
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Distribute students evenly across classes
 */
function distributeStudentsEvenly<T>(
  students: T[],
  numberOfClasses: number
): T[][] {
  const shuffled = shuffleArray(students);
  const distribution: T[][] = Array.from({ length: numberOfClasses }, () => []);

  shuffled.forEach((student, index) => {
    const classIndex = index % numberOfClasses;
    distribution[classIndex].push(student);
  });

  return distribution;
}

/**
 * Generate unique class name for promotion
 */
async function generateUniqueClassNameForPromotion(
  grade: number,
  jenjang: Jenjang,
  jurusan: string | undefined,
  tahunAjaran: string,
  semester: string,
  existingNames: string[] = []
): Promise<string> {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let sectionIndex = 0;
  let namaKelas: string;

  do {
    const section = alphabet[sectionIndex];
    if (!section) {
      // If we've exhausted alphabet, use numeric suffix
      const numericSuffix = Math.floor(sectionIndex / 26) + 1;
      const letterIndex = sectionIndex % 26;
      namaKelas = jurusan
        ? `${grade} ${jurusan} ${alphabet[letterIndex]}${numericSuffix}`
        : `${grade}${alphabet[letterIndex]}${numericSuffix}`;
    } else {
      namaKelas = jurusan
        ? `${grade} ${jurusan} ${section}`
        : `${grade}${section}`;
    }

    // Check against existing names in database and current generation
    const existingClass = await prisma.kelas.findFirst({
      where: {
        namaKelas,
        tahunAjaran,
        semester,
      },
    });

    if (!existingClass && !existingNames.includes(namaKelas)) {
      existingNames.push(namaKelas);
      return namaKelas;
    }

    sectionIndex++;
  } while (sectionIndex < 260); // Prevent infinite loop

  throw new Error(
    `Tidak dapat menggenerate nama kelas yang unik untuk grade ${grade}`
  );
}

/**
 * Promote students to next grade with random redistribution
 */
export async function promoteStudents(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());

    // Parse data
    const data: PromoteStudentsInput = {
      ...rawData,
      fromGrade: parseInt(rawData.fromGrade as string),
      toGrade: parseInt(rawData.toGrade as string),
      numberOfClasses: parseInt(rawData.numberOfClasses as string),
      randomDistribution: rawData.randomDistribution === "true",
      deactivateOldClasses: rawData.deactivateOldClasses === "true",
    } as PromoteStudentsInput;

    const parsed = promoteStudentsSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("BAD_REQUEST", {
        message: parsed.error.issues.map((e: any) => e.message).join(", "),
      });
    }

    const validData = parsed.data;

    // Validate that we have the required fields
    if (!validData.fromTahunAjaran || !validData.toTahunAjaran) {
      throw new APIError("BAD_REQUEST", {
        message: "Tahun ajaran asal dan tujuan harus diisi",
      });
    }

    if (!validData.fromGrade || !validData.toGrade) {
      throw new APIError("BAD_REQUEST", {
        message: "Tingkat asal dan tujuan harus diisi",
      });
    }

    if (validData.numberOfClasses < 1) {
      throw new APIError("BAD_REQUEST", {
        message: "Jumlah kelas harus minimal 1",
      });
    }

    // Special case: Check for graduation
    const isGraduation =
      (validData.fromGrade === 9 && validData.jenjang === Jenjang.SMP) ||
      (validData.fromGrade === 12 && validData.jenjang === Jenjang.SMA);

    if (isGraduation) {
      return await graduateStudents(validData, currentUser.id);
    }

    // Get students from previous academic year for promotion
    const studentsToPromote = await prisma.siswa.findMany({
      where: {
        status: "AKTIF",
        kelas: {
          some: {
            tahunAjaran: validData.fromTahunAjaran,
            isActive: validData.deactivateOldClasses ? true : false, // Look at old classes
            namaKelas: {
              startsWith: validData.fromGrade.toString(),
            },
            jenjang: validData.jenjang,
            jurusan: validData.jurusan || undefined,
          },
        },
      },
      include: {
        kelas: {
          where: {
            tahunAjaran: validData.fromTahunAjaran,
            namaKelas: {
              startsWith: validData.fromGrade.toString(),
            },
          },
          select: {
            id: true,
            namaKelas: true,
            jenjang: true,
            jurusan: true,
          },
        },
      },
    });

    if (studentsToPromote.length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: `Tidak ada siswa di grade ${validData.fromGrade} tahun ajaran ${validData.fromTahunAjaran} yang dapat dipromosikan`,
      });
    }

    // Get all available teachers (including those currently assigned)
    // We'll randomize all teachers for the new academic year
    const availableTeachers = await prisma.guru.findMany({
      select: {
        id: true,
        namaLengkap: true,
        nip: true,
      },
      orderBy: {
        namaLengkap: "asc",
      },
    });

    if (availableTeachers.length < validData.numberOfClasses) {
      throw new APIError("BAD_REQUEST", {
        message: `Tidak cukup guru tersedia. Dibutuhkan ${validData.numberOfClasses}, tersedia ${availableTeachers.length}`,
      });
    }

    // Determine target jurusan for SMA promotion
    let targetJurusan = validData.jurusan;
    if (
      validData.toGrade >= 10 &&
      validData.jenjang === Jenjang.SMA &&
      !targetJurusan
    ) {
      // For SMP to SMA transition, default to IPA
      targetJurusan = validData.fromGrade === 9 ? "IPA" : undefined;
    }

    // Check if we have enough teachers for proper reassignment
    const totalClassesNeeded = validData.numberOfClasses;
    const totalOldClasses = await prisma.kelas.count({
      where: {
        tahunAjaran: validData.fromTahunAjaran,
        namaKelas: {
          startsWith: validData.fromGrade.toString(),
        },
        jenjang: validData.jenjang,
        isActive: true,
      },
    });

    // Ensure we have enough teachers for new classes
    if (availableTeachers.length < totalClassesNeeded) {
      throw new APIError("BAD_REQUEST", {
        message: `Tidak cukup guru tersedia untuk kelas baru. Dibutuhkan ${totalClassesNeeded}, tersedia ${availableTeachers.length}`,
      });
    }

    // Randomize teachers for all new classes (always randomize teachers)
    const selectedTeachers = shuffleArray(availableTeachers).slice(
      0,
      validData.numberOfClasses
    );

    console.log("🔄 Teacher randomization:", {
      totalAvailableTeachers: availableTeachers.length,
      requiredTeachers: validData.numberOfClasses,
      selectedTeachers: selectedTeachers.map((t) => ({
        id: t.id,
        name: t.namaLengkap,
      })),
    });

    // Distribute students based on preference
    const distributedStudents = validData.randomDistribution
      ? distributeStudentsEvenly(studentsToPromote, validData.numberOfClasses)
      : [studentsToPromote]; // If not random, put all in one array to be handled differently

    const promotionResult = await prisma.$transaction(async (tx) => {
      const createdClasses = [];
      const existingClassNames: string[] = [];

      // First, get all old classes that will be affected
      const oldClasses = await tx.kelas.findMany({
        where: {
          tahunAjaran: validData.fromTahunAjaran,
          namaKelas: {
            startsWith: validData.fromGrade.toString(),
          },
          jenjang: validData.jenjang,
          isActive: true,
        },
        include: {
          siswa: {
            select: {
              id: true,
            },
          },
        },
      });

      // Deactivate old classes and disconnect all students if requested
      if (validData.deactivateOldClasses) {
        // Step 1: Create new classes with randomized teachers first
        for (let i = 0; i < validData.numberOfClasses; i++) {
          // Generate unique class name
          const namaKelas = await generateUniqueClassNameForPromotion(
            validData.toGrade,
            validData.jenjang,
            targetJurusan,
            validData.toTahunAjaran,
            validData.semester,
            existingClassNames
          );

          // Create the new class with assigned teacher
          try {
            const newKelas = await tx.kelas.create({
              data: {
                namaKelas,
                jenjang: validData.jenjang,
                jurusan: targetJurusan,
                tahunAjaran: validData.toTahunAjaran,
                semester: validData.semester,
                guruId: selectedTeachers[i].id, // Assign teacher to new class
                isActive: true,
              },
            });

            // Assign students to the new class
            const studentsForThisClass = validData.randomDistribution
              ? distributedStudents[i] || []
              : i === 0
              ? studentsToPromote
              : []; // If not random, assign all to first class

            if (studentsForThisClass.length > 0) {
              // Connect students to the new class
              await tx.kelas.update({
                where: { id: newKelas.id },
                data: {
                  siswa: {
                    connect: studentsForThisClass.map((s) => ({ id: s.id })),
                  },
                },
              });
            }

            createdClasses.push({
              ...newKelas,
              guru: selectedTeachers[i],
              siswaCount: studentsForThisClass.length,
              siswa: studentsForThisClass.map((s) => ({
                id: s.id,
                namaLengkap: s.namaLengkap,
              })),
            });
          } catch (createError) {
            console.error(`Error creating class ${namaKelas}:`, {
              error: createError,
              teacherId: selectedTeachers[i].id,
              teacherName: selectedTeachers[i].namaLengkap,
            });
            throw createError;
          }
        }

        // Step 2: Disconnect students from old classes and set teacher assignments to null
        for (const oldClass of oldClasses) {
          console.log("🚫 Deactivating old class:", {
            className: oldClass.namaKelas,
            classId: oldClass.id,
            studentCount: oldClass.siswa.length,
          });

          // Disconnect students first
          if (oldClass.siswa.length > 0) {
            await tx.kelas.update({
              where: { id: oldClass.id },
              data: {
                siswa: {
                  disconnect: oldClass.siswa.map((s) => ({ id: s.id })),
                },
              },
            });
          }

          // Deactivate old class and set teacher to null
          await tx.kelas.update({
            where: { id: oldClass.id },
            data: {
              isActive: false,
              guruId: null, // Clear teacher assignment from old class
              updatedAt: new Date(),
            },
          });

          console.log("✅ Old class deactivated and teacher cleared:", {
            className: oldClass.namaKelas,
            teacherAssignment: "null",
          });
        }
      } else {
        // If not deactivating old classes, just create new classes
        for (let i = 0; i < validData.numberOfClasses; i++) {
          const namaKelas = await generateUniqueClassNameForPromotion(
            validData.toGrade,
            validData.jenjang,
            targetJurusan,
            validData.toTahunAjaran,
            validData.semester,
            existingClassNames
          );

          try {
            const newKelas = await tx.kelas.create({
              data: {
                namaKelas,
                jenjang: validData.jenjang,
                jurusan: targetJurusan,
                tahunAjaran: validData.toTahunAjaran,
                semester: validData.semester,
                guruId: selectedTeachers[i].id,
                isActive: true,
              },
            });

            const studentsForThisClass = validData.randomDistribution
              ? distributedStudents[i] || []
              : i === 0
              ? studentsToPromote
              : [];

            if (studentsForThisClass.length > 0) {
              await tx.kelas.update({
                where: { id: newKelas.id },
                data: {
                  siswa: {
                    connect: studentsForThisClass.map((s) => ({ id: s.id })),
                  },
                },
              });
            }

            createdClasses.push({
              ...newKelas,
              guru: selectedTeachers[i],
              siswaCount: studentsForThisClass.length,
              siswa: studentsForThisClass.map((s) => ({
                id: s.id,
                namaLengkap: s.namaLengkap,
              })),
            });
          } catch (createError) {
            console.error(`Error creating class ${namaKelas}:`, createError);
            throw createError;
          }
        }
      }

      return {
        createdClasses,
        totalPromotedStudents: studentsToPromote.length,
        fromGrade: validData.fromGrade,
        toGrade: validData.toGrade,
        deactivatedOldClasses: validData.deactivateOldClasses,
      };
    });

    // Force cache invalidation with a small delay to ensure database consistency
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Invalidate multiple cache paths to ensure proper refresh
    revalidatePath("/admin/kelas");
    revalidatePath("/admin/kelas/pembagian-kelas");
    revalidatePath("/admin/students");
    revalidatePath("/admin/teachers-staff");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/kelas/actions/dataKelas");
    revalidatePath("/admin/kelas/page");

    return promotionResult;
  } catch (err) {
    console.error("❌ promoteStudents error details:", {
      error: err,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    if (err instanceof APIError) {
      throw err;
    }

    // Provide more specific error message
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    throw new Error(`Gagal mempromosikan siswa: ${errorMessage}`);
  }
}

/**
 * Graduate students (special case for final grades)
 */
async function graduateStudents(
  validData: PromoteStudentsInput,
  userId: string
) {
  const { revalidatePath } = await import("next/cache");
  const graduationLevel = validData.jenjang === Jenjang.SMP ? "SMP" : "SMA";

  // Get students to graduate
  const studentsToGraduate = await prisma.siswa.findMany({
    where: {
      status: "AKTIF",
      kelas: {
        some: {
          tahunAjaran: validData.fromTahunAjaran,
          namaKelas: {
            startsWith: validData.fromGrade.toString(),
          },
          jenjang: validData.jenjang,
          isActive: true,
        },
      },
    },
    include: {
      kelas: {
        where: {
          tahunAjaran: validData.fromTahunAjaran,
          namaKelas: {
            startsWith: validData.fromGrade.toString(),
          },
        },
        select: {
          id: true,
          namaKelas: true,
        },
      },
    },
  });

  if (studentsToGraduate.length === 0) {
    throw new APIError("BAD_REQUEST", {
      message: `Tidak ada siswa ${graduationLevel} yang dapat diluluskan`,
    });
  }

  const graduationResult = await prisma.$transaction(async (tx) => {
    // Update student status to graduated
    await tx.siswa.updateMany({
      where: {
        id: {
          in: studentsToGraduate.map((s) => s.id),
        },
      },
      data: {
        status: "LULUS",
        // Add graduation date if you have this field
      },
    });

    // Disconnect from current classes
    for (const student of studentsToGraduate) {
      if (student.kelas.length > 0) {
        await tx.siswa.update({
          where: { id: student.id },
          data: {
            kelas: {
              disconnect: student.kelas.map((k) => ({ id: k.id })),
            },
          },
        });
      }
    }

    // Deactivate graduation classes if requested
    if (validData.deactivateOldClasses) {
      await tx.kelas.updateMany({
        where: {
          tahunAjaran: validData.fromTahunAjaran,
          namaKelas: {
            startsWith: validData.fromGrade.toString(),
          },
          jenjang: validData.jenjang,
          isActive: true,
        },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    }

    return {
      graduatedStudents: studentsToGraduate.length,
      graduationLevel,
      tahunAjaran: validData.fromTahunAjaran,
    };
  });

  // Revalidate paths
  revalidatePath("/admin/kelas");
  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");

  return graduationResult;
}

/**
 * Get promotion statistics and validation
 */
export async function getPromotionValidation(
  fromTahunAjaran: string,
  fromGrade: number,
  jenjang: Jenjang,
  jurusan?: string
) {
  // Get students eligible for promotion
  const eligibleStudents = await prisma.siswa.findMany({
    where: {
      status: "AKTIF",
      kelas: {
        some: {
          tahunAjaran: fromTahunAjaran,
          namaKelas: {
            startsWith: fromGrade.toString(),
          },
          jenjang: jenjang,
          jurusan: jurusan || undefined,
          isActive: true,
        },
      },
    },
    include: {
      kelas: {
        where: {
          tahunAjaran: fromTahunAjaran,
          namaKelas: {
            startsWith: fromGrade.toString(),
          },
        },
        select: {
          namaKelas: true,
          jurusan: true,
        },
      },
    },
  });

  // Get current classes for this grade level
  const currentClasses = await prisma.kelas.findMany({
    where: {
      tahunAjaran: fromTahunAjaran,
      namaKelas: {
        startsWith: fromGrade.toString(),
      },
      jenjang: jenjang,
      jurusan: jurusan || undefined,
      isActive: true,
    },
    include: {
      _count: {
        select: {
          siswa: true,
        },
      },
    },
  });

  // Calculate recommended number of classes
  const averageClassSize = 30;
  const recommendedClasses = Math.ceil(
    eligibleStudents.length / averageClassSize
  );

  return {
    eligibleStudents: eligibleStudents.length,
    currentClasses: currentClasses.length,
    recommendedClasses,
    classesByJurusan: currentClasses.reduce((acc, kelas) => {
      const key = kelas.jurusan || "Umum";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    isGraduation:
      (fromGrade === 9 && jenjang === Jenjang.SMP) ||
      (fromGrade === 12 && jenjang === Jenjang.SMA),
  };
}
