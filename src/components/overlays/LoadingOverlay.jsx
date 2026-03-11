export function LoadingOverlay({
  title = 'Chargement',
  message = 'React charge maintenant le runtime du jeu. Le HTML reste limite au bootstrap Vite.',
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950 px-4 py-6">
      <div className="w-full max-w-2xl rounded-[32px] border border-orange-300/20 bg-slate-900/84 p-8 shadow-[0_28px_80px_rgba(2,6,23,0.62)]">
        <div className="font-pixel text-xl uppercase tracking-[0.24em] text-orange-300">{title}</div>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          {message}
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full border border-white/10 bg-black/40">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-orange-400 to-emerald-300" />
        </div>
      </div>
    </div>
  );
}
