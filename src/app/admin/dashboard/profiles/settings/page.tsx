import AdminLayout from "@/app/admin/layout/layout";
import React from "react";

export default function page() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold">Guru Dashboard</h1>
        <p className="mt-4">
          Welcome to the Guru dashboard. Here you can manage your profile and
          settings.
        </p>
        {/* Additional content can be added here */}
      </div>
    </AdminLayout>
  );
}
