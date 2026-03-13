import { Application, AnimatedSprite, BlurFilter, ColorMatrixFilter, Container, Graphics, Rectangle, Sprite, Text, Texture } from 'pixi.js';

type LegacySpriteKind = 'direct' | 'full' | 'atlas' | 'placeholder';

interface LegacySpriteInfo {
  kind: LegacySpriteKind;
  drawW: number;
  drawH: number;
  zoom?: number;
  frame?: { x: number; y: number; width?: number; height?: number };
  entry?: { image: CanvasImageSource };
}

interface LegacyPose {
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  alpha?: number;
  pixiEffects?: {
    kind?: 'kankuro' | 'jirobo' | 'neji';
    [key: string]: any;
  } | null;
}

interface DrawFighterPayload {
  fighter: {
    id?: string;
    charId?: string;
    name?: string;
    spriteSheet?: CanvasImageSource | null;
    animations?: Record<string, { frames?: number; row?: number; speed?: number }>;
    frameWidth?: number;
    frameHeight?: number;
    animFrame?: number;
    animationKey?: string;
    facingRight?: boolean;
    hitFlash?: number;
    state?: string;
    dashTimer?: number;
    stateTimer?: number;
    currentAttackType?: string | null;
    vx?: number;
    vy?: number;
    grounded?: boolean;
  };
  spriteInfo: LegacySpriteInfo;
  pose: LegacyPose | null;
  screenX: number;
  screenY: number;
}

interface DrawProjectilePayload {
  projectile: {
    id?: string;
    imagePath?: string;
    imageFrames?: string[];
    imageScale?: number;
    imageOffsetY?: number;
    owner?: {
      spriteSheet?: CanvasImageSource | null;
      frameWidth?: number;
      frameHeight?: number;
      displayScale?: number;
      animations?: Record<string, { frames?: number; row?: number; speed?: number }>;
    };
    spriteConfig?: {
      state?: string;
      scale?: number;
      offsetY?: number;
      alpha?: number;
      animateByLife?: boolean;
      flipOnReverse?: boolean;
    };
    life?: number;
    maxLife?: number;
    vx?: number;
    vy?: number;
    rotation?: number;
    rotateWithVelocity?: boolean;
    spin?: number;
    width?: number;
    height?: number;
  };
  screenX: number;
  screenY: number;
  zoom: number;
}

interface DrawBackgroundPayload {
  stage: {
    id?: string;
    backgroundImage?: string;
    skyTop?: string;
    skyBottom?: string;
    groundColor?: string;
    groundLineColor?: string;
    width?: number;
    bgAlignY?: 'top' | 'bottom';
    bgOffsetY?: number;
  };
  camera: {
    x?: number;
    zoom?: number;
    groundScreenY?: number;
  };
  gameWidth: number;
  gameHeight: number;
}

interface DrawParticlePayload {
  particle: {
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    radius?: number;
    alpha?: number;
    color?: string;
    life?: number;
    maxLife?: number;
    glow?: boolean;
    shape?: string;
    rotation?: number;
  };
  screenX: number;
  screenY: number;
  zoom: number;
}

interface DrawCombatTextPayload {
  id?: string;
  source?: object | null;
  text: string;
  subtext?: string;
  screenX: number;
  screenY: number;
  alpha?: number;
  size?: number;
  scale?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: 'popup' | 'combo' | 'special' | 'announcer';
  screenSpace?: boolean;
  zIndex?: number;
}

interface DrawRoundIndicatorsPayload {
  p1Wins: number;
  p2Wins: number;
  maxRounds: number;
  gameWidth: number;
}

interface DrawTrainingHudPayload {
  gameWidth: number;
  gameHeight: number;
  camera: {
    x?: number;
    y?: number;
  };
  fighter1?: any;
  fighter2?: any;
  projectiles?: any[];
  combo?: Record<string, any>;
  inputHistory?: { p1?: Array<{ keys?: string }>; p2?: Array<{ keys?: string }> };
  trainingConfig?: {
    showHitboxes?: boolean;
    showFrameData?: boolean;
    showInputHistory?: boolean;
    showDamageData?: boolean;
    infiniteHealth?: boolean;
  };
  aiEnabled?: boolean;
  aiDifficulty?: string;
}

interface DrawControlsOverlayPayload {
  gameWidth: number;
  lines: string[];
}

interface DrawFpsCounterPayload {
  gameWidth: number;
  fps: number;
}

interface DrawSlowMotionFramePayload {
  gameWidth: number;
  gameHeight: number;
}

interface DrawCinematicBarsPayload {
  gameWidth: number;
  gameHeight: number;
  height: number;
}

interface UpdateScenePayload {
  stage?: {
    id?: string;
  };
  camera?: {
    zoom?: number;
    shakeIntensity?: number;
    shakeFrames?: number;
    shakeMaxFrames?: number;
  };
  screenFlash?: {
    active?: boolean;
    color?: string;
    alpha?: number;
  };
  slowMotion?: {
    active?: boolean;
    scale?: number;
    timer?: number;
  };
}

interface StageVisualProfile {
  weather: 'clear' | 'rain' | 'sunset' | 'night';
  tintColor: number;
  tintAlpha: number;
  hazeColor: number;
  hazeAlpha: number;
  groundGlowColor: number;
  groundGlowAlpha: number;
  vignetteAlpha: number;
  decorColor: number;
  accentColor: number;
}

interface FighterNode {
  id: string;
  container: Container;
  shadow: Graphics;
  customUnderlay: Graphics;
  outlineSprite: Sprite;
  smearSprite: Sprite;
  animatedSprite: AnimatedSprite;
  sprite: Sprite;
  customOverlay: Graphics;
  auraSprite: Sprite; // Additive glow sprite
  afterimages: Sprite[];
  hitFilter: ColorMatrixFilter;
  blurFilter: BlurFilter;
  lastSeenFrame: number;
  lastHitFlash: number;
  lastState: string;
  lastAnimationKey: string;
}

interface ProjectileNode {
  id: string;
  container: Container;
  glowSprite: Sprite;
  sprite: Sprite;
  trailSprite: Sprite;
  fallback: Graphics;
  lastSeenFrame: number;
}

interface ParticleNode {
  id: string;
  container: Container;
  graphic: Graphics;
  coreSprite: Sprite;
  glowSprite: Sprite;
  lastSeenFrame: number;
}

interface CombatTextNode {
  id: string;
  container: Container;
  glowText: Text;
  mainText: Text;
  subText: Text;
  lastSeenFrame: number;
}

interface EffectNode {
  container: Container;
  life: number;
  maxLife: number;
  kind: 'hit' | 'block' | 'teleport' | 'landing' | 'special';
}

interface RainDrop {
  graphic: Graphics;
  x: number;
  y: number;
  length: number;
  speed: number;
  drift: number;
}

const FIGHTER_RENDER_SCALE_OVERRIDES: Record<string, number> = {};

export interface LegacyPixiCharactersApi {
  attach(canvas: HTMLCanvasElement): Promise<void>;
  destroy(): void;
  updateScene(payload: UpdateScenePayload): void;
  beginFrame(canvas: HTMLCanvasElement): void;
  drawBackground(payload: DrawBackgroundPayload): boolean;
  drawFighter(payload: DrawFighterPayload): boolean;
  drawProjectile(payload: DrawProjectilePayload): boolean;
  drawParticle(payload: DrawParticlePayload): boolean;
  drawCombatText(payload: DrawCombatTextPayload): boolean;
  drawRoundIndicators(payload: DrawRoundIndicatorsPayload): boolean;
  drawTrainingHud(payload: DrawTrainingHudPayload): boolean;
  drawControlsOverlay(payload: DrawControlsOverlayPayload): boolean;
  drawFpsCounter(payload: DrawFpsCounterPayload): boolean;
  drawSlowMotionFrame(payload: DrawSlowMotionFramePayload): boolean;
  drawCinematicBars(payload: DrawCinematicBarsPayload): boolean;
  endFrame(): void;
}

class LegacyPixiCharacters implements LegacyPixiCharactersApi {
  private app: Application | null = null;
  private underlayApp: Application | null = null;
  private hostCanvas: HTMLCanvasElement | null = null;
  private underlayCanvas: HTMLCanvasElement | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;
  private backgroundRoot = new Container();
  private sceneRoot = new Container();
  private backgroundLayer = new Container();
  private particleLayer = new Container();
  private combatLayer = new Container();
  private effectLayer = new Container();
  private weatherLayer = new Container();
  private textLayer = new Container();
  private screenFxLayer = new Container();
  private hudGraphics = new Graphics();
  private backgroundSprite = new Sprite();
  private backgroundTint = new Graphics();
  private groundGraphics = new Graphics();
  private floorGlow = new Graphics();
  private decorBackGraphics = new Graphics();
  private decorFrontGraphics = new Graphics();
  private flashOverlay = new Graphics();
  private vignetteOverlay = new Graphics();
  private fighterNodes = new Map<string, FighterNode>();
  private projectileNodes = new Map<string, ProjectileNode>();
  private particleNodes = new Map<string, ParticleNode>();
  private textNodes = new Map<string, CombatTextNode>();
  private effects: EffectNode[] = [];
  private frameCounter = 0;
  private backgroundSeenFrame = -1;
  private atlasTextureCache = new WeakMap<object, Map<string, Texture>>();
  private animationTextureCache = new WeakMap<object, Map<string, Texture[]>>();
  private particleIdCache = new WeakMap<object, string>();
  private particleIdCounter = 0;
  private textIdCache = new WeakMap<object, string>();
  private textIdCounter = 0;
  private colorGradeFilter = new ColorMatrixFilter();
  private sceneBlurFilter = new BlurFilter();
  private rainDrops: RainDrop[] = [];
  private weatherPreset: 'clear' | 'rain' | 'sunset' | 'night' = 'clear';
  private currentScenePayload: UpdateScenePayload = {};
  private activeStageId = '';
  private activeStageProfile: StageVisualProfile = this.getStageVisualProfile('');

  async attach(canvas: HTMLCanvasElement): Promise<void> {
    if (this.app && this.hostCanvas === canvas) {
      this.syncCanvasMetrics();
      return;
    }

    this.destroy();
    this.hostCanvas = canvas;
    const parent = canvas.parentElement;
    if (!parent) return;

    const computedStyle = window.getComputedStyle(parent);
    if (computedStyle.position === 'static') {
      parent.style.position = 'relative';
    }
    canvas.style.position = 'relative';
    canvas.style.zIndex = '1';

    const underlayCanvas = document.createElement('canvas');
    underlayCanvas.dataset.legacyPixiBackground = 'true';
    underlayCanvas.style.position = 'absolute';
    underlayCanvas.style.pointerEvents = 'none';
    underlayCanvas.style.zIndex = '0';
    underlayCanvas.style.background = 'transparent';
    underlayCanvas.style.imageRendering = 'pixelated';
    parent.insertBefore(underlayCanvas, canvas);
    this.underlayCanvas = underlayCanvas;

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.dataset.legacyPixiCharacters = 'true';
    overlayCanvas.style.position = 'absolute';
    overlayCanvas.style.pointerEvents = 'none';
    overlayCanvas.style.zIndex = '2';
    overlayCanvas.style.background = 'transparent';
    overlayCanvas.style.imageRendering = 'pixelated';
    parent.appendChild(overlayCanvas);
    this.overlayCanvas = overlayCanvas;

    const underlayApp = new Application();
    await underlayApp.init({
      canvas: underlayCanvas,
      width: Math.max(1, canvas.width || 800),
      height: Math.max(1, canvas.height || 450),
      antialias: false,
      backgroundAlpha: 0,
      autoDensity: false,
    });
    this.underlayApp = underlayApp;

    const app = new Application();
    await app.init({
      canvas: overlayCanvas,
      width: Math.max(1, canvas.width || 800),
      height: Math.max(1, canvas.height || 450),
      antialias: false,
      backgroundAlpha: 0,
      autoDensity: false,
    });

    this.app = app;
    this.backgroundRoot.sortableChildren = true;
    this.backgroundRoot.addChild(
      this.backgroundSprite,
      this.backgroundTint,
      this.decorBackGraphics,
      this.groundGraphics,
      this.floorGlow,
      this.decorFrontGraphics,
    );
    this.backgroundRoot.visible = false;
    underlayApp.stage.addChild(this.backgroundRoot);
    this.backgroundLayer.sortableChildren = true;
    this.particleLayer.sortableChildren = true;
    this.combatLayer.sortableChildren = true;
    this.effectLayer.sortableChildren = true;
    this.weatherLayer.sortableChildren = true;
    this.textLayer.sortableChildren = true;
    this.sceneRoot.sortableChildren = true;
    this.screenFxLayer.sortableChildren = true;
    app.stage.sortableChildren = true;
    app.stage.filters = [this.colorGradeFilter];
    this.sceneBlurFilter.strength = 0;
    this.sceneRoot.filters = [this.sceneBlurFilter];
    this.sceneRoot.addChild(
      this.backgroundLayer,
      this.effectLayer,
      this.particleLayer,
      this.combatLayer,
      this.weatherLayer,
    );
    this.textLayer.addChild(this.hudGraphics);
    this.screenFxLayer.addChild(this.flashOverlay, this.vignetteOverlay);
    app.stage.addChild(this.sceneRoot, this.textLayer, this.screenFxLayer);
    this.ensureRainDrops();
    this.applyWeatherPreset();
    this.syncCanvasMetrics();
  }

  destroy(): void {
    this.fighterNodes.forEach(({ container }) => container.destroy({ children: true }));
    this.fighterNodes.clear();
    this.projectileNodes.forEach(({ container }) => container.destroy({ children: true }));
    this.projectileNodes.clear();
    this.particleNodes.forEach(({ container }) => container.destroy({ children: true }));
    this.particleNodes.clear();
    this.textNodes.forEach(({ container }) => container.destroy({ children: true }));
    this.textNodes.clear();
    this.effects.forEach(({ container }) => container.destroy({ children: true }));
    this.effects = [];
    this.rainDrops.forEach(({ graphic }) => graphic.destroy());
    this.rainDrops = [];
    this.atlasTextureCache = new WeakMap();
    this.backgroundSeenFrame = -1;

    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }
    if (this.underlayApp) {
      this.underlayApp.destroy(true, { children: true });
      this.underlayApp = null;
    }

    if (this.underlayCanvas?.parentElement) {
      this.underlayCanvas.parentElement.removeChild(this.underlayCanvas);
    }

    if (this.overlayCanvas?.parentElement) {
      this.overlayCanvas.parentElement.removeChild(this.overlayCanvas);
    }

    this.underlayCanvas = null;
    this.overlayCanvas = null;
    this.hostCanvas = null;
  }

  updateScene(payload: UpdateScenePayload): void {
    this.currentScenePayload = payload || {};
  }

  beginFrame(canvas: HTMLCanvasElement): void {
    if (!this.app || this.hostCanvas !== canvas) return;
    this.frameCounter += 1;
    this.syncCanvasMetrics();
    this.hudGraphics.clear();
    this.updateEffects();
    this.updateWeather();
    this.updateSceneFx();
    this.backgroundRoot.visible = false;
  }

  drawBackground({ stage, camera, gameWidth, gameHeight }: DrawBackgroundPayload): boolean {
    if (!this.underlayApp || !stage) return false;
    if (!stage.backgroundImage) {
      this.backgroundRoot.visible = false;
      return false;
    }

    const texture = this.safeTextureFrom(stage.backgroundImage);
    if (!texture || !texture.width || !texture.height) {
      this.backgroundRoot.visible = false;
      return false;
    }
    this.activeStageId = String(stage.id || '');
    this.activeStageProfile = this.getStageVisualProfile(this.activeStageId);

    const baseScale = Math.max(gameWidth / texture.width, gameHeight / texture.height);
    const drawW = texture.width * baseScale;
    const drawH = texture.height * baseScale;
    const overflowX = Math.max(0, drawW - gameWidth);
    const stageWidth = Math.max(1, Number(stage.width) || gameWidth);
    const zoom = Math.max(0.001, Number(camera?.zoom) || 1);
    const maxCameraX = Math.max(0, stageWidth - gameWidth / zoom);
    const cameraRatio = maxCameraX > 0
      ? Math.min(1, Math.max(0, (Number(camera?.x) || 0) / maxCameraX))
      : 0;
    const dx = -overflowX * cameraRatio;

    let dy = (gameHeight - drawH) / 2;
    if (stage.bgAlignY === 'bottom') {
      dy = gameHeight - drawH;
    } else if (stage.bgAlignY === 'top') {
      dy = 0;
    }
    if (typeof stage.bgOffsetY === 'number') {
      dy += stage.bgOffsetY;
    }

    this.backgroundSprite.texture = texture;
    this.backgroundSprite.position.set(dx, dy);
    this.backgroundSprite.scale.set(baseScale);
    this.backgroundSprite.visible = true;

    this.backgroundTint.clear();
    this.backgroundTint.rect(0, 0, gameWidth, gameHeight).fill({
      color: this.activeStageProfile.tintColor,
      alpha: this.activeStageProfile.tintAlpha,
    });

    const groundScreenY = Number.isFinite(camera?.groundScreenY) ? Number(camera.groundScreenY) : gameHeight * 0.72;
    const groundColor = this.parseHexColor(stage.groundColor, 0x2a1a0a);
    const lineColor = this.parseHexColor(stage.groundLineColor, 0x4a3520);
    this.groundGraphics.clear();
    this.groundGraphics
      .rect(0, groundScreenY, gameWidth, Math.max(0, gameHeight - groundScreenY))
      .fill({ color: groundColor, alpha: 1 });
    this.groundGraphics
      .moveTo(0, groundScreenY)
      .lineTo(gameWidth, groundScreenY)
      .stroke({ color: lineColor, width: 2, alpha: 1 });
    this.syncStageDecor(gameWidth, gameHeight, groundScreenY, cameraRatio);

    this.backgroundRoot.visible = true;
    this.backgroundSeenFrame = this.frameCounter;
    return true;
  }

  drawFighter({ fighter, spriteInfo, pose, screenX, screenY }: DrawFighterPayload): boolean {
    if (!this.app || !this.hostCanvas || !this.overlayCanvas) return false;
    if (!fighter || spriteInfo.kind === 'placeholder') return false;

    const nodeId = String(fighter.id || fighter.charId || fighter.name || `fighter-${this.fighterNodes.size}`);
    const node = this.ensureFighterNode(nodeId);
    const animatedInfo = this.resolveAnimatedSpriteInfo(fighter, spriteInfo);
    const texture = animatedInfo?.currentTexture || this.resolveTexture(fighter, spriteInfo);
    if (!texture) return false;

    const zoom = Number.isFinite(spriteInfo.zoom) ? Number(spriteInfo.zoom) : 1;
    const poseScaleX = Number.isFinite(pose?.scaleX) ? Number(pose?.scaleX) : 1;
    const poseScaleY = Number.isFinite(pose?.scaleY) ? Number(pose?.scaleY) : 1;
    const poseRotation = Number.isFinite(pose?.rotation) ? Number(pose?.rotation) : 0;
    const poseAlpha = Number.isFinite(pose?.alpha) ? Number(pose?.alpha) : 1;
    const facing = fighter.facingRight === false ? -1 : 1;
    const poseOffsetX = (Number.isFinite(pose?.offsetX) ? Number(pose?.offsetX) : 0) * zoom * facing;
    const poseOffsetY = (Number.isFinite(pose?.offsetY) ? Number(pose?.offsetY) : 0) * zoom;
    const state = String(fighter.state || '');
    const isTeleport = state === 'TELEPORT' || state === 'SPECIAL_TELEPORT';
    const isDashLike = isTeleport || state === 'DASH';
    const isAttacking = state.startsWith('ATTACK_') || state === 'RUN_ATTACK' || state === 'CROUCH_ATTACK' || state === 'THROW' || state === 'CROUCH_THROW';
    const isSpecial = fighter.currentAttackType === 'special' || state === 'SPECIAL' || state === 'SPECIAL_TRANSFORM';
    const isPowerState = isSpecial || isTeleport || state === 'CHARGE';
    const pulse = 0.82 + Math.sin(this.frameCounter * 0.45) * 0.18;
    const fighterId = String(fighter.id || fighter.charId || fighter.name || '').toLowerCase();
    const renderScaleOverride = FIGHTER_RENDER_SCALE_OVERRIDES[fighterId] || 1;

    const isHit = (Number(fighter.hitFlash) || 0) > 0;

    // Filters setup
    node.hitFilter.alpha = isHit ? 1 : 0;
    if (isHit) {
      // Pure white flash
      node.hitFilter.matrix = [
        1, 1, 1, 1, 1,
        1, 1, 1, 1, 1,
        1, 1, 1, 1, 1,
        0, 0, 0, 1, 0,
      ];
    }

    const vx = Number(fighter.vx) || 0;
    const vy = Number(fighter.vy) || 0;

    // Motion Blur for dashes & teleports
    if (isDashLike) {
      const speed = Math.sqrt(vx * vx + vy * vy);
      node.blurFilter.strengthX = Math.abs(vx) * 0.5 + (isTeleport ? 8 : 4);
      node.blurFilter.strengthY = Math.abs(vy) * 0.5 + (isTeleport ? 4 : 0);
      node.blurFilter.quality = 4;
      node.sprite.filters = isHit ? [node.hitFilter, node.blurFilter] : [node.blurFilter];
      node.animatedSprite.filters = isHit ? [node.hitFilter, node.blurFilter] : [node.blurFilter];
    } else {
      node.blurFilter.strengthX = 0;
      node.blurFilter.strengthY = 0;
      node.sprite.filters = isHit ? [node.hitFilter] : [];
      node.animatedSprite.filters = isHit ? [node.hitFilter] : [];
    }

    // Aura effect for specials, transforms, and charging
    const isCharging = state === 'CHARGE';
    const hasAura = isSpecial || isCharging;
    
    // Squash & Stretch physics
    let squashY = 1;
    let squashX = 1;
    if (!fighter.grounded && !isDashLike && !isHit) {
      // Airborne stretch
      const stretchAmount = Math.min(0.15, Math.abs(vy) * 0.015);
      squashY = 1 + stretchAmount;
      squashX = 1 - stretchAmount * 0.5;
    } else if (fighter.grounded && state === 'IDLE' && node.lastState === 'JUMP') {
      // Landing squash
      squashY = 0.85;
      squashX = 1.15;
    } else if (state === 'CROUCH') {
      squashY = 0.8;
      squashX = 1.1;
    }

    const renderDisplay = animatedInfo?.animated ? node.animatedSprite : node.sprite;
    node.animatedSprite.visible = !!animatedInfo?.animated;
    node.sprite.visible = !animatedInfo?.animated;
    if (animatedInfo?.animated && animatedInfo.textures.length) {
      if (node.lastAnimationKey !== animatedInfo.animationCacheKey) {
        node.animatedSprite.textures = animatedInfo.textures;
        node.lastAnimationKey = animatedInfo.animationCacheKey;
      }
      node.animatedSprite.gotoAndStop(animatedInfo.frameIndex);
    } else {
      node.lastAnimationKey = '';
      node.sprite.texture = texture;
    }
    // Don't tint if HitFilter is handling it, but keep tint for special highlights
    renderDisplay.tint = isHit ? 0xffffff : (isSpecial ? 0xfff2bf : 0xffffff);
    renderDisplay.alpha = Math.max(0.2, poseAlpha * (isTeleport ? pulse : 1));

    const baseScaleX = spriteInfo.drawW / Math.max(1, texture.width || spriteInfo.drawW || 1);
    const baseScaleY = spriteInfo.drawH / Math.max(1, texture.height || spriteInfo.drawH || 1);
    const idleBob =
      fighter.grounded !== false &&
      !isDashLike &&
      !isPowerState &&
      !isAttacking &&
      (state === 'IDLE' || state === 'WALK')
        ? Math.sin(this.frameCounter * 0.08 + (screenX * 0.01)) * 1.4
        : 0;
    renderDisplay.scale.set(
      baseScaleX * renderScaleOverride * facing * poseScaleX * squashX,
      baseScaleY * renderScaleOverride * poseScaleY * squashY,
    );

    node.container.x = screenX + poseOffsetX;
    node.container.y = screenY + poseOffsetY + idleBob;
    node.container.rotation = poseRotation;
    node.container.zIndex = screenY;
    node.container.visible = true;
    node.lastSeenFrame = this.frameCounter;

    node.outlineSprite.texture = texture;
    node.outlineSprite.visible = isPowerState || isHit;
    node.outlineSprite.tint = isTeleport
      ? 0xc4b5fd
      : isCharging
        ? 0x60a5fa
        : isSpecial
          ? 0xfef08a
          : 0xffffff;
    node.outlineSprite.alpha = isHit
      ? 0.45
      : isTeleport
        ? 0.4 + pulse * 0.12
        : hasAura
          ? 0.24 + pulse * 0.08
          : 0;
    node.outlineSprite.scale.set(
      renderDisplay.scale.x * 1.09,
      renderDisplay.scale.y * 1.06,
    );

    node.auraSprite.texture = texture;
    node.auraSprite.visible = hasAura;
    node.auraSprite.alpha = isCharging ? 0.4 + Math.sin(this.frameCounter * 0.2) * 0.2 : 0.48 + pulse * 0.1;
    node.auraSprite.tint = this.resolveFighterAuraTint(fighter, isCharging, isSpecial, isTeleport);
    node.auraSprite.scale.set(
      renderDisplay.scale.x * 1.05,
      renderDisplay.scale.y * 1.05,
    );

    const attackSmearAlpha = isDashLike
      ? Math.min(0.36, 0.16 + Math.sqrt(vx * vx + vy * vy) * 0.016)
      : isSpecial
        ? 0.22 + pulse * 0.08
        : isAttacking
          ? 0.16
          : 0;
    node.smearSprite.texture = texture;
    node.smearSprite.visible = attackSmearAlpha > 0.02;
    node.smearSprite.alpha = attackSmearAlpha;
    node.smearSprite.tint = isTeleport
      ? 0xd8b4fe
      : isSpecial
        ? 0xfde68a
        : 0xbfe3ff;
    node.smearSprite.scale.set(
      renderDisplay.scale.x * (isDashLike ? 1.18 : 1.12),
      renderDisplay.scale.y * (isDashLike ? 0.96 : 1.02),
    );
    node.smearSprite.position.set(
      facing * (isDashLike ? -10 : -6),
      isSpecial ? -2 : 0,
    );

    this.syncAfterimages(
      node,
      texture,
      spriteInfo,
      facing,
      poseScaleX * squashX,
      poseScaleY * squashY,
      renderScaleOverride,
      isDashLike,
      pulse,
    );
    this.syncShadow(node, fighter, spriteInfo);
    this.syncLegacyPoseEffects(node, pose, fighter, zoom, facing);
    this.maybeSpawnFighterEffects(node, fighter, screenX, screenY, spriteInfo);
    return true;
  }

  drawProjectile({ projectile, screenX, screenY, zoom }: DrawProjectilePayload): boolean {
    if (!this.app || !projectile) return false;

    const nodeId = String(
      projectile.id ||
        `${projectile.imagePath || projectile.spriteConfig?.state || 'projectile'}:${Math.round(screenX)}:${Math.round(screenY)}`,
    );
    const node = this.ensureProjectileNode(nodeId);
    const textureInfo = this.resolveProjectileTexture(projectile);
    if (!textureInfo) return false;

    const { texture, width, height, alpha, flipX } = textureInfo;
    node.sprite.texture = texture;
    node.sprite.alpha = alpha;
    node.sprite.scale.set(
      (Math.max(1, width) / Math.max(1, texture.width || width)) * (flipX ? -1 : 1),
      Math.max(1, height) / Math.max(1, texture.height || height),
    );
    
    // Trail calculation
    const vx = Number(projectile.vx) || 0;
    const vy = Number(projectile.vy) || 0;
    const speed = Math.sqrt(vx * vx + vy * vy);
    
    const palette = this.getProjectilePalette(projectile);
    if (speed > 10) {
      node.trailSprite.texture = texture;
      node.trailSprite.visible = true;
      node.trailSprite.alpha = Math.min(0.5, 0.14 + speed * 0.028);
      node.trailSprite.scale.copyFrom(node.sprite.scale);
      node.trailSprite.scale.x *= 1.26;
      node.trailSprite.scale.y *= 1.06;
      node.trailSprite.tint = palette.trailTint;
      
      const angleOffsets = Math.atan2(vy, vx);
      node.trailSprite.rotation = angleOffsets - (projectile.rotation || 0);
      
      node.trailSprite.x = -vx * 0.5;
      node.trailSprite.y = -vy * 0.5;
    } else {
      node.trailSprite.visible = false;
    }

    node.glowSprite.texture = texture;
    node.glowSprite.visible = true;
    node.glowSprite.alpha = Math.min(0.36, 0.08 + speed * 0.018);
    node.glowSprite.tint = palette.glowTint;
    node.glowSprite.scale.set(node.sprite.scale.x * 1.16, node.sprite.scale.y * 1.1);

    node.container.x = screenX;
    node.container.y = screenY - (Number(projectile.imageOffsetY) || 0) * zoom;
    const rotatesWithVelocity = projectile.rotateWithVelocity !== false || Math.abs(Number(projectile.spin) || 0) > 0;
    const baseRotation = rotatesWithVelocity && speed > 0.01
      ? Math.atan2(vy, vx)
      : Number(projectile.rotation) || 0;
    node.container.rotation = baseRotation + (Number(projectile.spin) || 0) * this.frameCounter * 0.015;
    node.container.zIndex = screenY + 4;
    node.container.visible = true;
    node.lastSeenFrame = this.frameCounter;
    node.fallback.visible = false;
    return true;
  }

  drawParticle({ particle, screenX, screenY, zoom }: DrawParticlePayload): boolean {
    if (!this.app || !particle) return false;
    const alpha = Math.max(0, Math.min(1, Number(particle.alpha) || 0));
    const radius = Math.max(0, Number(particle.radius) || 0);
    if (alpha <= 0 || radius < 0.2) return false;

    const node = this.ensureParticleNode(this.resolveParticleId(particle));
    const tint = this.parseHexColor(particle.color, 0xffffff);
    const shape = String(particle.shape || 'circle').toLowerCase();
    const rotation = Number(particle.rotation) || Math.atan2(Number(particle.vy) || 0, Number(particle.vx) || 0);

    node.container.x = screenX;
    node.container.y = screenY;
    node.container.zIndex = screenY + 2;
    node.container.visible = true;
    node.lastSeenFrame = this.frameCounter;

    node.graphic.clear();
    node.graphic.rotation = 0;
    node.coreSprite.visible = false;
    node.glowSprite.visible = !!particle.glow;
    node.glowSprite.tint = tint;
    node.glowSprite.alpha = particle.glow ? Math.min(0.36, alpha * 0.45) : 0;
    node.glowSprite.position.set(0, 0);
    node.glowSprite.rotation = rotation;

    if (shape === 'spark') {
      node.coreSprite.visible = true;
      node.coreSprite.texture = Texture.WHITE;
      node.coreSprite.tint = tint;
      node.coreSprite.alpha = alpha;
      node.coreSprite.width = Math.max(2, radius * 5.2 * zoom);
      node.coreSprite.height = Math.max(1, radius * 0.9 * zoom);
      node.coreSprite.rotation = rotation;
      node.glowSprite.texture = Texture.WHITE;
      node.glowSprite.width = node.coreSprite.width * 1.28;
      node.glowSprite.height = node.coreSprite.height * 2.2;
    } else if (shape === 'square') {
      node.coreSprite.visible = true;
      node.coreSprite.texture = Texture.WHITE;
      node.coreSprite.tint = tint;
      node.coreSprite.alpha = alpha;
      node.coreSprite.width = radius * 2 * zoom;
      node.coreSprite.height = radius * 2 * zoom;
      node.coreSprite.rotation = rotation;
      node.glowSprite.texture = Texture.WHITE;
      node.glowSprite.width = node.coreSprite.width * 1.5;
      node.glowSprite.height = node.coreSprite.height * 1.5;
    } else if (shape === 'circle') {
      node.coreSprite.visible = true;
      node.coreSprite.texture = Texture.WHITE;
      node.coreSprite.tint = tint;
      node.coreSprite.alpha = alpha;
      node.coreSprite.width = radius * 2 * zoom;
      node.coreSprite.height = radius * 2 * zoom;
      node.coreSprite.rotation = 0;
      node.glowSprite.texture = Texture.WHITE;
      node.glowSprite.width = node.coreSprite.width * 1.8;
      node.glowSprite.height = node.coreSprite.height * 1.8;
    } else if (shape === 'ring') {
      node.graphic
        .circle(0, 0, Math.abs(radius) * zoom)
        .stroke({ color: tint, width: Math.max(0.5, 1.5 * alpha), alpha });
      node.glowSprite.visible = false;
    } else if (shape === 'triangle') {
      const r = radius * zoom;
      node.graphic
        .moveTo(0, -r)
        .lineTo(-r * 0.87, r * 0.5)
        .lineTo(r * 0.87, r * 0.5)
        .closePath()
        .fill({ color: tint, alpha });
      node.graphic.rotation = rotation;
      node.glowSprite.visible = false;
    } else if (shape === 'star') {
      this.drawPixiStar(node.graphic, radius * zoom, tint, alpha);
      node.graphic.rotation = rotation;
      node.glowSprite.visible = false;
    } else {
      node.graphic.circle(0, 0, radius * zoom).fill({ color: tint, alpha });
      node.glowSprite.visible = false;
    }

    return true;
  }

  drawCombatText({
    id,
    source,
    text,
    subtext,
    screenX,
    screenY,
    alpha = 1,
    size = 16,
    scale = 1,
    color = '#ffffff',
    align = 'center',
    style = 'popup',
    screenSpace = true,
    zIndex,
  }: DrawCombatTextPayload): boolean {
    if (!this.app || !text) return false;
    const resolvedAlpha = Math.max(0, Math.min(1, Number(alpha) || 0));
    if (resolvedAlpha <= 0.01) return false;

    const node = this.ensureCombatTextNode(this.resolveTextId(id, source, `${style}:${text}`));
    const anchorX = align === 'left' ? 0 : align === 'right' ? 1 : 0.5;
    const tint = this.parseHexColor(color, 0xffffff);
    const baseSize = Math.max(8, Number(size) || 16);
    const scaleValue = Math.max(0.2, Number(scale) || 1);
    const isAnnouncer = style === 'announcer';
    const isCombo = style === 'combo';
    const isSpecial = style === 'special';
    const fontFamily = isAnnouncer
      ? 'Impact, "Segoe UI", sans-serif'
      : isSpecial
        ? '"Press Start 2P", Impact, "Segoe UI", sans-serif'
        : '"Segoe UI", Arial, sans-serif';
    const fontWeight = isAnnouncer || isCombo ? '700' : '800';
    const strokeWidth = isAnnouncer ? 6 : isCombo ? 5 : isSpecial ? 4 : 3;
    const glowAlpha = isAnnouncer ? resolvedAlpha * 0.36 : resolvedAlpha * 0.18;
    const glowScale = isAnnouncer ? 1.14 : isCombo ? 1.08 : 1.04;

    node.container.x = screenX;
    node.container.y = screenY;
    node.container.visible = true;
    node.container.zIndex = Number.isFinite(zIndex)
      ? Number(zIndex)
      : screenSpace
        ? (isAnnouncer ? 12000 : 11000)
        : screenY + 8;
    node.lastSeenFrame = this.frameCounter;

    node.glowText.text = text;
    node.mainText.text = text;
    node.subText.text = subtext || '';
    node.subText.visible = !!subtext;

    node.glowText.anchor.set(anchorX, 0.5);
    node.mainText.anchor.set(anchorX, 0.5);
    node.subText.anchor.set(anchorX, 0.5);

    const mainStyle = {
      fill: tint,
      fontFamily,
      fontSize: Math.round(baseSize),
      fontWeight,
      align,
      stroke: { color: 0x000000, width: strokeWidth },
      letterSpacing: isAnnouncer ? 1.5 : isSpecial ? 1 : 0.4,
    };
    node.mainText.style = mainStyle as any;
    node.glowText.style = {
      fill: tint,
      fontFamily,
      fontSize: Math.round(baseSize),
      fontWeight,
      align,
      stroke: { color: tint, width: Math.max(1, strokeWidth - 1) },
      letterSpacing: mainStyle.letterSpacing,
    } as any;
    node.subText.style = {
      fill: isCombo ? 0xffcdd2 : 0xffffff,
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: Math.max(9, Math.round(baseSize * 0.58)),
      fontWeight: '700',
      align,
      stroke: { color: 0x000000, width: 2 },
      letterSpacing: 0.3,
    } as any;

    node.glowText.alpha = glowAlpha;
    node.mainText.alpha = resolvedAlpha;
    node.subText.alpha = resolvedAlpha * 0.88;

    node.glowText.scale.set(scaleValue * glowScale);
    node.mainText.scale.set(scaleValue);
    node.subText.scale.set(Math.max(0.8, scaleValue * 0.96));

    node.glowText.y = 0;
    node.mainText.y = 0;
    node.subText.y = Math.round(baseSize * 0.72);
    return true;
  }

  drawRoundIndicators({ p1Wins, p2Wins, maxRounds, gameWidth }: DrawRoundIndicatorsPayload): boolean {
    if (!this.app) return false;
    const winsNeeded = Math.ceil(Math.max(1, Number(maxRounds) || 1) / 2);
    for (let i = 0; i < winsNeeded; i += 1) {
      const p1x = gameWidth * 0.35 - i * 14;
      const p2x = gameWidth * 0.65 + i * 14;
      const y = 16;
      if (i < p1Wins) {
        this.hudGraphics.circle(p1x, y, 4).fill({ color: 0xffd700, alpha: 0.9 });
        this.hudGraphics.circle(p1x, y, 6.8).stroke({ color: 0xffd700, alpha: 0.34, width: 1.2 });
      } else {
        this.hudGraphics.circle(p1x, y, 4).stroke({ color: 0x555555, alpha: 0.92, width: 1.5 });
      }
      if (i < p2Wins) {
        this.hudGraphics.circle(p2x, y, 4).fill({ color: 0xffd700, alpha: 0.9 });
        this.hudGraphics.circle(p2x, y, 6.8).stroke({ color: 0xffd700, alpha: 0.34, width: 1.2 });
      } else {
        this.hudGraphics.circle(p2x, y, 4).stroke({ color: 0x555555, alpha: 0.92, width: 1.5 });
      }
    }
    return true;
  }

  drawTrainingHud({
    gameWidth,
    gameHeight,
    camera,
    fighter1,
    fighter2,
    combo = {},
    inputHistory = {},
    trainingConfig = {},
    aiEnabled = false,
    aiDifficulty = 'normal',
  }: DrawTrainingHudPayload): boolean {
    if (!this.app) return false;

    const cx = Number(camera?.x) || 0;
    const cy = Number(camera?.y) || 0;

    this.drawScreenRect(gameWidth / 2 - 55, 2, 110, 16, 0x1b5e20, 0.7);
    this.drawCombatText({
      id: 'training-banner',
      text: 'TRAINING MODE',
      screenX: gameWidth / 2,
      screenY: 13,
      alpha: 1,
      size: 10,
      scale: 1,
      color: '#76FF03',
      style: 'popup',
      align: 'center',
      screenSpace: true,
      zIndex: 11920,
    });

    const infoLines = [
      '[V] Training: ON',
      `[B] Hitboxes: ${trainingConfig.showHitboxes ? 'ON' : 'OFF'}`,
      `[N] Frame Data: ${trainingConfig.showFrameData ? 'ON' : 'OFF'}`,
      `[I] Input Hist: ${trainingConfig.showInputHistory ? 'ON' : 'OFF'}`,
      '[R] Reset Position',
      `[M] Inf HP: ${trainingConfig.infiniteHealth ? 'ON' : 'OFF'}`,
    ];
    if (aiEnabled) infoLines.push(`[F4] AI: ${String(aiDifficulty).toUpperCase()}`);
    infoLines.forEach((line, index) => {
      this.drawCombatText({
        id: `training-info:${index}`,
        text: line,
        screenX: 8,
        screenY: 30 + index * 11,
        alpha: 0.6,
        size: 8,
        scale: 1,
        color: '#B2FF59',
        style: 'popup',
        align: 'left',
        screenSpace: true,
        zIndex: 11910,
      });
    });

    const fighters = [fighter1, fighter2].filter(Boolean);
    if (trainingConfig.showHitboxes) {
      fighters.forEach((fighter) => {
        const fx = Number(fighter.x) - cx;
        const fy = Number(fighter.y) - cy;
        this.drawScreenRect(fx - fighter.width / 2, fy - fighter.height, fighter.width, fighter.height, 0x4caf50, 0.25, 0x4caf50, 0.6, 1);
        if (fighter.isAttacking && fighter.isAttacking()) {
          const atk = fighter.getCurrentAttack ? fighter.getCurrentAttack() : null;
          const range = atk?.range || 50;
          const dir = fighter.facingRight ? 1 : -1;
          const hx = fx + dir * range * 0.5;
          const hy = fy - fighter.height * 0.5;
          this.drawScreenRect(hx - range / 2, hy - 15, range, 30, 0xff1744, 0.3, 0xff1744, 0.7, 1.5);
        }
      });
    }

    if (trainingConfig.showFrameData) {
      fighters.forEach((fighter, idx) => {
        const fx = Number(fighter.x) - cx;
        const fy = Number(fighter.y) - cy - fighter.height - 35;
        const state = fighter.state || '?';
        const timer = fighter.stateTimer || 0;
        const grnd = fighter.grounded ? 'G' : 'A';
        const vx = typeof fighter.vx !== 'undefined' ? Number(fighter.vx).toFixed(1) : '?';
        const vy = typeof fighter.vy !== 'undefined' ? Number(fighter.vy).toFixed(1) : '?';
        this.drawCombatText({
          id: `training-frame:${idx}:state`,
          text: `${state} [${Math.round(timer)}f] ${grnd}`,
          screenX: fx,
          screenY: fy,
          alpha: 0.7,
          size: 8,
          scale: 1,
          color: '#FFFFFF',
          style: 'popup',
          align: 'center',
          screenSpace: true,
          zIndex: 11910,
        });
        this.drawCombatText({
          id: `training-frame:${idx}:vel`,
          text: `vx:${vx} vy:${vy}`,
          screenX: fx,
          screenY: fy + 10,
          alpha: 0.7,
          size: 8,
          scale: 1,
          color: '#FFFFFF',
          style: 'popup',
          align: 'center',
          screenSpace: true,
          zIndex: 11910,
        });
      });
    }

    if (trainingConfig.showInputHistory) {
      const startY = gameHeight - 10;
      const p1Hist = Array.isArray(inputHistory.p1) ? inputHistory.p1 : [];
      const p2Hist = Array.isArray(inputHistory.p2) ? inputHistory.p2 : [];
      const shownP1 = Math.min(p1Hist.length, 15);
      for (let i = 0; i < shownP1; i += 1) {
        const entry = p1Hist[p1Hist.length - 1 - i];
        this.drawCombatText({
          id: `training-input:p1:${i}`,
          text: entry?.keys || '',
          screenX: 8,
          screenY: startY - i * 10,
          alpha: 0.5,
          size: 8,
          scale: 1,
          color: '#FFFFFF',
          style: 'popup',
          align: 'left',
          screenSpace: true,
          zIndex: 11910,
        });
      }
      if (!aiEnabled) {
        const shownP2 = Math.min(p2Hist.length, 15);
        for (let i = 0; i < shownP2; i += 1) {
          const entry = p2Hist[p2Hist.length - 1 - i];
          this.drawCombatText({
            id: `training-input:p2:${i}`,
            text: entry?.keys || '',
            screenX: gameWidth - 8,
            screenY: startY - i * 10,
            alpha: 0.5,
            size: 8,
            scale: 1,
            color: '#FFFFFF',
            style: 'popup',
            align: 'right',
            screenSpace: true,
            zIndex: 11910,
          });
        }
      }
    }

    if (trainingConfig.showDamageData) {
      ['p1', 'p2'].forEach((key, idx) => {
        const data = combo[key];
        if (!data?.isActive || data.count < 1) return;
        const x = idx === 0 ? 140 : gameWidth - 8;
        const align = idx === 0 ? 'left' : 'right';
        this.drawCombatText({
          id: `training-dmg:${key}:combo`,
          text: `Combo: ${data.count} hits / ${data.damage} dmg`,
          screenX: x,
          screenY: gameHeight - 30,
          alpha: 0.6,
          size: 8,
          scale: 1,
          color: '#FF8A80',
          style: 'popup',
          align,
          screenSpace: true,
          zIndex: 11910,
        });
        this.drawCombatText({
          id: `training-dmg:${key}:scale`,
          text: `Scale: ${Number.isFinite(data.scalePercent) ? data.scalePercent : Math.round((1 / Math.max(1, data.count)) * 100)}%`,
          screenX: x,
          screenY: gameHeight - 20,
          alpha: 0.6,
          size: 8,
          scale: 1,
          color: '#FF8A80',
          style: 'popup',
          align,
          screenSpace: true,
          zIndex: 11910,
        });
      });
    }

    return true;
  }

  drawControlsOverlay({ gameWidth, lines }: DrawControlsOverlayPayload): boolean {
    if (!this.app || !Array.isArray(lines) || !lines.length) return false;

    const padX = 8;
    const padY = 6;
    const lineH = 11;
    const boxW = gameWidth - 16;
    const boxH = padY * 2 + lineH * lines.length;
    const boxY = 6;

    this.drawScreenRect(8, boxY, boxW, boxH, 0x061228, 0.62, 0x3fa9f5, 0.85, 1);

    lines.forEach((line, index) => {
      this.drawCombatText({
        id: `controls:${index}`,
        text: line,
        screenX: 8 + padX,
        screenY: boxY + padY + index * lineH + 4,
        alpha: 0.96,
        size: 8,
        scale: 1,
        color: index === lines.length - 1 ? '#9FD3FF' : '#E8F2FF',
        style: 'popup',
        align: 'left',
        screenSpace: true,
        zIndex: 11935,
      });
    });

    return true;
  }

  drawFpsCounter({ gameWidth, fps }: DrawFpsCounterPayload): boolean {
    if (!this.app) return false;

    const resolvedFps = Math.max(0, Math.round(Number(fps) || 0));
    const color = resolvedFps < 45
      ? '#FF5252'
      : resolvedFps < 55
        ? '#FF9800'
        : '#4CAF50';

    this.drawCombatText({
      id: 'training-fps',
      text: `${resolvedFps} FPS`,
      screenX: gameWidth - 10,
      screenY: 16,
      alpha: 0.6,
      size: 10,
      scale: 1,
      color,
      style: 'popup',
      align: 'right',
      screenSpace: true,
      zIndex: 11940,
    });

    return true;
  }

  drawSlowMotionFrame({ gameWidth, gameHeight }: DrawSlowMotionFramePayload): boolean {
    if (!this.app) return false;

    this.drawDashedScreenRect(2, 2, gameWidth - 4, gameHeight - 4, 0xffd700, 0.3, 2, 4, 4);
    return true;
  }

  drawCinematicBars({ gameWidth, gameHeight, height }: DrawCinematicBarsPayload): boolean {
    if (!this.app) return false;

    const resolvedHeight = Math.max(0, Number(height) || 0);
    if (resolvedHeight <= 0.5) return false;

    this.drawScreenRect(0, 0, gameWidth, resolvedHeight, 0x000000, 1);
    this.drawScreenRect(0, gameHeight - resolvedHeight, gameWidth, resolvedHeight, 0x000000, 1);
    return true;
  }

  endFrame(): void {
    if (!this.app) return;
    this.backgroundRoot.visible = this.backgroundSeenFrame === this.frameCounter;
    for (const node of this.fighterNodes.values()) {
      node.container.visible = node.lastSeenFrame === this.frameCounter;
      node.afterimages.forEach((afterimage) => {
        afterimage.visible = node.lastSeenFrame === this.frameCounter && afterimage.alpha > 0.01;
      });
    }
    for (const node of this.projectileNodes.values()) {
      node.container.visible = node.lastSeenFrame === this.frameCounter;
    }
    for (const node of this.particleNodes.values()) {
      node.container.visible = node.lastSeenFrame === this.frameCounter;
    }
    for (const node of this.textNodes.values()) {
      node.container.visible = node.lastSeenFrame === this.frameCounter;
    }
    this.particleLayer.sortChildren();
    this.combatLayer.sortChildren();
    this.textLayer.sortChildren();
  }

  private ensureFighterNode(id: string): FighterNode {
    let node = this.fighterNodes.get(id);
    if (node) return node;

    const container = new Container();
    const shadow = new Graphics();
    const customUnderlay = new Graphics();
    const outlineSprite = new Sprite();
    outlineSprite.anchor.set(0.5, 1);
    outlineSprite.visible = false;
    outlineSprite.blendMode = 'add';
    const smearSprite = new Sprite();
    smearSprite.anchor.set(0.5, 1);
    smearSprite.visible = false;
    smearSprite.blendMode = 'screen';
    const animatedSprite = new AnimatedSprite([Texture.WHITE]);
    animatedSprite.anchor.set(0.5, 1);
    animatedSprite.visible = false;
    animatedSprite.animationSpeed = 1;
    animatedSprite.gotoAndStop(0);
    const sprite = new Sprite();
    sprite.anchor.set(0.5, 1);
    const customOverlay = new Graphics();
    
    // Additive Aura Sprite
    const auraSprite = new Sprite();
    auraSprite.anchor.set(0.5, 1);
    auraSprite.blendMode = 'add';
    auraSprite.visible = false;
    
    // Filters
    const hitFilter = new ColorMatrixFilter();
    hitFilter.alpha = 0;
    const blurFilter = new BlurFilter();
    blurFilter.strength = 0;
    
    // Aura filter (glowish blur)
    const auraBlur = new BlurFilter();
    auraBlur.strength = 8;
    auraBlur.quality = 2;
    auraSprite.filters = [auraBlur];

    const afterimages = [new Sprite(), new Sprite(), new Sprite()];
    afterimages.forEach((afterimage) => {
      afterimage.anchor.set(0.5, 1);
      afterimage.visible = false;
      container.addChild(afterimage);
    });
    
    container.addChild(shadow);
    container.addChild(customUnderlay);
    container.addChild(outlineSprite);
    container.addChild(auraSprite);
    container.addChild(smearSprite);
    container.addChild(animatedSprite);
    container.addChild(sprite);
    container.addChild(customOverlay);
    this.combatLayer.addChild(container);

    node = {
      id,
      container,
      shadow,
      customUnderlay,
      outlineSprite,
      smearSprite,
      animatedSprite,
      sprite,
      customOverlay,
      auraSprite,
      afterimages,
      hitFilter,
      blurFilter,
      lastSeenFrame: -1,
      lastHitFlash: 0,
      lastState: '',
      lastAnimationKey: '',
    };
    this.fighterNodes.set(id, node);
    return node;
  }

  private ensureProjectileNode(id: string): ProjectileNode {
    let node = this.projectileNodes.get(id);
    if (node) return node;

    const container = new Container();
    const fallback = new Graphics();
    fallback
      .moveTo(16, 0)
      .lineTo(0, 4)
      .lineTo(-16, 0)
      .lineTo(0, -4)
      .closePath()
      .fill({ color: 0xd1d5db, alpha: 0.95 })
      .stroke({ color: 0x111827, width: 2, alpha: 0.9 });
    const sprite = new Sprite();
    sprite.anchor.set(0.5);
    const glowSprite = new Sprite();
    glowSprite.anchor.set(0.5);
    glowSprite.blendMode = 'add';
    glowSprite.visible = false;
    
    const trailSprite = new Sprite();
    trailSprite.anchor.set(0.5);
    trailSprite.blendMode = 'add';
    trailSprite.visible = false;
    trailSprite.tint = 0xa3e6ff; // Cyanic trail
    
    container.addChild(trailSprite);
    container.addChild(glowSprite);
    container.addChild(fallback, sprite);
    this.combatLayer.addChild(container);

    node = {
      id,
      container,
      glowSprite,
      sprite,
      trailSprite,
      fallback,
      lastSeenFrame: -1,
    };
    this.projectileNodes.set(id, node);
    return node;
  }

  private ensureParticleNode(id: string): ParticleNode {
    let node = this.particleNodes.get(id);
    if (node) return node;

    const container = new Container();
    const graphic = new Graphics();
    const glowSprite = new Sprite(Texture.WHITE);
    glowSprite.anchor.set(0.5);
    glowSprite.visible = false;
    glowSprite.blendMode = 'add';
    const coreSprite = new Sprite(Texture.WHITE);
    coreSprite.anchor.set(0.5);
    coreSprite.visible = false;
    container.addChild(glowSprite, graphic, coreSprite);
    this.particleLayer.addChild(container);

    node = {
      id,
      container,
      graphic,
      coreSprite,
      glowSprite,
      lastSeenFrame: -1,
    };
    this.particleNodes.set(id, node);
    return node;
  }

  private ensureCombatTextNode(id: string): CombatTextNode {
    let node = this.textNodes.get(id);
    if (node) return node;

    const container = new Container();
    const glowText = new Text({ text: '', style: { fill: 0xffffff } as any });
    const mainText = new Text({ text: '', style: { fill: 0xffffff } as any });
    const subText = new Text({ text: '', style: { fill: 0xffffff } as any });
    subText.visible = false;
    container.addChild(glowText, mainText, subText);
    this.textLayer.addChild(container);

    node = {
      id,
      container,
      glowText,
      mainText,
      subText,
      lastSeenFrame: -1,
    };
    this.textNodes.set(id, node);
    return node;
  }

  private resolveTexture(
    fighter: DrawFighterPayload['fighter'],
    spriteInfo: LegacySpriteInfo,
  ): Texture | null {
    if (spriteInfo.kind === 'direct') {
      return spriteInfo.entry?.image ? this.safeTextureFrom(spriteInfo.entry.image) : null;
    }

    const source = fighter.spriteSheet;
    if (!source) return null;

    if (spriteInfo.kind === 'full') {
      return this.safeTextureFrom(source);
    }

    if (spriteInfo.kind !== 'atlas' || !spriteInfo.frame) {
      return null;
    }

    const frameWidth = Number(spriteInfo.frame.width) || 0;
    const frameHeight = Number(spriteInfo.frame.height) || 0;
    if (frameWidth <= 0 || frameHeight <= 0) return null;

    const cacheKey = `${spriteInfo.frame.x}:${spriteInfo.frame.y}:${frameWidth}:${frameHeight}`;
    const sourceKey = source as object;
    let sourceCache = this.atlasTextureCache.get(sourceKey);
    if (!sourceCache) {
      sourceCache = new Map<string, Texture>();
      this.atlasTextureCache.set(sourceKey, sourceCache);
    }
    const cached = sourceCache.get(cacheKey);
    if (cached) return cached;

    const baseTexture = this.safeTextureFrom(source);
    if (!baseTexture) return null;
    const texture = new Texture({
      source: baseTexture.source,
      frame: new Rectangle(spriteInfo.frame.x, spriteInfo.frame.y, frameWidth, frameHeight),
    });
    sourceCache.set(cacheKey, texture);
    return texture;
  }

  private resolveAnimatedSpriteInfo(
    fighter: DrawFighterPayload['fighter'],
    spriteInfo: LegacySpriteInfo,
  ): { animated: true; textures: Texture[]; currentTexture: Texture; frameIndex: number; animationCacheKey: string } | null {
    if (spriteInfo.kind !== 'atlas') return null;
    const source = fighter.spriteSheet;
    const animations = fighter.animations;
    const animationKey = String(fighter.animationKey || fighter.state || '');
    const anim = animations?.[animationKey];
    const frameWidth = Number(fighter.frameWidth) || 0;
    const frameHeight = Number(fighter.frameHeight) || 0;
    const frameCount = Math.max(1, Number(anim?.frames) || 0);
    const row = Number(anim?.row);
    if (!source || !animations || !animationKey || !anim || frameWidth <= 0 || frameHeight <= 0 || !Number.isFinite(row) || frameCount <= 0) {
      return null;
    }

    const sourceKey = source as object;
    let sourceCache = this.animationTextureCache.get(sourceKey);
    if (!sourceCache) {
      sourceCache = new Map<string, Texture[]>();
      this.animationTextureCache.set(sourceKey, sourceCache);
    }
    const cacheKey = `${animationKey}:${row}:${frameWidth}:${frameHeight}:${frameCount}`;
    let textures = sourceCache.get(cacheKey);
    if (!textures) {
      const baseTexture = this.safeTextureFrom(source);
      if (!baseTexture) return null;
      textures = Array.from({ length: frameCount }, (_, idx) => new Texture({
        source: baseTexture.source,
        frame: new Rectangle(idx * frameWidth, row * frameHeight, frameWidth, frameHeight),
      }));
      sourceCache.set(cacheKey, textures);
    }

    const frameIndex = Math.max(0, Math.min(frameCount - 1, Number(fighter.animFrame) || 0));
    const currentTexture = textures[frameIndex];
    if (!currentTexture) return null;
    return {
      animated: true,
      textures,
      currentTexture,
      frameIndex,
      animationCacheKey: cacheKey,
    };
  }

  private resolveProjectileTexture(projectile: DrawProjectilePayload['projectile']): {
    texture: Texture;
    width: number;
    height: number;
    alpha: number;
    flipX: boolean;
  } | null {
    const zoomScale = 1;
    const flipX = (projectile.vx || 0) < 0;

    if (projectile.imagePath) {
      const texture = this.safeTextureFrom(projectile.imagePath);
      if (!texture) return null;
      const baseScale = Number(projectile.imageScale) || 1;
      return {
        texture,
        width: (texture.width || Number(projectile.width) || 32) * baseScale * zoomScale,
        height: (texture.height || Number(projectile.height) || 32) * baseScale * zoomScale,
        alpha: 1,
        flipX,
      };
    }

    if (Array.isArray(projectile.imageFrames) && projectile.imageFrames.length) {
      const maxLife = Math.max(1, Number(projectile.maxLife) || Number(projectile.life) || 1);
      const progress = 1 - Math.max(0, Math.min(1, (Number(projectile.life) || 0) / maxLife));
      const idx = Math.min(projectile.imageFrames.length - 1, Math.floor(progress * projectile.imageFrames.length));
      const texture = this.safeTextureFrom(projectile.imageFrames[idx]);
      if (!texture) return null;
      const baseScale = Number(projectile.imageScale) || 1;
      return {
        texture,
        width: (texture.width || Number(projectile.width) || 32) * baseScale * zoomScale,
        height: (texture.height || Number(projectile.height) || 32) * baseScale * zoomScale,
        alpha: 1,
        flipX,
      };
    }

    const ownerSheet = projectile.owner?.spriteSheet;
    const spriteConfig = projectile.spriteConfig;
    if (!ownerSheet || !spriteConfig?.state) return null;

    const anim = projectile.owner?.animations?.[spriteConfig.state];
    if (!anim) return null;
    const frameWidth = Number(projectile.owner?.frameWidth) || 0;
    const frameHeight = Number(projectile.owner?.frameHeight) || 0;
    if (frameWidth <= 0 || frameHeight <= 0) return null;

    const frameCount = Math.max(1, Number(anim.frames) || 1);
    const maxLife = Math.max(1, Number(projectile.maxLife) || Number(projectile.life) || 1);
    const progress = 1 - Math.max(0, Math.min(1, (Number(projectile.life) || 0) / maxLife));
    const elapsed = maxLife - (Number(projectile.life) || 0);
    const frameIdx = spriteConfig.animateByLife
      ? Math.min(frameCount - 1, Math.max(0, Math.floor(progress * frameCount)))
      : Math.floor(elapsed / Math.max(1, Number(anim.speed) || 8)) % frameCount;
    const key = `${frameIdx * frameWidth}:${(Number(anim.row) || 0) * frameHeight}:${frameWidth}:${frameHeight}`;
    const sourceKey = ownerSheet as object;
    let sourceCache = this.atlasTextureCache.get(sourceKey);
    if (!sourceCache) {
      sourceCache = new Map<string, Texture>();
      this.atlasTextureCache.set(sourceKey, sourceCache);
    }
    let texture = sourceCache.get(key);
    if (!texture) {
      const baseTexture = this.safeTextureFrom(ownerSheet);
      if (!baseTexture) return null;
      texture = new Texture({
        source: baseTexture.source,
        frame: new Rectangle(frameIdx * frameWidth, (Number(anim.row) || 0) * frameHeight, frameWidth, frameHeight),
      });
      sourceCache.set(key, texture);
    }
    const scale = (Number(projectile.owner?.displayScale) || 1) * (Number(spriteConfig.scale) || 1);
    return {
      texture,
      width: frameWidth * scale,
      height: frameHeight * scale,
      alpha: Number(spriteConfig.alpha) || 1,
      flipX: flipX && spriteConfig.flipOnReverse !== false,
    };
  }

  private safeTextureFrom(source: string | CanvasImageSource | null | undefined): Texture | null {
    if (!source) return null;
    try {
      const normalizedSource = typeof source === 'string'
        ? (
          source.startsWith('/') ||
          source.startsWith('http://') ||
          source.startsWith('https://') ||
          source.startsWith('blob:') ||
          source.startsWith('data:')
            ? source
            : `/${source.replace(/^\.?\//, '')}`
        )
        : source;
      const texture = Texture.from(normalizedSource as any);
      return texture || null;
    } catch (_error) {
      return null;
    }
  }

  private resolveParticleId(particle: DrawParticlePayload['particle']): string {
    const key = particle as object;
    const existing = this.particleIdCache.get(key);
    if (existing) return existing;
    const id = `particle-${this.particleIdCounter++}`;
    this.particleIdCache.set(key, id);
    return id;
  }

  private resolveTextId(id?: string, source?: object | null, fallback = 'text'): string {
    if (id) return id;
    if (source && typeof source === 'object') {
      const existing = this.textIdCache.get(source);
      if (existing) return existing;
      const nextId = `combat-text-${this.textIdCounter++}`;
      this.textIdCache.set(source, nextId);
      return nextId;
    }
    return `${fallback}-${this.textIdCounter++}`;
  }

  private getProjectilePalette(projectile: DrawProjectilePayload['projectile']): { trailTint: number; glowTint: number } {
    const hint = `${projectile.imagePath || ''} ${Array.isArray(projectile.imageFrames) ? projectile.imageFrames.join(' ') : ''}`.toLowerCase();
    if (hint.includes('water') || hint.includes('suikou') || hint.includes('same')) {
      return { trailTint: 0x7dd3fc, glowTint: 0x38bdf8 };
    }
    if (hint.includes('clay') || hint.includes('c1') || hint.includes('bird')) {
      return { trailTint: 0xfcd34d, glowTint: 0xf59e0b };
    }
    if (hint.includes('fire') || hint.includes('katon')) {
      return { trailTint: 0xfb923c, glowTint: 0xef4444 };
    }
    if (hint.includes('lightning') || hint.includes('raikiri') || hint.includes('chidori')) {
      return { trailTint: 0xbfdbfe, glowTint: 0x60a5fa };
    }
    return { trailTint: 0xa3e6ff, glowTint: 0x67e8f9 };
  }

  private resolveFighterAuraTint(
    fighter: DrawFighterPayload['fighter'],
    isCharging: boolean,
    isSpecial: boolean,
    isTeleport: boolean,
  ): number {
    if (isCharging) return 0x60a5fa;
    const key = String(fighter.charId || fighter.id || fighter.name || '').toLowerCase();
    if (isTeleport || key.includes('minato')) return 0xfef08a;
    if (key.includes('kakashi') || key.includes('sasuke')) return 0x93c5fd;
    if (key.includes('itachi')) return 0xfca5a5;
    if (key.includes('madara')) return 0xf472b6;
    if (key.includes('gaara')) return 0xfcd34d;
    if (key.includes('kisame')) return 0x67e8f9;
    if (key.includes('deidara')) return 0xfb923c;
    return isSpecial ? 0xfef08a : 0xffffff;
  }

  private drawPixiStar(graphic: Graphics, radius: number, color: number, alpha: number): void {
    let rot = Math.PI / 2 * 3;
    const spikes = 5;
    const innerRadius = radius * 0.5;
    const step = Math.PI / spikes;
    graphic.moveTo(0, -radius);
    for (let i = 0; i < spikes; i += 1) {
      graphic.lineTo(Math.cos(rot) * radius, Math.sin(rot) * radius);
      rot += step;
      graphic.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
      rot += step;
    }
    graphic.closePath().fill({ color, alpha });
  }

  private drawPolyline(
    graphic: Graphics,
    points: Array<{ x: number; y: number }>,
    color: number,
    alpha: number,
    width: number,
  ): void {
    if (!points.length) return;
    graphic.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      graphic.lineTo(points[i].x, points[i].y);
    }
    graphic.stroke({ color, alpha, width });
  }

  private drawQuadraticPolyline(
    graphic: Graphics,
    startX: number,
    startY: number,
    controlX: number,
    controlY: number,
    endX: number,
    endY: number,
    segments: number,
    color: number,
    alpha: number,
    width: number,
  ): void {
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const inv = 1 - t;
      points.push({
        x: inv * inv * startX + 2 * inv * t * controlX + t * t * endX,
        y: inv * inv * startY + 2 * inv * t * controlY + t * t * endY,
      });
    }
    this.drawPolyline(graphic, points, color, alpha, width);
  }

  private drawRotatedRect(
    graphic: Graphics,
    cx: number,
    cy: number,
    width: number,
    height: number,
    rotation: number,
    color: number,
    alpha: number,
  ): void {
    const hw = width * 0.5;
    const hh = height * 0.5;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const corners = [
      { x: -hw, y: -hh },
      { x: hw, y: -hh },
      { x: hw, y: hh },
      { x: -hw, y: hh },
    ].map((point) => ({
      x: cx + point.x * cos - point.y * sin,
      y: cy + point.x * sin + point.y * cos,
    }));
    graphic
      .moveTo(corners[0].x, corners[0].y)
      .lineTo(corners[1].x, corners[1].y)
      .lineTo(corners[2].x, corners[2].y)
      .lineTo(corners[3].x, corners[3].y)
      .closePath()
      .fill({ color, alpha });
  }

  private drawArcPolyline(
    graphic: Graphics,
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    segments: number,
    color: number,
    alpha: number,
    width: number,
  ): void {
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const angle = startAngle + (endAngle - startAngle) * t;
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
    this.drawPolyline(graphic, points, color, alpha, width);
  }

  private drawScreenRect(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
    fillAlpha: number,
    strokeColor?: number,
    strokeAlpha = 1,
    strokeWidth = 1,
  ): void {
    this.hudGraphics.rect(x, y, width, height).fill({ color: fillColor, alpha: fillAlpha });
    if (typeof strokeColor === 'number') {
      this.hudGraphics.rect(x, y, width, height).stroke({ color: strokeColor, alpha: strokeAlpha, width: strokeWidth });
    }
  }

  private drawDashedScreenRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    alpha: number,
    thickness: number,
    dash: number,
    gap: number,
  ): void {
    const step = Math.max(1, dash + gap);
    const right = x + width;
    const bottom = y + height;

    for (let sx = x; sx < right; sx += step) {
      const segment = Math.min(dash, right - sx);
      this.hudGraphics.rect(sx, y, segment, thickness).fill({ color, alpha });
      this.hudGraphics.rect(sx, bottom - thickness, segment, thickness).fill({ color, alpha });
    }

    for (let sy = y; sy < bottom; sy += step) {
      const segment = Math.min(dash, bottom - sy);
      this.hudGraphics.rect(x, sy, thickness, segment).fill({ color, alpha });
      this.hudGraphics.rect(right - thickness, sy, thickness, segment).fill({ color, alpha });
    }
  }

  private syncShadow(
    node: FighterNode,
    fighter: DrawFighterPayload['fighter'],
    spriteInfo: LegacySpriteInfo,
  ): void {
    const grounded = fighter.grounded !== false;
    const verticalSpeed = Math.abs(Number(fighter.vy) || 0);
    const airborneLift = grounded ? 0 : Math.min(0.45, 0.14 + verticalSpeed * 0.018);
    const baseWidth = Math.max(16, spriteInfo.drawW * 0.26);
    const baseHeight = Math.max(5, spriteInfo.drawH * 0.055);
    const widthScale = grounded ? 1 : Math.max(0.55, 1 - airborneLift);
    const heightScale = grounded ? 1 : Math.max(0.45, 1 - airborneLift * 1.25);
    const alpha = grounded ? 0.24 : Math.max(0.08, 0.22 - airborneLift * 0.2);

    node.shadow.clear();
    node.shadow
      .ellipse(0, -3, baseWidth * widthScale, baseHeight * heightScale)
      .fill({ color: 0x000000, alpha });
    node.shadow.y = 0;
    node.shadow.visible = true;
  }

  private syncLegacyPoseEffects(
    node: FighterNode,
    pose: LegacyPose | null,
    fighter: DrawFighterPayload['fighter'],
    zoom: number,
    dir: number,
  ): void {
    node.customUnderlay.clear();
    node.customOverlay.clear();
    node.customUnderlay.visible = false;
    node.customOverlay.visible = false;

    const fx = pose?.pixiEffects;
    if (!fx?.kind) return;

    if (fx.kind === 'kankuro') {
      const reach = Math.max(0, Number(fx.stringReach) || 0);
      const puppetScale = Math.max(0, Number(fx.puppetScale) || 0);
      const puppetState = !!fx.puppetState;
      const specialState = !!fx.specialState;
      const stringBob = Number(fx.stringBob) || 0;
      const puppetBob = Number(fx.puppetBob) || 0;
      const shadowIntensity = 0.74 + reach * 0.12;

      node.customUnderlay.visible = true;
      node.customUnderlay
        .ellipse(0, -4 * zoom, (18 + shadowIntensity * 8) * zoom, (5 + shadowIntensity * 2) * zoom)
        .fill({ color: 0x181210, alpha: 0.16 + shadowIntensity * 0.1 });

      if (reach > 0.08) {
        const handX = dir * 18 * zoom;
        const handY = -52 * zoom;
        const puppetX = dir * (36 + reach * 38) * zoom;
        const puppetY = -(44 + stringBob * 5) * zoom;
        for (let i = -1; i <= 1; i += 1) {
          const controlX = handX + dir * (10 + reach * 14) * zoom;
          const controlY = handY - (6 + Math.abs(i) * 6) * zoom;
          this.drawQuadraticPolyline(
            node.customUnderlay,
            handX,
            handY + i * 5 * zoom,
            controlX,
            controlY,
            puppetX,
            puppetY + i * 7 * zoom,
            10,
            0x93cfff,
            0.18 + reach * 0.18,
            Math.max(1, 1.2 * zoom),
          );
        }
        if (puppetState) {
          node.customUnderlay
            .circle(handX, handY, (3 + reach * 2) * zoom)
            .fill({ color: 0x93cfff, alpha: 0.08 + puppetScale * 0.08 });
        }
      }

      if (puppetScale > 0.04) {
        const puppetX = dir * (38 + reach * 40) * zoom;
        const puppetY = -(44 + puppetBob * 5) * zoom;
        const scale = Math.max(0.18, puppetScale) * zoom;
        node.customOverlay.visible = true;
        this.drawRotatedRect(node.customOverlay, puppetX, puppetY - 4 * scale, 20 * scale, 28 * scale, dir * (0.08 + puppetBob * 0.04), 0x281e16, specialState ? 0.42 : 0.28);
        this.drawRotatedRect(node.customOverlay, puppetX, puppetY + 15 * scale, 6 * scale, 10 * scale, dir * (0.08 + puppetBob * 0.04), 0x281e16, specialState ? 0.42 : 0.28);
        this.drawRotatedRect(node.customOverlay, puppetX, puppetY - 8 * scale, 32 * scale, 4 * scale, dir * (0.08 + puppetBob * 0.04), 0x281e16, specialState ? 0.42 : 0.28);
        node.customOverlay
          .circle(puppetX, puppetY - 6 * scale, 5 * scale)
          .fill({ color: 0xc45050, alpha: specialState ? 0.7 : 0.52 });
        if (specialState) {
          const glowW = 10 * scale;
          const glowH = 18 * scale;
          this.drawPolyline(node.customOverlay, [
            { x: puppetX - glowW, y: puppetY - glowH },
            { x: puppetX + glowW, y: puppetY + 10 * scale },
          ], 0xffd4aa, 0.42, Math.max(1, 1.3 * zoom));
          this.drawPolyline(node.customOverlay, [
            { x: puppetX + glowW, y: puppetY - glowH },
            { x: puppetX - glowW, y: puppetY + 10 * scale },
          ], 0xffd4aa, 0.42, Math.max(1, 1.3 * zoom));
        }
      }
      return;
    }

    if (fx.kind === 'jirobo') {
      const earthPulse = Math.max(0, Number(fx.earthPulse) || 0);
      const specialState = !!fx.specialState;
      const strideIntensity = Math.max(0, Number(fx.strideIntensity) || 0);
      const shadowIntensity = 0.8 + earthPulse * 0.35;
      node.customUnderlay.visible = true;
      node.customUnderlay
        .ellipse(0, -4 * zoom, (22 + shadowIntensity * 10) * zoom, (6 + shadowIntensity * 2.5) * zoom)
        .fill({ color: 0x241408, alpha: 0.18 + shadowIntensity * 0.12 });

      if (earthPulse > 0.02) {
        const handX = dir * (28 + earthPulse * 10) * zoom;
        const handY = -(52 + earthPulse * 4) * zoom;
        const groundY = -10 * zoom;
        node.customOverlay.visible = true;
        for (let i = 0; i < 3; i += 1) {
          const len = (18 + i * 9 + earthPulse * 18) * zoom;
          this.drawPolyline(node.customOverlay, [
            { x: handX, y: handY + i * 2 * zoom },
            { x: handX + dir * len, y: handY - (6 + i * 4) * zoom },
          ], 0xffca8a, 0.24 + earthPulse * 0.28, Math.max(1.5, 2.5 * zoom));
        }
        for (let i = 0; i < (specialState ? 6 : 4); i += 1) {
          const x = dir * (10 + i * 10) * zoom;
          const h = (10 + earthPulse * 14 + i * 1.5) * zoom;
          const w = (4 + earthPulse * 4) * zoom;
          this.drawRotatedRect(node.customOverlay, x, groundY - h * 0.5, w, h, dir * (0.16 + i * 0.05), 0x7e532c, 0.12 + earthPulse * 0.18);
        }
        for (let i = 0; i < (specialState ? 5 : 3); i += 1) {
          node.customOverlay
            .ellipse(
              (i - 2) * 14 * zoom,
              groundY - i * 2 * zoom,
              (8 + earthPulse * 14 - i) * zoom,
              (3 + earthPulse * 4) * zoom,
            )
            .fill({ color: 0xd69a5c, alpha: 0.12 + earthPulse * 0.22 });
        }
      } else if (strideIntensity > 0.03) {
        const baseX = -dir * 8 * zoom;
        const baseY = -12 * zoom;
        node.customOverlay.visible = true;
        for (let i = 0; i < 3; i += 1) {
          const spread = (i - 1) * 9 * zoom;
          node.customOverlay
            .ellipse(
              baseX + spread,
              baseY - i * 2 * zoom,
              (8 + strideIntensity * 8 - i) * zoom,
              (3 + strideIntensity * 3) * zoom,
            )
            .fill({ color: 0x8a5d3a, alpha: 0.08 + strideIntensity * 0.16 });
        }
      }
      return;
    }

    if (fx.kind === 'neji') {
      const auraPulse = Math.max(0, Number(fx.auraPulse) || 0);
      const ringPulse = Math.max(0, Number(fx.ringPulse) || 0);
      const specialState = !!fx.specialState;
      const heavyState = !!fx.heavyState;
      const orbitOffset = Number(fx.orbitOffset) || 0;
      const trigramIntensity = 0.18 + ringPulse * 0.32;
      if (trigramIntensity > 0.02) {
        const radius = (20 + trigramIntensity * 18) * zoom;
        const centerY = -34 * zoom;
        node.customUnderlay.visible = true;
        node.customUnderlay
          .circle(0, centerY, radius)
          .stroke({ color: 0xbdd2ff, width: Math.max(1, 1.2 * zoom), alpha: 0.12 + trigramIntensity * 0.18 });
        node.customUnderlay
          .circle(0, centerY, radius * 0.58)
          .stroke({ color: 0xbdd2ff, width: Math.max(1, 1.2 * zoom), alpha: 0.12 + trigramIntensity * 0.18 });
        for (let i = 0; i < 8; i += 1) {
          const angle = (Math.PI * 2 * i) / 8 + orbitOffset;
          const x = Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          node.customUnderlay
            .circle(x, y, (1.4 + trigramIntensity * 1.4) * zoom)
            .fill({ color: 0xdae4ff, alpha: 0.18 + trigramIntensity * 0.26 });
        }
        if (specialState) {
          this.drawPolyline(node.customUnderlay, [{ x: -radius, y: centerY }, { x: radius, y: centerY }], 0xffffff, 0.1 + trigramIntensity * 0.16, Math.max(1, 1.2 * zoom));
          this.drawPolyline(node.customUnderlay, [{ x: 0, y: centerY - radius }, { x: 0, y: centerY + radius }], 0xffffff, 0.1 + trigramIntensity * 0.16, Math.max(1, 1.2 * zoom));
        }
      }

      if (auraPulse > 0.08) {
        const handX = dir * 18 * zoom;
        const handY = -50 * zoom;
        const radius = (8 + auraPulse * 12) * zoom;
        node.customOverlay.visible = true;
        node.customOverlay
          .circle(handX, handY, radius * 1.8)
          .fill({ color: 0xaac3ff, alpha: 0.08 + auraPulse * 0.12 });
        node.customOverlay
          .circle(handX, handY, radius * 1.15)
          .fill({ color: 0xaac3ff, alpha: 0.08 + auraPulse * 0.08 });
        node.customOverlay
          .circle(handX, handY, radius * 0.62)
          .fill({ color: 0xfafcff, alpha: 0.16 + auraPulse * 0.22 });
        const arcCount = heavyState ? 4 : 2;
        for (let i = 0; i < arcCount; i += 1) {
          const sweep = 0.6 + i * 0.25;
          this.drawArcPolyline(
            node.customOverlay,
            handX,
            handY,
            radius * (0.7 + i * 0.22),
            -dir * sweep,
            dir * sweep,
            12,
            0xe2ecff,
            0.18 + auraPulse * 0.26,
            Math.max(1, 1.3 * zoom),
          );
        }
      }
    }
  }

  private syncAfterimages(
    node: FighterNode,
    texture: Texture,
    spriteInfo: LegacySpriteInfo,
    facing: number,
    poseScaleX: number,
    poseScaleY: number,
    renderScaleOverride: number,
    active: boolean,
    pulse: number,
  ): void {
    const baseScaleX = spriteInfo.drawW / Math.max(1, texture.width || spriteInfo.drawW || 1);
    const baseScaleY = spriteInfo.drawH / Math.max(1, texture.height || spriteInfo.drawH || 1);
    node.afterimages.forEach((afterimage, index) => {
      if (!active) {
        afterimage.visible = false;
        afterimage.alpha = 0;
        return;
      }
      const distance = (index + 1) * 12 * facing;
      afterimage.texture = texture;
      afterimage.scale.set(
        baseScaleX * renderScaleOverride * facing * poseScaleX,
        baseScaleY * renderScaleOverride * poseScaleY,
      );
      afterimage.position.set(-distance, 0);
      afterimage.tint = 0x93c5fd;
      afterimage.alpha = Math.max(0.08, (0.18 - index * 0.04) * pulse);
      afterimage.visible = true;
    });
  }

  private maybeSpawnFighterEffects(
    node: FighterNode,
    fighter: DrawFighterPayload['fighter'],
    screenX: number,
    screenY: number,
    spriteInfo: LegacySpriteInfo,
  ): void {
    const currentHitFlash = Number(fighter.hitFlash) || 0;
    const state = String(fighter.state || '');
    const enteredTeleport =
      (state === 'TELEPORT' || state === 'SPECIAL_TELEPORT') &&
      node.lastState !== 'TELEPORT' &&
      node.lastState !== 'SPECIAL_TELEPORT';
    const enteredSpecial =
      (state === 'SPECIAL' || state === 'SPECIAL_TRANSFORM' || String(fighter.currentAttackType || '').toLowerCase() === 'special') &&
      node.lastState !== state &&
      node.lastState !== 'SPECIAL' &&
      node.lastState !== 'SPECIAL_TRANSFORM';
    const gotHit = currentHitFlash > 0 && node.lastHitFlash <= 0;
    const landed =
      fighter.grounded !== false &&
      node.lastState === 'JUMP' &&
      state !== 'JUMP';

    if (enteredTeleport) {
      this.spawnEffect(screenX, screenY - spriteInfo.drawH * 0.56, 'teleport');
    } else if (enteredSpecial) {
      this.spawnEffect(
        screenX,
        screenY - spriteInfo.drawH * 0.52,
        'special',
        this.resolveFighterAuraTint(fighter, false, true, false),
      );
    } else if (gotHit) {
      const kind = state === 'BLOCK' ? 'block' : 'hit';
      this.spawnEffect(screenX, screenY - spriteInfo.drawH * 0.58, kind);
    } else if (landed) {
      this.spawnEffect(screenX, screenY - 6, 'landing');
    }

    node.lastHitFlash = currentHitFlash;
    node.lastState = state;
  }

  private spawnEffect(x: number, y: number, kind: EffectNode['kind'], tintOverride?: number): void {
    const container = new Container();
    const color = tintOverride ?? (
      kind === 'block' ? 0x93c5fd
      : kind === 'teleport' ? 0xc4b5fd
      : kind === 'special' ? 0xfef08a
      : kind === 'landing' ? 0xe2e8f0
      : 0xfbbf24
    );
    const radius =
      kind === 'teleport' ? 42
      : kind === 'special' ? 34
      : kind === 'block' ? 18
      : kind === 'landing' ? 30
      : 24;

    if (kind === 'landing') {
      for (let i = 0; i < 4; i += 1) {
        const ring = new Sprite(Texture.WHITE);
        ring.anchor.set(0.5);
        ring.tint = color;
        ring.alpha = i === 0 ? 0.28 : 0.12;
        ring.width = radius * (1.5 - i * 0.16);
        ring.height = radius * (0.22 - i * 0.025);
        container.addChild(ring);
      }
    } else {
      const shardCount = kind === 'teleport' ? 8 : kind === 'special' ? 10 : 6;
      for (let i = 0; i < shardCount; i += 1) {
        const shard = new Sprite(Texture.WHITE);
        shard.anchor.set(0.12, 0.5);
        shard.tint = i % 2 === 0 ? color : 0xffffff;
        shard.alpha = kind === 'teleport' ? 0.48 : kind === 'special' ? 0.56 : 0.88;
        shard.width = kind === 'teleport' ? radius * 0.92 : kind === 'special' ? radius * 1.08 : radius * 0.72;
        shard.height = kind === 'teleport' ? 3 : kind === 'special' ? 3.5 : 4;
        shard.rotation = (Math.PI * 2 * i) / shardCount;
        container.addChild(shard);
      }
      const core = new Sprite(Texture.WHITE);
      core.anchor.set(0.5);
      core.tint = color;
      core.alpha = kind === 'block' ? 0.22 : kind === 'special' ? 0.26 : 0.32;
      core.width = kind === 'teleport' ? radius * 0.8 : kind === 'special' ? radius * 0.66 : radius * 0.45;
      core.height = kind === 'teleport' ? radius * 0.8 : kind === 'special' ? radius * 0.66 : radius * 0.45;
      container.addChild(core);
    }

    container.x = x;
    container.y = y;
    this.effectLayer.addChild(container);
    this.effects.push({
      container,
      life: kind === 'teleport' ? 16 : kind === 'special' ? 14 : kind === 'landing' ? 12 : 10,
      maxLife: kind === 'teleport' ? 16 : kind === 'special' ? 14 : kind === 'landing' ? 12 : 10,
      kind,
    });
  }

  private updateEffects(): void {
    if (!this.effects.length) return;
    this.effects = this.effects.filter((effect) => {
      effect.life -= 1;
      const progress = Math.max(0, effect.life) / Math.max(1, effect.maxLife);
      effect.container.alpha = progress;
      const scale = effect.kind === 'teleport'
        ? 0.85 + (1 - progress) * 0.85
        : effect.kind === 'special'
          ? 0.92 + (1 - progress) * 0.72
        : effect.kind === 'landing'
          ? 0.9 + (1 - progress) * 0.6
          : 0.8 + (1 - progress) * 0.45;
      effect.container.scale.set(scale);
      if (effect.life > 0) return true;
      effect.container.destroy({ children: true });
      return false;
    });
  }

  private ensureRainDrops(): void {
    if (!this.app || this.rainDrops.length) return;
    const width = Math.max(1, this.app.renderer.width || 800);
    const height = Math.max(1, this.app.renderer.height || 450);
    for (let i = 0; i < 48; i += 1) {
      const graphic = new Graphics();
      this.weatherLayer.addChild(graphic);
      this.rainDrops.push({
        graphic,
        x: Math.random() * width,
        y: Math.random() * height,
        length: 10 + Math.random() * 12,
        speed: 8 + Math.random() * 7,
        drift: 2.5 + Math.random() * 2.5,
      });
    }
  }

  private applyWeatherPreset(): void {
    this.colorGradeFilter.reset();
    this.colorGradeFilter.alpha = 1;
    switch (this.weatherPreset) {
      case 'sunset':
        this.colorGradeFilter.brightness(1.05, false);
        this.colorGradeFilter.contrast(1.02, true);
        this.colorGradeFilter.saturate(0.18, true);
        this.colorGradeFilter.alpha = 0.18;
        this.colorGradeFilter.tint(0xffb16e, true);
        break;
      case 'night':
        this.colorGradeFilter.brightness(0.82, false);
        this.colorGradeFilter.saturate(-0.22, true);
        this.colorGradeFilter.alpha = 0.24;
        this.colorGradeFilter.tint(0x7aa2ff, true);
        break;
      case 'rain':
        this.colorGradeFilter.brightness(0.92, false);
        this.colorGradeFilter.saturate(-0.08, true);
        this.colorGradeFilter.alpha = 0.16;
        this.colorGradeFilter.tint(0x8ab4ff, true);
        break;
      default:
        this.colorGradeFilter.brightness(1, false);
        break;
    }
    this.weatherLayer.visible = this.weatherPreset === 'rain';
  }

  private updateWeather(): void {
    const requested = (window as any).__legacyPixiWeatherPreset;
    const preset = requested === 'rain' || requested === 'sunset' || requested === 'night'
      ? requested
      : this.activeStageProfile.weather;
    if (preset !== this.weatherPreset) {
      this.weatherPreset = preset;
      this.applyWeatherPreset();
    }
    if (this.weatherPreset !== 'rain' || !this.app) return;
    this.ensureRainDrops();
    const width = Math.max(1, this.app.renderer.width || 800);
    const height = Math.max(1, this.app.renderer.height || 450);
    for (const drop of this.rainDrops) {
      drop.x += drop.drift;
      drop.y += drop.speed;
      if (drop.y > height + 24 || drop.x > width + 24) {
        drop.x = Math.random() * width - 32;
        drop.y = -16 - Math.random() * 80;
      }
      drop.graphic.clear();
      drop.graphic
        .moveTo(drop.x, drop.y)
        .lineTo(drop.x - drop.drift * 1.6, drop.y - drop.length)
        .stroke({ color: 0xbfe3ff, width: 1.4, alpha: 0.32 });
    }
  }

  private updateSceneFx(): void {
    if (!this.app) return;
    const width = Math.max(1, this.app.renderer.width || 800);
    const height = Math.max(1, this.app.renderer.height || 450);
    const camera = this.currentScenePayload.camera || {};
    const shakeIntensity = Math.max(0, Number(camera.shakeIntensity) || 0);
    const shakeFrames = Math.max(0, Number(camera.shakeFrames) || 0);
    const shakeMaxFrames = Math.max(1, Number(camera.shakeMaxFrames) || 1);
    const shakeProgress = shakeFrames > 0 ? shakeFrames / shakeMaxFrames : 0;
    const activeShake = shakeIntensity * shakeProgress;
    const flashActive = !!this.currentScenePayload.screenFlash?.active;
    const flashAlpha = flashActive ? Math.max(0, Number(this.currentScenePayload.screenFlash?.alpha) || 0) : 0;
    const zoomBoost = Math.min(0.07, activeShake * 0.008 + flashAlpha * 0.04);
    const overlayZoom = 1 + zoomBoost;
    const backgroundZoom = 1 + zoomBoost * 0.45;
    const smoothShakeX = Math.sin(this.frameCounter * 0.7) * activeShake * 0.55;
    const smoothShakeY = Math.cos(this.frameCounter * 0.92) * activeShake * 0.3;

    this.sceneRoot.scale.set(overlayZoom);
    this.sceneRoot.position.set(
      width * 0.5 * (1 - overlayZoom) + smoothShakeX,
      height * 0.5 * (1 - overlayZoom) + smoothShakeY,
    );
    this.backgroundRoot.scale.set(backgroundZoom);
    this.backgroundRoot.position.set(
      width * 0.5 * (1 - backgroundZoom) + smoothShakeX * 0.45,
      height * 0.5 * (1 - backgroundZoom) + smoothShakeY * 0.35,
    );

    const slowMotionActive = !!this.currentScenePayload.slowMotion?.active;
    const slowMotionScale = Number(this.currentScenePayload.slowMotion?.scale) || 1;
    this.sceneBlurFilter.strength = Math.min(
      4.5,
      activeShake * 0.12 + (slowMotionActive && slowMotionScale < 0.95 ? (1 - slowMotionScale) * 5 : 0),
    );

    this.flashOverlay.clear();
    if (flashAlpha > 0.001) {
      this.flashOverlay.rect(0, 0, width, height).fill({
        color: this.parseHexColor(this.currentScenePayload.screenFlash?.color, 0xffffff),
        alpha: Math.min(0.72, flashAlpha * 0.55),
      });
    }

    this.vignetteOverlay.clear();
    const vignette = this.activeStageProfile.vignetteAlpha;
    if (vignette > 0.001) {
      this.vignetteOverlay.rect(0, 0, width, 18).fill({ color: 0x000000, alpha: vignette * 0.9 });
      this.vignetteOverlay.rect(0, height - 18, width, 18).fill({ color: 0x000000, alpha: vignette * 0.95 });
      this.vignetteOverlay.rect(0, 0, 20, height).fill({ color: 0x000000, alpha: vignette * 0.7 });
      this.vignetteOverlay.rect(width - 20, 0, 20, height).fill({ color: 0x000000, alpha: vignette * 0.7 });
      this.vignetteOverlay.rect(12, 12, width - 24, 10).fill({ color: 0x000000, alpha: vignette * 0.28 });
      this.vignetteOverlay.rect(12, height - 22, width - 24, 10).fill({ color: 0x000000, alpha: vignette * 0.32 });
    }
  }

  private syncStageDecor(gameWidth: number, gameHeight: number, groundScreenY: number, cameraRatio: number): void {
    const profile = this.activeStageProfile;
    const pulse = Math.sin(this.frameCounter * 0.018);
    this.decorBackGraphics.clear();
    this.floorGlow.clear();
    this.decorFrontGraphics.clear();

    for (let i = 0; i < 3; i += 1) {
      const bandY = gameHeight * (0.24 + i * 0.14) + Math.sin(this.frameCounter * 0.012 + i * 1.6) * 8;
      const bandH = 36 + i * 14;
      const drift = (cameraRatio - 0.5) * (24 + i * 10);
      this.decorBackGraphics
        .roundRect(-40 + drift, bandY, gameWidth + 80, bandH, 24)
        .fill({ color: profile.hazeColor, alpha: profile.hazeAlpha * (0.8 - i * 0.18) });
    }

    this.floorGlow
      .ellipse(gameWidth * 0.5, groundScreenY + 22, gameWidth * 0.44, 24 + pulse * 4)
      .fill({ color: profile.groundGlowColor, alpha: profile.groundGlowAlpha });

    const stageId = this.activeStageId;
    if (stageId.includes('bridge')) {
      for (let i = 0; i < 4; i += 1) {
        const x = gameWidth * (0.12 + i * 0.22) + Math.sin(this.frameCounter * 0.01 + i) * 12;
        this.decorFrontGraphics
          .moveTo(x, groundScreenY - 120)
          .lineTo(x + 42, groundScreenY)
          .stroke({ color: profile.decorColor, width: 3, alpha: 0.18 + i * 0.03 });
      }
    } else if (stageId.includes('hideout') || stageId.includes('valley')) {
      for (let i = 0; i < 3; i += 1) {
        const x = gameWidth * (0.2 + i * 0.3);
        this.decorFrontGraphics
          .ellipse(x, groundScreenY - 10, 110 + i * 16, 20 + i * 4)
          .fill({ color: profile.decorColor, alpha: 0.08 + i * 0.03 });
      }
    } else if (stageId.includes('ramen')) {
      for (let i = 0; i < 5; i += 1) {
        const x = gameWidth * (0.1 + i * 0.18);
        const y = 72 + Math.sin(this.frameCounter * 0.03 + i) * 4;
        this.decorFrontGraphics.circle(x, y, 5 + (i % 2)).fill({ color: profile.accentColor, alpha: 0.22 });
      }
    } else {
      for (let i = 0; i < 6; i += 1) {
        const x = gameWidth * (0.08 + i * 0.16) + Math.sin(this.frameCounter * 0.014 + i) * 5;
        const y = groundScreenY - 34 - Math.abs(Math.sin(this.frameCounter * 0.015 + i)) * 12;
        this.decorFrontGraphics
          .ellipse(x, y, 18, 6)
          .fill({ color: profile.accentColor, alpha: 0.08 });
      }
    }
  }

  private getStageVisualProfile(stageId: string): StageVisualProfile {
    const normalized = String(stageId || '').toLowerCase();
    if (normalized.includes('bridge')) {
      return {
        weather: 'rain',
        tintColor: 0x0f172a,
        tintAlpha: 0.2,
        hazeColor: 0xcbd5e1,
        hazeAlpha: 0.08,
        groundGlowColor: 0x93c5fd,
        groundGlowAlpha: 0.09,
        vignetteAlpha: 0.12,
        decorColor: 0xe2e8f0,
        accentColor: 0x7dd3fc,
      };
    }
    if (normalized.includes('hideout')) {
      return {
        weather: 'night',
        tintColor: 0x120b16,
        tintAlpha: 0.28,
        hazeColor: 0x312e81,
        hazeAlpha: 0.11,
        groundGlowColor: 0x1d4ed8,
        groundGlowAlpha: 0.08,
        vignetteAlpha: 0.16,
        decorColor: 0xa78bfa,
        accentColor: 0xc4b5fd,
      };
    }
    if (normalized.includes('valley')) {
      return {
        weather: 'night',
        tintColor: 0x020617,
        tintAlpha: 0.18,
        hazeColor: 0x94a3b8,
        hazeAlpha: 0.12,
        groundGlowColor: 0x67e8f9,
        groundGlowAlpha: 0.07,
        vignetteAlpha: 0.13,
        decorColor: 0xe2e8f0,
        accentColor: 0x7dd3fc,
      };
    }
    if (normalized.includes('ramen')) {
      return {
        weather: 'sunset',
        tintColor: 0x7c2d12,
        tintAlpha: 0.12,
        hazeColor: 0xfdba74,
        hazeAlpha: 0.08,
        groundGlowColor: 0xf59e0b,
        groundGlowAlpha: 0.12,
        vignetteAlpha: 0.09,
        decorColor: 0xfcd34d,
        accentColor: 0xfb923c,
      };
    }
    if (normalized.includes('konoha') || normalized.includes('training')) {
      return {
        weather: 'clear',
        tintColor: 0x08101a,
        tintAlpha: 0.12,
        hazeColor: 0xd9f99d,
        hazeAlpha: 0.05,
        groundGlowColor: 0xfef08a,
        groundGlowAlpha: 0.06,
        vignetteAlpha: 0.08,
        decorColor: 0x86efac,
        accentColor: 0xfde68a,
      };
    }
    return {
      weather: 'clear',
      tintColor: 0x000000,
      tintAlpha: 0.16,
      hazeColor: 0xffffff,
      hazeAlpha: 0.04,
      groundGlowColor: 0xffffff,
      groundGlowAlpha: 0.05,
      vignetteAlpha: 0.08,
      decorColor: 0xffffff,
      accentColor: 0xe2e8f0,
    };
  }

  private syncCanvasMetrics(): void {
    if (!this.app || !this.hostCanvas || !this.overlayCanvas) return;
    const parent = this.hostCanvas.parentElement;
    if (!parent) return;

    const baseRect = this.hostCanvas.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const width = Math.max(1, this.hostCanvas.width || 800);
    const height = Math.max(1, this.hostCanvas.height || 450);

    this.app.renderer.resize(width, height);
    if (this.underlayApp) this.underlayApp.renderer.resize(width, height);
    if (this.underlayCanvas) {
      this.underlayCanvas.width = width;
      this.underlayCanvas.height = height;
      this.underlayCanvas.style.width = `${baseRect.width}px`;
      this.underlayCanvas.style.height = `${baseRect.height}px`;
      this.underlayCanvas.style.left = `${baseRect.left - parentRect.left}px`;
      this.underlayCanvas.style.top = `${baseRect.top - parentRect.top}px`;
    }
    this.overlayCanvas.width = width;
    this.overlayCanvas.height = height;
    this.overlayCanvas.style.width = `${baseRect.width}px`;
    this.overlayCanvas.style.height = `${baseRect.height}px`;
    this.overlayCanvas.style.left = `${baseRect.left - parentRect.left}px`;
    this.overlayCanvas.style.top = `${baseRect.top - parentRect.top}px`;
  }

  private parseHexColor(value: string | undefined, fallback: number): number {
    if (!value || typeof value !== 'string') return fallback;
    const normalized = value.trim().replace(/^#/, '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return fallback;
    return Number.parseInt(normalized, 16);
  }
}

let instance: LegacyPixiCharacters | null = null;

function getInstance(): LegacyPixiCharacters {
  if (!instance) {
    instance = new LegacyPixiCharacters();
  }
  return instance;
}

export async function attachLegacyPixiCharacters(canvas: HTMLCanvasElement): Promise<void> {
  const layer = getInstance();
  await layer.attach(canvas);
  window.LegacyPixiCharacters = layer;
}

export function destroyLegacyPixiCharacters(): void {
  if (instance) {
    instance.destroy();
    instance = null;
  }
  if (window.LegacyPixiCharacters) {
    delete window.LegacyPixiCharacters;
  }
}
