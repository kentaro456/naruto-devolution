export function SurfacePanel({ children, className = '' }) {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-slate-900/76 shadow-[0_28px_80px_rgba(2,6,23,0.46)] ${className}`}>
      {children}
    </div>
  );
}
