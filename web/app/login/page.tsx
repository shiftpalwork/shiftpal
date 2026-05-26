"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

type LoginMode = "worker" | "supervisor";

export default function LoginPage() {
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<LoginMode>("worker");
  const [message, setMessage] = useState("");

  async function handleLogin(selectedMode: LoginMode) {
    setMessage("");
    setMode(selectedMode);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  setMessage("Authentication failed.");
  return;
}

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (profileError || !profile) {
  setMessage("Profile not found.");
  return;
}

if (selectedMode === "worker" && profile.role !== "worker") {
  await supabase.auth.signOut();

  setMessage(
    "This account is not registered as a worker."
  );

  return;
}

if (
  selectedMode === "supervisor" &&
  profile.role !== "supervisor"
) {
  await supabase.auth.signOut();

  setMessage(
    "This account is not registered as a supervisor."
  );

  return;
}

if (profile.role === "worker") {
  window.location.href = "/worker";
  return;
}

if (profile.role === "supervisor") {
  window.location.href = "/supervisor";
  return;
}
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black">ShiftPal Login</h1>

          <p className="mt-2 text-sm text-gray-500">
            Access your workforce workspace.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("worker")}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              mode === "worker"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-50"
            }`}
          >
            Worker
          </button>

          <button
            type="button"
            onClick={() => setMode("supervisor")}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              mode === "supervisor"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-50"
            }`}
          >
            Supervisor
          </button>
        </div>

        <input
          className="mb-4 w-full rounded-xl border p-4"
          placeholder={
            mode === "worker"
              ? "Worker email"
              : "Supervisor email"
          }
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          className="mb-4 w-full rounded-xl border p-4"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="grid gap-3">
          <button
            onClick={() => handleLogin("worker")}
            className="w-full rounded-xl bg-black p-4 font-semibold text-white"
          >
            Login as Worker
          </button>

          <button
            onClick={() => handleLogin("supervisor")}
            className="w-full rounded-xl border bg-white p-4 font-semibold text-black hover:bg-gray-50"
          >
            Login as Supervisor
          </button>
        </div>

        <div className="mt-6 border-t pt-5">
          <p className="text-sm text-gray-500">
            New to ShiftPal?
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <a
              href="/signup?role=worker"
              className="rounded-xl border px-4 py-3 text-center text-sm font-semibold hover:bg-gray-50"
            >
              Signup as Worker
            </a>

            <a
              href="/signup?role=supervisor"
              className="rounded-xl border px-4 py-3 text-center text-sm font-semibold hover:bg-gray-50"
            >
              Signup as Supervisor
            </a>
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}