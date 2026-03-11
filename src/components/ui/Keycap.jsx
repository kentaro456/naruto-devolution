export function Keycap({ children, className = '' }) {
  return (
    <span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 px-2 font-pixel text-[10px] uppercase tracking-[0.16em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(2,6,23,0.28)] ${className}`}>
      {children}
    </span>
  );
}
