export type FightMode = 'player-vs-cpu' | 'training-solo' | 'cpu-vs-cpu';

export interface CharacterCombatStats {
  speed: number;
  power: number;
  defense: number;
  chakra: number;
}

export interface CharacterSummary {
  id: string;
  name: string;
  fullName?: string;
  thumbnail?: string;
  selectable?: boolean;
  color?: string;
  description?: string;
  special?: string;
  stats?: Partial<CharacterCombatStats>;
  [key: string]: unknown;
}

export interface StageSummary {
  id: string;
  name: string;
  thumbnail?: string;
  backgroundImage?: string;
  groundY?: number;
  skyTop?: string;
  groundColor?: string;
  [key: string]: unknown;
}

export interface HudFighterState {
  name?: string;
  stateText?: string;
  healthPercent?: number;
  bufferedHealthPercent?: number;
  chakraPercent?: number;
  staminaPercent?: number;
  healthText?: string;
  comboCount?: number;
}

export interface HudState {
  p1: HudFighterState | null;
  p2: HudFighterState | null;
  timer: number;
  round: number;
}

export interface ResultStatsState {
  p1Name: string;
  p2Name: string;
  rows: Array<[string, number, number]>;
}

export interface GameUIState {
  menuVisible: boolean;
  charSelectVisible: boolean;
  hudVisible: boolean;
  stageLoadingVisible: boolean;
  pauseVisible: boolean;
  comboGuideVisible: boolean;
  resultVisible: boolean;
  splashVisible: boolean;
  fightMode: FightMode;
  soundEnabled: boolean;
  selectTitle: string;
  p1Label: string;
  p2Label: string;
  selectedPlayerId: string | null;
  selectedCpuId: string | null;
  selectedStageId: string | null;
  stageSelectVisible: boolean;
  p1Name: string;
  p2Name: string;
  roster: CharacterSummary[];
  stages: StageSummary[];
  hud: HudState;
  loadingTitle: string;
  loadingMessage: string;
  splashText: string;
  resultText: string;
  resultWinner: string;
  resultStats: ResultStatsState | null;
}

export interface GameUIActions {
  startVsMode: () => void;
  startSoloTraining: () => void;
  toggleAutoFight: () => void;
  toggleSound: () => void;
  openComboGuide: () => void;
  closeComboGuide: () => void;
  backToMenu: () => void;
  backToSelect: () => void;
  rematch: () => void;
  pauseResume: () => void;
  pauseRematch: () => void;
  pauseBackSelect: () => void;
  pauseBackMenu: () => void;
  selectCharacter: (charId: string) => void;
  selectStage: (stageId: string) => void;
}

export interface GameUIBridge {
  subscribe: (listener: (state: GameUIState) => void) => () => void;
  getState: () => GameUIState;
  setState: (partial: Partial<GameUIState>) => void;
  resetState: () => void;
  setGame: (game: unknown) => void;
  getGame: () => unknown;
  actions: GameUIActions;
}
