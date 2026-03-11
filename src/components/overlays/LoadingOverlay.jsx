export function LoadingOverlay({
  title = 'Chargement',
  message = 'Initialisation du jeu en cours.',
  variant = 'boot',
}) {
  const isBoot = variant === 'boot';
  const statusLabel = isBoot ? 'Initialisation du système' : 'Préparation du duel';
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
    ? ['Chargement du moteur', 'Connexion UI / canvas', 'Ouverture du menu']
    : ['Validation de l’arène', 'Placement des combattants', 'Entrée en combat'];

  return (
    <div className="absolute inset-0 z-40 overflow-hidden bg-slate-950/96 px-4 py-6 backdrop-blur-md">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(45,212,191,0.12),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
      <div className="relative flex h-full items-center justify-center">
        <div className={`w-full max-w-3xl rounded-[36px] border border-white/10 bg-slate-900/82 p-6 sm:p-8 ${panelGlow}`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${chipTone}`}>
                <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
                {statusLabel}
              </div>
              <div className="mt-4 font-pixel text-lg uppercase tracking-[0.18em] text-slate-50 sm:text-xl">{title}</div>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-[15px]">
                {message}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-[28px] border border-white/10 bg-black/20 px-4 py-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-orange-300" />
              <span className="font-pixel text-[10px] uppercase tracking-[0.24em] text-slate-200">
                {isBoot ? 'Boot' : 'Fight'}
              </span>
            </div>
          </div>

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

          <div className="mt-8">
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className={`h-full w-[42%] rounded-full bg-gradient-to-r ${accent} animate-pulse`} />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-slate-500">
              <span>Transition en cours</span>
              <span>Ne quitte pas l’écran</span>
            </div>
          </div>

          <div className="mt-8 rounded-[26px] border border-white/8 bg-black/20 px-4 py-4 text-xs leading-6 text-slate-400 sm:text-sm">
            {isBoot
              ? 'Le jeu prépare le moteur, le canvas et l’interface avant d’ouvrir le menu principal.'
              : 'L’arène et les combattants sont en cours de préparation avant l’ouverture du round.'}
          </div>
        </div>
      </div>
    </div>
  );
}
