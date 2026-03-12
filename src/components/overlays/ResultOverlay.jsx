import { useGameActions } from '../../context/GameUIContext';
import { ActionButton } from '../ui/ActionButton';
import { InfoPill } from '../ui/InfoPill';
import { ResultStats } from '../ui/ResultStats';
import { SurfacePanel } from '../ui/SurfacePanel';

export function ResultOverlay({ ui }) {
  const actions = useGameActions();

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/82 px-4 py-6 backdrop-blur-md">
      <SurfacePanel className="w-full max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="flex justify-center">
          <InfoPill tone="amber">Duel Terminé</InfoPill>
        </div>
        <div className="text-center font-pixel text-xl uppercase tracking-[0.18em] text-amber-200 sm:text-2xl lg:text-3xl">{ui.resultText}</div>
        <div className="mt-4 text-center font-pixel text-sm uppercase tracking-[0.16em] text-white sm:text-base lg:text-lg">{ui.resultWinner}</div>
        <ResultStats stats={ui.resultStats} />
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <ActionButton onClick={actions.rematch}>MATCH RETOUR</ActionButton>
          <ActionButton onClick={actions.backToSelect}>SÉLECTION NINJA</ActionButton>
          <ActionButton onClick={actions.backToMenu} accent="rose">RETOUR MENU</ActionButton>
        </div>
      </SurfacePanel>
    </div>
  );
}
