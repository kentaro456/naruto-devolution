export function InfoPill({ children, tone = 'slate', className = '' }) {
  const tones = {
    slate: 'border-white/10 bg-white/5 text-slate-300',
    orange: 'border-orange-300/20 bg-orange-400/10 text-orange-100',
    amber: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
    rose: 'border-rose-300/20 bg-rose-400/10 text-rose-100',
    emerald: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100',
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.18em] ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
