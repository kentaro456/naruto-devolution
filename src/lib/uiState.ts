import type { GameUIState } from '../types/game-ui';
import { ROSTER } from '../data/roster';
import { STAGES } from '../data/stages';

export const FALLBACK_UI: GameUIState = {
  menuVisible: true,
  charSelectVisible: false,
  hudVisible: false,
  stageLoadingVisible: false,
  pauseVisible: false,
  comboGuideVisible: false,
  resultVisible: false,
  splashVisible: false,
  fightMode: 'player-vs-cpu',
  soundEnabled: true,
  selectTitle: 'CHOISIS TON SHINOBI',
  p1Label: 'P1',
  p2Label: 'CPU',
  selectedPlayerId: null,
  selectedCpuId: null,
  selectedStageId: null,
  stageSelectVisible: false,
  p1Name: '???',
  p2Name: '???',
  roster: ROSTER,
  stages: STAGES,
  hud: { p1: null, p2: null, timer: 99, round: 1 },
  loadingTitle: "Ouverture de l'arene",
  loadingMessage: "Les portes du duel s'ouvrent.",
  splashText: 'MANCHE 1',
  resultText: 'VICTOIRE !',
  resultWinner: '',
  resultStats: null,
};
