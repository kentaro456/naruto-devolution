/// <reference types="vite/client" />

import type { GameUIBridge } from './types/game-ui';
import type { LegacyPixiCharactersApi } from './engine/legacyPixiCharacters';

declare global {
  interface Window {
    UIBridge?: GameUIBridge;
    Game?: new () => { destroy?: () => void };
    __shinobiGameInstance?: { destroy?: () => void } | null;
    MapperApp?: new () => unknown;
    initMapperApp?: () => Promise<unknown>;
    __mapperProjectileObserver?: MutationObserver | null;
    CHARACTER_ROSTER?: Array<Record<string, unknown>>;
    STAGES?: Array<Record<string, unknown>>;
    LegacyPixiCharacters?: LegacyPixiCharactersApi;
  }
}

export {};
