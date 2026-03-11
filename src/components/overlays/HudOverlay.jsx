import { HudPanel } from '../ui/HudPanel';
import { useGameActions } from '../../context/GameUIContext';

export function HudOverlay({ ui }) {
  const actions = useGameActions();
  const hasP2 = !!ui?.hud?.p2;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4">
      <div className={`mx-auto grid max-w-7xl gap-6 ${hasP2 ? 'grid-cols-[1fr_auto_1fr]' : 'grid-cols-[1fr_auto]'}`}>
        <HudPanel side="left" data={ui.hud.p1} />
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="rounded-2xl border border-orange-300/25 bg-slate-950/80 px-5 py-4 font-pixel text-3xl text-white shadow-[0_18px_34px_rgba(2,6,23,0.45)]">
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
        {hasP2 && <HudPanel side="right" data={ui.hud.p2} />}
      </div>
    </div>
  );
}
