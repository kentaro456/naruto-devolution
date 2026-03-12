import { FALLBACK_UI } from '../lib/uiState';
import type {
  CharacterSummary,
  FightMode,
  GameUIActions,
  GameUIState,
  HudFighterState,
  ResultStatsState,
  StageSummary,
} from '../types/game-ui';
import { loadGameCatalog } from './catalog';
import { PixiScene } from './pixiScene';

type Listener = (state: GameUIState) => void;

type ComboRouteDirection = 'neutral' | 'forward' | 'down' | 'air' | 'back' | 'up' | 'any';
type ComboActionType = 'light' | 'heavy' | 'special';

interface ComboChainProfile {
  state?: string;
  duration?: number;
  damageMultiplier?: number;
  rangeMultiplier?: number;
  knockbackMultiplier?: number;
  activeStart?: number;
  activeEnd?: number;
  activeFrames?: number;
  cancelStart?: number;
  hitConfirmCancelStart?: number;
}

interface ComboNodePatch {
  routes?: Partial<Record<ComboActionType, Partial<Record<ComboRouteDirection, string>>>>;
  requiresHitOnRoute?: boolean;
  profileOverrides?: ComboChainProfile;
}

interface BufferedAttack {
  rawType: 'light' | 'heavy' | 'special' | 'special1' | 'special2' | 'special3' | 'special4';
  routeType: ComboActionType;
  direction: ComboRouteDirection;
}

interface RuntimeProjectileConfig {
  imagePath: string;
  speed: number;
  width: number;
  height: number;
  life: number;
  spinSpeed: number;
}

interface RuntimeComboSettings {
  comboCancelRatio: number;
  comboHitResetFrames: number;
  requireHitForComboRoutes: boolean;
  attackDurationScale: number;
  specialTransformDurationScale: number;
}

interface RuntimeComboConfig {
  settings: RuntimeComboSettings;
  chains: Record<ComboActionType, ComboChainProfile[]>;
  rootRoutes: Record<ComboActionType, Partial<Record<ComboRouteDirection, string>>>;
  actionMap: Record<string, string>;
  hotkeys: Record<string, string>;
  nodePatches: Record<string, ComboNodePatch>;
  projectile: RuntimeProjectileConfig | null;
  projectileByState: Record<string, RuntimeProjectileConfig>;
  stateFrameCounts: Record<string, number>;
  animationTimings: Record<string, number[]>;
}

interface ResolvedAttackTimings {
  duration: number;
  activeAt: number;
  recoveryAt: number;
}

interface RuntimeFighter {
  id: string;
  name: string;
  color: string;
  thumbnail?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingRight: boolean;
  health: number;
  maxHealth: number;
  chakra: number;
  maxChakra: number;
  stamina: number;
  maxStamina: number;
  animationState: string;
  stateText: string;
  attackVariant: string | null;
  attackTimer: number;
  attackDuration: number;
  attackActiveAt: number;
  attackRecoveryAt: number;
  attackHasHit: boolean;
  currentAttackProfile: ComboChainProfile | null;
  currentComboNodeId: string | null;
  bufferedAttack: BufferedAttack | null;
  lastAttackConnected: boolean;
  comboChainTimer: number;
  guardTimer: number;
  hitstunTimer: number;
  hitFlashTimer: number;
  hitShakeTimer: number;
  attackCooldown: number;
  projectileCooldown: number;
  teleportCharges: number;
  teleportCooldown: number;
  awakenTimer: number;
  comboConfig: RuntimeComboConfig;
  isCpu: boolean;
}

interface RuntimeProjectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  damage: number;
  ttl: number;
  rotation: number;
  spinSpeed: number;
  width: number;
  height: number;
  imagePath: string;
}

interface RuntimeEffect {
  id: string;
  kind: 'hit' | 'block';
  x: number;
  y: number;
  ttl: number;
  maxTtl: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ARENA_WIDTH = 960;
const GROUND_Y = 530;
const MAX_HEALTH = 130;
const MAX_CHAKRA = 100;
const MAX_STAMINA = 100;
const PLAYER_SPEED = 260;
const JUMP_VELOCITY = -520;
const GRAVITY = 1600;
const PROJECTILE_SPEED = 420;
const COMBO_CHAIN_RESET = 0.7;
const ATTACK_CONFIG = {
  light1: { damage: 6, range: 92, chakra: 0, stamina: 3, duration: 0.34, activeAt: 0.12, recoveryAt: 0.24, animation: 'ATTACK_LIGHT_1', label: 'LIGHT 1' },
  light2: { damage: 7, range: 98, chakra: 0, stamina: 4, duration: 0.38, activeAt: 0.14, recoveryAt: 0.27, animation: 'ATTACK_LIGHT_2', label: 'LIGHT 2' },
  light3: { damage: 10, range: 106, chakra: 0, stamina: 5, duration: 0.46, activeAt: 0.18, recoveryAt: 0.34, animation: 'ATTACK_LIGHT_3', label: 'LIGHT 3' },
  heavy1: { damage: 14, range: 116, chakra: 0, stamina: 7, duration: 0.52, activeAt: 0.2, recoveryAt: 0.38, animation: 'ATTACK_HEAVY_1', label: 'HEAVY 1' },
  heavy2: { damage: 18, range: 126, chakra: 0, stamina: 9, duration: 0.6, activeAt: 0.24, recoveryAt: 0.44, animation: 'ATTACK_HEAVY_2', label: 'HEAVY 2' },
  special: { damage: 18, range: 146, chakra: 14, stamina: 10, duration: 0.82, activeAt: 0.3, recoveryAt: 0.62, animation: 'SPECIAL', label: 'SPECIAL' },
  special1: { damage: 20, range: 150, chakra: 12, stamina: 10, duration: 0.78, activeAt: 0.28, recoveryAt: 0.58, animation: 'SPECIAL', label: 'TECH 1' },
  special2: { damage: 22, range: 156, chakra: 14, stamina: 10, duration: 0.82, activeAt: 0.3, recoveryAt: 0.62, animation: 'SPECIAL', label: 'TECH 2' },
  special3: { damage: 24, range: 162, chakra: 16, stamina: 12, duration: 0.86, activeAt: 0.32, recoveryAt: 0.66, animation: 'SPECIAL', label: 'TECH 3' },
  special4: { damage: 28, range: 168, chakra: 20, stamina: 14, duration: 0.92, activeAt: 0.34, recoveryAt: 0.72, animation: 'SPECIAL', label: 'TECH 4' },
} as const;
const SOUND_MAP = {
  bgm_select: '/assets/organized/shared/sb3_fullpack/stage_bg__snd_select.wav',
  bgm_battle: '/assets/organized/shared/sb3_fullpack/stage_bg__snd_battlesoundtrack.wav',
  round_start: '/assets/organized/shared/sb3/stage__sound_001__pop.wav',
  victory: '/assets/organized/shared/sb3_fullpack/stage_bg__snd_select.wav',
  hit_light: '/assets/organized/shared/sb3/kakashi_new/kakashi__snd_combo_effect.wav',
  hit_heavy: '/assets/organized/shared/sb3_fullpack/naruto__snd_combo_effect.wav',
  projectile: '/assets/organized/shared/sb3/kakashi_new/kunai__snd_kunai_effect.wav',
  teleport: '/assets/organized/shared/sb3/kakashi_new/kakashi__snd_teleporting.wav',
  awaken: '/assets/organized/shared/sb3_fullpack/sasuke__snd_lightning.wav',
  ko: '/assets/organized/shared/sb3_fullpack/itachi__snd_hurt.wav',
} as const;

const DEFAULT_COMBO_SETTINGS: RuntimeComboSettings = {
  comboCancelRatio: 0.45,
  comboHitResetFrames: 45,
  requireHitForComboRoutes: false,
  attackDurationScale: 1,
  specialTransformDurationScale: 1,
};

const DEFAULT_ROOT_ROUTES: RuntimeComboConfig['rootRoutes'] = {
  light: { neutral: 'L_N_1', forward: 'L_F_1', down: 'L_D_1', air: 'L_A_1', back: 'L_N_1' },
  heavy: { neutral: 'H_N_1', forward: 'H_F_1', down: 'H_D_1', air: 'H_A_1', back: 'H_N_1' },
  special: { neutral: 'S_N_1', up: 'S_U_1', down: 'S_D_1', back: 'S_B_1', forward: 'S_F_1', any: 'S_N_1' },
};
const DEFAULT_PROJECTILE_CONFIG: RuntimeProjectileConfig = {
  imagePath: '/assets/organized/shared/sb3_fullpack/projectile__kunai.png',
  speed: PROJECTILE_SPEED,
  width: 24,
  height: 24,
  life: 60,
  spinSpeed: 0.35,
};

function directionToComboCode(direction: ComboRouteDirection, group: 'L' | 'H' | 'S'): string {
  if (group === 'S') {
    if (direction === 'up') return 'U';
    if (direction === 'down') return 'D';
    if (direction === 'back') return 'B';
    if (direction === 'forward') return 'F';
    return 'N';
  }
  if (direction === 'forward') return 'F';
  if (direction === 'down') return 'D';
  if (direction === 'air' || direction === 'up') return 'A';
  return 'N';
}

export class ShinobiGameRuntime {
  private state: GameUIState = { ...FALLBACK_UI, hud: { ...FALLBACK_UI.hud } };
  private listeners = new Set<Listener>();
  private scene = new PixiScene();
  private canvas: HTMLCanvasElement | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private rafId = 0;
  private lastFrameTime = 0;
  private roundTimerAccumulator = 0;
  private splashTimeout: number | null = null;
  private keys = new Set<string>();
  private projectiles: RuntimeProjectile[] = [];
  private effects: RuntimeEffect[] = [];
  private fighters: { p1: RuntimeFighter | null; p2: RuntimeFighter | null } = { p1: null, p2: null };
  private mappingConfigCache = new Map<string, Promise<RuntimeComboConfig>>();
  private soundEnabled = true;
  private currentBgm: HTMLAudioElement | null = null;

  readonly actions: GameUIActions = {
    startVsMode: () => this.startCharacterSelect('player-vs-cpu'),
    startSoloTraining: () => this.startCharacterSelect('training-solo'),
    toggleAutoFight: () =>
      this.startCharacterSelect(this.state.fightMode === 'cpu-vs-cpu' ? 'player-vs-cpu' : 'cpu-vs-cpu'),
    toggleSound: () => {
      this.soundEnabled = !this.soundEnabled;
      if (!this.soundEnabled) {
        this.stopBgm();
      } else if (this.state.hudVisible) {
        this.playBgm('bgm_battle');
      } else {
        this.playBgm('bgm_select');
      }
      this.patchState({ soundEnabled: this.soundEnabled });
    },
    openComboGuide: () => this.patchState({ comboGuideVisible: true }),
    closeComboGuide: () => this.patchState({ comboGuideVisible: false }),
    backToMenu: () => this.goToMenu(),
    backToSelect: () => this.goToCharacterSelect(this.state.fightMode),
    rematch: () => this.startFight(),
    pauseResume: () => this.patchState({ pauseVisible: !this.state.pauseVisible }),
    pauseRematch: () => this.startFight(),
    pauseBackSelect: () => this.goToCharacterSelect(this.state.fightMode),
    pauseBackMenu: () => this.goToMenu(),
    selectCharacter: (charId) => this.selectCharacter(charId),
    selectStage: (stageId) => this.selectStage(stageId),
  };

  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = loadGameCatalog().then(({ roster, stages }) => {
      this.state = {
        ...this.state,
        roster,
        stages,
      };
      this.initialized = true;
      this.emit();
      this.playBgm('bgm_select');
    });

    return this.initPromise;
  }

  async attach(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    await this.scene.attach(canvas);
    this.bindInput();
    if (!this.rafId) {
      this.lastFrameTime = performance.now();
      this.rafId = window.requestAnimationFrame(this.frame);
    }
    this.renderScene();
  }

  destroy(): void {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this.unbindInput();
    this.clearSplashTimeout();
    this.stopBgm();
    this.scene.destroy();
    this.canvas = null;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): GameUIState {
    return this.state;
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private patchState(partial: Partial<GameUIState>): void {
    this.state = { ...this.state, ...partial };
    this.emit();
    this.renderScene();
  }

  private startCharacterSelect(mode: FightMode): void {
    this.resetMatch();
    this.playBgm('bgm_select');
    this.patchState({
      fightMode: mode,
      menuVisible: false,
      charSelectVisible: true,
      hudVisible: false,
      pauseVisible: false,
      resultVisible: false,
      comboGuideVisible: false,
      splashVisible: false,
      stageSelectVisible: false,
      selectedPlayerId: null,
      selectedCpuId: null,
      selectedStageId: null,
      p1Name: '???',
      p2Name: mode === 'training-solo' ? '---' : '???',
      selectTitle: 'SELECTION DU NINJA',
    });
  }

  private goToMenu(): void {
    this.resetMatch();
    this.playBgm('bgm_select');
    this.patchState({
      ...FALLBACK_UI,
      roster: this.state.roster,
      stages: this.state.stages,
      soundEnabled: this.soundEnabled,
    });
  }

  private goToCharacterSelect(mode: FightMode): void {
    this.resetMatch();
    this.playBgm('bgm_select');
    const player = this.findCharacter(this.state.selectedPlayerId);
    const cpu = this.findCharacter(this.state.selectedCpuId);
    this.patchState({
      ...this.state,
      fightMode: mode,
      menuVisible: false,
      charSelectVisible: true,
      hudVisible: false,
      pauseVisible: false,
      resultVisible: false,
      splashVisible: false,
      stageSelectVisible: false,
      p1Name: player?.name || '???',
      p2Name: mode === 'training-solo' ? '---' : cpu?.name || '???',
    });
  }

  private selectCharacter(charId: string): void {
    const selected = this.findCharacter(charId);
    if (!selected) return;

    if (!this.state.selectedPlayerId) {
      this.patchState({
        selectedPlayerId: selected.id,
        p1Name: selected.name,
      });
      if (this.state.fightMode === 'training-solo') {
        this.patchState({ stageSelectVisible: true });
      }
      return;
    }

    if (this.state.fightMode !== 'training-solo' && !this.state.selectedCpuId) {
      this.patchState({
        selectedCpuId: selected.id,
        p2Name: selected.name,
        stageSelectVisible: true,
      });
      return;
    }

    this.patchState({
      selectedPlayerId: selected.id,
      p1Name: selected.name,
      selectedCpuId: this.state.fightMode === 'training-solo' ? null : this.state.selectedCpuId,
      stageSelectVisible: this.state.fightMode === 'training-solo' || !!this.state.selectedCpuId,
    });
  }

  private selectStage(stageId: string): void {
    if (!this.findStage(stageId)) return;
    this.patchState({
      selectedStageId: stageId,
      stageLoadingVisible: true,
      loadingTitle: 'Preparation du combat',
      loadingMessage: 'Le duel se met en place.',
    });
    window.setTimeout(() => {
      this.startFight(stageId);
    }, 180);
  }

  private startFight(stageId = this.state.selectedStageId || this.state.stages[0]?.id || null): void {
    const p1Char = this.findCharacter(this.state.selectedPlayerId) || this.state.roster[0] || null;
    const p2Char =
      this.state.fightMode === 'training-solo'
        ? null
        : this.findCharacter(this.state.selectedCpuId) ||
          this.state.roster.find((entry) => entry.id !== p1Char?.id) ||
          null;
    const stage = this.findStage(stageId);
    if (!p1Char || !stage) return;

    this.projectiles = [];
    this.effects = [];
    this.roundTimerAccumulator = 0;
    this.fighters.p1 = this.createFighter(p1Char, false, 260, GROUND_Y);
    this.fighters.p2 = p2Char ? this.createFighter(p2Char, this.state.fightMode !== 'training-solo', 700, GROUND_Y) : null;
    if (this.fighters.p2) this.fighters.p2.facingRight = false;
    this.hydrateFighterConfig(this.fighters.p1);
    if (this.fighters.p2) this.hydrateFighterConfig(this.fighters.p2);

    const nextHud = {
      p1: this.toHudState(this.fighters.p1),
      p2: this.fighters.p2 ? this.toHudState(this.fighters.p2) : null,
      timer: 99,
      round: 1,
    };

    this.patchState({
      menuVisible: false,
      charSelectVisible: false,
      hudVisible: true,
      pauseVisible: false,
      resultVisible: false,
      comboGuideVisible: false,
      splashVisible: true,
      splashText: 'MANCHE 1',
      stageLoadingVisible: false,
      selectedStageId: stage.id,
      loadingTitle: 'Preparation du combat',
      loadingMessage: `${stage.name} est pret.`,
      hud: nextHud,
      p1Name: p1Char.name,
      p2Name: this.fighters.p2?.name || '---',
    });

    this.playSfx('round_start');
    this.playBgm('bgm_battle');

    this.clearSplashTimeout();
    this.splashTimeout = window.setTimeout(() => {
      this.patchState({ splashVisible: false });
      this.splashTimeout = null;
    }, 1000);
  }

  private resetMatch(): void {
    this.projectiles = [];
    this.effects = [];
    this.fighters.p1 = null;
    this.fighters.p2 = null;
    this.roundTimerAccumulator = 0;
    this.clearSplashTimeout();
  }

  private clearSplashTimeout(): void {
    if (this.splashTimeout !== null) {
      window.clearTimeout(this.splashTimeout);
      this.splashTimeout = null;
    }
  }

  private createFighter(character: CharacterSummary, isCpu: boolean, x: number, y: number): RuntimeFighter {
    return {
      id: character.id,
      name: character.name,
      color: character.color || '#f97316',
      thumbnail: character.thumbnail,
      x,
      y,
      vx: 0,
      vy: 0,
      facingRight: true,
      health: MAX_HEALTH,
      maxHealth: MAX_HEALTH,
      chakra: MAX_CHAKRA,
      maxChakra: MAX_CHAKRA,
      stamina: MAX_STAMINA,
      maxStamina: MAX_STAMINA,
      animationState: 'IDLE',
      stateText: 'PRET',
      attackVariant: null,
      attackTimer: 0,
      attackDuration: 0,
      attackActiveAt: 0,
      attackRecoveryAt: 0,
      attackHasHit: false,
      currentAttackProfile: null,
      currentComboNodeId: null,
      bufferedAttack: null,
      lastAttackConnected: false,
      comboChainTimer: 0,
      guardTimer: 0,
      hitstunTimer: 0,
      hitFlashTimer: 0,
      hitShakeTimer: 0,
      attackCooldown: 0,
      projectileCooldown: 0,
      teleportCharges: 2,
      teleportCooldown: 0,
      awakenTimer: 0,
      comboConfig: this.buildDefaultComboConfig(),
      isCpu,
    };
  }

  private frame = (time: number): void => {
    const dt = Math.min(0.033, (time - this.lastFrameTime) / 1000 || 0.016);
    this.lastFrameTime = time;

    if (this.state.hudVisible && !this.state.pauseVisible && !this.state.resultVisible) {
      this.updateMatch(dt);
    }
    this.renderScene();
    this.rafId = window.requestAnimationFrame(this.frame);
  };

  private updateMatch(dt: number): void {
    const { p1, p2 } = this.fighters;
    if (!p1) return;

    this.roundTimerAccumulator += dt;
    if (this.roundTimerAccumulator >= 1) {
      this.roundTimerAccumulator -= 1;
      const nextTimer = Math.max(0, this.state.hud.timer - 1);
      this.state = {
        ...this.state,
        hud: { ...this.state.hud, timer: nextTimer },
      };
      if (nextTimer <= 0) {
        this.finishMatch(p2 && p2.health > p1.health ? p2 : p1);
        return;
      }
      this.emit();
    }

    this.updateFighter(p1, dt, false, p2);
    if (p2) this.updateFighter(p2, dt, true, p1);
    this.updateProjectiles(dt);
    this.updateEffects(dt);
    this.refreshHud();
    this.checkMatchEnd();
  }

  private updateFighter(
    fighter: RuntimeFighter,
    dt: number,
    aiControlled: boolean,
    opponent: RuntimeFighter | null,
  ): void {
    fighter.attackCooldown = Math.max(0, fighter.attackCooldown - dt);
    fighter.projectileCooldown = Math.max(0, fighter.projectileCooldown - dt);
    fighter.teleportCooldown = Math.max(0, fighter.teleportCooldown - dt);
    fighter.awakenTimer = Math.max(0, fighter.awakenTimer - dt);
    fighter.guardTimer = Math.max(0, fighter.guardTimer - dt);
    fighter.hitstunTimer = Math.max(0, fighter.hitstunTimer - dt);
    fighter.hitFlashTimer = Math.max(0, fighter.hitFlashTimer - dt);
    fighter.hitShakeTimer = Math.max(0, fighter.hitShakeTimer - dt);
    fighter.comboChainTimer = Math.max(0, fighter.comboChainTimer - dt);

    if (fighter.teleportCooldown <= 0 && fighter.teleportCharges < 2) {
      fighter.teleportCharges = 2;
    }
    if (fighter.comboChainTimer <= 0) {
      fighter.currentComboNodeId = null;
      fighter.bufferedAttack = null;
    }

    fighter.chakra = Math.min(fighter.maxChakra, fighter.chakra + dt * 4);
    fighter.stamina = Math.min(fighter.maxStamina, fighter.stamina + dt * 9);

    if (fighter.hitstunTimer > 0) {
      fighter.animationState = fighter.health <= 0 ? 'KO' : 'HIT';
      fighter.stateText = fighter.health <= 0 ? 'KO' : 'TOUCHE';
      fighter.vx *= 0.9;
    } else if (fighter.attackVariant) {
      this.updateAttackState(fighter, opponent, dt);
    } else if (aiControlled && opponent) {
      this.updateCpu(fighter, opponent, dt);
    } else {
      this.updatePlayerOneInput(fighter, opponent, dt);
    }

    fighter.vy += GRAVITY * dt;
    fighter.x += fighter.vx * dt;
    fighter.y += fighter.vy * dt;
    fighter.x = Math.max(90, Math.min(ARENA_WIDTH - 90, fighter.x));

    if (fighter.y >= GROUND_Y) {
      fighter.y = GROUND_Y;
      fighter.vy = 0;
    }

    if (opponent) {
      fighter.facingRight = fighter.x <= opponent.x;
    }
  }

  private updatePlayerOneInput(fighter: RuntimeFighter, opponent: RuntimeFighter | null, dt: number): void {
    let move = 0;
    if (this.keys.has('ArrowLeft')) move -= 1;
    if (this.keys.has('ArrowRight')) move += 1;

    fighter.vx = move * PLAYER_SPEED * (fighter.awakenTimer > 0 ? 1.15 : 1);
    fighter.stateText = move === 0 ? 'PRET' : 'MOUVEMENT';
    fighter.animationState = move === 0 ? 'IDLE' : 'WALK';

    if (this.keys.has('KeyQ')) {
      fighter.stateText = 'GARDE';
      fighter.animationState = 'BLOCK';
      fighter.guardTimer = 0.08;
      fighter.chakra = Math.min(fighter.maxChakra, fighter.chakra + dt * 10);
    }

    if (this.keys.has('ArrowDown')) {
      fighter.stateText = 'ACCROUPI';
      fighter.animationState = 'CROUCH';
    }

    if (this.keys.has('ArrowUp') && fighter.y >= GROUND_Y) {
      fighter.vy = JUMP_VELOCITY;
      fighter.stateText = 'SAUT';
      fighter.animationState = 'JUMP';
      this.keys.delete('ArrowUp');
    }

    if (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) {
      fighter.vx = (fighter.facingRight ? 1 : -1) * PLAYER_SPEED * 2.2;
      fighter.stateText = 'DASH';
      fighter.animationState = 'DASH';
      this.keys.delete('ShiftLeft');
      this.keys.delete('ShiftRight');
    }

    this.consumeCombatInputs(fighter, opponent, false);
  }

  private updateCpu(fighter: RuntimeFighter, opponent: RuntimeFighter, dt: number): void {
    const distance = opponent.x - fighter.x;
    const dir = Math.sign(distance);
    fighter.vx = Math.abs(distance) > 120 ? dir * PLAYER_SPEED * 0.7 : 0;
    fighter.stateText = fighter.vx === 0 ? 'OBSERVE' : 'APPROCHE';
    fighter.animationState = fighter.vx === 0 ? 'IDLE' : 'RUN';

    if (Math.random() < dt * 0.55) {
      fighter.guardTimer = 0.08;
      fighter.animationState = 'BLOCK';
      fighter.stateText = 'GARDE';
    }

    if (Math.random() < dt * 1.4) {
      if (Math.abs(distance) < 120) {
        this.performAttack(fighter, opponent, Math.random() > 0.4 ? 'light' : 'heavy');
      } else if (fighter.projectileCooldown <= 0 && fighter.chakra >= 10) {
        this.spawnProjectile(fighter);
      }
    }

    if (Math.random() < dt * 0.4 && fighter.teleportCooldown <= 0 && fighter.teleportCharges > 0) {
      this.teleportBehind(fighter, opponent);
    }
  }

  private consumeCombatInputs(fighter: RuntimeFighter, opponent: RuntimeFighter | null, cpu: boolean): void {
    if (this.consumeKey('KeyS')) this.queueOrPerformAttack(fighter, opponent, 'light');
    if (this.consumeKey('KeyD')) this.queueOrPerformAttack(fighter, opponent, 'heavy');
    if (this.consumeKey('KeyF')) this.queueOrPerformAttack(fighter, opponent, 'special');
    if (this.consumeKey('Digit1')) this.queueOrPerformAttack(fighter, opponent, 'special1');
    if (this.consumeKey('Digit2')) this.queueOrPerformAttack(fighter, opponent, 'special2');
    if (this.consumeKey('Digit3')) this.queueOrPerformAttack(fighter, opponent, 'special3');
    if (this.consumeKey('Digit4')) this.queueOrPerformAttack(fighter, opponent, 'special4');
    if (this.consumeKey('KeyE')) this.spawnProjectile(fighter);
    if (this.consumeKey('KeyG')) this.awaken(fighter);
    if (this.consumeKey('KeyR') && opponent && !cpu) this.teleportBehind(fighter, opponent);
  }

  private queueOrPerformAttack(
    fighter: RuntimeFighter,
    opponent: RuntimeFighter | null,
    rawType: 'light' | 'heavy' | 'special' | 'special1' | 'special2' | 'special3' | 'special4',
  ): void {
    const buffered = this.buildBufferedAttack(fighter, rawType);
    if (fighter.attackVariant) {
      fighter.bufferedAttack = buffered;
      return;
    }
    this.performAttack(fighter, opponent, rawType);
  }

  private performAttack(
    attacker: RuntimeFighter,
    defender: RuntimeFighter | null,
    type: 'light' | 'heavy' | 'special' | 'special1' | 'special2' | 'special3' | 'special4',
  ): void {
    if (attacker.attackCooldown > 0 || attacker.attackVariant || attacker.hitstunTimer > 0) return;
    const attackSelection = this.resolveAttackSelection(attacker, type, null);
    const resolvedType = attackSelection.variantKey;
    const config = ATTACK_CONFIG[resolvedType];

    if (attacker.chakra < config.chakra || attacker.stamina < config.stamina) return;

    attacker.chakra -= config.chakra;
    attacker.stamina -= config.stamina;
    attacker.attackCooldown = config.recoveryAt;
    attacker.attackVariant = resolvedType;
    attacker.attackTimer = 0;
    attacker.attackDuration = attackSelection.duration;
    attacker.attackActiveAt = attackSelection.activeAt;
    attacker.attackRecoveryAt = attackSelection.recoveryAt;
    attacker.attackHasHit = false;
    attacker.currentAttackProfile = attackSelection.profile;
    attacker.currentComboNodeId = attackSelection.nodeId;
    attacker.lastAttackConnected = false;
    attacker.animationState = attackSelection.animationState;
    attacker.stateText = attackSelection.label;
    attacker.comboChainTimer = this.comboResetWindowToSeconds(attacker.comboConfig.settings.comboHitResetFrames);
  }

  private spawnProjectile(fighter: RuntimeFighter): void {
    if (fighter.projectileCooldown > 0 || fighter.chakra < 8) return;
    const projectileConfig = this.resolveProjectileConfig(fighter);
    fighter.projectileCooldown = 0.9;
    fighter.chakra -= 8;
    fighter.stateText = 'PROJECTILE';
    fighter.animationState = 'THROW';
    this.playSfx('projectile');
    this.projectiles.push({
      id: `${fighter.id}-${performance.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ownerId: fighter.id,
      x: fighter.x + (fighter.facingRight ? 42 : -42),
      y: fighter.y - 96,
      vx: fighter.facingRight ? projectileConfig.speed : -projectileConfig.speed,
      damage: fighter.awakenTimer > 0 ? 14 : 10,
      ttl: projectileConfig.life / 60,
      rotation: 0,
      spinSpeed: projectileConfig.spinSpeed,
      width: projectileConfig.width,
      height: projectileConfig.height,
      imagePath: projectileConfig.imagePath,
    });
  }

  private awaken(fighter: RuntimeFighter): void {
    if (fighter.chakra < 30) return;
    fighter.chakra -= 30;
    fighter.awakenTimer = 8;
    fighter.stateText = 'EVEIL';
    fighter.animationState = 'SPECIAL_TRANSFORM';
    this.playSfx('awaken');
  }

  private teleportBehind(fighter: RuntimeFighter, opponent: RuntimeFighter): void {
    if (fighter.teleportCooldown > 0 || fighter.teleportCharges <= 0 || fighter.stamina < 16) return;
    fighter.stamina -= 16;
    fighter.teleportCharges -= 1;
    if (fighter.teleportCharges <= 0) fighter.teleportCooldown = 4.5;
    fighter.x = opponent.x + (opponent.facingRight ? -72 : 72);
    fighter.facingRight = fighter.x <= opponent.x;
    fighter.stateText = 'TELEPORT';
    fighter.animationState = 'TELEPORT';
    this.playSfx('teleport');
  }

  private updateProjectiles(dt: number): void {
    const { p1, p2 } = this.fighters;
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.x += projectile.vx * dt;
      projectile.ttl -= dt;
      projectile.rotation += projectile.spinSpeed;
      if (projectile.ttl <= 0 || projectile.x < -50 || projectile.x > ARENA_WIDTH + 50) return false;

      const target = projectile.ownerId === p1?.id ? p2 : p1;
      if (!target) return true;
      if (this.rectsOverlap(this.getProjectileRect(projectile), this.getHurtbox(target))) {
        const blocked = this.isBlockingAgainst(target, projectile.vx > 0 ? -1 : 1);
        const damage = blocked ? Math.max(2, projectile.damage * 0.25) : projectile.damage;
        target.health = Math.max(0, target.health - damage);
        target.stateText = blocked ? 'GARDE' : 'IMPACT';
        target.animationState = blocked ? 'BLOCK' : 'HIT';
        target.hitstunTimer = blocked ? 0.12 : 0.2;
        target.hitFlashTimer = blocked ? 0.08 : 0.16;
        target.hitShakeTimer = blocked ? 0.06 : 0.14;
        this.spawnImpactEffect(target.x, target.y - 92, blocked ? 'block' : 'hit');
        this.playSfx('projectile');
        return false;
      }
      return true;
    });
  }

  private refreshHud(): void {
    this.state = {
      ...this.state,
      hud: {
        ...this.state.hud,
        p1: this.fighters.p1 ? this.toHudState(this.fighters.p1) : null,
        p2: this.fighters.p2 ? this.toHudState(this.fighters.p2) : null,
      },
    };
    this.emit();
  }

  private checkMatchEnd(): void {
    const { p1, p2 } = this.fighters;
    if (!p1) return;
    if (p1.health <= 0) {
      this.finishMatch(p2);
      return;
    }
    if (p2 && p2.health <= 0) {
      this.finishMatch(p1);
    }
  }

  private finishMatch(winner: RuntimeFighter | null): void {
    if (this.state.resultVisible) return;
    const stats: ResultStatsState = {
      p1Name: this.fighters.p1?.name || 'P1',
      p2Name: this.fighters.p2?.name || 'P2',
      rows: [
        ['Vie', Math.round(this.fighters.p1?.health || 0), Math.round(this.fighters.p2?.health || 0)],
        ['Chakra', Math.round(this.fighters.p1?.chakra || 0), Math.round(this.fighters.p2?.chakra || 0)],
        ['Stamina', Math.round(this.fighters.p1?.stamina || 0), Math.round(this.fighters.p2?.stamina || 0)],
      ],
    };

    this.patchState({
      hudVisible: false,
      pauseVisible: false,
      splashVisible: false,
      resultVisible: true,
      resultText: 'VICTOIRE !',
      resultWinner: winner?.name || 'EGALITE',
      resultStats: stats,
    });
    this.playSfx(winner ? 'victory' : 'ko');
  }

  private toHudState(fighter: RuntimeFighter): HudFighterState {
    return {
      name: fighter.name,
      stateText: fighter.stateText,
      healthPercent: fighter.health / fighter.maxHealth,
      bufferedHealthPercent: fighter.health / fighter.maxHealth,
      chakraPercent: fighter.chakra / fighter.maxChakra,
      staminaPercent: fighter.stamina / fighter.maxStamina,
      healthText: `${Math.round(fighter.health)} / ${fighter.maxHealth}`,
    };
  }

  private renderScene(): void {
    const stage = this.findStage(this.state.selectedStageId);
    const fighters = [this.fighters.p1, this.fighters.p2]
      .filter((fighter): fighter is RuntimeFighter => !!fighter)
      .map((fighter) => ({
        id: fighter.id,
        name: fighter.name,
        color: fighter.color,
        thumbnail: fighter.thumbnail,
        x: fighter.x,
        y: fighter.y,
        facingRight: fighter.facingRight,
        activeState: fighter.animationState,
        healthPercent: fighter.health / fighter.maxHealth,
        hitFlash: fighter.hitFlashTimer > 0,
        shake: fighter.hitShakeTimer,
      }));

    const projectiles = this.projectiles.map((projectile, index) => ({
      id: projectile.id || `${projectile.ownerId}-${index}`,
      x: projectile.x,
      y: projectile.y,
      rotation: Math.atan2(0, projectile.vx || 1) + projectile.rotation,
      imagePath: projectile.imagePath,
      width: projectile.width,
      height: projectile.height,
    }));
    const effects = this.effects.map((effect) => ({
      id: effect.id,
      kind: effect.kind,
      x: effect.x,
      y: effect.y,
      alpha: effect.ttl / effect.maxTtl,
      scale: 0.7 + (1 - effect.ttl / effect.maxTtl) * 0.8,
    }));

    this.scene.render(this.state.hudVisible ? { stage, fighters, projectiles, effects } : null);
  }

  private playSfx(id: keyof typeof SOUND_MAP): void {
    if (!this.soundEnabled) return;
    const path = SOUND_MAP[id];
    const audio = new Audio(path);
    audio.volume =
      id === 'round_start' ? 0.5 :
      id === 'victory' ? 0.42 :
      id === 'ko' ? 0.45 :
      id === 'teleport' ? 0.5 :
      0.35;
    audio.play().catch(() => {});
  }

  private playBgm(id: 'bgm_select' | 'bgm_battle'): void {
    if (!this.soundEnabled) return;
    const path = SOUND_MAP[id];
    if (this.currentBgm?.src.endsWith(path)) return;
    this.stopBgm();
    const audio = new Audio(path);
    audio.loop = true;
    audio.volume = id === 'bgm_battle' ? 0.24 : 0.34;
    audio.play().catch(() => {});
    this.currentBgm = audio;
  }

  private stopBgm(): void {
    if (!this.currentBgm) return;
    this.currentBgm.pause();
    this.currentBgm.currentTime = 0;
    this.currentBgm = null;
  }

  private findCharacter(id: string | null): CharacterSummary | null {
    if (!id) return null;
    return this.state.roster.find((entry) => entry.id === id) || null;
  }

  private findStage(id: string | null): StageSummary | null {
    if (!id) return null;
    return this.state.stages.find((entry) => entry.id === id) || null;
  }

  private consumeKey(code: string): boolean {
    if (!this.keys.has(code)) return false;
    this.keys.delete(code);
    return true;
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    if (event.code === 'Escape' && this.state.hudVisible) {
      this.patchState({ pauseVisible: !this.state.pauseVisible });
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private updateAttackState(fighter: RuntimeFighter, opponent: RuntimeFighter | null, dt: number): void {
    if (!fighter.attackVariant) return;
    const config = ATTACK_CONFIG[fighter.attackVariant as keyof typeof ATTACK_CONFIG];
    fighter.attackTimer += dt;
    fighter.vx *= fighter.attackTimer < fighter.attackRecoveryAt ? 0.82 : 0.6;
    fighter.animationState = this.resolveAnimationForVariant(fighter, fighter.attackVariant);
    fighter.stateText = this.resolveLabelForVariant(fighter, fighter.attackVariant);

    if (fighter.bufferedAttack && this.canConsumeBufferedAttack(fighter)) {
      if (this.tryConsumeBufferedAttack(fighter, opponent)) {
        return;
      }
    }

    if (!fighter.attackHasHit && fighter.attackTimer >= fighter.attackActiveAt) {
      fighter.attackHasHit = true;
      if (opponent) {
        this.resolveAttackHit(fighter, opponent, config, fighter.attackVariant.startsWith('light'));
      }
    }

    if (fighter.attackTimer >= fighter.attackDuration) {
      fighter.attackVariant = null;
      fighter.attackTimer = 0;
      fighter.attackDuration = 0;
      fighter.attackActiveAt = 0;
      fighter.attackRecoveryAt = 0;
      fighter.attackHasHit = false;
      fighter.currentAttackProfile = null;
      fighter.currentComboNodeId = null;
      fighter.bufferedAttack = null;
      fighter.lastAttackConnected = false;
      fighter.animationState = fighter.y < GROUND_Y ? 'JUMP' : 'IDLE';
      fighter.stateText = fighter.y < GROUND_Y ? 'SAUT' : 'PRET';
    }
  }

  private resolveAttackHit(
    attacker: RuntimeFighter,
    defender: RuntimeFighter,
    config: (typeof ATTACK_CONFIG)[keyof typeof ATTACK_CONFIG],
    lightHit: boolean,
  ): void {
    const attackDir = attacker.x < defender.x ? -1 : 1;
    const attackProfile = attacker.currentAttackProfile;
    const attackRect = this.getAttackHitbox(attacker, config, attackProfile);
    const hurtbox = this.getHurtbox(defender);
    if (!this.rectsOverlap(attackRect, hurtbox)) return;
    const blocked = this.isBlockingAgainst(defender, attackDir);
    const boost = attacker.awakenTimer > 0 ? 1.2 : 1;
    const damageBase = config.damage * (attackProfile?.damageMultiplier || 1);
    const knockbackBase = attackProfile?.knockbackMultiplier || 1;
    const damage = blocked ? Math.max(2, damageBase * 0.18) : damageBase * boost;
    defender.health = Math.max(0, defender.health - damage);
    defender.stateText = blocked ? 'GARDE' : 'TOUCHE';
    defender.animationState = blocked ? 'BLOCK' : defender.health <= 0 ? 'KO' : 'HIT';
    defender.hitstunTimer = blocked ? 0.14 : config.animation === 'SPECIAL' ? 0.34 : 0.22;
    defender.hitFlashTimer = blocked ? 0.08 : 0.18;
    defender.hitShakeTimer = blocked ? 0.08 : 0.16;
    this.spawnImpactEffect(defender.x, defender.y - 92, blocked ? 'block' : 'hit');
    defender.vx += blocked ? (attackDir * 26 * knockbackBase) : (attackDir * 110 * knockbackBase);
    if (!blocked) {
      attacker.lastAttackConnected = true;
    }
    this.playSfx(blocked ? 'hit_light' : lightHit ? 'hit_light' : 'hit_heavy');
  }

  private isBlockingAgainst(defender: RuntimeFighter, attackDir: number): boolean {
    if (defender.guardTimer <= 0) return false;
    return defender.facingRight ? attackDir > 0 : attackDir < 0;
  }

  private hydrateFighterConfig(fighter: RuntimeFighter): void {
    this.loadFighterComboConfig(fighter.id).then((comboConfig) => {
      if (this.fighters.p1?.id === fighter.id) {
        this.fighters.p1.comboConfig = comboConfig;
      }
      if (this.fighters.p2?.id === fighter.id) {
        this.fighters.p2.comboConfig = comboConfig;
      }
    }).catch(() => {});
  }

  private loadFighterComboConfig(characterId: string): Promise<RuntimeComboConfig> {
    if (this.mappingConfigCache.has(characterId)) {
      return this.mappingConfigCache.get(characterId)!;
    }
    const promise = fetch(`/assets/organized/characters/${characterId}/mapping.json`, { cache: 'force-cache' })
      .then((response) => (response.ok ? response.json() : null))
      .then((mapping) => this.normalizeComboConfig(mapping || null))
      .catch(() => this.buildDefaultComboConfig());
    this.mappingConfigCache.set(characterId, promise);
    return promise;
  }

  private normalizeComboConfig(rawMapping: any): RuntimeComboConfig {
    const fallback = this.buildDefaultComboConfig();
    const rawCombo = rawMapping?.combo;
    if (!rawCombo || typeof rawCombo !== 'object') return fallback;

    return {
      settings: {
        ...DEFAULT_COMBO_SETTINGS,
        ...(rawCombo.settings || {}),
      },
      chains: {
        light: Array.isArray(rawCombo.chains?.light) ? rawCombo.chains.light : fallback.chains.light,
        heavy: Array.isArray(rawCombo.chains?.heavy) ? rawCombo.chains.heavy : fallback.chains.heavy,
        special: Array.isArray(rawCombo.chains?.special) ? rawCombo.chains.special : fallback.chains.special,
      },
      rootRoutes: {
        light: rawCombo.rootRoutes?.light || fallback.rootRoutes.light,
        heavy: rawCombo.rootRoutes?.heavy || fallback.rootRoutes.heavy,
        special: rawCombo.rootRoutes?.special || fallback.rootRoutes.special,
      },
      actionMap: {
        ...fallback.actionMap,
        ...(rawCombo.actionMap || {}),
      },
      hotkeys: {
        ...(rawCombo.hotkeys || {}),
      },
      nodePatches: {
        ...(rawCombo.nodePatches || {}),
      },
      projectile: this.normalizeProjectileConfig(rawMapping?.projectile) || fallback.projectile,
      projectileByState: this.normalizeProjectileByState(rawMapping?.projectileByState),
      stateFrameCounts: this.normalizeStateFrameCounts(rawMapping),
      animationTimings: this.normalizeAnimationTimings(rawMapping),
    };
  }

  private buildDefaultComboConfig(): RuntimeComboConfig {
    return {
      settings: DEFAULT_COMBO_SETTINGS,
      chains: {
        light: [
          { state: 'ATTACK_LIGHT_1', duration: 11, damageMultiplier: 1, rangeMultiplier: 1, knockbackMultiplier: 0.9 },
          { state: 'ATTACK_LIGHT_2', duration: 11, damageMultiplier: 1.15, rangeMultiplier: 1.06, knockbackMultiplier: 1.05 },
          { state: 'ATTACK_LIGHT_3', duration: 14, damageMultiplier: 1.35, rangeMultiplier: 1.12, knockbackMultiplier: 1.35 },
        ],
        heavy: [
          { state: 'ATTACK_HEAVY_1', duration: 16, damageMultiplier: 1.2, rangeMultiplier: 1.08, knockbackMultiplier: 1.15 },
          { state: 'ATTACK_HEAVY_2', duration: 20, damageMultiplier: 1.45, rangeMultiplier: 1.15, knockbackMultiplier: 1.5 },
        ],
        special: [
          { state: 'SPECIAL', duration: 35, damageMultiplier: 1, rangeMultiplier: 1, knockbackMultiplier: 1 },
        ],
      },
      rootRoutes: DEFAULT_ROOT_ROUTES,
      actionMap: {
        light: 'ATTACK_LIGHT_1',
        heavy: 'ATTACK_HEAVY_1',
        special: 'SPECIAL',
        transform: 'SPECIAL_TRANSFORM',
        block: 'BLOCK',
        jump: 'JUMP',
        run: 'RUN',
        crouch: 'CROUCH',
        dash: 'DASH',
      },
      hotkeys: {},
      nodePatches: {},
      projectile: DEFAULT_PROJECTILE_CONFIG,
      projectileByState: {},
      stateFrameCounts: {},
      animationTimings: {},
    };
  }

  private resolveAttackSelection(
    fighter: RuntimeFighter,
    type: 'light' | 'heavy' | 'special' | 'special1' | 'special2' | 'special3' | 'special4',
    forcedNodeId: string | null,
  ): { variantKey: keyof typeof ATTACK_CONFIG; animationState: string; label: string; duration: number; activeAt: number; recoveryAt: number; profile: ComboChainProfile | null; nodeId: string | null } {
    if (type === 'light' || type === 'heavy') {
      const direction = this.resolveBufferedDirection(fighter, type);
      const nodeId = forcedNodeId || this.resolveRouteNodeId(fighter.comboConfig, type, direction);
      const parsed = this.parseComboNodeId(nodeId);
      const step = parsed?.step || 1;
      const variantKey = `${type}${Math.min(step, fighter.comboConfig.chains[type].length || 1)}` as keyof typeof ATTACK_CONFIG;
      const baseProfile = fighter.comboConfig.chains[type][Math.max(0, step - 1)];
      const profile = this.applyNodePatchProfile(fighter.comboConfig, nodeId, baseProfile);
      const animationState = profile?.state || ATTACK_CONFIG[variantKey].animation;
      const timings = this.resolveAttackTimings(
        fighter.comboConfig,
        animationState,
        variantKey,
        profile,
      );
      return {
        variantKey,
        animationState,
        label: ATTACK_CONFIG[variantKey].label,
        duration: timings.duration,
        activeAt: timings.activeAt,
        recoveryAt: timings.recoveryAt,
        profile: profile || null,
        nodeId,
      };
    }

    const specialDirection = this.resolveSpecialDirectionFromInput(fighter, type);
    const routeNodeId = forcedNodeId || this.resolveRouteNodeId(fighter.comboConfig, 'special', specialDirection);
    const variantKey = type === 'special' ? 'special' : (type as keyof typeof ATTACK_CONFIG);
    const profile = this.applyNodePatchProfile(fighter.comboConfig, routeNodeId, fighter.comboConfig.chains.special[0]);
    const animationState = this.resolveSpecialAnimationState(fighter, routeNodeId, profile?.state);
    const timings = this.resolveAttackTimings(
      fighter.comboConfig,
      animationState,
      variantKey,
      profile,
    );
    return {
      variantKey,
      animationState,
      label: ATTACK_CONFIG[variantKey].label,
      duration: timings.duration,
      activeAt: timings.activeAt,
      recoveryAt: timings.recoveryAt,
      profile: profile || null,
      nodeId: routeNodeId,
    };
  }

  private resolveAnimationForVariant(fighter: RuntimeFighter, variant: string): string {
    if (variant === 'light1') return fighter.comboConfig.chains.light[0]?.state || 'ATTACK_LIGHT_1';
    if (variant === 'light2') return fighter.comboConfig.chains.light[1]?.state || 'ATTACK_LIGHT_2';
    if (variant === 'light3') return fighter.comboConfig.chains.light[2]?.state || 'ATTACK_LIGHT_3';
    if (variant === 'heavy1') return fighter.comboConfig.chains.heavy[0]?.state || 'ATTACK_HEAVY_1';
    if (variant === 'heavy2') return fighter.comboConfig.chains.heavy[1]?.state || 'ATTACK_HEAVY_2';
    if (variant.startsWith('special')) {
      return fighter.animationState || fighter.comboConfig.chains.special[0]?.state || 'SPECIAL';
    }
    return ATTACK_CONFIG[variant as keyof typeof ATTACK_CONFIG]?.animation || 'IDLE';
  }

  private resolveLabelForVariant(fighter: RuntimeFighter, variant: string): string {
    void fighter;
    return ATTACK_CONFIG[variant as keyof typeof ATTACK_CONFIG]?.label || 'ATTACK';
  }

  private resolveRouteNodeId(
    comboConfig: RuntimeComboConfig,
    type: ComboActionType,
    direction: ComboRouteDirection,
  ): string {
    const routes = comboConfig.rootRoutes[type] || {};
    return routes[direction] || routes.any || routes.neutral || DEFAULT_ROOT_ROUTES[type].neutral || '';
  }

  private resolveNextComboNodeId(
    fighter: RuntimeFighter,
    routeType: ComboActionType,
    direction: ComboRouteDirection,
  ): string | null {
    if (!fighter.currentComboNodeId) {
      return this.resolveRouteNodeId(fighter.comboConfig, routeType, direction);
    }

    const patchRoute = fighter.comboConfig.nodePatches[fighter.currentComboNodeId]?.routes?.[routeType];
    if (patchRoute) {
      return patchRoute[direction] || patchRoute.any || patchRoute.neutral || null;
    }

    const parsed = this.parseComboNodeId(fighter.currentComboNodeId);
    if (!parsed) {
      return this.resolveRouteNodeId(fighter.comboConfig, routeType, direction);
    }
    if (fighter.comboConfig.nodePatches[fighter.currentComboNodeId]?.requiresHitOnRoute && !fighter.lastAttackConnected) {
      return null;
    }
    if (fighter.comboConfig.settings.requireHitForComboRoutes && !fighter.lastAttackConnected && routeType !== 'special') {
      return null;
    }

    if (parsed.group === 'L') {
      if (routeType === 'light') {
        const nextStep = Math.min(parsed.step + 1, fighter.comboConfig.chains.light.length);
        return parsed.step >= fighter.comboConfig.chains.light.length ? null : this.makeComboNodeId('L', directionToComboCode(direction, 'L'), nextStep);
      }
      if (routeType === 'heavy') {
        return this.makeComboNodeId('H', directionToComboCode(direction, 'H'), 1);
      }
      if (routeType === 'special') {
        return this.makeComboNodeId('S', directionToComboCode(direction, 'S'), 1);
      }
      return null;
    }

    if (parsed.group === 'H') {
      if (routeType === 'heavy') {
        const nextStep = Math.min(parsed.step + 1, fighter.comboConfig.chains.heavy.length);
        return parsed.step >= fighter.comboConfig.chains.heavy.length ? null : this.makeComboNodeId('H', directionToComboCode(direction, 'H'), nextStep);
      }
      if (routeType === 'special') {
        return this.makeComboNodeId('S', directionToComboCode(direction, 'S'), 1);
      }
      return null;
    }

    return null;
  }

  private resolveSpecialDirectionFromInput(
    fighter: RuntimeFighter,
    type: 'special' | 'special1' | 'special2' | 'special3' | 'special4',
  ): ComboRouteDirection {
    if (type !== 'special') {
      return this.resolveSpecialDirectionFromHotkey(fighter, type);
    }
    return this.resolveBufferedDirection(fighter, 'special');
  }

  private resolveSpecialDirectionFromHotkey(
    fighter: RuntimeFighter,
    type: 'special1' | 'special2' | 'special3' | 'special4',
  ): ComboRouteDirection {
    const slot = type.replace('special', '');
    const style = fighter.comboConfig.hotkeys[slot] || '';
    if (style === 's1' || /up|kamui/i.test(style)) return 'up';
    if (style === 's2' || /down|tsukuyomi/i.test(style)) return 'down';
    if (style === 's3' || /back|amaterasu/i.test(style)) return 'back';
    if (style === 's4' || /forward/i.test(style)) return 'forward';
    if (style === 'a' || /neutral|raikiri|(^a$)/i.test(style)) return 'neutral';
    if (slot === '2') return 'up';
    if (slot === '3') return 'down';
    if (slot === '4') return 'back';
    return 'neutral';
  }

  private resolveBufferedDirection(fighter: RuntimeFighter, type: ComboActionType): ComboRouteDirection {
    const down = this.keys.has('ArrowDown') && !this.keys.has('ArrowUp');
    const up = this.keys.has('ArrowUp') && !this.keys.has('ArrowDown');
    const left = this.keys.has('ArrowLeft');
    const right = this.keys.has('ArrowRight');

    if (type === 'special') {
      if (up) return 'up';
      if (down) return 'down';
      if (left !== right) {
        const movingRight = right && !left;
        const forward = fighter.facingRight ? movingRight : !movingRight;
        return forward ? 'forward' : 'back';
      }
      return 'neutral';
    }

    if (up) return 'air';
    if (down) return 'down';
    if (left !== right) {
      const movingRight = right && !left;
      const forward = fighter.facingRight ? movingRight : !movingRight;
      return forward ? 'forward' : 'back';
    }
    return 'neutral';
  }

  private resolveSpecialAnimationState(
    fighter: RuntimeFighter,
    routeNodeId: string,
    fallbackState?: string,
  ): string {
    const actionMap = fighter.comboConfig.actionMap;
    switch (routeNodeId) {
      case 'S_U_1':
        return actionMap.specialUp || actionMap.specialAirLight || fallbackState || actionMap.special || 'SPECIAL';
      case 'S_D_1':
        return actionMap.specialDown || actionMap.specialAirHeavy || fallbackState || actionMap.special || 'SPECIAL';
      case 'S_B_1':
        return actionMap.specialBack || actionMap.teleport || fallbackState || actionMap.special || 'SPECIAL';
      case 'S_F_1':
        return actionMap.specialForward || fallbackState || actionMap.special || 'SPECIAL';
      default:
        return fallbackState || actionMap.special || 'SPECIAL';
    }
  }

  private profileDurationToSeconds(profileDuration: number | undefined, fallbackSeconds: number, scale = 1): number {
    if (!Number.isFinite(profileDuration)) return fallbackSeconds * scale;
    return Math.max(0.2, (Number(profileDuration) / 30) * scale);
  }

  private comboResetWindowToSeconds(frames: number | undefined): number {
    if (!Number.isFinite(frames)) return COMBO_CHAIN_RESET;
    return Math.max(0.2, Number(frames) / 60);
  }

  private buildBufferedAttack(
    fighter: RuntimeFighter,
    rawType: BufferedAttack['rawType'],
  ): BufferedAttack {
    const routeType: ComboActionType =
      rawType === 'light' ? 'light' :
      rawType === 'heavy' ? 'heavy' :
      'special';
    const direction = routeType === 'special'
      ? this.resolveSpecialDirectionFromInput(fighter, rawType as 'special' | 'special1' | 'special2' | 'special3' | 'special4')
      : this.resolveBufferedDirection(fighter, routeType);
    return { rawType, routeType, direction };
  }

  private canConsumeBufferedAttack(fighter: RuntimeFighter): boolean {
    if (!fighter.attackVariant) return false;
    const cancelStart = Math.max(
      fighter.attackActiveAt,
      fighter.attackDuration * (1 - fighter.comboConfig.settings.comboCancelRatio),
    );
    return fighter.attackTimer >= cancelStart;
  }

  private tryConsumeBufferedAttack(fighter: RuntimeFighter, opponent: RuntimeFighter | null): boolean {
    const buffered = fighter.bufferedAttack;
    if (!buffered) return false;

    const nextNodeId = this.resolveNextComboNodeId(fighter, buffered.routeType, buffered.direction);
    const selection = this.resolveAttackSelection(fighter, buffered.rawType, nextNodeId);
    const config = ATTACK_CONFIG[selection.variantKey];
    if (fighter.chakra < config.chakra || fighter.stamina < config.stamina) return false;

    fighter.bufferedAttack = null;
    fighter.chakra -= config.chakra;
    fighter.stamina -= config.stamina;
    fighter.attackCooldown = config.recoveryAt;
    fighter.attackVariant = selection.variantKey;
    fighter.attackTimer = 0;
    fighter.attackDuration = selection.duration;
    fighter.attackActiveAt = selection.activeAt;
    fighter.attackRecoveryAt = selection.recoveryAt;
    fighter.attackHasHit = false;
    fighter.currentAttackProfile = selection.profile;
    fighter.currentComboNodeId = selection.nodeId;
    fighter.lastAttackConnected = false;
    fighter.animationState = selection.animationState;
    fighter.stateText = selection.label;
    fighter.comboChainTimer = this.comboResetWindowToSeconds(fighter.comboConfig.settings.comboHitResetFrames);
    void opponent;
    return true;
  }

  private applyNodePatchProfile(
    comboConfig: RuntimeComboConfig,
    nodeId: string | null,
    baseProfile: ComboChainProfile | undefined,
  ): ComboChainProfile | null {
    if (!baseProfile && !nodeId) return null;
    const patchProfile = (nodeId && comboConfig.nodePatches[nodeId]?.profileOverrides) || {};
    return {
      ...(baseProfile || {}),
      ...patchProfile,
    };
  }

  private parseComboNodeId(nodeId: string | null): { group: 'L' | 'H' | 'S'; direction: string; step: number } | null {
    if (!nodeId) return null;
    const match = /^([LHS])_([A-Z])_(\d+)$/.exec(nodeId);
    if (!match) return null;
    return {
      group: match[1] as 'L' | 'H' | 'S',
      direction: match[2],
      step: Number(match[3]) || 1,
    };
  }

  private makeComboNodeId(group: 'L' | 'H' | 'S', directionCode: string, step: number): string {
    return `${group}_${directionCode}_${step}`;
  }

  private getHurtbox(fighter: RuntimeFighter): Rect {
    if (fighter.animationState === 'CROUCH' || fighter.animationState === 'BLOCK') {
      return {
        x: fighter.x - 30,
        y: fighter.y - 96,
        width: 60,
        height: 96,
      };
    }
    if (fighter.animationState === 'JUMP') {
      return {
        x: fighter.x - 24,
        y: fighter.y - 118,
        width: 48,
        height: 118,
      };
    }
    return {
      x: fighter.x - 28,
      y: fighter.y - 132,
      width: 56,
      height: 132,
    };
  }

  private getAttackHitbox(
    attacker: RuntimeFighter,
    config: (typeof ATTACK_CONFIG)[keyof typeof ATTACK_CONFIG],
    profile: ComboChainProfile | null,
  ): Rect {
    const range = config.range * (profile?.rangeMultiplier || 1);
    const state = attacker.animationState;
    const width =
      state.startsWith('ATTACK_HEAVY') ? Math.max(54, Math.min(172, range * 1.05)) :
      state === 'SPECIAL' ? Math.max(62, Math.min(188, range * 1.08)) :
      Math.max(36, Math.min(160, range));
    const height =
      state === 'SPECIAL' ? 108 :
      state.startsWith('ATTACK_HEAVY') ? 98 :
      92;
    const yOffset =
      state === 'JUMP' ? 124 :
      state === 'CROUCH' ? 78 :
      110;
    const facing = attacker.facingRight ? 1 : -1;
    return {
      x: attacker.x + (facing > 0 ? 18 : -18 - width),
      y: attacker.y - yOffset,
      width,
      height,
    };
  }

  private getProjectileRect(projectile: RuntimeProjectile): Rect {
    return {
      x: projectile.x - projectile.width / 2,
      y: projectile.y - projectile.height / 2,
      width: projectile.width,
      height: projectile.height,
    };
  }

  private rectsOverlap(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private spawnImpactEffect(x: number, y: number, kind: 'hit' | 'block'): void {
    const maxTtl = kind === 'hit' ? 0.18 : 0.14;
    this.effects.push({
      id: `${kind}-${performance.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind,
      x,
      y,
      ttl: maxTtl,
      maxTtl,
    });
  }

  private updateEffects(dt: number): void {
    this.effects = this.effects
      .map((effect) => ({ ...effect, ttl: effect.ttl - dt }))
      .filter((effect) => effect.ttl > 0);
  }

  private normalizeProjectileConfig(rawProjectile: any): RuntimeProjectileConfig | null {
    if (!rawProjectile || typeof rawProjectile !== 'object') return null;
    const imagePath = typeof rawProjectile.imagePath === 'string' && rawProjectile.imagePath.trim()
      ? rawProjectile.imagePath.trim()
      : DEFAULT_PROJECTILE_CONFIG.imagePath;
    const speed = Number.isFinite(rawProjectile.speed) ? Number(rawProjectile.speed) * 42 : DEFAULT_PROJECTILE_CONFIG.speed;
    const width = Number.isFinite(rawProjectile.width) ? Number(rawProjectile.width) : DEFAULT_PROJECTILE_CONFIG.width;
    const height = Number.isFinite(rawProjectile.height) ? Number(rawProjectile.height) : DEFAULT_PROJECTILE_CONFIG.height;
    const life = Number.isFinite(rawProjectile.life) ? Number(rawProjectile.life) : DEFAULT_PROJECTILE_CONFIG.life;
    const spinSpeed = Number.isFinite(rawProjectile.spinSpeed) ? Number(rawProjectile.spinSpeed) : DEFAULT_PROJECTILE_CONFIG.spinSpeed;
    return { imagePath, speed, width, height, life, spinSpeed };
  }

  private normalizeProjectileByState(rawByState: any): Record<string, RuntimeProjectileConfig> {
    if (!rawByState || typeof rawByState !== 'object') return {};
    return Object.entries(rawByState).reduce<Record<string, RuntimeProjectileConfig>>((acc, [state, config]) => {
      const normalized = this.normalizeProjectileConfig(config);
      if (normalized) acc[String(state).toUpperCase()] = normalized;
      return acc;
    }, {});
  }

  private normalizeStateFrameCounts(rawMapping: any): Record<string, number> {
    const result: Record<string, number> = {};
    const sources = [rawMapping?.stateMap, rawMapping?.categories];
    sources.forEach((source) => {
      if (!source || typeof source !== 'object') return;
      Object.entries(source).forEach(([state, frames]) => {
        if (!Array.isArray(frames)) return;
        const normalizedState = String(state).trim().toUpperCase();
        if (!normalizedState) return;
        result[normalizedState] = Math.max(
          result[normalizedState] || 0,
          frames.filter((frame) => typeof frame === 'string' && frame.trim()).length,
        );
      });
    });
    return result;
  }

  private normalizeAnimationTimings(rawMapping: any): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    const sources = [
      rawMapping?.animationTimings,
      rawMapping?.frameDurations,
      rawMapping?.timingMap,
    ];
    sources.forEach((source) => {
      if (!source || typeof source !== 'object') return;
      Object.entries(source).forEach(([state, values]) => {
        if (!Array.isArray(values)) return;
        const normalizedState = String(state).trim().toUpperCase();
        if (!normalizedState) return;
        const normalizedValues = values
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value > 0)
          .map((value) => Math.max(1, value));
        if (!normalizedValues.length) return;
        result[normalizedState] = normalizedValues;
      });
    });
    return result;
  }

  private getAnimationDurationSeconds(
    comboConfig: RuntimeComboConfig,
    animationState: string,
  ): number | null {
    const normalizedState = String(animationState || '').trim().toUpperCase();
    if (!normalizedState) return null;
    const timingValues = comboConfig.animationTimings[normalizedState];
    if (timingValues?.length) {
      const totalFrames = timingValues.reduce((sum, value) => sum + Math.max(1, Number(value) || 1), 0);
      return Math.max(0.2, totalFrames / 60);
    }
    const frameCount = comboConfig.stateFrameCounts[normalizedState];
    if (Number.isFinite(frameCount) && frameCount > 0) {
      return Math.max(0.2, frameCount / 16);
    }
    return null;
  }

  private resolveAttackTimings(
    comboConfig: RuntimeComboConfig,
    animationState: string,
    variantKey: keyof typeof ATTACK_CONFIG,
    profile: ComboChainProfile | null,
  ): ResolvedAttackTimings {
    const baseConfig = ATTACK_CONFIG[variantKey];
    const scaledDuration = this.profileDurationToSeconds(
      profile?.duration,
      baseConfig.duration,
      comboConfig.settings.attackDurationScale,
    );
    const animationDuration = this.getAnimationDurationSeconds(comboConfig, animationState);
    const duration = Math.max(scaledDuration, animationDuration || 0);

    const activeRatio = Math.max(
      0.08,
      Math.min(0.7, baseConfig.duration > 0 ? baseConfig.activeAt / baseConfig.duration : 0.25),
    );
    const recoveryRatio = Math.max(
      activeRatio + 0.08,
      Math.min(0.95, baseConfig.duration > 0 ? baseConfig.recoveryAt / baseConfig.duration : 0.6),
    );

    const activeAt = Math.max(0.05, Math.min(duration - 0.06, duration * activeRatio));
    const recoveryAt = Math.max(activeAt + 0.04, Math.min(duration - 0.02, duration * recoveryRatio));

    return { duration, activeAt, recoveryAt };
  }

  private resolveProjectileConfig(fighter: RuntimeFighter): RuntimeProjectileConfig {
    return fighter.comboConfig.projectileByState[fighter.animationState] || fighter.comboConfig.projectile || DEFAULT_PROJECTILE_CONFIG;
  }

  private bindInput(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private unbindInput(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
