import { useGameActions } from '../../context/GameUIContext';
import { ActionButton } from '../ui/ActionButton';
import { InfoPill } from '../ui/InfoPill';
import { ResultStats } from '../ui/ResultStats';
import { SurfacePanel } from '../ui/SurfacePanel';

export function ResultOverlay({ ui }) {
  const actions = useGameActions();

  return (
    <div
      className="absolute inset-0 z-20 overflow-y-auto bg-slate-950/82 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <SurfacePanel className="ui-stage-enter my-auto w-full max-w-5xl p-5 sm:p-6 lg:p-8">
          <div className="flex justify-center">
            <InfoPill tone="amber">Fin du duel</InfoPill>
          </div>
          <div className="mt-6 text-center font-pixel text-xl uppercase tracking-[0.18em] text-amber-100 sm:text-2xl lg:text-3xl">
            {ui.resultText}
          </div>
          <div className="mt-4 text-center font-pixel text-sm uppercase tracking-[0.16em] text-white sm:text-base lg:text-lg">
            {ui.resultWinner}
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-slate-300">
            Le verdict est tombe. Compare le rythme, les degats et la pression avant d enchaîner
            sur une revanche.
          </p>
          <ResultStats stats={ui.resultStats} />
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <ActionButton onClick={actions.rematch}>REVANCHE</ActionButton>
            <ActionButton onClick={actions.backToSelect}>RETOUR A LA SELECTION</ActionButton>
            <ActionButton onClick={actions.backToMenu} accent="rose">RETOUR AU HALL</ActionButton>
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}
