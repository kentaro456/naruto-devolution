import { useEffect, useState } from 'react';
import { FALLBACK_UI } from '../lib/uiState';
import type { GameUIState } from '../types/game-ui';

export function useUIBridgeState(): GameUIState {
  const [ui, setUi] = useState<GameUIState>(() =>
    typeof window !== 'undefined' ? window.UIBridge?.getState() || FALLBACK_UI : FALLBACK_UI,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const bridge = window.UIBridge;
    if (!bridge) {
      setUi(FALLBACK_UI);
      return undefined;
    }
    const unsubscribe = bridge.subscribe((next) => setUi({ ...next }));
    return () => {
      unsubscribe();
    };
  }, []);

  return ui;
}
