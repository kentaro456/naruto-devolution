import { useGameActions } from '../../context/GameUIContext';
import { ActionButton } from '../ui/ActionButton';
import { InfoPill } from '../ui/InfoPill';
import { Keycap } from '../ui/Keycap';
import { SurfacePanel } from '../ui/SurfacePanel';

export function ComboGuideOverlay() {
  const actions = useGameActions();

  return (
    <div
      className="absolute inset-0 z-20 overflow-y-auto bg-slate-950/80 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <SurfacePanel className="ui-stage-enter my-auto w-full max-w-5xl p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-pixel text-base uppercase tracking-[0.18em] text-orange-200 sm:text-xl">DOJO DES TECHNIQUES</div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Le rappel express pour retrouver tes commandes, tes routes et tes outils de
                pression avant de repartir.
              </p>
            </div>
            <InfoPill tone="slate">Fleches + 1234 + QSDFERG</InfoPill>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[26px] border border-white/10 bg-slate-950/55 p-4 sm:p-5">
              <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-slate-200">FONDAMENTAUX</div>
              <div className="mt-4 grid gap-3 text-xs leading-6 text-slate-300 sm:text-sm sm:leading-7">
                <GuideRow keys="← ↑ ↓ →" label="Deplacement" />
                <GuideRow keys="Q" label="Garde / charge de chakra" />
                <GuideRow keys="S + D" label="Chaines rapides puis lourdes" />
                <GuideRow keys="1 2 3 4" label="Techniques assignees" />
                <GuideRow keys="F + E" label="Jutsu / projectile" />
                <GuideRow keys="R + G" label="Teleportation / eveil" />
                <GuideRow keys="←→" label="Pas eclair" />
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[26px] border border-white/10 bg-slate-950/55 p-4 sm:p-5">
                <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-slate-200">ROUTES D OUVERTURE</div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
                    <b>F</b>, <b>↑+F</b>, <b>↓+F</b>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
                    <b>Arriere+F</b>, <b>Avant+F</b>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
                    <b>↓+S</b> ouverture basse
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
                    <b>→+S</b> pression vers l&apos;avant
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
                    <b>S &gt; S &gt; S</b> chaine rapide
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-slate-950/55 p-4 sm:p-5">
                <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-slate-200">Memo combat</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Garde ce panneau comme pense-bete entre deux manches.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-stretch sm:justify-end">
            <ActionButton onClick={actions.closeComboGuide}>FERMER</ActionButton>
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}

function GuideRow({ keys, label }) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-black/20 px-3 py-3">
      <Keycap>{keys}</Keycap>
      <span>{label}</span>
    </div>
  );
}
