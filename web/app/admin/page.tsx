"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { getCurrentUserProfile, type UserProfile } from "@/lib/auth";

export default function AdminPage() {
  const supabase = createBrowserSupabaseClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workerCount, setWorkerCount] = useState(0);
  const [shiftCount, setShiftCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    async function loadAdminData() {
      const currentProfile = await getCurrentUserProfile();

      if (!currentProfile) {
        window.location.href = "/login";
        return;
      }

      if (currentProfile.role !== "admin") {
        window.location.href = "/role-router";
        return;
      }

      setProfile(currentProfile);

      const { count: workers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: shifts } = await supabase
        .from("shifts")
        .select("*", { count: "exact", head: true });

      const { count: attendance } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true });

      setWorkerCount(workers ?? 0);
      setShiftCount(shifts ?? 0);
      setAttendanceCount(attendance ?? 0);
    }

    loadAdminData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-black">Admin Workspace</h1>

        <p className="mt-2 text-gray-500">
          Company-level workforce control, analytics, and system oversight.
        </p>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Logged in as</p>
          <h2 className="mt-2 text-2xl font-bold text-black">
            {profile?.full_name}
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase text-gray-500">
            {profile?.role}
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Workers</p>
            <h3 className="mt-4 text-5xl font-bold">{workerCount}</h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Shifts</p>
            <h3 className="mt-4 text-5xl font-bold">{shiftCount}</h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Attendance Records
            </p>
            <h3 className="mt-4 text-5xl font-bold">{attendanceCount}</h3>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <a
            href="/dashboard"
            className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
          >
            <h3 className="text-xl font-bold">Operations Dashboard</h3>
            <p className="mt-2 text-sm text-gray-500">
              View workforce command metrics.
            </p>
          </a>

          <a
            href="/shifts"
            className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
          >
            <h3 className="text-xl font-bold">Shift Management</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create and manage workforce schedules.
            </p>
          </a>

          <a
            href="/swaps"
            className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
          >
            <h3 className="text-xl font-bold">Swap Requests</h3>
            <p className="mt-2 text-sm text-gray-500">
              Manage workforce flexibility requests.
            </p>
          </a>
        </div>
      </section>
    </main>
  );
}