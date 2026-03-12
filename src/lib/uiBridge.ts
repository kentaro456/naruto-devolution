import { FALLBACK_UI } from './uiState';
import type { GameUIBridge, GameUIState } from '../types/game-ui';

function cloneInitialState(): GameUIState {
  return {
    ...FALLBACK_UI,
    hud: { ...FALLBACK_UI.hud },
  };
}

export function ensureUIBridge(): GameUIBridge | null {
  if (typeof window === 'undefined') return null;
  if (window.UIBridge) return window.UIBridge;

  const listeners = new Set<(state: GameUIState) => void>();
  let gameRef: unknown = null;
  let state = cloneInitialState();

  const emit = () => {
    listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('UIBridge listener error:', error);
      }
    });
  };

  const merge = (partial: Partial<GameUIState>) => {
    state = { ...state, ...partial };
    emit();
  };

  const bridge: GameUIBridge = {
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },

    getState() {
      return state;
    },

    setState(partial) {
      merge(partial);
    },

    resetState() {
      state = cloneInitialState();
      emit();
    },

    setGame(game) {
      gameRef = game;
    },

    getGame() {
      return gameRef;
    },

    actions: {
      startVsMode() {
        const game = gameRef as {
          setFightMode?: (mode: string) => void;
          goToCharacterSelect?: (mode?: string) => void;
        } | null;
        if (!game) return;
        game.setFightMode?.('player-vs-cpu');
        game.goToCharacterSelect?.('player-vs-cpu');
      },
      startSoloTraining() {
        const game = gameRef as {
          setFightMode?: (mode: string) => void;
          goToCharacterSelect?: (mode?: string) => void;
        } | null;
        if (!game) return;
        game.setFightMode?.('training-solo');
        game.goToCharacterSelect?.('training-solo');
      },
      toggleAutoFight() {
        const game = gameRef as {
          setFightMode?: (mode: string) => void;
          isCpuVsCpuMode?: () => boolean;
        } | null;
        if (!game) return;
        game.setFightMode?.(game.isCpuVsCpuMode?.() ? 'player-vs-cpu' : 'cpu-vs-cpu');
      },
      toggleSound() {
        (gameRef as { toggleSound?: () => void } | null)?.toggleSound?.();
      },
      openComboGuide() {
        (gameRef as { openComboGuide?: () => void } | null)?.openComboGuide?.();
      },
      closeComboGuide() {
        (gameRef as { closeComboGuide?: () => void } | null)?.closeComboGuide?.();
      },
      backToMenu() {
        (gameRef as { goToMenu?: () => void } | null)?.goToMenu?.();
      },
      backToSelect() {
        (gameRef as { goToCharacterSelect?: () => void } | null)?.goToCharacterSelect?.();
      },
      rematch() {
        (gameRef as { startRematch?: () => void } | null)?.startRematch?.();
      },
      pauseResume() {
        (gameRef as { resumePauseMenu?: () => void } | null)?.resumePauseMenu?.();
      },
      pauseRematch() {
        (gameRef as { startRematch?: () => void } | null)?.startRematch?.();
      },
      pauseBackSelect() {
        (gameRef as { goToCharacterSelect?: () => void } | null)?.goToCharacterSelect?.();
      },
      pauseBackMenu() {
        (gameRef as { goToMenu?: () => void } | null)?.goToMenu?.();
      },
      selectCharacter(charId) {
        (gameRef as { selectCharacter?: (id: string) => void } | null)?.selectCharacter?.(charId);
      },
      selectStage(stageId) {
        (gameRef as { selectStage?: (id: string) => void } | null)?.selectStage?.(stageId);
      },
    },
  };

  window.UIBridge = bridge;
  return bridge;
}
