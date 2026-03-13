export function ResultStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(2,6,23,0.88))] shadow-[0_20px_48px_rgba(2,6,23,0.34)]">
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="grid grid-cols-[1fr_auto_1fr] border-b border-white/10 bg-white/[0.04] px-4 py-4 font-pixel text-[10px] uppercase tracking-[0.18em] text-slate-100">
            <div className="text-orange-200">{stats.p1Name}</div>
            <div className="px-4 text-center text-slate-500">Bilan du duel</div>
            <div className="text-right text-rose-200">{stats.p2Name}</div>
          </div>
          <div className="divide-y divide-white/5">
            {stats.rows.map(([label, p1, p2]) => (
              <div key={label} className="grid grid-cols-[1fr_auto_1fr] px-4 py-3 text-sm text-slate-200">
                <div className={`font-medium ${p1 > p2 ? 'text-orange-200' : 'text-slate-300'}`}>{p1}</div>
                <div className="px-4 text-center text-slate-400">{label}</div>
                <div className={`text-right font-medium ${p2 > p1 ? 'text-rose-200' : 'text-slate-300'}`}>{p2}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
