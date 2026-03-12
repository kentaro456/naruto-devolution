import type { GameUIActions, GameUIState } from '../types/game-ui';
import { FALLBACK_UI } from '../lib/uiState';
import { ShinobiGameRuntime } from './runtime';

let runtime: ShinobiGameRuntime | null = null;

function getRuntime(): ShinobiGameRuntime {
  if (!runtime) {
    runtime = new ShinobiGameRuntime();
  }
  return runtime;
}

export async function bootGameRuntime(canvas: HTMLCanvasElement): Promise<ShinobiGameRuntime> {
  const instance = getRuntime();
  await instance.init();
  await instance.attach(canvas);
  return instance;
}

export function destroyGameRuntime(): void {
  runtime?.destroy();
  runtime = null;
}

export function subscribeGameRuntime(listener: (state: GameUIState) => void): () => void {
  return getRuntime().subscribe(listener);
}

export function getGameRuntimeState(): GameUIState {
  return runtime?.getState() || FALLBACK_UI;
}

export function getGameRuntimeActions(): GameUIActions {
  return getRuntime().actions;
}
