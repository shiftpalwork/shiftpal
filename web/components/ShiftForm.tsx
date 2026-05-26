"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

type WorkerProfile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  company_id: string;
};

export function ShiftForm() {
  const supabase = createBrowserSupabaseClient();

  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [workerId, setWorkerId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadWorkers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, company_id")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Worker loading error:", error);
        setMessage("Could not load workers.");
        return;
      }

      setWorkers(data ?? []);
    }

    loadWorkers();
  }, []);

  async function handleCreateShift(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const selectedWorker = workers.find((worker) => worker.id === workerId);

    if (!selectedWorker) {
      setSaving(false);
      setMessage("Please select a worker.");
      return;
    }

    const { error } = await supabase.from("shifts").insert({
      company_id: selectedWorker.company_id,
      worker_id: selectedWorker.id,
      role_name: roleName,
      location,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      status: "scheduled",
      title: `${roleName} Shift`,
      department: "Operations",
      shift_date: startsAt.slice(0, 10),
      start_time: startsAt.slice(11, 16),
      end_time: endsAt.slice(11, 16),
      assigned_employee_id: null,
    });

    if (error) {
      console.error("Shift creation error:", error);
      setMessage(`Failed to create shift: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Shift created successfully.");

    setWorkerId("");
    setRoleName("");
    setLocation("");
    setStartsAt("");
    setEndsAt("");
    setSaving(false);

    window.location.reload();
  }

  return (
    <form
      onSubmit={handleCreateShift}
      className="grid gap-4 rounded-2xl border bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-bold text-black">Create Shift</h2>
        <p className="mt-1 text-sm text-gray-500">
          Assign a worker and publish a live scheduled shift.
        </p>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">Worker</label>

        <select
          value={workerId}
          onChange={(event) => {
            const selectedId = event.target.value;
            const selectedWorker = workers.find(
              (worker) => worker.id === selectedId
            );

            setWorkerId(selectedId);

            if (selectedWorker) {
              setRoleName(selectedWorker.role);
            }
          }}
          required
          className="rounded-xl border p-3 text-sm"
        >
          <option value="">Select worker</option>

          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.full_name} — {worker.role}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">Role</label>

        <input
          value={roleName}
          onChange={(event) => setRoleName(event.target.value)}
          className="rounded-xl border p-3 text-sm"
          placeholder="e.g. Supervisor"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">Location</label>

        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="rounded-xl border p-3 text-sm"
          placeholder="e.g. Johannesburg HQ"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">Start Time</label>

        <input
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
          className="rounded-xl border p-3 text-sm"
          type="datetime-local"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">End Time</label>

        <input
          value={endsAt}
          onChange={(event) => setEndsAt(event.target.value)}
          className="rounded-xl border p-3 text-sm"
          type="datetime-local"
          required
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Creating shift..." : "Create Shift"}
      </button>

      {message && <p className="text-sm font-medium text-gray-700">{message}</p>}
    </form>
  );
}