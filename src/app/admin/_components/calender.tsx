"use client";
import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from "lucide-react";
import type { Kalender } from "@/interface/kalender";

interface AcademicEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  description: string;
  semester: string;
}

interface AcademicCalendarProps {
  kalenderData: Kalender[];
}

const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  kalenderData,
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Helper function to create dates relative to current date
  const getAcademicYear = () => {
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    // Academic year starts in July/August
    return currentMonth >= 6 ? currentYear : currentYear - 1;
  };

  const academicYear = getAcademicYear();

  // Transform database Kalender to AcademicEvent format
  const transformKalenderToEvents = (
    kalenderList: Kalender[]
  ): AcademicEvent[] => {
    return kalenderList.map((kalender) => {
      return {
        id: kalender.id,
        title: kalender.keterangan || `Kegiatan Semester ${kalender.semester}`,
        date: new Date(kalender.tanggalMulai),
        endDate: kalender.tanggalSelesai
          ? new Date(kalender.tanggalSelesai)
          : undefined,
        description:
          kalender.keterangan || `Kegiatan pada semester ${kalender.semester}`,
        semester: kalender.semester,
      };
    });
  };

  // Transform database events
  const academicEvents: AcademicEvent[] =
    transformKalenderToEvents(kalenderData);

  // Calendar helpers
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isDateInRange = (date: Date, event: AcademicEvent): boolean => {
    const eventStart = new Date(event.date);
    const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;

    // Reset time to compare dates only
    const checkDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const startDate = new Date(
      eventStart.getFullYear(),
      eventStart.getMonth(),
      eventStart.getDate()
    );
    const endDate = new Date(
      eventEnd.getFullYear(),
      eventEnd.getMonth(),
      eventEnd.getDate()
    );

    return checkDate >= startDate && checkDate <= endDate;
  };

  const getEventsForDate = (date: Date): AcademicEvent[] => {
    return academicEvents.filter((event) => isDateInRange(date, event));
  };

  const calendarDays = useMemo((): (Date | null)[] => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: (Date | null)[] = [];

    // Previous month's trailing days
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      days.push(date);
    }

    return days;
  }, [currentDate]);

  const navigateMonth = (direction: number): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  interface EventCardProps {
    event: AcademicEvent;
  }

  const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const formatEventDate = (event: AcademicEvent): string => {
      const startDate = event.date;
      const endDate = event.endDate;

      if (!endDate || isSameDay(startDate, endDate)) {
        // Single day event
        return `${startDate.getDate()} ${
          monthNames[startDate.getMonth()]
        } ${startDate.getFullYear()}`;
      } else {
        // Date range event
        const startStr = `${startDate.getDate()} ${
          monthNames[startDate.getMonth()]
        }`;
        const endStr = `${endDate.getDate()} ${
          monthNames[endDate.getMonth()]
        } ${endDate.getFullYear()}`;

        if (startDate.getFullYear() === endDate.getFullYear()) {
          if (startDate.getMonth() === endDate.getMonth()) {
            // Same month: "15 - 20 Januari 2024"
            return `${startDate.getDate()} - ${endDate.getDate()} ${
              monthNames[endDate.getMonth()]
            } ${endDate.getFullYear()}`;
          } else {
            // Different months, same year: "30 Januari - 5 Februari 2024"
            return `${startStr} - ${endStr}`;
          }
        } else {
          // Different years: "30 Desember 2023 - 5 Januari 2024"
          return `${startStr} ${startDate.getFullYear()} - ${endStr}`;
        }
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800 text-sm">{event.title}</h4>

          <p className="text-xs text-gray-500">{formatEventDate(event)}</p>
          {event.semester && (
            <p className="text-xs text-blue-600 font-medium">
              Semester {event.semester}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto p-6 bg-zinc-500 rounded-xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Kalender Akademik
          </h1>
          <p className="text-gray-600">
            SMA Negeri 1 Jakarta - Tahun Ajaran {academicYear}/
            {academicYear + 1}
          </p>
          <div className="mt-3 flex justify-center gap-4 text-sm text-gray-500">
            <span>📅 {academicEvents.length} Event Terjadwal</span>
            <span>
              📚 Semester Aktif:{" "}
              {academicEvents.length > 0
                ? [...new Set(academicEvents.map((e) => e.semester))].join(", ")
                : "Belum ada data"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-gray-900 px-6 py-4">
              <div className="flex items-center justify-between text-white">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <h2 className="text-xl font-semibold">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </h2>

                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="h-10 flex items-center justify-center text-sm font-medium text-gray-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="h-12"></div>;
                  }

                  const events = getEventsForDate(date);
                  const isSelected = isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, today);

                  return (
                    <button
                      key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        h-12 p-1 text-sm rounded-lg transition-all duration-200 relative
                        ${
                          isSelected
                            ? "bg-blue-100 border-2 border-blue-500"
                            : "hover:bg-gray-100"
                        }
                        ${
                          isToday
                            ? "bg-blue-50 font-bold text-blue-600 ring-2 ring-blue-300"
                            : "text-gray-700"
                        }
                      `}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <span>{date.getDate()}</span>
                        {events.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5">
                            {events.slice(0, 3).map((event, i) => (
                              <div
                                key={`${event.id}-dot-${i}`}
                                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                              ></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {isSameDay(selectedDate, today)
                  ? "Kegiatan hari ini"
                  : `${selectedDate.getDate()} ${
                      monthNames[selectedDate.getMonth()]
                    } ${selectedDate.getFullYear()}`}
              </h3>
              <div className="space-y-3">
                {getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">
                      Tidak ada kegiatan pada tanggal ini
                    </p>
                    {academicEvents.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Belum ada kegiatan terjadwal dalam kalender
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Kegiatan Mendatang
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {academicEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 text-sm mb-2">
                    Belum ada kegiatan akademik terjadwal
                  </p>
                  <p className="text-xs text-gray-400">
                    Tambahkan kegiatan melalui menu Manajemen Kalender
                  </p>
                </div>
              ) : (
                academicEvents
                  .filter((event) => {
                    const eventEndDate = event.endDate || event.date;
                    return eventEndDate >= today;
                  })
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <EventCard key={`upcoming-${event.id}`} event={event} />
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicCalendar;
