export function InfoPill({ children, tone = 'slate', className = '' }) {
  const tones = {
    slate: {
      shell: 'border-white/10 bg-white/[0.05] text-slate-200',
      dot: 'bg-slate-300',
    },
    orange: {
      shell: 'border-orange-300/20 bg-orange-400/10 text-orange-100',
      dot: 'bg-orange-300',
    },
    amber: {
      shell: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
      dot: 'bg-amber-200',
    },
    rose: {
      shell: 'border-rose-300/20 bg-rose-400/10 text-rose-100',
      dot: 'bg-rose-300',
    },
    emerald: {
      shell: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100',
      dot: 'bg-emerald-300',
    },
  };
  const style = tones[tone] || tones.slate;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.18em] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${style.shell} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
