export function LoadingOverlay({
  title = 'Chargement',
  message = 'Les portes du duel s ouvrent.',
  variant = 'boot',
}) {
  const isBoot = variant === 'boot';
  const statusLabel = isBoot ? "Portail de l'arene" : 'Annonce du combat';
  const accent = isBoot
    ? 'from-orange-400 via-amber-300 to-orange-500'
    : 'from-emerald-300 via-cyan-300 to-orange-400';
  const panelGlow = isBoot
    ? 'shadow-[0_28px_90px_rgba(249,115,22,0.18)]'
    : 'shadow-[0_28px_90px_rgba(16,185,129,0.16)]';
  const chipTone = isBoot
    ? 'border-orange-300/30 bg-orange-400/10 text-orange-200'
    : 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200';
  const steps = isBoot
    ? ['Allumage du dojo', 'Appel des combattants', 'Ouverture du hall']
    : ["Scellement de l'arene", 'Prise de position', 'Annonce de la manche'];

  return (
    <div
      className="absolute inset-0 z-40 overflow-hidden bg-slate-950/96 px-4 py-6 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.14),transparent_26%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:38px_38px] opacity-[0.08]" />
      <div className="relative flex h-full items-center justify-center">
        <div className={`ui-stage-enter relative w-full max-w-4xl overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.94))] p-6 sm:p-8 ${panelGlow}`}>
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${chipTone}`}>
                <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
                {statusLabel}
              </div>
              <div className="mt-5 font-pixel text-lg uppercase tracking-[0.18em] text-slate-50 sm:text-xl lg:text-2xl">{title}</div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]">
                {message}
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      0{index + 1}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-100">{step}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-orange-300" />
                <span className="font-pixel text-[10px] uppercase tracking-[0.24em] text-slate-200">
                  {isBoot ? 'Invocation' : 'Round'}
                </span>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Etat</div>
                <div className="mt-2 text-sm leading-6 text-slate-200">
                  {isBoot
                    ? "Le portail rassemble le decor, les effets et les commandes du duel."
                    : "Les combattants entrent en scene pendant que l arene se verrouille."}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className={`h-full w-[42%] rounded-full bg-gradient-to-r ${accent} animate-pulse`} />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-slate-500">
              <span>Transition en cours</span>
              <span>Garde l ecran ouvert</span>
            </div>
          </div>

          <div className="mt-8 rounded-[26px] border border-white/8 bg-black/20 px-4 py-4 text-xs leading-6 text-slate-400 sm:text-sm">
            {isBoot
              ? "Encore un instant avant l'ouverture du hall."
              : 'La manche se met en place avant le signal de depart.'}
          </div>
        </div>
      </div>
    </div>
  );
}
