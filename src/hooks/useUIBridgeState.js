import { useEffect, useState } from 'react';
import { ensureUIBridge } from '../lib/uiBridge';
import { FALLBACK_UI } from '../lib/uiState';

export function useUIBridgeState() {
  ensureUIBridge();
  const [ui, setUi] = useState(() =>
    typeof window !== 'undefined' && window.UIBridge ? window.UIBridge.getState() : FALLBACK_UI,
  );

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    const attach = () => {
      if (cancelled) return;
      if (typeof window !== 'undefined' && window.UIBridge) {
        unsubscribe = window.UIBridge.subscribe((next) => setUi({ ...next }));
        return;
      }
      window.setTimeout(attach, 16);
    };

    attach();
    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return ui;
}
