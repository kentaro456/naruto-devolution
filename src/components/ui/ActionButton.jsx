export function ActionButton({ onClick, children, accent = 'orange', className = '', ...props }) {
  const accents = {
    orange: 'border-orange-300/25 text-orange-100 hover:border-orange-300 hover:bg-orange-400/10',
    rose: 'border-rose-300/25 text-rose-100 hover:border-rose-300 hover:bg-rose-400/10',
    slate: 'border-white/10 text-slate-100 hover:border-white/20 hover:bg-white/5',
  };

  return (
    <button
      {...props}
      onClick={onClick}
      className={`inline-flex min-w-0 w-full items-center justify-center rounded-2xl border bg-slate-900/72 px-4 py-3 text-center font-pixel text-[10px] uppercase tracking-[0.16em] transition hover:-translate-y-0.5 sm:min-w-56 sm:px-5 sm:py-4 sm:text-xs sm:tracking-[0.2em] ${accents[accent]} ${className}`}
    >
      {children}
    </button>
  );
}
