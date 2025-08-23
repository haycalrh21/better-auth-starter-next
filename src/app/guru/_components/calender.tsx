"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { useState } from "react";

interface CalendarEvent {
  date: Date;
  title: string;
  type: "jadwal" | "tugas" | "ujian" | "libur";
  description?: string;
}

interface CalendarGuruProps {
  events?: CalendarEvent[];
}

export function CalendarGuru({ events = [] }: CalendarGuruProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  // Mock events untuk demo
  const defaultEvents: CalendarEvent[] = [
    {
      date: new Date(2025, 7, 25), // 25 Agustus 2025
      title: "Rapat Guru",
      type: "jadwal",
      description: "Rapat evaluasi pembelajaran semester",
    },
    {
      date: new Date(2025, 7, 26), // 26 Agustus 2025
      title: "Deadline Tugas Matematika VII A",
      type: "tugas",
      description: "Batas pengumpulan tugas bab 3",
    },
    {
      date: new Date(2025, 7, 30), // 30 Agustus 2025
      title: "UTS Matematika",
      type: "ujian",
      description: "Ujian Tengah Semester",
    },
  ];

  const allEvents = [...defaultEvents, ...events];

  // Filter events untuk tanggal yang dipilih
  const eventsForSelectedDate = selectedDate
    ? allEvents.filter(
        (event) => event.date.toDateString() === selectedDate.toDateString()
      )
    : [];

  // Tanggal yang memiliki event
  const datesWithEvents = allEvents.map((event) => event.date);

  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "jadwal":
        return "default";
      case "tugas":
        return "secondary";
      case "ujian":
        return "destructive";
      case "libur":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Kalender Guru
          </CardTitle>
          <CardDescription>
            Kalender jadwal mengajar dan kegiatan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasEvent: datesWithEvents,
            }}
            modifiersStyles={{
              hasEvent: {
                fontWeight: "bold",
                backgroundColor: "hsl(var(--accent))",
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Events for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate
              ? `Kegiatan ${selectedDate.toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`
              : "Pilih Tanggal"}
          </CardTitle>
          <CardDescription>
            {eventsForSelectedDate.length > 0
              ? `${eventsForSelectedDate.length} kegiatan pada tanggal ini`
              : "Tidak ada kegiatan pada tanggal ini"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eventsForSelectedDate.length > 0 ? (
              eventsForSelectedDate.map((event, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <Badge variant={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Tidak ada kegiatan pada tanggal ini
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
