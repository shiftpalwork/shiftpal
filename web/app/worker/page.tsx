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
  worker_id: string;
};

export default function WorkerPage() {
  const supabase = createBrowserSupabaseClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [availableShifts, setAvailableShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadWorkerData() {
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

    const { data: assignedShifts, error: assignedError } = await supabase
      .from("shifts")
      .select("id, role_name, location, starts_at, ends_at, status, worker_id")
      .eq("worker_id", currentProfile.id)
      .order("starts_at", { ascending: true });

    if (assignedError) {
      console.error("Worker shift loading error:", assignedError);
    }

const { data: swapRequests, error: swapError } = await supabase
  .from("shift_swap_requests")
  .select(`
    id,
    status,
    shift_id,
    shifts (
      id,
      role_name,
      location,
      starts_at,
      ends_at,
      status,
      worker_id
    )
  `)
  .eq("status", "pending");

if (swapError) {
  console.error("Available shift loading error:", swapError);
}

const peerShifts =
  swapRequests
    ?.map((request: any) => request.shifts)
    ?.filter(Boolean)
    ?.filter(
      (shift: any) => shift.worker_id !== currentProfile.id
    ) ?? [];

    if (peerError) {
      console.error("Available shift loading error:", peerError);
    }

    setMyShifts(assignedShifts ?? []);
    setAvailableShifts(peerShifts ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadWorkerData();
  }, []);

async function requestAbsence(shiftId: string) {
  if (!profile) return;

  setMessage("");

  const shift = myShifts.find((item) => item.id === shiftId);

  if (!shift) {
    setMessage("Shift not found.");
    return;
  }

  const requestedDate = shift.starts_at.slice(0, 10);

  const { error: requestError } = await supabase
    .from("absence_requests")
    .insert({
      worker_id: profile.id,
      reason: "Personal absence request",
      requested_date: requestedDate,
      status: "pending",
    });

  if (requestError) {
    setMessage(`Absence request failed: ${requestError.message}`);
    return;
  }

  const { error: shiftError } = await supabase
    .from("shifts")
    .update({ status: "absence_requested" })
    .eq("id", shiftId);

  if (shiftError) {
    setMessage(`Shift update failed: ${shiftError.message}`);
    return;
  }

  setMessage("Absence request submitted successfully.");
  await loadWorkerData();
}

async function requestSwap(shiftId: string) {
  if (!profile) return;

  setMessage("");

  const { error: requestError } = await supabase
    .from("shift_swap_requests")
    .insert({
      requester_id: profile.id,
      target_worker_id: null,
      shift_id: shiftId,
      reason: "Worker requested shift swap",
      status: "pending",
    });

  if (requestError) {
    setMessage(`Swap request failed: ${requestError.message}`);
    return;
  }

  const { error: shiftError } = await supabase
    .from("shifts")
    .update({ status: "swap_requested" })
    .eq("id", shiftId);

  if (shiftError) {
    setMessage(`Shift update failed: ${shiftError.message}`);
    return;
  }

  setMessage("Shift swap request submitted successfully.");
  await loadWorkerData();
}

async function acceptPeerShift(shiftId: string) {
  if (!profile) return;

  setMessage("");

  const { error } = await supabase
    .from("shift_swap_requests")
    .update({
      accepted_by: profile.id,
      status: "awaiting_supervisor_approval",
    })
    .eq("shift_id", shiftId)
    .eq("status", "pending");

  if (error) {
    setMessage(`Could not accept shift: ${error.message}`);
    return;
  }

  setMessage(
    "Shift acceptance submitted. Waiting for supervisor approval."
  );

  await loadWorkerData();
}

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-black">
              Worker Self-Service Portal
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your shifts, absence requests, swap requests, and peer shift opportunities.
            </p>
          </div>

          <a
            href="/role-router"
            className="w-fit rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back to Workspace
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
            <p className="text-sm font-medium text-gray-500">My Shifts</p>
            <h3 className="mt-4 text-5xl font-bold">{myShifts.length}</h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Available Peer Shifts
            </p>
            <h3 className="mt-4 text-5xl font-bold">
              {availableShifts.length}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Portal Status</p>
            <h3 className="mt-4 text-3xl font-bold">Active</h3>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-black">My Assigned Shifts</h2>

          {loading ? (
            <p className="mt-4 text-gray-500">Loading your shifts...</p>
          ) : myShifts.length === 0 ? (
            <p className="mt-4 text-gray-500">No assigned shifts found.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {myShifts.map((shift) => (
                <div key={shift.id} className="rounded-xl border p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-black">
                        {shift.role_name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {shift.location}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Start: {new Date(shift.starts_at).toLocaleString()}
                      </p>

                      <p className="text-sm text-gray-600">
                        End: {new Date(shift.ends_at).toLocaleString()}
                      </p>

                      <span className="mt-3 inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                        {shift.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 md:w-56">
                      <button
                        onClick={() => requestAbsence(shift.id)}
                        className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                      >
                        Request Absence
                      </button>

                      <button
                        onClick={() => requestSwap(shift.id)}
                        className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
                      >
                        Offer Shift Swap
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
            Available Peer Shifts
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            These are shifts other workers have offered for swap.
          </p>

          {availableShifts.length === 0 ? (
            <p className="mt-4 text-gray-500">No peer shifts available.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {availableShifts.map((shift) => (
                <div key={shift.id} className="rounded-xl border p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-black">
                        {shift.role_name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {shift.location}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Start: {new Date(shift.starts_at).toLocaleString()}
                      </p>

                      <p className="text-sm text-gray-600">
                        End: {new Date(shift.ends_at).toLocaleString()}
                      </p>

                      <span className="mt-3 inline-flex rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">
                        {shift.status}
                      </span>
                    </div>

                    <button
                      onClick={() => acceptPeerShift(shift.id)}
                      className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
                    >
                      Accept Shift
                    </button>
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