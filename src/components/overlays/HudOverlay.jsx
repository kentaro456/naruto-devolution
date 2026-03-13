import { HudPanel } from '../ui/HudPanel';
import { useGameActions } from '../../context/GameUIContext';

export function HudOverlay({ ui }) {
  const actions = useGameActions();
  const hasP2 = !!ui?.hud?.p2;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-2 sm:p-4">
      <div className={`mx-auto grid max-w-7xl gap-3 sm:gap-6 ${hasP2 ? 'grid-cols-1 md:grid-cols-[1fr_auto_1fr]' : 'grid-cols-1 md:grid-cols-[1fr_auto]'}`}>
        <div className="order-2 md:order-1">
          <HudPanel side="left" data={ui.hud.p1} />
        </div>
        <div className="order-1 flex flex-col items-center gap-2 pt-0 md:order-2 md:gap-3 md:pt-2">
          <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))] px-5 py-4 shadow-[0_18px_34px_rgba(2,6,23,0.45)] sm:px-6 sm:py-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.16),transparent_34%)]" />
            <div className="relative font-pixel text-2xl text-white sm:text-3xl">
              {ui.hud.timer}
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 font-pixel text-[10px] uppercase tracking-[0.22em] text-slate-300">
            Manche {ui.hud.round}
          </div>
          <button
            type="button"
            onClick={actions.toggleSound}
            aria-label={ui.soundEnabled ? 'Couper le son' : 'Activer le son'}
            aria-pressed={ui.soundEnabled}
            className="pointer-events-auto rounded-full border border-white/10 bg-black/40 px-4 py-2 font-pixel text-[10px] uppercase tracking-[0.18em] text-slate-100 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-orange-300/35 hover:text-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090c13]"
          >
            {ui.soundEnabled ? 'Bande-son active' : 'Silence dojo'}
          </button>
        </div>
        {hasP2 && <div className="order-3"><HudPanel side="right" data={ui.hud.p2} /></div>}
      </div>
    </div>
  );
}
