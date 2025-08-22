"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLogger } from "@/utils/logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  createKelasSchema,
  randomKelasSchema,
  type CreateKelasInput,
  type RandomKelasInput,
} from "../schema";

/**
 * Generate unique class name based on existing classes
 */
async function generateUniqueClassName(
  grade: number,
  jenjang: string,
  jurusan: string | undefined,
  tahunAjaran: string,
  semester: string
): Promise<string> {
  return generateUniqueClassNameWithAvoidList(
    grade,
    jenjang,
    jurusan,
    tahunAjaran,
    semester,
    []
  );
}

async function generateUniqueClassNameWithAvoidList(
  grade: number,
  jenjang: string,
  jurusan: string | undefined,
  tahunAjaran: string,
  semester: string,
  avoidList: string[] = []
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
        ? `${grade} ${jurusan} ${alphabet[letterIndex]}${numericSuffix} S${semester}`
        : `${grade}${alphabet[letterIndex]}${numericSuffix} S${semester}`;
    } else {
      namaKelas = jurusan
        ? `${grade} ${jurusan} ${section} S${semester}`
        : `${grade}${section} S${semester}`;
    }

    // Check if name is in avoid list (already used in current transaction)
    if (avoidList.includes(namaKelas)) {
      sectionIndex++;
      continue;
    }

    const existingClass = await prisma.kelas.findFirst({
      where: {
        namaKelas,
        tahunAjaran,
        // Only check the unique constraint fields since semester is now in the name
      },
    });

    if (!existingClass) {
      return namaKelas;
    }

    sectionIndex++;
  } while (sectionIndex < 260); // Prevent infinite loop

  throw new Error("Tidak dapat menggenerate nama kelas yang unik");
}

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
 * Create a single class with validation
 */
export async function createKelas(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());

    // Convert FormData values to proper types
    const data: CreateKelasInput = {
      ...rawData,
      kapasitas: parseInt(rawData.kapasitas as string),
      isActive: rawData.isActive === "true",
    } as CreateKelasInput;

    const parsed = createKelasSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("BAD_REQUEST", {
        message: parsed.error.issues.map((e: any) => e.message).join(", "),
      });
    }

    const validData = parsed.data;

    // Check if teacher is already assigned
    const existingTeacherAssignment = await prisma.kelas.findFirst({
      where: {
        guruId: validData.guruId,
        tahunAjaran: validData.tahunAjaran,
        semester: validData.semester,
        isActive: true,
      },
    });

    if (existingTeacherAssignment) {
      throw new APIError("BAD_REQUEST", {
        message:
          "Guru sudah menjadi wali kelas di tahun ajaran dan semester ini",
      });
    }

    // Check for duplicate class name
    const existingClass = await prisma.kelas.findFirst({
      where: {
        namaKelas: validData.namaKelas,
        tahunAjaran: validData.tahunAjaran,
        semester: validData.semester,
      },
    });

    if (existingClass) {
      throw new APIError("BAD_REQUEST", {
        message: "Nama kelas sudah ada di tahun ajaran dan semester ini",
      });
    }

    // Create the class
    const newKelas = await prisma.kelas.create({
      data: {
        namaKelas: validData.namaKelas,
        jenjang: validData.jenjang,
        jurusan: validData.jurusan,
        tahunAjaran: validData.tahunAjaran,
        semester: validData.semester,
        guruId: validData.guruId,
        isActive: validData.isActive,
      },
      include: {
        guru: {
          select: {
            namaLengkap: true,
          },
        },
      },
    });

    // Log the creation
    const logger = await UserLogger.create(currentUser.id);
    await logger.create("kelas", {
      namaKelas: validData.namaKelas,
      guruId: validData.guruId,
      tahunAjaran: validData.tahunAjaran,
    });

    revalidatePath("/admin/kelas");
    revalidatePath("/admin/kelas/pembagian-kelas");

    return newKelas;
  } catch (err) {
    console.error("❌ createKelas error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal membuat kelas, coba lagi nanti");
  }
}

/**
 * Assign students to existing classes when no teachers available
 */
export async function assignStudentsToExistingClasses(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const tahunAjaran = formData.get("tahunAjaran") as string;
    const semester = formData.get("semester") as string;

    if (!tahunAjaran || !semester) {
      throw new APIError("BAD_REQUEST", {
        message: "Tahun ajaran dan semester harus diisi",
      });
    }

    // Get unassigned students
    const unassignedStudents = await prisma.siswa.findMany({
      where: {
        status: "AKTIF",
        kelas: {
          none: {
            tahunAjaran,
            semester,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        namaLengkap: true,
      },
    });

    if (unassignedStudents.length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: "Tidak ada siswa yang perlu ditempatkan",
      });
    }

    // Get existing classes with available capacity
    const existingClasses = await prisma.kelas.findMany({
      where: {
        tahunAjaran,
        semester,
        isActive: true,
      },
      include: {
        siswa: {
          select: {
            id: true,
          },
        },
        guru: {
          select: {
            namaLengkap: true,
          },
        },
      },
    });

    // Filter classes that have available capacity (assuming default capacity of 35)
    const classesWithCapacity = existingClasses
      .map((kelas) => ({
        ...kelas,
        currentStudents: kelas.siswa.length,
        availableSpots: 35 - kelas.siswa.length, // Assuming max capacity is 35
      }))
      .filter((kelas) => kelas.availableSpots > 0)
      .sort((a, b) => b.availableSpots - a.availableSpots); // Sort by most available spots first

    if (classesWithCapacity.length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: "Tidak ada kelas yang memiliki kapasitas tersedia",
      });
    }

    // Calculate total available spots
    const totalAvailableSpots = classesWithCapacity.reduce(
      (sum, kelas) => sum + kelas.availableSpots,
      0
    );

    if (totalAvailableSpots < unassignedStudents.length) {
      throw new APIError("BAD_REQUEST", {
        message: `Kapasitas tidak mencukupi. Dibutuhkan ${unassignedStudents.length} tempat, tersedia ${totalAvailableSpots} tempat`,
      });
    }

    // Shuffle students for fair distribution
    const shuffledStudents = shuffleArray(unassignedStudents);
    let classesUsed = 0;
    let totalAssigned = 0;

    // Calculate how many students each class should get for even distribution
    const studentsPerClass = Math.floor(
      unassignedStudents.length / classesWithCapacity.length
    );
    const remainingStudents =
      unassignedStudents.length % classesWithCapacity.length;

    // Debug logging
    console.log("📊 Student distribution plan:", {
      totalStudents: unassignedStudents.length,
      availableClasses: classesWithCapacity.length,
      studentsPerClass,
      remainingStudents,
      classCapacities: classesWithCapacity.map((c) => ({
        name: c.namaKelas,
        available: c.availableSpots,
        current: c.currentStudents,
      })),
    });

    // Assign students to classes using transaction
    await prisma.$transaction(async (tx) => {
      let studentIndex = 0;

      for (let i = 0; i < classesWithCapacity.length; i++) {
        if (studentIndex >= shuffledStudents.length) break;

        const kelas = classesWithCapacity[i];

        // Calculate how many students this class should get
        let studentsToAssignCount = Math.min(
          studentsPerClass + (i < remainingStudents ? 1 : 0), // Add 1 extra for remainder distribution
          kelas.availableSpots, // Don't exceed class capacity
          shuffledStudents.length - studentIndex // Don't exceed remaining students
        );

        if (studentsToAssignCount > 0) {
          const studentsToAssign = shuffledStudents.slice(
            studentIndex,
            studentIndex + studentsToAssignCount
          );

          // Connect students to the class
          await tx.kelas.update({
            where: { id: kelas.id },
            data: {
              siswa: {
                connect: studentsToAssign.map((student) => ({
                  id: student.id,
                })),
              },
            },
          });

          studentIndex += studentsToAssignCount;
          totalAssigned += studentsToAssignCount;
          classesUsed++;

          // Debug logging for each assignment
          console.log(
            `✅ Assigned ${studentsToAssignCount} students to ${kelas.namaKelas}`
          );
        }
      }

      // If there are still unassigned students due to capacity constraints,
      // distribute them to classes with remaining capacity
      if (studentIndex < shuffledStudents.length) {
        for (const kelas of classesWithCapacity) {
          if (studentIndex >= shuffledStudents.length) break;

          const currentClassStudents = await tx.kelas.findUnique({
            where: { id: kelas.id },
            include: { siswa: { select: { id: true } } },
          });

          const remainingCapacity = Math.max(
            0,
            kelas.availableSpots -
              (currentClassStudents?.siswa.length || 0 - kelas.currentStudents)
          );

          if (remainingCapacity > 0) {
            const remainingToAssign = Math.min(
              remainingCapacity,
              shuffledStudents.length - studentIndex
            );

            if (remainingToAssign > 0) {
              const studentsToAssign = shuffledStudents.slice(
                studentIndex,
                studentIndex + remainingToAssign
              );

              await tx.kelas.update({
                where: { id: kelas.id },
                data: {
                  siswa: {
                    connect: studentsToAssign.map((student) => ({
                      id: student.id,
                    })),
                  },
                },
              });

              studentIndex += remainingToAssign;
              totalAssigned += remainingToAssign;
            }
          }
        }
      }
    });

    // Final debug logging
    console.log("✅ Assignment completed:", {
      totalAssigned,
      classesUsed,
      unassignedRemaining: unassignedStudents.length - totalAssigned,
    });

    // Log the assignment
    const logger = await UserLogger.create(currentUser.id);
    await logger.create("assign_existing_classes", {
      tahunAjaran,
      semester,
      totalAssigned,
      classesUsed,
    });

    revalidatePath("/admin/kelas");
    revalidatePath("/admin/kelas/pembagian-kelas");

    return {
      totalAssigned,
      classesUsed,
      message: `${totalAssigned} siswa berhasil ditempatkan di ${classesUsed} kelas`,
    };
  } catch (err) {
    console.error("❌ assignStudentsToExistingClasses error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error(
      "Gagal menempatkan siswa ke kelas yang ada, coba lagi nanti"
    );
  }
}

/**
 * Create multiple classes with random student distribution
 */
export async function createRandomKelas(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());

    // Parse numeric fields
    const data: RandomKelasInput = {
      ...rawData,
      numberOfClasses: parseInt(rawData.numberOfClasses as string),
      grade: parseInt(rawData.grade as string),
      kapasitas: parseInt(rawData.kapasitas as string) || 30,
      randomizeStudents: rawData.randomizeStudents === "true",
      randomizeTeachers: rawData.randomizeTeachers === "true",
    } as RandomKelasInput;

    const parsed = randomKelasSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("BAD_REQUEST", {
        message: parsed.error.issues.map((e: any) => e.message).join(", "),
      });
    }

    const validData = parsed.data;

    // Get available teachers
    const availableTeachers = await prisma.guru.findMany({
      where: {
        kelas: {
          none: {
            tahunAjaran: validData.tahunAjaran,
            semester: validData.semester,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        namaLengkap: true,
      },
    });

    if (availableTeachers.length < validData.numberOfClasses) {
      throw new APIError("BAD_REQUEST", {
        message: `Tidak cukup guru tersedia. Dibutuhkan ${validData.numberOfClasses}, tersedia ${availableTeachers.length}`,
      });
    }

    // Get unassigned students
    const unassignedStudents = await prisma.siswa.findMany({
      where: {
        status: "AKTIF",
        kelas: {
          none: {
            tahunAjaran: validData.tahunAjaran,
            semester: validData.semester,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        namaLengkap: true,
      },
    });

    if (unassignedStudents.length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: "Tidak ada siswa yang tersedia untuk dibagi ke kelas",
      });
    }

    // Randomize teachers if requested
    const selectedTeachers = validData.randomizeTeachers
      ? shuffleArray(availableTeachers).slice(0, validData.numberOfClasses)
      : availableTeachers.slice(0, validData.numberOfClasses);

    // Distribute students evenly across classes
    const studentDistribution = distributeStudentsEvenly(
      unassignedStudents,
      validData.numberOfClasses
    );

    const createdClasses: any[] = [];
    const usedClassNames: string[] = []; // Track names used in this transaction

    // Create classes in a transaction
    const result = await prisma.$transaction(async (tx) => {
      for (let i = 0; i < validData.numberOfClasses; i++) {
        // Generate unique class name, avoiding names already used in this transaction
        const namaKelas = await generateUniqueClassNameWithAvoidList(
          validData.grade,
          validData.jenjang,
          validData.jurusan,
          validData.tahunAjaran,
          validData.semester,
          usedClassNames
        );

        // Add to used names to avoid duplicates in this transaction
        usedClassNames.push(namaKelas);

        // Create the class
        const newKelas = await tx.kelas.create({
          data: {
            namaKelas,
            jenjang: validData.jenjang,
            jurusan: validData.jurusan,
            tahunAjaran: validData.tahunAjaran,
            semester: validData.semester,
            guruId: selectedTeachers[i].id,
            isActive: true,
          },
        });

        // Assign students to the class
        const studentsForThisClass = studentDistribution[i];
        if (studentsForThisClass.length > 0) {
          await tx.siswa.updateMany({
            where: {
              id: {
                in: studentsForThisClass.map((s) => s.id),
              },
            },
            data: {
              // Note: This will need to be handled differently based on your schema
              // If siswa-kelas is many-to-many, you'll need to create records in a join table
            },
          });

          // If using many-to-many relationship, connect students
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
        });
      }

      return createdClasses;
    });

    // Log the creation
    const logger = await UserLogger.create(currentUser.id);
    await logger.create("kelas_random", {
      numberOfClasses: validData.numberOfClasses,
      grade: validData.grade,
      jenjang: validData.jenjang,
      tahunAjaran: validData.tahunAjaran,
      totalStudents: unassignedStudents.length,
    });

    revalidatePath("/admin/kelas");
    revalidatePath("/admin/kelas/pembagian-kelas");

    return result;
  } catch (err) {
    console.error("❌ createRandomKelas error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal membuat kelas secara random, coba lagi nanti");
  }
}
