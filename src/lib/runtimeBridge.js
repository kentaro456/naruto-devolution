export function destroyLegacyGame() {
  if (typeof window === 'undefined') return;
  const game = window.__shinobiGameInstance;
  if (game && typeof game.destroy === 'function') {
    game.destroy();
  }
  window.__shinobiGameInstance = null;
}

export function bootLegacyGame() {
  if (typeof window === 'undefined') return;
  if (typeof window.Game !== 'function') return;
  destroyLegacyGame();
  window.__shinobiGameInstance = new window.Game();
}

export function runAction(actionName, ...args) {
  const action = typeof window !== 'undefined' ? window.UIBridge?.actions?.[actionName] : null;
  if (typeof action === 'function') {
    action(...args);
  }
}
