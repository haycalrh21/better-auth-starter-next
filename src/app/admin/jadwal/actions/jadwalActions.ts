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

    // Check if Istirahat subject exists (must be created by admin)
    let istirahatSubject = mataPelajaranList.find((mp) =>
      mp.nama.toLowerCase().includes("istirahat")
    );

    if (!istirahatSubject) {
      return {
        success: false,
        error:
          "Mata pelajaran 'Istirahat' belum dibuat. Silakan buat mata pelajaran Istirahat terlebih dahulu di modul Mata Pelajaran.",
      };
    }

    // Use first available teacher for break times (database requirement)
    // UI will handle displaying "no teacher" for break times
    const breakTeacherId = guruList[0]?.id;

    if (!breakTeacherId) {
      return {
        success: false,
        error:
          "Tidak ada guru tersedia. Tambahkan minimal satu guru untuk membuat jadwal.",
      };
    }

    // Define break times including istirahat
    const breakTimes = [
      { start: "09:15", end: "09:30", name: "Istirahat Pagi" },
      { start: "12:00", end: "13:00", name: "Istirahat Siang" }, // Main break/lunch
    ];

    console.log("Break times defined:", breakTimes);
    console.log("Istirahat subject:", istirahatSubject?.nama);

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

    // Helper function to check if two time slots overlap
    const timeSlotsOverlap = (
      start1: number,
      end1: number,
      start2: number,
      end2: number
    ) => {
      return start1 < end2 && start2 < end1;
    };

    // Helper function to find available teacher for a time slot
    const findAvailableTeacher = (
      subjects: typeof availableSubjects,
      day: Hari,
      timeSlotStart: number,
      timeSlotEnd: number,
      existingSchedules: typeof schedules
    ) => {
      // Filter subjects by teachers who are not busy at this time
      const availableTeachers = subjects.filter((subject) => {
        const teacherId = subject.guru!.id;

        // Check if this teacher has any conflicting schedule
        const hasConflict = existingSchedules.some((schedule) => {
          if (schedule.hari !== day || schedule.guruId !== teacherId) {
            return false;
          }

          const scheduleStart = parseTime(schedule.jamMulai);
          const scheduleEnd = parseTime(schedule.jamSelesai);

          return timeSlotsOverlap(
            timeSlotStart,
            timeSlotEnd,
            scheduleStart,
            scheduleEnd
          );
        });

        return !hasConflict;
      });

      // Return a random available teacher/subject
      if (availableTeachers.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * availableTeachers.length
        );
        return availableTeachers[randomIndex];
      }

      return null;
    };

    // Generate time slots for the entire school day
    const generateTimeSlots = () => {
      const slots: {
        start: number;
        end: number;
        isBreak: boolean;
        name?: string;
      }[] = [];
      let currentTime = parseTime(validatedData.startTime!);
      const endTime = parseTime(validatedData.endTime!);
      const lessonDuration = validatedData.lessonDuration!;

      // First, add all predefined break times
      for (const breakTime of breakTimes) {
        const breakStart = parseTime(breakTime.start);
        const breakEndTime = parseTime(breakTime.end);

        // Only add if within school hours
        if (
          breakStart >= parseTime(validatedData.startTime!) &&
          breakEndTime <= parseTime(validatedData.endTime!)
        ) {
          slots.push({
            start: breakStart,
            end: breakEndTime,
            isBreak: true,
            name: breakTime.name,
          });
        }
      }

      // Then, add lesson slots avoiding break times
      while (currentTime + lessonDuration <= endTime) {
        let conflictsWithBreak = false;

        // Check if this time slot conflicts with any break time
        for (const breakTime of breakTimes) {
          const breakStart = parseTime(breakTime.start);
          const breakEndTime = parseTime(breakTime.end);

          if (
            timeSlotsOverlap(
              currentTime,
              currentTime + lessonDuration,
              breakStart,
              breakEndTime
            )
          ) {
            // Skip to after the break time
            currentTime = breakEndTime;
            conflictsWithBreak = true;
            break;
          }
        }

        if (!conflictsWithBreak && currentTime + lessonDuration <= endTime) {
          // Add regular lesson slot
          slots.push({
            start: currentTime,
            end: currentTime + lessonDuration,
            isBreak: false,
          });
          currentTime += lessonDuration + 15; // Add 15 minutes break between lessons
        }
      }

      // Sort slots by start time
      return slots.sort((a, b) => a.start - b.start);
    };

    const timeSlots = generateTimeSlots();
    console.log(
      "Generated time slots:",
      timeSlots.map((slot) => ({
        time: `${formatTime(slot.start)} - ${formatTime(slot.end)}`,
        isBreak: slot.isBreak,
        name: slot.name,
      }))
    );

    // Generate schedule with teacher conflict prevention
    for (const day of days) {
      for (const timeSlot of timeSlots) {
        if (timeSlot.isBreak) {
          // Add break for all classes - Use existing teacher for database requirement
          for (const kelasId of validatedData.kelasIds) {
            const breakSchedule = {
              hari: day,
              jamMulai: formatTime(timeSlot.start),
              jamSelesai: formatTime(timeSlot.end),
              kelasId,
              guruId: breakTeacherId, // Use existing teacher
              mataPelajaranId: istirahatSubject?.id || null,
            };
            schedules.push(breakSchedule);
            console.log(
              `Added break schedule for ${day} at ${formatTime(
                timeSlot.start
              )}-${formatTime(
                timeSlot.end
              )} for class ${kelasId} - UI will show no teacher`
            );
          }
        } else {
          // Assign lessons with teacher conflict checking
          for (const kelasId of validatedData.kelasIds) {
            const availableTeacher = findAvailableTeacher(
              availableSubjects,
              day,
              timeSlot.start,
              timeSlot.end,
              schedules
            );

            if (availableTeacher) {
              schedules.push({
                hari: day,
                jamMulai: formatTime(timeSlot.start),
                jamSelesai: formatTime(timeSlot.end),
                kelasId,
                guruId: availableTeacher.guru!.id,
                mataPelajaranId: availableTeacher.id,
              });
            } else {
              // If no teacher available, try to use any available subject
              // This can happen when there are more classes than available teachers
              const fallbackSubject =
                availableSubjects[
                  Math.floor(Math.random() * availableSubjects.length)
                ];
              if (fallbackSubject) {
                console.warn(
                  `Teacher conflict detected for class ${kelasId} on ${day} at ${formatTime(
                    timeSlot.start
                  )}. Using fallback assignment.`
                );
                schedules.push({
                  hari: day,
                  jamMulai: formatTime(timeSlot.start),
                  jamSelesai: formatTime(timeSlot.end),
                  kelasId,
                  guruId: fallbackSubject.guru!.id,
                  mataPelajaranId: fallbackSubject.id,
                });
              }
            }
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
