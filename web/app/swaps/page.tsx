import { SwapCard } from "@/components/SwapCard";

export default function SwapsPage() {
  return (
    <section>
      <h1 className="text-3xl font-black">Swap Approvals</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SwapCard requester="Thabo Dlamini" target="Lerato Nkosi" status="pending_supervisor" reason="Family commitment. Peer has accepted the replacement." />
        <SwapCard requester="Nomsa Khumalo" target="Sipho Maseko" status="pending_peer" reason="Transport issue for early shift." />
      </div>
    </section>
  );
}
