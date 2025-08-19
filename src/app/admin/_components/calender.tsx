"use client";
import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Users,
  Award,
  AlertCircle,
} from "lucide-react";

interface AcademicEvent {
  id: number;
  title: string;
  date: Date;
  type: "semester" | "exam" | "holiday" | "academic" | "activity";
  color: string;
  description: string;
}

const AcademicCalendar = () => {
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

  // Academic events data - dynamically set based on current academic year
  const academicEvents: AcademicEvent[] = [
    {
      id: 1,
      title: "Hari Pertama Sekolah",
      date: new Date(academicYear, 7, 15), // August 15
      type: "semester",
      color: "bg-blue-500",
      description: `Pembukaan tahun ajaran baru ${academicYear}/${
        academicYear + 1
      }`,
    },
    {
      id: 2,
      title: "Ujian Tengah Semester",
      date: new Date(academicYear, 9, 15), // October 15
      type: "exam",
      color: "bg-red-500",
      description: "UTS Semester Ganjil",
    },
    {
      id: 3,
      title: "Ujian Akhir Semester Ganjil",
      date: new Date(academicYear, 11, 1), // December 1
      type: "exam",
      color: "bg-red-600",
      description: "UAS Semester Ganjil",
    },
    {
      id: 4,
      title: "Penerimaan Rapor",
      date: new Date(academicYear, 11, 20), // December 20
      type: "academic",
      color: "bg-purple-500",
      description: "Pembagian rapor semester ganjil",
    },
    {
      id: 5,
      title: "Libur Semester",
      date: new Date(academicYear, 11, 21), // December 21
      type: "holiday",
      color: "bg-green-500",
      description: "Libur akhir semester ganjil",
    },
    {
      id: 6,
      title: "Mulai Semester Genap",
      date: new Date(academicYear + 1, 0, 8), // January 8 next year
      type: "semester",
      color: "bg-blue-500",
      description: "Pembukaan semester genap",
    },
    {
      id: 7,
      title: "Ujian Tengah Semester Genap",
      date: new Date(academicYear + 1, 2, 15), // March 15 next year
      type: "exam",
      color: "bg-red-500",
      description: "UTS Semester Genap",
    },
    {
      id: 8,
      title: "Prakerin SMK",
      date: new Date(academicYear, 9, 1), // October 1
      type: "activity",
      color: "bg-orange-500",
      description: "Mulai Praktek Kerja Industri",
    },
    {
      id: 9,
      title: "Festival Sains",
      date: new Date(academicYear + 1, 3, 22), // April 22 next year
      type: "activity",
      color: "bg-orange-600",
      description: "Festival Sains dan Teknologi Sekolah",
    },
    {
      id: 10,
      title: "Ujian Akhir Semester Genap",
      date: new Date(academicYear + 1, 4, 15), // May 15 next year
      type: "exam",
      color: "bg-red-600",
      description: "UAS Semester Genap",
    },
    {
      id: 11,
      title: "Kelulusan",
      date: new Date(academicYear + 1, 5, 15), // June 15 next year
      type: "academic",
      color: "bg-purple-600",
      description: "Pengumuman Kelulusan",
    },
    {
      id: 12,
      title: "Libur Kenaikan Kelas",
      date: new Date(academicYear + 1, 5, 25), // June 25 next year
      type: "holiday",
      color: "bg-green-600",
      description: "Libur akhir tahun ajaran",
    },
  ];

  interface EventType {
    icon: React.ComponentType<{ size: number }>;
    label: string;
  }

  const eventTypes: Record<AcademicEvent["type"], EventType> = {
    semester: { icon: Calendar, label: "Semester" },
    exam: { icon: AlertCircle, label: "Ujian" },
    holiday: { icon: Users, label: "Libur" },
    academic: { icon: BookOpen, label: "Akademik" },
    activity: { icon: Award, label: "Kegiatan" },
  };

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

  const getEventsForDate = (date: Date): AcademicEvent[] => {
    return academicEvents.filter((event) => isSameDay(event.date, date));
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
    const IconComponent = eventTypes[event.type]?.icon || Calendar;

    return (
      <div
        className="bg-white rounded-lg shadow-md p-4 border-l-4"
        style={{ borderLeftColor: event.color.replace("bg-", "#") }}
      >
        <div className="flex items-start gap-3">
          <div
            className={`${event.color} p-2 rounded-lg text-white flex-shrink-0`}
          >
            <IconComponent size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 text-sm">
              {event.title}
            </h4>
            <p className="text-xs text-gray-600 mt-1">{event.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              {event.date.getDate()} {monthNames[event.date.getMonth()]}{" "}
              {event.date.getFullYear()}
            </p>
          </div>
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
                                className={`w-1.5 h-1.5 rounded-full ${event.color}`}
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
          {/* Legend */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Keterangan
            </h3>
            <div className="space-y-2">
              {Object.entries(eventTypes).map(([type, info]) => {
                const IconComponent = info.icon;
                const sampleEvent = academicEvents.find((e) => e.type === type);
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div
                      className={`${
                        sampleEvent?.color || "bg-gray-500"
                      } p-1.5 rounded text-white`}
                    >
                      <IconComponent size={14} />
                    </div>
                    <span className="text-sm text-gray-700">{info.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}{" "}
                {selectedDate.getFullYear()}
              </h3>
              <div className="space-y-3">
                {getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Tidak ada kegiatan pada tanggal ini
                  </p>
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
              {academicEvents
                .filter((event) => event.date >= today)
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((event) => (
                  <EventCard key={`upcoming-${event.id}`} event={event} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicCalendar;
