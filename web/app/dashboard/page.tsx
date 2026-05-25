"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

type Shift = {
  id: string;
  role_name: string;
  location: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

export default function DashboardPage() {
  const supabase = createBrowserSupabaseClient();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [workerCount, setWorkerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);

      const { data: shiftData, error: shiftError } = await supabase
        .from("shifts")
        .select("id, role_name, location, starts_at, ends_at, status")
        .order("starts_at", { ascending: true });

      if (shiftError) {
        console.error("Shift loading error:", shiftError);
      }

      setShifts(shiftData ?? []);

      const { count: attendanceTotal, error: attendanceError } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true });

      if (attendanceError) {
        console.error("Attendance loading error:", attendanceError);
      }

      setAttendanceCount(attendanceTotal ?? 0);

      const { count: workerTotal, error: workerError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (workerError) {
        console.error("Worker loading error:", workerError);
      }

      setWorkerCount(workerTotal ?? 0);
      setLoading(false);
    }

    loadDashboardData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold text-black">ShiftPal™</h1>
            <p className="text-sm text-gray-500">
              Workforce Coordination Platform
            </p>
          </div>

          <nav className="flex items-center gap-6">
            <a href="/dashboard" className="font-medium text-black">
              Dashboard
            </a>

            <a
              href="/shifts"
              className="font-medium text-gray-600 hover:text-black"
            >
              Shifts
            </a>

            <a
              href="/swaps"
              className="font-medium text-gray-600 hover:text-black"
            >
              Swaps
            </a>

            <button
              onClick={handleLogout}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <h2 className="text-4xl font-bold tracking-tight text-black">
            Operations Dashboard
          </h2>

          <p className="mt-2 text-gray-500">
            Real-time workforce coordination and scheduling intelligence.
          </p>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Shifts</p>

            <h3 className="mt-4 text-5xl font-bold text-black">
              {shifts.length}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Active Workers</p>

            <h3 className="mt-4 text-5xl font-bold text-black">
              {workerCount}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Attendance Records
            </p>

            <h3 className="mt-4 text-5xl font-bold text-black">
              {attendanceCount}
            </h3>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-black">Live Shift Feed</h3>

            <p className="mt-1 text-sm text-gray-500">
              Real-time operational scheduling activity.
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading workforce data...
            </div>
          ) : shifts.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No shifts found.
            </div>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="rounded-xl border border-gray-200 p-5 hover:border-black"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-black">
                        {shift.role_name}
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">
                        {shift.location}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Start: {new Date(shift.starts_at).toLocaleString()}
                      </p>

                      <p className="text-sm text-gray-600">
                        End: {new Date(shift.ends_at).toLocaleString()}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
                      {shift.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}