"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { getCurrentUserProfile, type UserProfile } from "@/lib/auth";

type LeaveBalance = {
  id: string;
  annual_leave_days: number;
  sick_leave_days: number;
  family_leave_days: number;
};

type LeaveRequest = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string;
};

export default function WorkerLeavePage() {
  const supabase = createBrowserSupabaseClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveType, setLeaveType] = useState("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  async function loadLeaveData() {
    const currentProfile = await getCurrentUserProfile();

    if (!currentProfile) {
      window.location.href = "/login";
      return;
    }

    if (currentProfile.role !== "worker") {
      window.location.href = "/role-router";
      return;
    }

    setProfile(currentProfile);

    const { data: balanceData } = await supabase
      .from("leave_balances")
      .select("id, annual_leave_days, sick_leave_days, family_leave_days")
      .eq("worker_id", currentProfile.id)
      .single();

    setBalance(balanceData as LeaveBalance | null);

    const { data: requestData } = await supabase
      .from("leave_requests")
      .select("id, leave_type, start_date, end_date, reason, status, created_at")
      .eq("worker_id", currentProfile.id)
      .order("created_at", { ascending: false });

    setRequests((requestData ?? []) as LeaveRequest[]);
  }

  useEffect(() => {
    loadLeaveData();
  }, []);

  async function submitLeaveRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) return;

    setMessage("");

    const { error } = await supabase.from("leave_requests").insert({
      worker_id: profile.id,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason,
      status: "pending",
    });

    if (error) {
      setMessage(`Leave request failed: ${error.message}`);
      return;
    }

    setMessage("Leave request submitted successfully.");
    setLeaveType("annual");
    setStartDate("");
    setEndDate("");
    setReason("");

    await loadLeaveData();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-black">
              Leave Self-Service
            </h1>

            <p className="mt-2 text-gray-500">
              View your leave balance and submit leave requests.
            </p>
          </div>

          <a
            href="/worker"
            className="w-fit rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back to Worker Portal
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

        {message && (
          <div className="mt-6 rounded-2xl border bg-white p-4 text-sm font-medium text-gray-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Annual Leave
            </p>
            <h3 className="mt-4 text-5xl font-bold">
              {balance?.annual_leave_days ?? 0}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Sick Leave
            </p>
            <h3 className="mt-4 text-5xl font-bold">
              {balance?.sick_leave_days ?? 0}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Family Leave
            </p>
            <h3 className="mt-4 text-5xl font-bold">
              {balance?.family_leave_days ?? 0}
            </h3>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={submitLeaveRequest}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-black">
              Request Leave
            </h2>

            <div className="mt-5 grid gap-4">
              <select
                value={leaveType}
                onChange={(event) => setLeaveType(event.target.value)}
                className="rounded-xl border p-3 text-sm"
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="family">Family Responsibility Leave</option>
              </select>

              <input
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                className="rounded-xl border p-3 text-sm"
                required
              />

              <input
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                type="date"
                className="rounded-xl border p-3 text-sm"
                required
              />

              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason"
                className="min-h-28 rounded-xl border p-3 text-sm"
              />

              <button
                type="submit"
                className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
              >
                Submit Leave Request
              </button>
            </div>
          </form>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-black">
              My Leave Requests
            </h2>

            {requests.length === 0 ? (
              <p className="mt-4 text-gray-500">
                No leave requests yet.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-xl border p-5">
                    <h3 className="text-lg font-semibold capitalize">
                      {request.leave_type} leave
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                      {request.start_date} → {request.end_date}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {request.reason || "No reason supplied."}
                    </p>

                    <span className="mt-3 inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}