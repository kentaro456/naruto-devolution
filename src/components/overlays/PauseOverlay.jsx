import { useGameActions } from '../../context/GameUIContext';
import { ActionButton } from '../ui/ActionButton';
import { InfoPill } from '../ui/InfoPill';
import { SurfacePanel } from '../ui/SurfacePanel';

export function PauseOverlay() {
  const actions = useGameActions();

  return (
    <div
      className="absolute inset-0 z-20 overflow-y-auto bg-slate-950/76 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <SurfacePanel className="ui-stage-enter my-auto w-full max-w-4xl p-5 sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-pixel text-xl uppercase tracking-[0.16em] text-orange-200 sm:text-2xl">PAUSE</div>
                <InfoPill tone="slate">Le temps se fige</InfoPill>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Respire, relis tes options et repars dans le duel quand tu veux.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <ActionButton onClick={actions.openComboGuide}>DOJO DES TECHNIQUES</ActionButton>
                <ActionButton onClick={actions.pauseResume}>REPRENDRE LE DUEL</ActionButton>
                <ActionButton onClick={actions.pauseRematch}>NOUVEL AFFRONTEMENT</ActionButton>
                <ActionButton onClick={actions.pauseBackSelect}>RETOUR A LA SELECTION</ActionButton>
                <ActionButton onClick={actions.pauseBackMenu} accent="rose">MENU PRINCIPAL</ActionButton>
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
              <div className="font-pixel text-[10px] uppercase tracking-[0.24em] text-white/40">Entre deux echanges</div>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
                <div>
                  <div className="font-medium text-white">Dojo</div>
                  <div>Rouvre les commandes et les routes de combo.</div>
                </div>
                <div>
                  <div className="font-medium text-white">Rematch</div>
                  <div>Relance une manche sans casser le rythme.</div>
                </div>
                <div>
                  <div className="font-medium text-white">Selection</div>
                  <div>Change de shinobi ou d arene avant de repartir.</div>
                </div>
              </div>
            </div>
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}
