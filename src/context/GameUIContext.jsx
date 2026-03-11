import { createContext, useContext, useMemo } from 'react';
import { useUIBridgeState } from '../hooks/useUIBridgeState';
import { runAction } from '../lib/runtimeBridge';

const GameUIStateContext = createContext(null);
const GameUIActionsContext = createContext(null);

export function GameUIProvider({ children }) {
  const ui = useUIBridgeState();

  const actions = useMemo(
    () => ({
      startVsMode: () => runAction('startVsMode'),
      startSoloTraining: () => runAction('startSoloTraining'),
      toggleAutoFight: () => runAction('toggleAutoFight'),
      toggleSound: () => runAction('toggleSound'),
      openComboGuide: () => runAction('openComboGuide'),
      closeComboGuide: () => runAction('closeComboGuide'),
      backToMenu: () => runAction('backToMenu'),
      backToSelect: () => runAction('backToSelect'),
      rematch: () => runAction('rematch'),
      pauseResume: () => runAction('pauseResume'),
      pauseRematch: () => runAction('pauseRematch'),
      pauseBackSelect: () => runAction('pauseBackSelect'),
      pauseBackMenu: () => runAction('pauseBackMenu'),
      selectCharacter: (charId) => runAction('selectCharacter', charId),
      selectStage: (stageId) => runAction('selectStage', stageId),
    }),
    [],
  );

  return (
    <GameUIStateContext.Provider value={ui}>
      <GameUIActionsContext.Provider value={actions}>
        {children}
      </GameUIActionsContext.Provider>
    </GameUIStateContext.Provider>
  );
}

export function useGameUI() {
  const value = useContext(GameUIStateContext);
  if (!value) {
    throw new Error('useGameUI must be used inside GameUIProvider.');
  }
  return value;
}

export function useGameActions() {
  const value = useContext(GameUIActionsContext);
  if (!value) {
    throw new Error('useGameActions must be used inside GameUIProvider.');
  }
  return value;
}
