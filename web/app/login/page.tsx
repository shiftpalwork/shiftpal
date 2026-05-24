"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    setLoading(true);
    setMessage("");

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (!loginError && loginData.user) {
      router.push("/dashboard");
      return;
    }

    const { data: signupData, error: signupError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (signupError) {
      setMessage(signupError.message);
      setLoading(false);
      return;
    }

    if (signupData.user) {
      setMessage("Account created successfully. Please login again.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-4xl font-bold mb-6">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-4 rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-4 rounded-lg mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-black text-white p-4 rounded-lg"
        >
          {loading ? "Loading..." : "Login / Sign Up"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-red-500">{message}</p>
        )}
      </div>
    </main>
  );
}