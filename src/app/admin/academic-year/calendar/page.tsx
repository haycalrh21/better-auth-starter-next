import React from "react";
import AdminLayout from "../../layout/layout";
import AcademicCalendar from "../../_components/calender";
import { getDataKalender } from "../../calender/actions/kalenderActions";

export default async function CalendarPage() {
  const kalenderData = await getDataKalender();
  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        <AcademicCalendar kalenderData={kalenderData} />
      </div>
    </AdminLayout>
  );
}
