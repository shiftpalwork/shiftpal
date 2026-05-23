"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@shiftpal.co.za");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "Logged in successfully.");
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-black">Login</h1>
      <div className="mt-5 grid gap-3">
        <input className="rounded-xl border p-3" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="rounded-xl border p-3" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={login} className="rounded-xl bg-slate-900 p-3 font-bold text-white">Login</button>
        {message && <p className="text-sm">{message}</p>}
      </div>
    </div>
  );
}
