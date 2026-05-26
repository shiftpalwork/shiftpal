"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { getCurrentUserProfile, type UserProfile } from "@/lib/auth";

type Shift = {
  id: string;
  role_name: string;
  location: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

type AttendanceRecord = {
  id: string;
  worker_id: string;
  status: string;
  is_late: boolean;
  minutes_late: number;
  check_in: string | null;
  check_out: string | null;
  profiles?: {
    full_name: string;
    email: string;
    role: string;
  } | null;
};

export default function DashboardPage() {
  const supabase = createBrowserSupabaseClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  const [workerCount, setWorkerCount] = useState(0);

  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await supabase.auth.signOut();

    window.location.href = "/login";
  }

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);

      const currentProfile = await getCurrentUserProfile();

      if (!currentProfile) {
        window.location.href = "/login";
        return;
      }

      setProfile(currentProfile);

      const { data: shiftData, error: shiftError } = await supabase
        .from("shifts")
        .select(
          "id, role_name, location, starts_at, ends_at, status"
        )
        .order("starts_at", { ascending: true });

      if (shiftError) {
        console.error("Shift loading error:", shiftError);
      }

      setShifts(shiftData ?? []);

      const { data: attendanceData, error: attendanceError } =
        await supabase
          .from("attendance")
.select(`
  id,
  worker_id,
  status,
  is_late,
  minutes_late,
  check_in,
  check_out,
  profiles (
    full_name,
    email,
    role
  )
`);

      if (attendanceError) {
        console.error(
          "Attendance loading error:",
          attendanceError
        );
      }

      setAttendanceRecords(
        (attendanceData ?? []) as AttendanceRecord[]
      );

      const { count: workerTotal, error: workerError } =
        await supabase
          .from("profiles")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("role", "worker");

      if (workerError) {
        console.error("Worker loading error:", workerError);
      }

      setWorkerCount(workerTotal ?? 0);

      setLoading(false);
    }

    loadDashboardData();
  }, []);

  const activeWorkers = attendanceRecords.filter(
    (record) => record.status === "clocked_in"
  ).length;

  const lateWorkers = attendanceRecords.filter(
    (record) => record.is_late
  ).length;

  const absentWorkers = Math.max(
    0,
    workerCount - activeWorkers
  );

  const attendancePercentage =
    workerCount === 0
      ? 0
      : Math.round((activeWorkers / workerCount) * 100);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold text-black">
              ShiftPal™
            </h1>

            <p className="text-sm text-gray-500">
              Workforce Coordination Platform
            </p>
          </div>

          <nav className="flex items-center gap-6">
            <a
              href="/dashboard"
              className="font-medium text-black"
            >
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

          <div className="mt-3 flex items-center gap-3">
            <span className="rounded-full bg-black px-4 py-1 text-sm font-semibold uppercase tracking-wide text-white">
              {profile?.role ?? "worker"}
            </span>

            <span className="text-sm text-gray-500">
              Logged in as {profile?.full_name}
            </span>
          </div>

          <div className="mt-5">
            <a
              href="/supervisor"
              className="inline-flex items-center rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-gray-50"
            >
              ← Back to Supervisor Workspace
            </a>
          </div>

          <p className="mt-2 text-gray-500">
            Real-time workforce coordination and
            attendance intelligence.
          </p>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-5">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Shifts
            </p>

            <h3 className="mt-4 text-5xl font-bold text-black">
              {shifts.length}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Active Workforce
            </p>

            <h3 className="mt-4 text-5xl font-bold text-green-600">
              {activeWorkers}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Attendance %
            </p>

            <h3 className="mt-4 text-5xl font-bold text-black">
              {attendancePercentage}%
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Late Arrivals
            </p>

            <h3 className="mt-4 text-5xl font-bold text-orange-500">
              {lateWorkers}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Absent Workers
            </p>

            <h3 className="mt-4 text-5xl font-bold text-red-600">
              {absentWorkers}
            </h3>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-black">
              Live Shift Feed
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Real-time operational scheduling
              activity.
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
                        Start:{" "}
                        {new Date(
                          shift.starts_at
                        ).toLocaleString()}
                      </p>

                      <p className="text-sm text-gray-600">
                        End:{" "}
                        {new Date(
                          shift.ends_at
                        ).toLocaleString()}
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

<div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
  <div className="mb-6">
    <h3 className="text-2xl font-bold text-black">
      Live Attendance Board
    </h3>

    <p className="mt-1 text-sm text-gray-500">
      Real-time clock-in, clock-out, late arrival, and workforce presence status.
    </p>
  </div>

  {attendanceRecords.length === 0 ? (
    <div className="py-10 text-center text-gray-500">
      No attendance records yet.
    </div>
  ) : (
    <div className="overflow-hidden rounded-xl border">
      <div className="hidden grid-cols-5 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-500 md:grid">
        <span>Worker</span>
        <span>Status</span>
        <span>Clock In</span>
        <span>Clock Out</span>
        <span>Late</span>
      </div>

      {attendanceRecords.map((record) => (
        <div
          key={record.id}
          className="grid gap-3 border-t px-5 py-4 md:grid-cols-5 md:items-center"
        >
          <div>
            <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
              Worker
            </p>
            <p className="font-semibold text-black">
              {record.profiles?.full_name ?? "Unknown worker"}
            </p>
            <p className="text-xs text-gray-500">
              {record.profiles?.email}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
              Status
            </p>
            <span className="inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              {record.status}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
              Clock In
            </p>
            <p className="text-sm text-gray-700">
              {record.check_in
                ? new Date(record.check_in).toLocaleString()
                : "Not clocked in"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
              Clock Out
            </p>
            <p className="text-sm text-gray-700">
              {record.check_out
                ? new Date(record.check_out).toLocaleString()
                : "Not clocked out"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
              Late
            </p>
            {record.is_late ? (
              <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                {record.minutes_late} min late
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                On time
              </span>
            )}
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