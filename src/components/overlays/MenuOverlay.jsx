import { useGameActions } from '../../context/GameUIContext';
import { ActionButton } from '../ui/ActionButton';
import { InfoPill } from '../ui/InfoPill';
import { Keycap } from '../ui/Keycap';

export function MenuOverlay({ ui }) {
  const actions = useGameActions();
  const modeTone = ui.fightMode === 'cpu-vs-cpu' ? 'amber' : ui.fightMode === 'training-solo' ? 'orange' : 'emerald';
  const modeLabel = ui.fightMode === 'cpu-vs-cpu' ? 'Mode Spectateur' : ui.fightMode === 'training-solo' ? 'Entrainement Libre' : 'Combat Libre';

  return (
    <div className="absolute inset-0 z-20 flex items-center bg-slate-950/20 px-12 py-12 backdrop-blur-sm">
      {/* Top Left: Game Title & Version Info */}
      <div className="absolute left-12 top-12 flex flex-col gap-2">
        <h1 className="font-pixel text-5xl uppercase tracking-[0.1em] text-white drop-shadow-[0_4px_16px_rgba(251,146,60,0.5)] sm:text-7xl">
          SHINOBI
          <span className="block text-4xl text-orange-400 sm:text-6xl">EVOLUTION</span>
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <InfoPill tone="orange">Version Arena</InfoPill>
          <InfoPill tone={modeTone}>
            {modeLabel}
          </InfoPill>
        </div>
      </div>

      {/* Center Left: Vertical Menu List */}
      <div className="mt-48 flex w-80 flex-col gap-4">
        <MenuButton
          onClick={actions.startVsMode}
          label="Combat Libre"
          subtitle="Affronte un rival CPU"
          active
        />
        <MenuButton
          onClick={actions.startSoloTraining}
          label="Entrainement"
          subtitle="Solo, sans adversaire"
        />

        <MenuButton
          onClick={actions.toggleAutoFight}
          label="Mode Spectateur"
          subtitle={ui.fightMode === 'cpu-vs-cpu' ? 'Duel CPU contre CPU actif' : 'Lancer un duel CPU contre CPU'}
        />
        <MenuButton
          onClick={actions.openComboGuide}
          label="Dojo"
          subtitle="Techniques et commandes"
        />
        <MenuButton
          onClick={actions.toggleSound}
          label="Audio"
          subtitle={ui.soundEnabled ? 'Couper la bande-son' : 'Activer la bande-son'}
        />
      </div>

      {/* Bottom Right: Quick Controls Legend */}
      <div className="absolute bottom-12 right-12 rounded-2xl bg-black/40 p-4 backdrop-blur-md border border-white/5">
        <div className="mb-2 font-pixel text-[10px] uppercase tracking-[0.2em] text-slate-400">Commandes Ninja</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-300">
          <div className="flex items-center gap-3"><Keycap>Q</Keycap><span>Garde / Chakra</span></div>
          <div className="flex items-center gap-3"><Keycap>S</Keycap><span>Attaque rapide</span></div>
          <div className="flex items-center gap-3"><Keycap>D</Keycap><span>Attaque puissante</span></div>
          <div className="flex items-center gap-3"><Keycap>E</Keycap><span>Technique secrète</span></div>
          <div className="flex items-center gap-3"><Keycap>G</Keycap><span>Éveil</span></div>
          <div className="flex items-center gap-3"><Keycap>←→</Keycap><span>Pas éclair</span></div>
        </div>
      </div>
    </div>
  );
}

function MenuButton({ onClick, label, subtitle, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-start overflow-hidden rounded-xl border border-white/10 px-6 py-4 transition-all duration-300 ease-out hover:scale-105 hover:border-orange-400/50 hover:bg-gradient-to-r hover:from-orange-950/80 hover:to-transparent ${active ? 'bg-gradient-to-r from-slate-900/80 to-transparent shadow-[0_0_20px_rgba(251,146,60,0.15)]' : 'bg-black/40'
        }`}
    >
      <div className="relative z-10 flex flex-col items-start gap-1">
        <span className="font-pixel text-lg uppercase tracking-wider text-white group-hover:text-orange-300">
          {label}
        </span>
        <span className="text-sm text-slate-400 transition-colors group-hover:text-orange-100/70">
          {subtitle}
        </span>
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 opacity-0 transition-opacity duration-300 group-hover:from-orange-500/10 group-hover:opacity-100" />
      <div className="absolute -left-1 bottom-0 top-0 w-1 bg-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}
