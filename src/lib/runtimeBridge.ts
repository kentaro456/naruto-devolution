export function destroyLegacyGame(): void {
  if (typeof window === 'undefined') return;
  const game = window.__shinobiGameInstance;
  if (game && typeof game.destroy === 'function') {
    game.destroy();
  }
  window.__shinobiGameInstance = null;
}

export function bootLegacyGame(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.Game !== 'function') return;
  destroyLegacyGame();
  window.__shinobiGameInstance = new window.Game();
}

export function runAction(actionName: string, ...args: unknown[]): void {
  const action =
    typeof window !== 'undefined' ? window.UIBridge?.actions?.[actionName as keyof typeof window.UIBridge.actions] : null;
  if (typeof action === 'function') {
    (action as (...input: unknown[]) => void)(...args);
  }
}
