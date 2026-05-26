"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { getCurrentUserProfile, type UserProfile } from "@/lib/auth";

type AttendanceRecord = {
  id: string;
  worker_id: string;
  shift_id: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  is_late: boolean;
  minutes_late: number;
  total_minutes: number;

clock_in_latitude: number | null;
clock_in_longitude: number | null;
clock_in_distance_meters: number | null;
geofence_verified: boolean;

  profiles?: {
    full_name: string;
    email: string;
    role: string;
  } | null;
  shifts?: {
    role_name: string;
    location: string;
    starts_at: string;
    ends_at: string;
  } | null;
};

export default function SupervisorAttendancePage() {
  const supabase = createBrowserSupabaseClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [workerCount, setWorkerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadAttendance() {
    setLoading(true);

    const currentProfile = await getCurrentUserProfile();

    if (!currentProfile) {
      window.location.href = "/login";
      return;
    }

    if (
      currentProfile.role !== "supervisor" &&
      currentProfile.role !== "admin"
    ) {
      window.location.href = "/role-router";
      return;
    }

    setProfile(currentProfile);

    const { data, error } = await supabase
      .from("attendance")
      .select(`
        id,
        worker_id,
        shift_id,
        status,
        check_in,
        check_out,
        is_late,
        minutes_late,
        total_minutes,

clock_in_latitude,
clock_in_longitude,
clock_in_distance_meters,
geofence_verified,

        profiles (
          full_name,
          email,
          role
        ),
        shifts (
          role_name,
          location,
          starts_at,
          ends_at
        )
      `)
      .order("check_in", { ascending: false });

    if (error) {
      console.error("Attendance loading error:", error);
    }

    const { count, error: workerError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "worker");

    if (workerError) {
      console.error("Worker count error:", workerError);
    }

    setAttendanceRecords((data ?? []) as AttendanceRecord[]);
    setWorkerCount(count ?? 0);
    setLoading(false);
  }

useEffect(() => {
  loadAttendance();

  const channel = supabase
    .channel("attendance-console-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "attendance" },
      () => {
        loadAttendance();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shifts" },
      () => {
        loadAttendance();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const clockedIn = attendanceRecords.filter(
    (record) => record.status === "clocked_in"
  ).length;

  const clockedOut = attendanceRecords.filter(
    (record) => record.status === "clocked_out"
  ).length;

  const lateWorkers = attendanceRecords.filter(
    (record) => record.is_late
  ).length;

  const absentWorkers = Math.max(0, workerCount - clockedIn);

  const attendanceRate =
    workerCount === 0 ? 0 : Math.round((clockedIn / workerCount) * 100);

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-black">
              Supervisor Attendance Console
            </h1>

            <p className="mt-2 text-gray-500">
              Monitor live worker presence, late arrivals, attendance status,
              and shift coverage.
            </p>
          </div>

          <a
            href="/supervisor"
            className="w-fit rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back to Supervisor Workspace
          </a>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Logged in as</p>

          <h2 className="mt-2 text-2xl font-bold text-black">
            {profile?.full_name}
          </h2>

          <p className="mt-1 text-sm font-semibold uppercase text-gray-500">
            {profile?.role}
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-5">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Attendance Rate
            </p>
            <h3 className="mt-4 text-5xl font-bold text-black">
              {attendanceRate}%
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Clocked In</p>
            <h3 className="mt-4 text-5xl font-bold text-green-600">
              {clockedIn}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Clocked Out</p>
            <h3 className="mt-4 text-5xl font-bold text-blue-600">
              {clockedOut}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Late Workers</p>
            <h3 className="mt-4 text-5xl font-bold text-orange-500">
              {lateWorkers}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Absent Workers</p>
            <h3 className="mt-4 text-5xl font-bold text-red-600">
              {absentWorkers}
            </h3>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black">
              Live Attendance Records
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Real-time attendance evidence from worker clock-in and clock-out
              actions.
            </p>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading attendance records...</p>
          ) : attendanceRecords.length === 0 ? (
            <p className="text-gray-500">No attendance records found.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <div className="hidden grid-cols-8 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-500 md:grid">
                <span>Worker</span>
                <span>Shift</span>
                <span>Status</span>
                <span>Clock In</span>
                <span>Clock Out</span>
                <span>Late</span>
                <span>GPS</span>
                <span>Distance</span>
              </div>

              {attendanceRecords.map((record) => (
                <div
                  key={record.id}
                  className="grid gap-3 border-t px-5 py-4 md:grid-cols-8 md:items-center"
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
                      Shift
                    </p>
                    <p className="font-medium text-black">
                      {record.shifts?.role_name ?? "Unknown shift"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {record.shifts?.location}
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

<div>
  <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
    GPS
  </p>

  {record.geofence_verified ? (
    <span className="inline-flex rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
      Verified
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
      Failed
    </span>
  )}
</div>

<div>
  <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
    Distance
  </p>

  <p className="text-sm text-gray-700">
    {record.clock_in_distance_meters ?? 0}m
  </p>
</div>

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