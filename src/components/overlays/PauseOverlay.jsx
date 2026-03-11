import { useGameActions } from '../../context/GameUIContext';
import { ActionButton } from '../ui/ActionButton';
import { InfoPill } from '../ui/InfoPill';
import { SurfacePanel } from '../ui/SurfacePanel';

export function PauseOverlay() {
  const actions = useGameActions();

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/76 px-4 py-6 backdrop-blur-md">
      <SurfacePanel className="w-full max-w-3xl p-8">
        <div className="flex items-center justify-between">
          <div className="font-pixel text-2xl uppercase tracking-[0.2em] text-orange-300">PAUSE</div>
          <InfoPill tone="slate">Affrontement interrompu</InfoPill>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-300">Rassemble ton chakra et choisis la suite.</p>
        <div className="mt-6 flex flex-col gap-3">
          <ActionButton onClick={actions.openComboGuide}>DOJO DES TECHNIQUES</ActionButton>
          <ActionButton onClick={actions.pauseResume}>REPRENDRE LE DUEL</ActionButton>
          <ActionButton onClick={actions.pauseRematch}>NOUVEL AFFRONTEMENT</ActionButton>
          <ActionButton onClick={actions.pauseBackSelect}>RETOUR À LA SÉLECTION</ActionButton>
          <ActionButton onClick={actions.pauseBackMenu} accent="rose">MENU PRINCIPAL</ActionButton>
        </div>
      </SurfacePanel>
    </div>
  );
}
