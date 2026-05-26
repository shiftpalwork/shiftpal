"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { getCurrentUserProfile, type UserProfile } from "@/lib/auth";

type PayrollRecord = {
  id: string;
  worker_id: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  total_minutes: number;
  profiles?: {
    full_name: string;
    email: string;
    hourly_rate: number;
    payroll_code: string | null;
    employment_type: string | null;
  } | null;
};

export default function PayrollPage() {
  const supabase = createBrowserSupabaseClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayroll() {
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
          status,
          check_in,
          check_out,
          total_minutes,
          profiles (
            full_name,
            email,
            hourly_rate,
            payroll_code,
            employment_type
          )
        `)
        .eq("status", "clocked_out")
        .order("check_out", { ascending: false });

      if (error) {
        console.error("Payroll loading error:", error);
      }

      setRecords((data ?? []) as PayrollRecord[]);
      setLoading(false);
    }

    loadPayroll();
  }, []);

  function hoursWorked(minutes: number) {
    return minutes / 60;
  }

  function normalHours(minutes: number) {
    return Math.min(hoursWorked(minutes), 8);
  }

  function overtimeHours(minutes: number) {
    return Math.max(0, hoursWorked(minutes) - 8);
  }

  function calculatePay(record: PayrollRecord) {
    const rate = Number(record.profiles?.hourly_rate ?? 0);
    const normalPay = normalHours(record.total_minutes) * rate;
    const overtimePay = overtimeHours(record.total_minutes) * rate * 1.5;

    return normalPay + overtimePay;
  }

  const totalPayroll = records.reduce(
    (sum, record) => sum + calculatePay(record),
    0
  );

  const totalHours = records.reduce(
    (sum, record) => sum + hoursWorked(record.total_minutes),
    0
  );

  const totalOvertime = records.reduce(
    (sum, record) => sum + overtimeHours(record.total_minutes),
    0
  );

  function exportPayrollCsv() {
    const headers = [
      "Worker",
      "Email",
      "Payroll Code",
      "Employment Type",
      "Hours Worked",
      "Overtime Hours",
      "Hourly Rate",
      "Estimated Pay",
      "Status",
    ];

    const rows = records.map((record) => {
      const workerHours = hoursWorked(record.total_minutes);
      const workerOvertime = overtimeHours(record.total_minutes);
      const workerPay = calculatePay(record);

      return [
        record.profiles?.full_name ?? "Unknown worker",
        record.profiles?.email ?? "",
        record.profiles?.payroll_code ?? "N/A",
        record.profiles?.employment_type ?? "N/A",
        workerHours.toFixed(2),
        workerOvertime.toFixed(2),
        Number(record.profiles?.hourly_rate ?? 0).toFixed(2),
        workerPay.toFixed(2),
        record.status,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `shiftpal-payroll-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-black">
              Payroll & Overtime Engine
            </h1>

            <p className="mt-2 text-gray-500">
              Convert attendance records into payroll-ready hours, overtime,
              and estimated pay.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportPayrollCsv}
              className="w-fit rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Export CSV
            </button>

            <a
              href="/supervisor"
              className="w-fit rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Back to Supervisor Workspace
            </a>
          </div>
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

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Payroll Records
            </p>

            <h3 className="mt-4 text-5xl font-bold">{records.length}</h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Hours</p>

            <h3 className="mt-4 text-5xl font-bold">
              {totalHours.toFixed(1)}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Estimated Payroll
            </p>

            <h3 className="mt-4 text-4xl font-bold">
              R {totalPayroll.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black">
              Payroll Records
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Overtime is calculated after 8 hours per attendance record at
              1.5x hourly rate.
            </p>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading payroll records...</p>
          ) : records.length === 0 ? (
            <p className="text-gray-500">
              No completed attendance records yet. Workers must clock in and
              clock out first.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <div className="hidden grid-cols-7 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-500 md:grid">
                <span>Worker</span>
                <span>Payroll Code</span>
                <span>Hours</span>
                <span>Overtime</span>
                <span>Rate</span>
                <span>Estimated Pay</span>
                <span>Status</span>
              </div>

              {records.map((record) => {
                const workerHours = hoursWorked(record.total_minutes);
                const workerOvertime = overtimeHours(record.total_minutes);
                const workerPay = calculatePay(record);

                return (
                  <div
                    key={record.id}
                    className="grid gap-3 border-t px-5 py-4 md:grid-cols-7 md:items-center"
                  >
                    <div>
                      <p className="font-semibold text-black">
                        {record.profiles?.full_name ?? "Unknown worker"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {record.profiles?.email}
                      </p>
                    </div>

                    <p className="text-sm text-gray-700">
                      {record.profiles?.payroll_code ?? "N/A"}
                    </p>

                    <p className="text-sm text-gray-700">
                      {workerHours.toFixed(2)}
                    </p>

                    <p className="text-sm text-gray-700">
                      {workerOvertime.toFixed(2)}
                    </p>

                    <p className="text-sm text-gray-700">
                      R {Number(record.profiles?.hourly_rate ?? 0).toFixed(2)}
                    </p>

                    <p className="font-semibold text-black">
                      R {workerPay.toFixed(2)}
                    </p>

                    <span className="w-fit rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                      {record.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-600">
              Total overtime hours: {totalOvertime.toFixed(2)}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}