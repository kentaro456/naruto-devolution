import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useUIBridgeState } from '../hooks/useUIBridgeState';
import { ensureUIBridge } from '../lib/uiBridge';
import type { GameUIActions, GameUIState } from '../types/game-ui';

const GameUIStateContext = createContext<GameUIState | null>(null);
const GameUIActionsContext = createContext<GameUIActions | null>(null);

export function GameUIProvider({ children }: { children: ReactNode }) {
  const ui = useUIBridgeState();

  const actions = useMemo<GameUIActions>(
    () => ensureUIBridge()?.actions || {
      startVsMode: () => {},
      startSoloTraining: () => {},
      toggleAutoFight: () => {},
      toggleSound: () => {},
      openComboGuide: () => {},
      closeComboGuide: () => {},
      backToMenu: () => {},
      backToSelect: () => {},
      rematch: () => {},
      pauseResume: () => {},
      pauseRematch: () => {},
      pauseBackSelect: () => {},
      pauseBackMenu: () => {},
      selectCharacter: () => {},
      selectStage: () => {},
    },
    [],
  );

  return (
    <GameUIStateContext.Provider value={ui}>
      <GameUIActionsContext.Provider value={actions}>{children}</GameUIActionsContext.Provider>
    </GameUIStateContext.Provider>
  );
}

export function useGameUI(): GameUIState {
  const value = useContext(GameUIStateContext);
  if (!value) {
    throw new Error('useGameUI must be used inside GameUIProvider.');
  }
  return value;
}

export function useGameActions(): GameUIActions {
  const value = useContext(GameUIActionsContext);
  if (!value) {
    throw new Error('useGameActions must be used inside GameUIProvider.');
  }
  return value;
}
