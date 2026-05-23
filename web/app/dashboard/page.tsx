const cards = [
  ["Coverage", "94%", "Scheduled roles covered today"],
  ["Approvals", "7", "Swap requests awaiting supervisor action"],
  ["Absentees", "2", "Flagged for HR review"],
  ["Payroll", "Ready", "Export this week’s payable hours"]
];

export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-3xl font-black">Supervisor Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {cards.map(([title, value, caption]) => (
          <div key={title} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
            <p className="mt-2 text-sm text-slate-600">{caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
