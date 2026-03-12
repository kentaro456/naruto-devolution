import { Application, Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { StageSummary } from '../types/game-ui';

interface CharacterMapping {
  stateMap?: Record<string, string[]>;
  categories?: Record<string, string[]>;
  animationTimings?: Record<string, number[]>;
  frameDurations?: Record<string, number[]>;
  timingMap?: Record<string, number[]>;
}

interface SceneFighter {
  id: string;
  name: string;
  color: string;
  thumbnail?: string;
  x: number;
  y: number;
  facingRight: boolean;
  activeState: string;
  healthPercent: number;
  hitFlash: boolean;
  shake: number;
}

interface SceneProjectile {
  id: string;
  x: number;
  y: number;
  rotation: number;
  imagePath: string;
  width: number;
  height: number;
}

interface SceneEffect {
  id: string;
  kind: 'hit' | 'block';
  x: number;
  y: number;
  alpha: number;
  scale: number;
}

interface SceneMatch {
  stage: StageSummary | null;
  fighters: SceneFighter[];
  projectiles: SceneProjectile[];
  effects: SceneEffect[];
}

interface FighterAnimState {
  currentAnim: string;
  currentFrame: number;
  lastFrameAt: number;
  currentTexturePath: string;
  currentFrameDuration: number;
}

interface FighterNodeParts {
  node: Container;
  body: Graphics;
  portrait: Sprite;
  shadow: Graphics;
  label: Text;
  state: Text;
}

interface FighterVisualTuning {
  targetHeight: number;
  maxWidth: number;
  yOffset: number;
  fallbackScale: number;
}

const DEFAULT_VISUAL_TUNING: FighterVisualTuning = {
  targetHeight: 188,
  maxWidth: 168,
  yOffset: -6,
  fallbackScale: 0.34,
};

const FIGHTER_VISUAL_TUNING: Record<string, FighterVisualTuning> = {
  naruto: { targetHeight: 186, maxWidth: 166, yOffset: -6, fallbackScale: 0.36 },
  sasuke: { targetHeight: 186, maxWidth: 166, yOffset: -6, fallbackScale: 0.35 },
  kakashi: { targetHeight: 192, maxWidth: 172, yOffset: -8, fallbackScale: 0.35 },
  lee: { targetHeight: 194, maxWidth: 174, yOffset: -6, fallbackScale: 0.35 },
  itachi: { targetHeight: 192, maxWidth: 170, yOffset: -8, fallbackScale: 0.35 },
  minato: { targetHeight: 194, maxWidth: 174, yOffset: -8, fallbackScale: 0.35 },
  madara: { targetHeight: 208, maxWidth: 188, yOffset: -10, fallbackScale: 0.34 },
};

export class PixiScene {
  private app: Application | null = null;
  private root = new Container();
  private background = new Graphics();
  private backgroundSprite = new Sprite();
  private floor = new Graphics();
  private projectileLayer = new Container();
  private effectLayer = new Container();
  private fighterLayer = new Container();
  private fighterNodes = new Map<string, FighterNodeParts>();
  private fighterAnimState = new Map<string, FighterAnimState>();
  private mappingCache = new Map<string, Promise<CharacterMapping | null>>();
  private textureCache = new Map<string, Promise<Texture | null>>();
  private pathExistsCache = new Map<string, Promise<boolean>>();
  private currentBackgroundImage = '';

  async attach(canvas: HTMLCanvasElement): Promise<void> {
    if (this.app) return;
    this.app = new Application();
    await this.app.init({
      canvas,
      resizeTo: canvas.parentElement ?? window,
      antialias: true,
      backgroundAlpha: 0,
    });
    this.backgroundSprite.alpha = 0.88;
    this.app.stage.addChild(this.root);
    this.root.addChild(this.background, this.backgroundSprite, this.floor, this.projectileLayer, this.effectLayer, this.fighterLayer);
  }

  render(match: SceneMatch | null): void {
    if (!this.app) return;
    const width = this.app.screen.width;
    const height = this.app.screen.height;

    this.background.clear();
    this.floor.clear();

    if (!match) {
      this.currentBackgroundImage = '';
      this.backgroundSprite.texture = Texture.EMPTY;
      this.background.rect(0, 0, width, height).fill({ color: 0x020617, alpha: 1 });
      this.floor.rect(0, height * 0.78, width, height * 0.22).fill({ color: 0x111827, alpha: 0.95 });
      this.syncFighters([]);
      this.syncProjectiles([]);
      this.syncEffects([]);
      return;
    }

    const stageColor = parseHexColor(match.stage?.skyTop || '#1f2937', 0x1f2937);
    const groundColor = parseHexColor(match.stage?.groundColor || '#111827', 0x111827);
    this.background.rect(0, 0, width, height).fill({ color: stageColor, alpha: 1 });
    this.background.rect(0, 0, width, height * 0.48).fill({ color: 0xffffff, alpha: 0.05 });
    this.syncBackground(match.stage?.backgroundImage || null, width, height);
    this.floor.rect(0, height * 0.76, width, height * 0.24).fill({ color: groundColor, alpha: 0.96 });
    this.floor.rect(0, height * 0.76 - 4, width, 4).fill({ color: 0xffffff, alpha: 0.08 });

    this.syncFighters(match.fighters);
    this.syncProjectiles(match.projectiles);
    this.syncEffects(match.effects);
  }

  destroy(): void {
    if (!this.app) return;
    this.app.destroy(true, { children: true });
    this.app = null;
    this.fighterNodes.clear();
  }

  private syncFighters(fighters: SceneFighter[]): void {
    const liveIds = new Set(fighters.map((fighter) => fighter.id));

    for (const [id, parts] of this.fighterNodes.entries()) {
      if (liveIds.has(id)) continue;
      this.fighterLayer.removeChild(parts.node);
      parts.node.destroy({ children: true });
      this.fighterNodes.delete(id);
      this.fighterAnimState.delete(id);
    }

    fighters.forEach((fighter) => {
      let parts = this.fighterNodes.get(fighter.id);
      if (!parts) {
        parts = this.createFighterNode(fighter);
        this.fighterNodes.set(fighter.id, parts);
        this.fighterLayer.addChild(parts.node);
      }
      this.updateFighterNode(parts, fighter);
    });
  }

  private syncProjectiles(projectiles: SceneProjectile[]): void {
    this.projectileLayer.removeChildren().forEach((child) => child.destroy({ children: true }));

    projectiles.forEach((projectile) => {
      const node = new Container();
      node.x = projectile.x;
      node.y = projectile.y;
      node.rotation = projectile.rotation;

      const fallback = new Graphics();
      fallback.moveTo(14, 0);
      fallback.lineTo(0, 4);
      fallback.lineTo(-14, 0);
      fallback.lineTo(0, -4);
      fallback.closePath().fill({ color: 0xd1d5db, alpha: 0.95 });
      fallback.stroke({ color: 0x111827, width: 2, alpha: 0.9 });
      node.addChild(fallback);

      const sprite = new Sprite();
      sprite.anchor.set(0.5);
      sprite.alpha = 0;
      node.addChild(sprite);
      this.projectileLayer.addChild(node);

      this.loadTexture(projectile.imagePath).then((texture) => {
        if (!texture || !node.parent) return;
        sprite.texture = texture;
        const scaleX = projectile.width > 0 ? projectile.width / Math.max(1, texture.width) : 0.55;
        const scaleY = projectile.height > 0 ? projectile.height / Math.max(1, texture.height) : scaleX;
        sprite.scale.set(scaleX, scaleY);
        sprite.alpha = 1;
        fallback.alpha = 0;
      });
    });
  }

  private syncEffects(effects: SceneEffect[]): void {
    this.effectLayer.removeChildren().forEach((child) => child.destroy({ children: true }));

    effects.forEach((effect) => {
      const burst = new Graphics();
      const color = effect.kind === 'block' ? 0x93c5fd : 0xfbbf24;
      const radius = effect.kind === 'block' ? 18 : 24;
      burst.x = effect.x;
      burst.y = effect.y;
      burst.alpha = effect.alpha;
      burst.scale.set(effect.scale);

      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI * 2 * i) / 6;
        const inner = radius * 0.35;
        const outer = radius;
        burst.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        burst.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      }
      burst.stroke({ color, width: effect.kind === 'block' ? 3 : 4, alpha: effect.alpha });
      burst.circle(0, 0, effect.kind === 'block' ? 10 : 7).fill({ color, alpha: effect.kind === 'block' ? 0.18 : 0.28 });
      this.effectLayer.addChild(burst);
    });
  }

  private createFighterNode(fighter: SceneFighter): FighterNodeParts {
    const node = new Container();
    const body = new Graphics();
    node.addChild(body);

    const portrait = new Sprite();
    portrait.anchor.set(0.5, 1);
    node.addChild(portrait);

    const shadow = new Graphics();
    node.addChildAt(shadow, 0);

    const label = new Text({
      text: fighter.name,
      style: {
        fill: 0xffffff,
        fontSize: 14,
        fontFamily: 'Outfit, sans-serif',
        fontWeight: '700',
      },
    });
    label.anchor.set(0.5, 1);
    node.addChild(label);

    const state = new Text({
      text: fighter.activeState,
      style: {
        fill: 0xfbbf24,
        fontSize: 11,
        fontFamily: 'Outfit, sans-serif',
        fontWeight: '600',
      },
    });
    state.anchor.set(0.5, 0);
    node.addChild(state);

    return { node, body, portrait, shadow, label, state };
  }

  private updateFighterNode(parts: FighterNodeParts, fighter: SceneFighter): void {
    const { node, portrait, body, shadow, label, state } = parts;
    const baseColor = parseHexColor(fighter.color, 0xf97316);
    const tuning = FIGHTER_VISUAL_TUNING[fighter.id] || DEFAULT_VISUAL_TUNING;
    const shakeOffset = fighter.shake > 0 ? Math.sin(performance.now() * 0.09) * 6 * Math.min(1, fighter.shake / 0.16) : 0;

    shadow.clear();
    shadow.ellipse(0, 0, 46, 12).fill({ color: 0x000000, alpha: 0.28 });
    shadow.y = 0;

    body.clear();
    body.roundRect(-34, -120, 68, 120, 18).fill({ color: fighter.hitFlash ? 0xfca5a5 : baseColor, alpha: portrait.texture !== Texture.EMPTY ? 0.18 : 0.92 });
    body.roundRect(-24, -156, 48, 40, 16).fill({ color: fighter.hitFlash ? 0xffffff : 0xf8fafc, alpha: portrait.texture !== Texture.EMPTY ? 0.14 : 0.96 });

    const hpWidth = 80 * Math.max(0, Math.min(1, fighter.healthPercent));
    body.roundRect(-40, -176, 80, 8, 4).fill({ color: 0x0f172a, alpha: 0.9 });
    body.roundRect(-40, -176, hpWidth, 8, 4).fill({ color: 0x34d399, alpha: 1 });

    this.syncFighterSprite(fighter, portrait);
    portrait.y = tuning.yOffset;
    portrait.alpha = portrait.texture === Texture.EMPTY ? 0 : 0.98;
    portrait.tint = fighter.hitFlash ? 0xffd4d4 : 0xffffff;

    node.x = fighter.x + shakeOffset;
    node.y = fighter.y;
    node.scale.x = 1;

    const facingScale = fighter.facingRight ? 1 : -1;
    portrait.scale.x = Math.abs(portrait.scale.x || 1) * facingScale;
    body.scale.x = facingScale;
    shadow.scale.x = facingScale;

    label.text = fighter.name;
    label.y = -(tuning.targetHeight + 6);
    label.scale.x = 1;
    state.text = fighter.activeState;
    state.y = 10;
    state.scale.x = 1;
  }

  private syncBackground(path: string | null, width: number, height: number): void {
    const normalized = normalizeAssetPath(path);
    if (!normalized) {
      this.currentBackgroundImage = '';
      this.backgroundSprite.texture = Texture.EMPTY;
      return;
    }
    if (this.currentBackgroundImage !== normalized) {
      this.currentBackgroundImage = normalized;
      this.loadTexture(normalized).then((texture) => {
        if (!texture || this.currentBackgroundImage !== normalized) return;
        this.backgroundSprite.texture = texture;
        this.backgroundSprite.x = 0;
        this.backgroundSprite.y = 0;
        const textureWidth = texture.width || width;
        const textureHeight = texture.height || height;
        this.backgroundSprite.scale.set(width / textureWidth, height / textureHeight);
      });
    }
  }

  private syncFighterPortrait(sprite: Sprite, path: string | null): void {
    const normalized = normalizeAssetPath(path);
    if (!normalized) {
      sprite.texture = Texture.EMPTY;
      return;
    }
    this.loadTexture(normalized).then((texture) => {
      if (texture) {
        sprite.texture = texture;
      }
    });
  }

  private syncFighterSprite(fighter: SceneFighter, sprite: Sprite): void {
    const tuning = FIGHTER_VISUAL_TUNING[fighter.id] || DEFAULT_VISUAL_TUNING;
    const animState = this.fighterAnimState.get(fighter.id) || {
      currentAnim: '',
      currentFrame: 0,
      lastFrameAt: 0,
      currentTexturePath: '',
      currentFrameDuration: 95,
    };
    this.fighterAnimState.set(fighter.id, animState);

    const targetAnim = mapRuntimeStateToAnimation(fighter.activeState);
    const now = performance.now();

    this.loadMapping(fighter.id).then(async (mapping) => {
      const frames = resolveAnimationFrames(mapping, targetAnim);
      if (!frames.length) {
        const fallbackPath = normalizeAssetPath(fighter.thumbnail || null) || '';
        if (animState.currentTexturePath !== fallbackPath) {
          this.syncFighterPortrait(sprite, fighter.thumbnail || null);
          animState.currentTexturePath = fallbackPath;
        }
        sprite.scale.set(tuning.fallbackScale);
        return;
      }

      if (animState.currentAnim !== targetAnim) {
        animState.currentAnim = targetAnim;
        animState.currentFrame = 0;
        animState.lastFrameAt = now;
        animState.currentFrameDuration = resolveAnimationFrameDuration(mapping, targetAnim, 0);
      } else if (now - animState.lastFrameAt >= animState.currentFrameDuration) {
        animState.currentFrame = (animState.currentFrame + 1) % frames.length;
        animState.lastFrameAt = now;
        animState.currentFrameDuration = resolveAnimationFrameDuration(
          mapping,
          targetAnim,
          animState.currentFrame,
        );
      }

      const frameName = await this.findExistingFrame(fighter.id, frames, animState.currentFrame);
      if (!frameName) {
        const fallbackPath = normalizeAssetPath(fighter.thumbnail || null) || '';
        if (animState.currentTexturePath !== fallbackPath) {
          this.syncFighterPortrait(sprite, fighter.thumbnail || null);
          animState.currentTexturePath = fallbackPath;
        }
        sprite.scale.set(tuning.fallbackScale);
        return;
      }

      const framePath = `/assets/organized/characters/${fighter.id}/frames/${frameName}`;
      if (animState.currentTexturePath !== framePath) {
        this.syncFighterPortrait(sprite, framePath);
        animState.currentTexturePath = framePath;
      }
      const tex = sprite.texture;
      const heightScale = tex.height > 0 ? tuning.targetHeight / tex.height : 0.4;
      const widthScale = tex.width > 0 ? tuning.maxWidth / tex.width : heightScale;
      const scale = Math.min(0.98, heightScale, widthScale);
      sprite.scale.set(scale, scale);
    });
  }

  private loadMapping(characterId: string): Promise<CharacterMapping | null> {
    if (this.mappingCache.has(characterId)) {
      return this.mappingCache.get(characterId)!;
    }
    const promise = fetch(`/assets/organized/characters/${characterId}/mapping.json`, { cache: 'force-cache' })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);
    this.mappingCache.set(characterId, promise);
    return promise;
  }

  private loadTexture(path: string): Promise<Texture | null> {
    if (this.textureCache.has(path)) {
      return this.textureCache.get(path)!;
    }
    const promise = Assets.load(path)
      .then((asset) => (asset instanceof Texture ? asset : Texture.from(asset as string)))
      .catch(() => null);
    this.textureCache.set(path, promise);
    return promise;
  }

  private async findExistingFrame(characterId: string, frames: string[], startIndex: number): Promise<string | null> {
    for (let offset = 0; offset < frames.length; offset += 1) {
      const frameName = frames[(startIndex + offset) % frames.length];
      const framePath = `/assets/organized/characters/${characterId}/frames/${frameName}`;
      if (await this.pathExists(framePath)) {
        return frameName;
      }
    }
    return null;
  }

  private pathExists(path: string): Promise<boolean> {
    if (this.pathExistsCache.has(path)) {
      return this.pathExistsCache.get(path)!;
    }
    const promise = fetch(path, { method: 'HEAD', cache: 'force-cache' })
      .then((response) => response.ok)
      .catch(() => false);
    this.pathExistsCache.set(path, promise);
    return promise;
  }
}

function parseHexColor(value: string, fallback: number): number {
  const normalized = value.trim();
  if (!normalized.startsWith('#')) return fallback;
  const parsed = Number.parseInt(normalized.slice(1), 16);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeAssetPath(path: string | null): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function mapRuntimeStateToAnimation(state: string): string {
  if (!state) return 'IDLE';
  if (
    state === 'IDLE' ||
    state === 'WALK' ||
    state === 'RUN' ||
    state === 'JUMP' ||
    state === 'CROUCH' ||
    state === 'BLOCK' ||
    state === 'DASH' ||
    state === 'TELEPORT' ||
    state === 'THROW' ||
    state === 'SPECIAL' ||
    state === 'SPECIAL_TRANSFORM' ||
    state === 'HIT' ||
    state === 'KO' ||
    state.startsWith('ATTACK_')
  ) {
    return state;
  }

  switch (state) {
    case 'PRET':
    case 'OBSERVE':
      return 'IDLE';
    case 'MOUVEMENT':
      return 'WALK';
    case 'APPROCHE':
      return 'RUN';
    case 'SAUT':
      return 'JUMP';
    case 'ACCROUPI':
      return 'CROUCH';
    case 'GARDE':
      return 'BLOCK';
    case 'DASH':
      return 'DASH';
    case 'TELEPORT':
      return 'TELEPORT';
    case 'PROJECTILE':
      return 'THROW';
    case 'EVEIL':
      return 'SPECIAL_TRANSFORM';
    case 'LIGHT':
      return 'ATTACK_LIGHT_1';
    case 'HEAVY':
      return 'ATTACK_HEAVY_1';
    case 'SPECIAL':
    case 'TECH 1':
    case 'TECH 2':
    case 'TECH 3':
    case 'TECH 4':
      return 'SPECIAL';
    case 'TOUCHE':
    case 'IMPACT':
      return 'HIT';
    default:
      return 'IDLE';
  }
}

function resolveAnimationFrames(mapping: CharacterMapping | null, targetAnim: string): string[] {
  if (!mapping) return [];

  const sources: Array<Record<string, string[]> | undefined> = [mapping.stateMap, mapping.categories];
  const candidates = [
    targetAnim,
    targetAnim.toUpperCase(),
    targetAnim.toLowerCase(),
    targetAnim.replace(/_/g, '').toLowerCase(),
  ];

  if (targetAnim.startsWith('ATTACK_LIGHT_')) {
    candidates.push('ATTACK_LIGHT', 'attack_light');
  } else if (targetAnim.startsWith('ATTACK_HEAVY_')) {
    candidates.push('ATTACK_HEAVY', 'attack_heavy');
  }

  for (const source of sources) {
    if (!source) continue;
    for (const candidate of candidates) {
      if (source[candidate]?.length) {
        return source[candidate];
      }
    }
  }

  return mapping.stateMap?.IDLE || mapping.categories?.idle || [];
}

function resolveAnimationFrameDuration(
  mapping: CharacterMapping | null,
  targetAnim: string,
  frameIndex: number,
): number {
  if (!mapping) return 95;
  const timingMap = mapping.animationTimings || mapping.frameDurations || mapping.timingMap;
  if (!timingMap || typeof timingMap !== 'object') return 95;

  const candidates = [
    targetAnim,
    targetAnim.toUpperCase(),
    targetAnim.toLowerCase(),
    targetAnim.replace(/_/g, '').toLowerCase(),
  ];

  if (targetAnim.startsWith('ATTACK_LIGHT_')) {
    candidates.push('ATTACK_LIGHT', 'attack_light');
  } else if (targetAnim.startsWith('ATTACK_HEAVY_')) {
    candidates.push('ATTACK_HEAVY', 'attack_heavy');
  }

  for (const candidate of candidates) {
    const values = timingMap[candidate];
    if (!Array.isArray(values) || !values.length) continue;
    const numeric = values
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (!numeric.length) continue;
    const value = numeric[frameIndex % numeric.length] || numeric[0];
    return Math.max(50, (value / 60) * 1000);
  }

  return 95;
}
