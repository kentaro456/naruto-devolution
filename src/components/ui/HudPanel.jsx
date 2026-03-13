export function HudPanel({ side, data }) {
  const alignRight = side === 'right';
  const healthStyle = alignRight
    ? { width: `${(data?.healthPercent || 0) * 100}%`, right: 0 }
    : { width: `${(data?.healthPercent || 0) * 100}%`, left: 0 };
  const bufferedStyle = alignRight
    ? { width: `${(data?.bufferedHealthPercent || 0) * 100}%`, right: 0 }
    : { width: `${(data?.bufferedHealthPercent || 0) * 100}%`, left: 0 };
  const chakraStyle = alignRight
    ? { width: `${(data?.chakraPercent || 0) * 100}%`, right: 0 }
    : { width: `${(data?.chakraPercent || 0) * 100}%`, left: 0 };
  const staminaStyle = alignRight
    ? { width: `${(data?.staminaPercent || 0) * 100}%`, right: 0 }
    : { width: `${(data?.staminaPercent || 0) * 100}%`, left: 0 };
  const comboCount = Math.max(0, Number(data?.comboCount) || 0);
  const roleLabel = alignRight ? 'Shinobi rival' : 'Shinobi actif';

  const meterJustify = alignRight ? 'items-end text-right' : 'items-start text-left';

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.86))] p-4 shadow-[0_18px_34px_rgba(2,6,23,0.45)] sm:p-5">
      <div
        className={`pointer-events-none absolute inset-0 ${alignRight ? 'bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.16),transparent_34%)]' : 'bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_34%)]'}`}
      />
      <div className="relative z-10">
        <div className={`flex items-start justify-between gap-3 ${alignRight ? 'flex-row-reverse' : ''}`}>
          <div className={`min-w-0 ${meterJustify}`}>
            <div className={`font-pixel text-[11px] uppercase tracking-[0.22em] ${alignRight ? 'text-rose-300' : 'text-orange-300'}`}>
              {data?.name || (alignRight ? 'CPU' : 'PLAYER')}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.26em] text-white/35">{roleLabel}</div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-pixel text-[9px] uppercase tracking-[0.18em] text-slate-100">
            {data?.stateText || 'PRÊT'}
          </span>
        </div>

        <div className={`mt-4 flex items-center justify-between text-[11px] text-slate-300 sm:text-xs ${alignRight ? 'flex-row-reverse' : ''}`}>
          <span className="font-medium text-slate-200">{data?.healthText || '100 / 100'}</span>
          <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Vie</span>
        </div>
        <div className="relative mt-2 h-5 overflow-hidden rounded-full border border-white/10 bg-black/60">
          <div
            className="absolute inset-y-0 bg-rose-400/28 transition-all duration-1000 ease-out delay-200"
            style={bufferedStyle}
          />
          <div
            className={`absolute inset-y-0 transition-all duration-150 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 ${alignRight ? 'bg-gradient-to-l' : ''}`}
            style={healthStyle}
          />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className={`flex flex-col gap-1 ${meterJustify}`}>
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Chakra</div>
            <div className="relative h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/60">
              <div
                className={`absolute inset-y-0 transition-all duration-150 bg-gradient-to-r from-amber-500 to-orange-300 ${alignRight ? 'bg-gradient-to-l' : ''}`}
                style={chakraStyle}
              />
            </div>
          </div>
          <div className={`flex flex-col gap-1 ${meterJustify}`}>
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Endurance</div>
            <div className="relative h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/60">
              <div
                className={`absolute inset-y-0 transition-all duration-150 bg-gradient-to-r from-amber-200 to-yellow-300 ${alignRight ? 'bg-gradient-to-l' : ''}`}
                style={staminaStyle}
              />
            </div>
          </div>
        </div>

        {comboCount > 1 ? (
          <div className={`mt-4 flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
            <div className="rounded-full border border-amber-200/25 bg-amber-300/10 px-3 py-1.5 shadow-[0_0_22px_rgba(251,191,36,0.18)]">
              <div className="font-pixel text-[10px] uppercase tracking-[0.28em] text-amber-100 animate-pulse">
                {comboCount} Hits
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
