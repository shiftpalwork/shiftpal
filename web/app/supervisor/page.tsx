"use client";

import { useEffect, useState } from "react";
import { getCurrentUserProfile, type UserProfile } from "@/lib/auth";
import { NotificationBell } from "@/components/NotificationBell";

export default function SupervisorPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const currentProfile = await getCurrentUserProfile();

      if (!currentProfile) {
        window.location.href = "/login";
        return;
      }

      if (currentProfile.role !== "supervisor" && currentProfile.role !== "admin") {
        window.location.href = "/role-router";
        return;
      }

      setProfile(currentProfile);
    }

    loadProfile();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-black">
          Supervisor Workspace
        </h1>

        <p className="mt-2 text-gray-500">
          Shift planning, attendance monitoring, and workforce operations.
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
          <a
            href="/dashboard"
            className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
          >
            <h3 className="text-xl font-bold">Operations Dashboard</h3>
            <p className="mt-2 text-sm text-gray-500">
              View live workforce metrics.
            </p>
          </a>

          <a
            href="/shifts"
            className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
          >
            <h3 className="text-xl font-bold">Manage Shifts</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create and monitor live shifts.
            </p>
          </a>

          <a
            href="/swaps"
            className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
          >
            <h3 className="text-xl font-bold">Swap Requests</h3>
            <p className="mt-2 text-sm text-gray-500">
              Review worker shift swap activity.
            </p>
          </a>

<a
  href="/supervisor/approvals"
  className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
>
  <h3 className="text-xl font-bold">Approval Center</h3>

  <p className="mt-2 text-sm text-gray-500">
    Review absence and shift swap requests.
  </p>
</a>

<a
  href="/supervisor/attendance"
  className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
>
  <h3 className="text-xl font-bold">
    Attendance Console
  </h3>

  <p className="mt-2 text-sm text-gray-500">
    Monitor clock-ins, late arrivals, absences, and live workforce presence.
  </p>
</a>

<a
  href="/payroll"
  className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
>
  <h3 className="text-xl font-bold">Payroll Engine</h3>

  <p className="mt-2 text-sm text-gray-500">
    Review completed attendance records, overtime, hours worked, and estimated pay.
  </p>
</a>

        </div>
      </section>
    </main>
  );
}