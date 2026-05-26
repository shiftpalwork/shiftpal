"use client";

import { useEffect } from "react";
import { getCurrentUserProfile } from "@/lib/auth";

export default function RoleRouterPage() {
  useEffect(() => {
    async function routeUser() {
      const profile = await getCurrentUserProfile();

      if (!profile) {
        window.location.href = "/login";
        return;
      }

      if (profile.role === "admin") {
        window.location.href = "/admin";
        return;
      }

      if (profile.role === "supervisor") {
        window.location.href = "/supervisor";
        return;
      }

      if (profile.role === "worker") {
        window.location.href = "/worker";
        return;
      }

      window.location.href = "/role-router";
    }

    routeUser();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-black">Loading ShiftPal...</h1>
        <p className="mt-2 text-gray-500">
          Checking your role and preparing your workspace.
        </p>
      </div>
    </main>
  );
}