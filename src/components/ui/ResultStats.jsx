export function ResultStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55">
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="grid grid-cols-[1fr_auto_1fr] border-b border-white/10 bg-white/5 px-4 py-3 font-pixel text-[10px] uppercase tracking-[0.18em] text-slate-200">
            <div>{stats.p1Name}</div>
            <div className="px-4 text-center text-slate-400">Statistiques</div>
            <div className="text-right">{stats.p2Name}</div>
          </div>
          <div className="divide-y divide-white/5">
            {stats.rows.map(([label, p1, p2]) => (
              <div key={label} className="grid grid-cols-[1fr_auto_1fr] px-4 py-3 text-sm text-slate-200">
                <div className={p1 > p2 ? 'text-orange-300' : 'text-slate-300'}>{p1}</div>
                <div className="px-4 text-center text-slate-400">{label}</div>
                <div className={`text-right ${p2 > p1 ? 'text-rose-300' : 'text-slate-300'}`}>{p2}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
