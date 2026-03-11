export function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 shadow-[0_12px_30px_rgba(2,6,23,0.32)]">
      <div className="font-pixel text-[9px] uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}
