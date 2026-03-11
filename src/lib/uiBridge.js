import { FALLBACK_UI } from './uiState';

function cloneInitialState() {
  return {
    ...FALLBACK_UI,
    hud: { ...FALLBACK_UI.hud },
  };
}

export function ensureUIBridge() {
  if (typeof window === 'undefined') return null;
  if (window.UIBridge) return window.UIBridge;

  const listeners = new Set();
  let gameRef = null;
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

  const merge = (partial) => {
    state = { ...state, ...partial };
    emit();
  };

  const bridge = {
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
        if (!gameRef) return;
        gameRef.setFightMode('player-vs-cpu');
        gameRef.goToCharacterSelect('player-vs-cpu');
      },
      startSoloTraining() {
        if (!gameRef) return;
        gameRef.setFightMode('training-solo');
        gameRef.goToCharacterSelect('training-solo');
      },
      toggleAutoFight() {
        if (!gameRef) return;
        gameRef.setFightMode(gameRef.isCpuVsCpuMode() ? 'player-vs-cpu' : 'cpu-vs-cpu');
      },
      toggleSound() {
        if (gameRef) gameRef.toggleSound();
      },
      openComboGuide() {
        if (gameRef) gameRef.openComboGuide();
      },
      closeComboGuide() {
        if (gameRef) gameRef.closeComboGuide();
      },
      backToMenu() {
        if (gameRef) gameRef.goToMenu();
      },
      backToSelect() {
        if (gameRef) gameRef.goToCharacterSelect();
      },
      rematch() {
        if (gameRef) gameRef.startRematch();
      },
      pauseResume() {
        if (gameRef) gameRef.resumePauseMenu();
      },
      pauseRematch() {
        if (gameRef) gameRef.startRematch();
      },
      pauseBackSelect() {
        if (gameRef) gameRef.goToCharacterSelect();
      },
      pauseBackMenu() {
        if (gameRef) gameRef.goToMenu();
      },
      selectCharacter(charId) {
        if (gameRef && typeof gameRef.selectCharacter === 'function') {
          gameRef.selectCharacter(charId);
        }
      },
      selectStage(stageId) {
        if (gameRef && typeof gameRef.selectStage === 'function') {
          gameRef.selectStage(stageId);
        }
      },
    },
  };

  window.UIBridge = bridge;
  return bridge;
}
