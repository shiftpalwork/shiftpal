"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { getCurrentUserProfile, type UserProfile } from "@/lib/auth";

type AbsenceRequest = {
  id: string;
  worker_id: string;
  reason: string;
  requested_date: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    role: string;
  } | null;
};

type SwapRequest = {
  id: string;
  requester_id: string;
  accepted_by: string | null;
  approved_by: string | null;
  shift_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  shifts?: {
    id: string;
    role_name: string;
    location: string;
    starts_at: string;
    ends_at: string;
    status: string;
    worker_id: string;
  } | null;
};

export default function SupervisorApprovalsPage() {
  const supabase = createBrowserSupabaseClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadRequests() {
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

    const { data: absences, error: absenceError } = await supabase
      .from("absence_requests")
      .select(
        `
        id,
        worker_id,
        reason,
        requested_date,
        status,
        created_at,
        profiles (
          full_name,
          email,
          role
        )
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (absenceError) {
      console.error("Absence request loading error:", absenceError);
      setMessage(`Could not load absence requests: ${absenceError.message}`);
    }

    const { data: swaps, error: swapError } = await supabase
      .from("shift_swap_requests")
      .select(
        `
        id,
        requester_id,
        accepted_by,
        approved_by,
        shift_id,
        reason,
        status,
        created_at,
        shifts (
          id,
          role_name,
          location,
          starts_at,
          ends_at,
          status,
          worker_id
        )
      `
      )
      .in("status", ["awaiting_supervisor_approval"])
      .order("created_at", { ascending: false });

    if (swapError) {
      console.error("Swap request loading error:", swapError);
      setMessage(`Could not load swap requests: ${swapError.message}`);
    }

    setAbsenceRequests((absences ?? []) as AbsenceRequest[]);
    setSwapRequests((swaps ?? []) as SwapRequest[]);
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function approveAbsence(request: AbsenceRequest) {
    setMessage("");

    const { error: requestError } = await supabase
      .from("absence_requests")
      .update({
        status: "approved",
      })
      .eq("id", request.id);

    if (requestError) {
      setMessage(`Absence approval failed: ${requestError.message}`);
      return;
    }

    setMessage("Absence request approved.");
    await loadRequests();
  }

  async function rejectAbsence(request: AbsenceRequest) {
    setMessage("");

    const { error: requestError } = await supabase
      .from("absence_requests")
      .update({
        status: "rejected",
      })
      .eq("id", request.id);

    if (requestError) {
      setMessage(`Absence rejection failed: ${requestError.message}`);
      return;
    }

    setMessage("Absence request rejected.");
    await loadRequests();
  }

  async function approveSwap(request: SwapRequest) {
    if (!profile) return;

    setMessage("");

    if (!request.accepted_by) {
      setMessage("This swap has not been accepted by another worker yet.");
      return;
    }

    const { error: shiftError } = await supabase
      .from("shifts")
      .update({
        worker_id: request.accepted_by,
        status: "scheduled",
      })
      .eq("id", request.shift_id);

    if (shiftError) {
      setMessage(`Shift transfer failed: ${shiftError.message}`);
      return;
    }

    const { error: requestError } = await supabase
      .from("shift_swap_requests")
      .update({
        status: "approved",
        approved_by: profile.id,
        approved_at: new Date().toISOString(),
        decision_note: "Supervisor approved shift swap.",
      })
      .eq("id", request.id);

    if (requestError) {
      setMessage(`Swap approval failed: ${requestError.message}`);
      return;
    }

    setMessage("Shift swap approved and shift transferred.");
    await loadRequests();
  }

  async function rejectSwap(request: SwapRequest) {
    setMessage("");

    const { error: requestError } = await supabase
      .from("shift_swap_requests")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        decision_note: "Supervisor rejected shift swap.",
      })
      .eq("id", request.id);

    if (requestError) {
      setMessage(`Swap rejection failed: ${requestError.message}`);
      return;
    }

    const { error: shiftError } = await supabase
      .from("shifts")
      .update({
        status: "scheduled",
      })
      .eq("id", request.shift_id);

    if (shiftError) {
      setMessage(`Shift reset failed: ${shiftError.message}`);
      return;
    }

    setMessage("Shift swap rejected and original shift restored.");
    await loadRequests();
  }

  const totalRequests = absenceRequests.length + swapRequests.length;

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-black">
              Supervisor Approval Center
            </h1>

            <p className="mt-2 text-gray-500">
              Review absence requests, accepted shift swaps, and workforce
              exceptions.
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

        {message && (
          <div className="mt-6 rounded-2xl border bg-white p-4 text-sm font-medium text-gray-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Pending Decisions
            </p>

            <h3 className="mt-4 text-5xl font-bold">{totalRequests}</h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Absence Requests
            </p>

            <h3 className="mt-4 text-5xl font-bold">
              {absenceRequests.length}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Swap Approvals
            </p>

            <h3 className="mt-4 text-5xl font-bold">{swapRequests.length}</h3>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-black">
            Absence Requests
          </h2>

          {loading ? (
            <p className="mt-4 text-gray-500">Loading absence requests...</p>
          ) : absenceRequests.length === 0 ? (
            <p className="mt-4 text-gray-500">
              No pending absence requests.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {absenceRequests.map((request) => (
                <div key={request.id} className="rounded-xl border p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-black">
                        {request.profiles?.full_name ?? "Worker"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {request.reason}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Requested date: {request.requested_date}
                      </p>

                      <span className="mt-3 inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                        {request.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 md:w-56">
                      <button
                        onClick={() => approveAbsence(request)}
                        className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
                      >
                        Approve Absence
                      </button>

                      <button
                        onClick={() => rejectAbsence(request)}
                        className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                      >
                        Reject Absence
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-black">
            Shift Swap Approvals
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            These swaps have been offered by one worker and accepted by another
            worker. Supervisor approval is required before transfer.
          </p>

          {loading ? (
            <p className="mt-4 text-gray-500">Loading swap approvals...</p>
          ) : swapRequests.length === 0 ? (
            <p className="mt-4 text-gray-500">
              No shift swaps awaiting supervisor approval.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {swapRequests.map((request) => (
                <div key={request.id} className="rounded-xl border p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-black">
                        {request.shifts?.role_name ?? "Shift Swap"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {request.shifts?.location ?? "No location"}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Start:{" "}
                        {request.shifts?.starts_at
                          ? new Date(request.shifts.starts_at).toLocaleString()
                          : "N/A"}
                      </p>

                      <p className="text-sm text-gray-600">
                        End:{" "}
                        {request.shifts?.ends_at
                          ? new Date(request.shifts.ends_at).toLocaleString()
                          : "N/A"}
                      </p>

                      <span className="mt-3 inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                        {request.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 md:w-56">
                      <button
                        onClick={() => approveSwap(request)}
                        className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
                      >
                        Approve Swap
                      </button>

                      <button
                        onClick={() => rejectSwap(request)}
                        className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                      >
                        Reject Swap
                      </button>
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