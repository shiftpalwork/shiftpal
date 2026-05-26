"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

type SwapRequest = {
  id: string;
  requester_id: string;
  accepted_by: string | null;
  approved_by: string | null;
  shift_id: string;
  reason: string | null;
  status: string;
  created_at: string;

  requester_profile?: {
    full_name: string;
  } | null;

  accepted_profile?: {
    full_name: string;
  } | null;

  shifts?: {
    role_name: string;
    location: string;
    starts_at: string;
    ends_at: string;
  } | null;
};

export default function SwapsPage() {
  const supabase = createBrowserSupabaseClient();

  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSwaps() {
    setLoading(true);

    const { data, error } = await supabase
      .from("shift_swap_requests")
      .select(`
        id,
        requester_id,
        accepted_by,
        approved_by,
        shift_id,
        reason,
        status,
        created_at,

        shifts (
          role_name,
          location,
          starts_at,
          ends_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Swap loading error:", error);
      setLoading(false);
      return;
    }

    const enrichedSwaps = await Promise.all(
      (data ?? []).map(async (swap) => {
        let requesterProfile = null;
        let acceptedProfile = null;

        if (swap.requester_id) {
          const { data: requesterData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", swap.requester_id)
            .single();

          requesterProfile = requesterData;
        }

        if (swap.accepted_by) {
          const { data: acceptedData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", swap.accepted_by)
            .single();

          acceptedProfile = acceptedData;
        }

        return {
          ...swap,
          requester_profile: requesterProfile,
          accepted_profile: acceptedProfile,
        };
      })
    );

    setSwapRequests(enrichedSwaps);
    setLoading(false);
  }

  useEffect(() => {
    loadSwaps();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black">
              Live Swap Operations
            </h1>

            <p className="mt-2 text-gray-500">
              Real-time workforce shift exchange activity.
            </p>
          </div>

          <a
            href="/supervisor"
            className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
          >
            Back to Supervisor Workspace
          </a>
        </div>

        {loading ? (
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Loading live swaps...</p>
          </div>
        ) : swapRequests.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">
              No live shift swaps found.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {swapRequests.map((swap) => (
              <div
                key={swap.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      {swap.requester_profile?.full_name ?? "Worker"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      requesting shift transfer
                    </p>
                  </div>

                  <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    {swap.status}
                  </span>
                </div>

                <div className="mt-5 rounded-xl border p-4">
                  <p className="text-sm text-gray-500">
                    Role
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    {swap.shifts?.role_name ?? "Unknown Shift"}
                  </h3>

                  <p className="mt-3 text-sm text-gray-500">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {swap.shifts?.location ?? "No location"}
                  </p>

                  <p className="mt-3 text-sm text-gray-500">
                    Shift Time
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {swap.shifts?.starts_at
                      ? new Date(
                          swap.shifts.starts_at
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                  <p className="text-sm font-medium">
                    →
                  </p>

                  <p className="text-sm font-medium">
                    {swap.shifts?.ends_at
                      ? new Date(
                          swap.shifts.ends_at
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-sm text-gray-500">
                    Reason
                  </p>

                  <p className="mt-1 text-sm">
                    {swap.reason ?? "No reason supplied."}
                  </p>
                </div>

                <div className="mt-5 rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Accepted By
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {swap.accepted_profile?.full_name ??
                      "Awaiting peer acceptance"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}