export function Keycap({ children, className = '' }) {
  return (
    <span
      className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.9))] px-2.5 font-pixel text-[10px] uppercase tracking-[0.16em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_rgba(2,6,23,0.32)] ${className}`}
    >
      {children}
    </span>
  );
}
