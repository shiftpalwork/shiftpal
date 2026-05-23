import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-6 py-16 md:grid-cols-2">
      <div>
        <p className="font-semibold text-blue-700">Your Shift. Your Power.</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">ShiftPal workforce coordination for modern HR teams.</h1>
        <p className="mt-5 text-lg text-slate-600">Manage shifts, approvals, attendance exceptions, and payroll exports from one clean dashboard.</p>
        <Link href="/dashboard" className="mt-8 inline-flex rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white">Open dashboard</Link>
      </div>
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">MVP modules</h2>
        <ul className="mt-4 space-y-3 text-slate-700">
          <li>✓ Worker shift visibility</li>
          <li>✓ Peer swap request flow</li>
          <li>✓ Supervisor approval queue</li>
          <li>✓ Attendance records</li>
          <li>✓ Payroll CSV export</li>
        </ul>
      </div>
    </section>
  );
}
