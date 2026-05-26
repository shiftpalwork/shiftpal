"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { ShiftForm } from "@/components/ShiftForm";

type Shift = {
  id: string;
  role_name: string;
  location: string;
  starts_at: string;
  ends_at: string;
  status: string;
  qr_code_token: string | null;
};

export default function ShiftsPage() {
  const supabase = createBrowserSupabaseClient();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadShifts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("shifts")
      .select(
        "id, role_name, location, starts_at, ends_at, status, qr_code_token"
      )
      .order("starts_at", { ascending: true });

    if (error) {
      console.error("Shift loading error:", error);
    }

    setShifts((data ?? []) as Shift[]);
    setLoading(false);
  }

  useEffect(() => {
    loadShifts();

    const channel = supabase
      .channel("shifts-page-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shifts" },
        () => {
          loadShifts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-black">
              Shift Management
            </h1>

            <p className="mt-2 text-gray-500">
              View schedules, QR verification tokens, and live workforce shift
              operations.
            </p>
          </div>

          <a
            href="/dashboard"
            className="w-fit rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back to Dashboard
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="hidden grid-cols-6 border-b bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-500 md:grid">
            <span>Role</span>
            <span>Location</span>
            <span>Start</span>
            <span>End</span>
            <span>Status</span>
            <span>QR Token</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading shifts...
            </div>
          ) : shifts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No shifts found.
            </div>
          ) : (
            shifts.map((shift) => (
              <div
                key={shift.id}
                className="grid gap-3 border-b px-6 py-5 last:border-b-0 md:grid-cols-6 md:items-center"
              >
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
                    Role
                  </p>

                  <p className="font-semibold text-black">{shift.role_name}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
                    Location
                  </p>

                  <p className="text-gray-700">{shift.location}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
                    Start
                  </p>

                  <p className="text-gray-700">
                    {new Date(shift.starts_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
                    End
                  </p>

                  <p className="text-gray-700">
                    {new Date(shift.ends_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
                    Status
                  </p>

                  <span className="inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    {shift.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400 md:hidden">
                    QR Token
                  </p>

                  <span className="inline-flex rounded-xl bg-gray-100 px-3 py-2 font-mono text-sm font-bold tracking-widest text-black">
                    {shift.qr_code_token ?? "NO TOKEN"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div></div>

          <div>
            <ShiftForm />
          </div>
        </div>
      </section>
    </main>
  );
}