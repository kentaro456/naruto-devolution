import { useGameActions } from '../../context/GameUIContext';
import { ActionButton } from '../ui/ActionButton';
import { InfoPill } from '../ui/InfoPill';
import { Keycap } from '../ui/Keycap';
import { SurfacePanel } from '../ui/SurfacePanel';

export function ComboGuideOverlay() {
  const actions = useGameActions();

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-md">
      <SurfacePanel className="w-full max-w-4xl p-8">
        <div className="flex items-center justify-between">
          <div className="font-pixel text-xl uppercase tracking-[0.22em] text-orange-300">DOJO DES TECHNIQUES</div>
          <InfoPill tone="slate">Fleches + QSDEG</InfoPill>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-slate-200">BASES</div>
            <div className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
              <div className="flex items-center gap-2"><Keycap>← ↑ ↓ →</Keycap><span>Déplacement ninja</span></div>
              <div className="flex items-center gap-2"><Keycap>Q</Keycap><span>Garde / charge chakra</span></div>
              <div className="flex items-center gap-2"><Keycap>S</Keycap><span>Attaque rapide</span><Keycap>D</Keycap><span>Attaque puissante</span></div>
              <div className="flex items-center gap-2"><Keycap>E</Keycap><span>Technique secrète</span><Keycap>G</Keycap><span>Éveil</span></div>
              <div className="flex items-center gap-2"><Keycap>←→</Keycap><span>Pas éclair (double direction)</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-slate-200">ROUTES DE TECHNIQUE</div>
            <div className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
              <div><b>E</b>, <b>↑+E</b>, <b>↓+E</b></div>
              <div><b>Arriere+E</b>, <b>Avant+E</b></div>
              <div><b>↓+S</b> ouverture basse</div>
              <div><b>→+S</b> pression vers l'avant</div>
              <div><b>S &gt; S &gt; S</b> chaîne rapide</div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <ActionButton onClick={actions.closeComboGuide}>FERMER</ActionButton>
        </div>
      </SurfacePanel>
    </div>
  );
}
