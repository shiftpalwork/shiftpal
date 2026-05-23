"use client";

import { useState } from "react";

export function ShiftForm() {
  const [message, setMessage] = useState("");
  return (
    <form
      className="grid gap-3 rounded-2xl border bg-white p-5 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage("Shift captured locally. Connect Supabase auth to save live shifts.");
      }}
    >
      <h2 className="text-lg font-bold">Create Shift</h2>
      <input className="rounded-xl border p-3" placeholder="Worker UUID" required />
      <input className="rounded-xl border p-3" placeholder="Role e.g. Picker" required />
      <input className="rounded-xl border p-3" placeholder="Location e.g. Warehouse A" required />
      <input className="rounded-xl border p-3" type="datetime-local" required />
      <button className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Create shift</button>
      {message && <p className="text-sm text-green-700">{message}</p>}
    </form>
  );
}
