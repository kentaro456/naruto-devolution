import { useGameActions } from '../../context/GameUIContext';
import { ActionButton } from '../ui/ActionButton';
import { InfoPill } from '../ui/InfoPill';
import { Keycap } from '../ui/Keycap';
import { SurfacePanel } from '../ui/SurfacePanel';

export function ComboGuideOverlay() {
  const actions = useGameActions();

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-md">
      <SurfacePanel className="w-full max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-pixel text-base uppercase tracking-[0.18em] text-orange-300 sm:text-xl">DOJO DES TECHNIQUES</div>
          <InfoPill tone="slate">Fleches + 1234 + QSDFERG</InfoPill>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-slate-200">BASES</div>
            <div className="mt-3 space-y-2 text-xs leading-6 text-slate-300 sm:text-sm sm:leading-7">
              <div className="flex items-center gap-2"><Keycap>← ↑ ↓ →</Keycap><span>Déplacement ninja</span></div>
              <div className="flex items-center gap-2"><Keycap>Q</Keycap><span>Garde / charge chakra</span></div>
              <div className="flex items-center gap-2"><Keycap>S</Keycap><span>Attaque rapide</span><Keycap>D</Keycap><span>Attaque puissante</span></div>
              <div className="flex items-center gap-2"><Keycap>1 2 3 4</Keycap><span>Techniques spéciales directes</span></div>
              <div className="flex items-center gap-2"><Keycap>F</Keycap><span>Spécial / jutsu</span><Keycap>E</Keycap><span>Projectile</span></div>
              <div className="flex items-center gap-2"><Keycap>R</Keycap><span>Téléport derrière l'adversaire</span><Keycap>G</Keycap><span>Éveil</span></div>
              <div className="flex items-center gap-2"><Keycap>←→</Keycap><span>Pas éclair (double direction)</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-slate-200">ROUTES DE TECHNIQUE</div>
            <div className="mt-3 space-y-2 text-xs leading-6 text-slate-300 sm:text-sm sm:leading-7">
              <div><b>F</b>, <b>↑+F</b>, <b>↓+F</b></div>
              <div><b>Arriere+F</b>, <b>Avant+F</b></div>
              <div><b>↓+S</b> ouverture basse</div>
              <div><b>→+S</b> pression vers l'avant</div>
              <div><b>S &gt; S &gt; S</b> chaîne rapide</div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-stretch sm:justify-end">
          <ActionButton onClick={actions.closeComboGuide}>FERMER</ActionButton>
        </div>
      </SurfacePanel>
    </div>
  );
}
