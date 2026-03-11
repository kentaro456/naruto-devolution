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

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_14px_34px_rgba(2,6,23,0.45)]">
      <div className={`font-pixel text-[11px] uppercase tracking-[0.22em] ${alignRight ? 'text-right text-rose-300' : 'text-orange-300'}`}>
        {data?.name || (alignRight ? 'CPU' : 'PLAYER')}
      </div>
      <div className={`mt-2 flex items-center gap-2 text-xs text-slate-300 ${alignRight ? 'flex-row-reverse' : 'justify-between'}`}>
        <span>{data?.healthText || '100 / 100'}</span>
        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-pixel text-[9px] uppercase tracking-[0.18em] text-slate-200">
          {data?.stateText || 'PRÊT'}
        </span>
      </div>
      <div className="relative mt-3 h-5 overflow-hidden rounded-full border border-white/10 bg-black/60">
        <div className="absolute inset-y-0 bg-rose-400/30" style={bufferedStyle} />
        <div className={`absolute inset-y-0 bg-gradient-to-r from-emerald-500 to-emerald-300 ${alignRight ? 'bg-gradient-to-l' : ''}`} style={healthStyle} />
      </div>
      <div className="relative mt-2 h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/60">
        <div className={`absolute inset-y-0 bg-gradient-to-r from-amber-500 to-orange-300 ${alignRight ? 'bg-gradient-to-l' : ''}`} style={chakraStyle} />
      </div>
      <div className="relative mt-2 h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/60">
        <div className={`absolute inset-y-0 bg-gradient-to-r from-amber-500 to-yellow-300 ${alignRight ? 'bg-gradient-to-l' : ''}`} style={staminaStyle} />
      </div>
    </div>
  );
}
