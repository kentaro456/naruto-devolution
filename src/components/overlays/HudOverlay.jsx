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
          <div className="rounded-2xl border border-orange-300/25 bg-slate-950/80 px-4 py-3 font-pixel text-2xl text-white shadow-[0_18px_34px_rgba(2,6,23,0.45)] sm:px-5 sm:py-4 sm:text-3xl">
            {ui.hud.timer}
          </div>
          <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-slate-400">
            MANCHE {ui.hud.round}
          </div>
          <button
            onClick={actions.toggleSound}
            className="pointer-events-auto mt-1 rounded border border-white/10 bg-black/40 px-3 py-1.5 font-pixel text-[10px] tracking-wider text-slate-300 transition-colors hover:border-orange-400/50 hover:text-orange-300 focus:outline-none"
          >
            {ui.soundEnabled ? '🔊 Son: ON' : '🔇 Son: OFF'}
          </button>
        </div>
        {hasP2 && <div className="order-3"><HudPanel side="right" data={ui.hud.p2} /></div>}
      </div>
    </div>
  );
}
