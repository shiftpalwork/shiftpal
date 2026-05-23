type Props = {
  requester: string;
  target: string;
  status: string;
  reason: string;
};

export function SwapCard({ requester, target, status, reason }: Props) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{requester} → {target}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{status}</span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{reason}</p>
      <div className="mt-4 flex gap-2">
        <button className="rounded-xl bg-green-700 px-3 py-2 text-sm font-semibold text-white">Approve</button>
        <button className="rounded-xl bg-red-700 px-3 py-2 text-sm font-semibold text-white">Decline</button>
      </div>
    </article>
  );
}
