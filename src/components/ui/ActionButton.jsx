export function ActionButton({ onClick, children, accent = 'orange', className = '', ...props }) {
  const accents = {
    orange:
      'border-orange-300/25 bg-[linear-gradient(180deg,rgba(251,146,60,0.18),rgba(251,146,60,0.06))] text-orange-50 hover:border-orange-200/70 hover:text-white hover:shadow-[0_16px_40px_rgba(249,115,22,0.22)] active:translate-y-0 active:shadow-[0_10px_24px_rgba(249,115,22,0.16)] focus-visible:ring-orange-300/35',
    rose:
      'border-rose-300/25 bg-[linear-gradient(180deg,rgba(244,63,94,0.18),rgba(244,63,94,0.06))] text-rose-50 hover:border-rose-200/70 hover:text-white hover:shadow-[0_16px_40px_rgba(244,63,94,0.22)] active:translate-y-0 active:shadow-[0_10px_24px_rgba(244,63,94,0.16)] focus-visible:ring-rose-300/35',
    slate:
      'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] text-slate-100 hover:border-white/25 hover:text-white hover:shadow-[0_16px_34px_rgba(15,23,42,0.34)] active:translate-y-0 active:shadow-[0_8px_20px_rgba(15,23,42,0.2)] focus-visible:ring-white/20',
  };

  return (
    <button
      {...props}
      type={props.type || 'button'}
      onClick={onClick}
      className={`group relative inline-flex min-h-12 w-full min-w-0 items-center justify-center overflow-hidden rounded-[22px] border px-4 py-3 text-center font-pixel text-[10px] uppercase tracking-[0.18em] transition duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090c13] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:min-h-[52px] sm:min-w-56 sm:px-5 sm:py-4 sm:text-xs sm:tracking-[0.2em] ${accents[accent]} ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_45%,rgba(255,255,255,0.08))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-80" />
      <span className="relative z-10 flex items-center justify-center gap-2 leading-none">{children}</span>
    </button>
  );
}
