import { ShiftForm } from "@/components/ShiftForm";

const shifts = [
  ["Thabo Dlamini", "Picker", "Warehouse A", "Tomorrow 08:00 - 16:00"],
  ["Lerato Nkosi", "Packer", "Warehouse A", "Friday 06:00 - 14:00"]
];

export default function ShiftsPage() {
  return (
    <section className="grid gap-6 md:grid-cols-[1fr_380px]">
      <div>
        <h1 className="text-3xl font-black">Manage Shifts</h1>
        <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
          {shifts.map(([name, role, location, time]) => (
            <div key={name} className="grid gap-2 border-b p-4 last:border-b-0 md:grid-cols-4">
              <strong>{name}</strong><span>{role}</span><span>{location}</span><span>{time}</span>
            </div>
          ))}
        </div>
      </div>
      <ShiftForm />
    </section>
  );
}
