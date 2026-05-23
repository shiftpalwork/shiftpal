import Link from "next/link";

const nav = [
  ["Dashboard", "/dashboard"],
  ["Shifts", "/shifts"],
  ["Swaps", "/swaps"]
];

export function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-black tracking-tight">ShiftPal</Link>
        <div className="flex gap-4 text-sm font-medium">
          {nav.map(([label, href]) => <Link key={href} href={href} className="hover:text-blue-700">{label}</Link>)}
        </div>
      </nav>
    </header>
  );
}
