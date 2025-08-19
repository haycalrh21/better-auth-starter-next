import React from "react";
import AdminLayout from "../../layout/layout";
import AcademicCalendar from "../../_components/calender";

export default function CalendarPage() {
  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        <AcademicCalendar />
      </div>
    </AdminLayout>
  );
}
