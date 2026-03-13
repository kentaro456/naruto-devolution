import { useGameActions } from '../../context/GameUIContext';
import { InfoPill } from '../ui/InfoPill';
import { SurfacePanel } from '../ui/SurfacePanel';

export function MenuOverlay({ ui, runtimeReady = true }) {
  const actions = useGameActions();
  const rosterCount = (ui.roster || []).length;
  const stageCount = (ui.stages || []).length;
  const modeTone =
    ui.fightMode === 'cpu-vs-cpu' ? 'amber' : ui.fightMode === 'training-solo' ? 'orange' : 'emerald';
  const modeLabel =
    ui.fightMode === 'cpu-vs-cpu'
      ? 'Observation'
      : ui.fightMode === 'training-solo'
        ? 'Dojo libre'
        : 'Versus CPU';

  const menuItems = [
    {
      id: '01',
      label: 'Versus CPU',
      subtitle: "Affronte l'IA dans un duel complet et vise la victoire manche apres manche.",
      detail: '1P vs CPU',
      onClick: actions.startVsMode,
      active: true,
      tone: 'orange',
      disabled: !runtimeReady,
    },
    {
      id: '02',
      label: 'Dojo libre',
      subtitle: 'Travaille tes timings, tes routes et tes confirms sans pression.',
      detail: 'Solo',
      onClick: actions.startSoloTraining,
      tone: 'slate',
      disabled: !runtimeReady,
    },
    {
      id: '03',
      label: 'Observation',
      subtitle:
        ui.fightMode === 'cpu-vs-cpu'
          ? 'Le duel CPU contre CPU tourne deja dans l arene.'
          : 'Regarde deux shinobi s affronter sans intervenir.',
      detail: 'CPU vs CPU',
      onClick: actions.toggleAutoFight,
      tone: 'rose',
      disabled: !runtimeReady,
    },
    {
      id: '04',
      label: 'Dojo',
      subtitle: 'Rouvre les commandes, les routes speciales et les reperes de combo.',
      detail: 'Commandes',
      onClick: actions.openComboGuide,
      tone: 'slate',
      disabled: !runtimeReady,
    },
    {
      id: '05',
      label: 'Audio',
      subtitle:
        ui.soundEnabled
          ? 'Coupe la bande son et les impacts du duel.'
          : 'Rappelle la bande son et les effets de combat.',
      detail: ui.soundEnabled ? 'Son ON' : 'Son OFF',
      onClick: actions.toggleSound,
      tone: ui.soundEnabled ? 'emerald' : 'slate',
      disabled: !runtimeReady,
    },
  ];

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-slate-950/10 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.12),transparent_26%)]" />

      <div className="relative mx-auto flex min-h-full max-w-7xl flex-col gap-4 sm:gap-5 xl:gap-6">
        <SurfacePanel className="ui-stage-enter overflow-hidden p-0">
          <div className="border-b border-white/10 px-4 py-3 sm:px-6">
            <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
              <InfoPill tone="orange">Mode arcade</InfoPill>
              <InfoPill tone={modeTone}>{modeLabel}</InfoPill>
              <InfoPill tone="slate">{rosterCount} shinobi</InfoPill>
              <InfoPill tone="slate">{stageCount} arenes</InfoPill>
              {!runtimeReady ? <InfoPill tone="amber">Portail en ouverture</InfoPill> : null}
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7 sm:py-8 lg:px-8">
            <div className="font-pixel text-[10px] uppercase tracking-[0.28em] text-white/45">Hall des affrontements</div>

            <div className="mt-4 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <h1 className="font-pixel text-3xl uppercase tracking-[0.08em] text-white drop-shadow-[0_12px_36px_rgba(251,146,60,0.24)] sm:text-5xl lg:text-6xl">
                  SHINOBI
                  <span className="mt-2 block text-2xl text-orange-300 sm:text-4xl lg:text-5xl">
                    EVOLUTION
                  </span>
                </h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-[15px]">
                  Choisis ton mode, verrouille tes shinobi et ouvre la prochaine manche. Tout est
                  cale pour aller du hall a l arene sans casser le rythme.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
                <LaunchStat
                  title="Signal"
                  value={
                    !runtimeReady
                      ? 'Rituel en cours'
                      : ui.soundEnabled
                        ? 'Portail stable'
                        : 'Portail muet'
                  }
                  copy={
                    !runtimeReady
                      ? "Le hall reste ouvert pendant l appel de l arene."
                      : 'Tu peux lancer un duel d un seul geste.'
                  }
                />
                <LaunchStat
                  title="Circuit"
                  value={!runtimeReady ? 'Manche en approche' : 'Selection express'}
                  copy="Mode, combattants et arene s enchainent sans attente inutile."
                />
                <LaunchStat
                  title="Roster"
                  value={`${rosterCount} shinobi`}
                  copy={`${stageCount} arenes pretes pour le prochain affrontement.`}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 text-[11px] uppercase tracking-[0.22em] text-white/40">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                Ambiance arcade
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                Acces instantane au duel
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                Roster pret au combat
              </span>
            </div>
          </div>
        </SurfacePanel>

        <SurfacePanel className="ui-stage-enter p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="font-pixel text-[10px] uppercase tracking-[0.26em] text-white/45">Choix du mode</div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Fais glisser le rail, verrouille ton format de duel et entre directement dans
                l arene.
              </p>
            </div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
              Choisis ton prochain combat
            </div>
          </div>

          <div className="hide-scrollbar mt-5 overflow-x-auto pb-2">
            <div className="flex gap-4 pr-2">
              {menuItems.map((item, index) => (
                <MenuButton
                  key={item.label}
                  id={item.id}
                  onClick={item.onClick}
                  label={item.label}
                  subtitle={item.subtitle}
                  detail={item.detail}
                  active={item.active}
                  tone={item.tone}
                  disabled={item.disabled}
                  className={resolveMenuWidth(index)}
                />
              ))}
            </div>
          </div>
        </SurfacePanel>

      </div>
    </div>
  );
}

function MenuButton({
  id,
  onClick,
  label,
  subtitle,
  detail,
  active = false,
  tone = 'slate',
  disabled = false,
  className = '',
}) {
  const tones = {
    orange:
      'border-orange-300/20 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.9))] hover:border-orange-200/70 hover:shadow-[0_24px_48px_rgba(249,115,22,0.18)]',
    rose:
      'border-rose-300/20 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.16),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.9))] hover:border-rose-200/70 hover:shadow-[0_24px_48px_rgba(244,63,94,0.18)]',
    emerald:
      'border-emerald-300/20 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.9))] hover:border-emerald-200/70 hover:shadow-[0_24px_48px_rgba(16,185,129,0.18)]',
    slate:
      'border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.9))] hover:border-white/20 hover:shadow-[0_20px_44px_rgba(15,23,42,0.28)]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${label}. ${subtitle}`}
      className={`group relative flex min-h-[218px] shrink-0 snap-start flex-col items-start overflow-hidden rounded-[28px] border px-5 py-5 text-left transition-all duration-300 ease-out hover:-translate-y-1 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090c13] disabled:cursor-wait disabled:hover:translate-y-0 disabled:opacity-65 sm:px-6 sm:py-6 ${
        active ? 'ring-1 ring-orange-200/30' : ''
      } ${tones[tone] || tones.slate} ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_38%)] opacity-70" />

      <div className="relative z-10 flex h-full w-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="font-pixel text-[10px] uppercase tracking-[0.26em] text-white/35">
            {id}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-pixel text-[9px] uppercase tracking-[0.2em] text-white/70">
            {detail}
          </span>
        </div>

        <span className="mt-8 font-pixel text-base uppercase tracking-[0.18em] text-white group-hover:text-orange-100 sm:text-lg">
          {label}
        </span>
        <span className="mt-4 max-w-sm text-sm leading-6 text-slate-300 transition-colors group-hover:text-white/90">
          {subtitle}
        </span>

        <div className="mt-auto flex items-end justify-between gap-3 pt-8">
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            {disabled ? 'Ouverture en cours' : 'Lancer le mode'}
          </span>
          <span className="font-pixel text-xl text-white/55 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
            &gt;
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_42%,rgba(255,255,255,0.05))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}

function resolveMenuWidth(index) {
  switch (index) {
    case 0:
      return 'w-[min(84vw,420px)] sm:w-[360px] lg:w-[400px]';
    case 1:
      return 'w-[min(78vw,340px)] sm:w-[310px] lg:w-[330px]';
    case 2:
      return 'w-[min(78vw,320px)] sm:w-[300px] lg:w-[320px]';
    case 3:
      return 'w-[min(78vw,320px)] sm:w-[300px] lg:w-[320px]';
    case 4:
      return 'w-[min(84vw,380px)] sm:w-[340px] lg:w-[360px]';
    default:
      return 'w-[min(78vw,320px)] sm:w-[300px]';
  }
}

function LaunchStat({ title, value, copy }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">{title}</div>
      <div className="mt-2 font-pixel text-sm uppercase tracking-[0.18em] text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-slate-300">{copy}</div>
    </div>
  );
}
