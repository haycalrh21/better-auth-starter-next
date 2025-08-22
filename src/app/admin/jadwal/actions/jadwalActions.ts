"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { jadwalSchema, generateScheduleSchema } from "../schema/jadwalSchema";
import { validate } from "@/utils/validate";
import { ZodError } from "zod";
import { Hari } from "@/interface/enums";

// Get all jadwal data with relations
export async function getDataJadwal() {
  try {
    const jadwalData = await prisma.jadwal.findMany({
      orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
      include: {
        kelas: {
          select: {
            id: true,
            namaKelas: true,
          },
        },
        guru: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
        mataPelajaran: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });
    return jadwalData;
  } catch (error) {
    console.error("Error fetching jadwal data:", error);
    return [];
  }
}

// Get kelas data for dropdown
export async function getDataKelas() {
  try {
    const kelasData = await prisma.kelas.findMany({
      orderBy: {
        namaKelas: "asc",
      },
      select: {
        id: true,
        namaKelas: true,
        tahunAjaran: true,
      },
    });
    return kelasData;
  } catch (error) {
    console.error("Error fetching kelas data:", error);
    return [];
  }
}

// Get guru data for dropdown
export async function getDataGuru() {
  try {
    const guruData = await prisma.guru.findMany({
      orderBy: {
        namaLengkap: "asc",
      },
      select: {
        id: true,
        namaLengkap: true,
      },
    });
    return guruData;
  } catch (error) {
    console.error("Error fetching guru data:", error);
    return [];
  }
}

// Get mata pelajaran data for dropdown
export async function getDataMataPelajaran() {
  try {
    const mataPelajaranData = await prisma.mataPelajaran.findMany({
      orderBy: {
        nama: "asc",
      },
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
      },
    });
    return mataPelajaranData;
  } catch (error) {
    console.error("Error fetching mata pelajaran data:", error);
    return [];
  }
}

// Get kelas data for dropdown - only classes without existing schedules
export async function getDataKelasWithoutSchedule() {
  try {
    const kelasData = await prisma.kelas.findMany({
      where: {
        Jadwal: {
          none: {}, // No schedules associated with this class
        },
      },
      orderBy: {
        namaKelas: "asc",
      },
      select: {
        id: true,
        namaKelas: true,
      },
    });
    return kelasData;
  } catch (error) {
    console.error("Error fetching kelas without schedule data:", error);
    return [];
  }
}

// Create single jadwal entry
export async function createJadwal(formData: FormData) {
  try {
    const rawData = {
      hari: (formData.get("hari") as string) || undefined,
      jamMulai: (formData.get("jamMulai") as string) || undefined,
      jamSelesai: (formData.get("jamSelesai") as string) || undefined,
      kelasId: (formData.get("kelasId") as string) || undefined,
      guruId: (formData.get("guruId") as string) || undefined,
      mataPelajaranId: (formData.get("mataPelajaranId") as string) || undefined,
    };

    const validatedData = validate(jadwalSchema, rawData);

    const newJadwal = await prisma.jadwal.create({
      data: {
        hari: validatedData.hari as Hari, // Cast to Hari enum
        jamMulai: validatedData.jamMulai,
        jamSelesai: validatedData.jamSelesai,
        kelasId: validatedData.kelasId,
        guruId: validatedData.guruId,
        mataPelajaranId: validatedData.mataPelajaranId || null,
      },
      include: {
        kelas: { select: { namaKelas: true } },
        guru: { select: { namaLengkap: true } },
        mataPelajaran: { select: { nama: true } },
      },
    });

    revalidatePath("/admin/jadwal");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Jadwal berhasil dibuat",
      data: newJadwal,
    };
  } catch (error) {
    console.error("Error creating jadwal:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat jadwal",
    };
  }
}

// Update jadwal entry
export async function updateJadwal(id: string, formData: FormData) {
  try {
    const rawData = {
      hari: (formData.get("hari") as string) || undefined,
      jamMulai: (formData.get("jamMulai") as string) || undefined,
      jamSelesai: (formData.get("jamSelesai") as string) || undefined,
      kelasId: (formData.get("kelasId") as string) || undefined,
      guruId: (formData.get("guruId") as string) || undefined,
      mataPelajaranId: (formData.get("mataPelajaranId") as string) || undefined,
    };

    const validatedData = validate(jadwalSchema, rawData);

    const updatedJadwal = await prisma.jadwal.update({
      where: { id },
      data: {
        hari: validatedData.hari as Hari, // Cast to Hari enum
        jamMulai: validatedData.jamMulai,
        jamSelesai: validatedData.jamSelesai,
        kelasId: validatedData.kelasId,
        guruId: validatedData.guruId,
        mataPelajaranId: validatedData.mataPelajaranId || null,
      },
      include: {
        kelas: { select: { namaKelas: true } },
        guru: { select: { namaLengkap: true } },
        mataPelajaran: { select: { nama: true } },
      },
    });

    revalidatePath("/admin/jadwal");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Jadwal berhasil diperbarui",
      data: updatedJadwal,
    };
  } catch (error) {
    console.error("Error updating jadwal:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui jadwal",
    };
  }
}

// Delete jadwal entry
export async function deleteJadwal(id: string) {
  try {
    await prisma.jadwal.delete({
      where: { id },
    });

    revalidatePath("/admin/jadwal");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Jadwal berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting jadwal:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus jadwal",
    };
  }
}

// Generate random schedule for selected classes
export async function generateRandomSchedule(formData: FormData) {
  try {
    const kelasIdsString = formData.get("kelasIds") as string;
    const kelasIds = kelasIdsString ? kelasIdsString.split(",") : [];

    const rawData = {
      kelasIds,
      startTime: (formData.get("startTime") as string) || "07:00",
      endTime: (formData.get("endTime") as string) || "15:00",
      lessonDuration: parseInt(
        (formData.get("lessonDuration") as string) || "45"
      ),
    };

    const validatedData = validate(generateScheduleSchema, rawData);

    // Get all available resources
    const [guruList, mataPelajaranList] = await Promise.all([
      getDataGuru(),
      getDataMataPelajaran(),
    ]);

    // Validate required data
    if (guruList.length === 0) {
      return {
        success: false,
        error:
          "Tidak ada data guru. Tambahkan minimal satu guru sebelum membuat jadwal otomatis.",
      };
    }

    if (mataPelajaranList.length === 0) {
      return {
        success: false,
        error:
          "Tidak ada data mata pelajaran. Tambahkan minimal satu mata pelajaran sebelum membuat jadwal otomatis.",
      };
    }

    // Filter subjects that have assigned teachers (excluding istirahat)
    const availableSubjects = mataPelajaranList.filter(
      (mp) => mp.guru && !mp.nama.toLowerCase().includes("istirahat")
    );

    if (availableSubjects.length === 0) {
      return {
        success: false,
        error:
          "Tidak ada mata pelajaran dengan guru yang ditugaskan. Pastikan setiap mata pelajaran memiliki guru yang ditugaskan.",
      };
    }

    // Auto-create Istirahat mata pelajaran if not exists
    let istirahatSubject = mataPelajaranList.find((mp) =>
      mp.nama.toLowerCase().includes("istirahat")
    );

    if (!istirahatSubject) {
      // Create a temporary istirahat entry for this generation
      istirahatSubject = await prisma.mataPelajaran.create({
        data: {
          nama: "Istirahat",
          kode: "IST",
          deskripsi: "Waktu istirahat siswa (auto-generated)",
        },
        include: {
          guru: {
            select: {
              id: true,
              namaLengkap: true,
            },
          },
        },
      });
      console.log(
        "Auto-created Istirahat mata pelajaran:",
        istirahatSubject?.nama
      );
    }

    // Define break times including istirahat
    const breakTimes = [
      { start: "09:15", end: "09:30", name: "Istirahat 1" },
      { start: "12:00", end: "13:00", name: "Istirahat" }, // Main break/lunch
    ];

    const days: Hari[] = [
      Hari.SENIN,
      Hari.SELASA,
      Hari.RABU,
      Hari.KAMIS,
      Hari.JUMAT,
    ];
    const schedules: {
      hari: Hari;
      jamMulai: string;
      jamSelesai: string;
      kelasId: string;
      guruId: string;
      mataPelajaranId: string | null;
    }[] = [];

    // Helper function to parse time
    const parseTime = (time: string) => {
      const [hour, minute] = time.split(":").map(Number);
      return hour * 60 + minute;
    };

    // Helper function to format time
    const formatTime = (minutes: number) => {
      const hour = Math.floor(minutes / 60);
      const min = minutes % 60;
      return `${hour.toString().padStart(2, "0")}:${min
        .toString()
        .padStart(2, "0")}`;
    };

    // Generate schedule for each class
    for (const kelasId of validatedData.kelasIds) {
      for (const day of days) {
        let currentTime = parseTime(validatedData.startTime!);
        const endTime = parseTime(validatedData.endTime!);
        const lessonDuration = validatedData.lessonDuration!;

        // Shuffle subjects (with their assigned teachers) for randomization
        const shuffledSubjects = [...availableSubjects].sort(
          () => Math.random() - 0.5
        );

        if (shuffledSubjects.length === 0) {
          console.warn(
            `No subjects with assigned teachers available for class ${kelasId} on ${day}`
          );
          continue;
        }

        let subjectIndex = 0;

        while (currentTime + lessonDuration <= endTime) {
          // Check if current time conflicts with break time
          const currentTimeStr = formatTime(currentTime);
          const lessonEndTime = currentTime + lessonDuration;
          const lessonEndTimeStr = formatTime(lessonEndTime);

          let isBreakTime = false;

          for (const breakTime of breakTimes) {
            const breakStart = parseTime(breakTime.start);
            const breakEnd = parseTime(breakTime.end);

            // If lesson would overlap with break, schedule the break instead
            if (
              (currentTime < breakEnd && lessonEndTime > breakStart) ||
              currentTime === breakStart
            ) {
              // Add istirahat schedule (no teacher needed for breaks)
              schedules.push({
                hari: day,
                jamMulai: formatTime(breakStart),
                jamSelesai: formatTime(breakEnd),
                kelasId,
                guruId: guruList[0]?.id || "", // Temporary assignment, will be handled in display
                mataPelajaranId: istirahatSubject?.id || null,
              });

              currentTime = breakEnd;
              isBreakTime = true;
              break;
            }
          }

          if (!isBreakTime && currentTime + lessonDuration <= endTime) {
            // Add regular lesson with assigned teacher
            const subject =
              shuffledSubjects[subjectIndex % shuffledSubjects.length];

            schedules.push({
              hari: day,
              jamMulai: currentTimeStr,
              jamSelesai: lessonEndTimeStr,
              kelasId,
              guruId: subject.guru!.id, // Use the teacher assigned to this subject
              mataPelajaranId: subject.id,
            });

            currentTime = lessonEndTime;
            subjectIndex++;
          }

          // Add small break between lessons if not already a break time
          if (!isBreakTime) {
            currentTime += 15; // 15 minute break between lessons
          }
        }
      }
    }

    // Validate that we have schedules to create
    if (schedules.length === 0) {
      return {
        success: false,
        error:
          "Tidak dapat membuat jadwal. Periksa waktu sekolah, durasi pelajaran, dan pastikan ada mata pelajaran yang tersedia.",
      };
    }

    // Delete existing schedules for selected classes
    const deleteResult = await prisma.jadwal.deleteMany({
      where: {
        kelasId: {
          in: validatedData.kelasIds,
        },
      },
    });

    // Create new schedules
    const createdSchedules = await prisma.jadwal.createMany({
      data: schedules,
    });

    revalidatePath("/admin/jadwal");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Berhasil membuat ${createdSchedules.count} jadwal acak untuk ${validatedData.kelasIds.length} kelas (${deleteResult.count} jadwal lama dihapus)`,
      data: {
        count: createdSchedules.count,
        deletedCount: deleteResult.count,
        kelasCount: validatedData.kelasIds.length,
      },
    };
  } catch (error) {
    console.error("Error generating schedule:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat jadwal otomatis",
    };
  }
}
