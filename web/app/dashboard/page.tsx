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
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    async function loadShifts() {
      const { data, error } = await supabase
        .from("shifts")
        .select("id, role_name, location, starts_at, ends_at, status")
        .order("starts_at", { ascending: true });

      if (error) {
        console.error(error);
      }

      if (data) {
        setShifts(data);
      }

      setLoading(false);
    }

    loadShifts();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="rounded-2xl bg-white p-10 shadow">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Live Supabase dashboard</p>
            <h1 className="text-4xl font-bold">ShiftPal Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <a href="/dashboard" className="font-medium text-gray-700">
              Dashboard
            </a>

            <a href="/shifts" className="font-medium text-gray-700">
              Shifts
            </a>

            <a href="/swaps" className="font-medium text-gray-700">
              Swaps
            </a>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-5 py-2 text-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border p-6">
            <p className="text-gray-500">Total Shifts</p>
            <h2 className="mt-2 text-5xl font-bold">{shifts.length}</h2>
          </div>

          <div className="rounded-xl border p-6">
            <p className="text-gray-500">Scheduled</p>
            <h2 className="mt-2 text-5xl font-bold">
              {shifts.filter((shift) => shift.status === "scheduled").length}
            </h2>
          </div>

          <div className="rounded-xl border p-6">
            <p className="text-gray-500">Attendance</p>
            <h2 className="mt-2 text-5xl font-bold">98%</h2>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="mb-4 text-2xl font-semibold">Live Shift Feed</h2>

          {loading ? (
            <p>Loading shifts...</p>
          ) : shifts.length === 0 ? (
            <p>No shifts found.</p>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift) => (
                <div key={shift.id} className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold">{shift.role_name}</h3>

                  <p className="text-sm text-gray-600">{shift.location}</p>

                  <p className="text-sm text-gray-500">
                    {new Date(shift.starts_at).toLocaleString()} →{" "}
                    {new Date(shift.ends_at).toLocaleString()}
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    Status: {shift.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}