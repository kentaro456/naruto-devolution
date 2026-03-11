/* ============================================
   FIGHTER — Base class for all characters
   ============================================ */

const SHARED_KUNAI_PROJECTILE_IMAGE =
  "assets/organized/characters/projectile_pool/pool/sb3_fullpack/projectile__kunai.png";
const SHARED_SHURIKEN_PROJECTILE_IMAGE =
  "assets/organized/characters/projectile_pool/pool/sb3_fullpack/projectile__shuriken1.png";
const SHARED_KUNAI_PROJECTILE_EXCEPTIONS =
  /naruto|sasuke|madara|gaara|itachi|kisame|deidara|sasori|jiraiya|minato|kakashi/i;
const CHARACTER_DEFAULT_PROJECTILES = {
  naruto: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 12,
    width: 24,
    height: 8,
    life: 60,
  },
  naruto_kyuubi: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 12.5,
    width: 24,
    height: 8,
    life: 58,
  },
  boruto: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 12,
    width: 24,
    height: 8,
    life: 60,
  },
  minato: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 13,
    width: 24,
    height: 8,
    life: 66,
  },
  kakashi: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 12,
    width: 24,
    height: 8,
    life: 60,
  },
  teen_kakashi: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 12,
    width: 24,
    height: 8,
    life: 60,
  },
  sasuke: {
    kind: "shuriken",
    imagePath: SHARED_SHURIKEN_PROJECTILE_IMAGE,
    speed: 11.5,
    width: 24,
    height: 24,
    life: 58,
    spinSpeed: 0.45,
    rotateWithVelocity: false,
  },
  sasuke_cs2: {
    kind: "shuriken",
    imagePath: SHARED_SHURIKEN_PROJECTILE_IMAGE,
    speed: 11.8,
    width: 24,
    height: 24,
    life: 60,
    spinSpeed: 0.48,
    rotateWithVelocity: false,
  },
  itachi: {
    kind: "shuriken",
    imagePath: SHARED_SHURIKEN_PROJECTILE_IMAGE,
    speed: 11.6,
    width: 24,
    height: 24,
    life: 60,
    spinSpeed: 0.45,
    rotateWithVelocity: false,
  },
  madara: {
    kind: "shuriken",
    imagePath: SHARED_SHURIKEN_PROJECTILE_IMAGE,
    speed: 11.4,
    width: 24,
    height: 24,
    life: 62,
    spinSpeed: 0.44,
    rotateWithVelocity: false,
  },
  sasuke_ems: {
    kind: "shuriken",
    imagePath: SHARED_SHURIKEN_PROJECTILE_IMAGE,
    speed: 11.7,
    width: 24,
    height: 24,
    life: 60,
    spinSpeed: 0.46,
    rotateWithVelocity: false,
  },
  gaara: {
    kind: "sandburial",
    speed: 7.8,
    width: 40,
    height: 30,
    life: 70,
  },
  gaara_grand_alt: {
    kind: "sandburial",
    speed: 7.8,
    width: 40,
    height: 30,
    life: 70,
  },
  kankuro: {
    kind: "puppet_strike",
    speed: 8.8,
    width: 48,
    height: 36,
    life: 64,
  },
  sasori: {
    kind: "puppet_strike",
    speed: 9,
    width: 50,
    height: 38,
    life: 64,
  },
  deidara: {
    kind: "claybird",
    speed: 9.5,
    width: 44,
    height: 30,
    life: 66,
  },
  kisame: {
    kind: "water_shark",
    speed: 10,
    width: 46,
    height: 34,
    life: 70,
  },
  jirobo: {
    kind: "EarthJutsu",
    speed: 7.2,
    width: 34,
    height: 34,
    life: 72,
  },
  orochimaru: {
    kind: "EarthJutsu",
    speed: 7.4,
    width: 34,
    height: 34,
    life: 72,
  },
  jiraiya_new: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 11,
    width: 24,
    height: 8,
    life: 58,
  },
  lee: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 12,
    width: 24,
    height: 8,
    life: 56,
  },
  ns_lee_young: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 12,
    width: 24,
    height: 8,
    life: 56,
  },
  hinata: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 11.6,
    width: 24,
    height: 8,
    life: 58,
  },
  hinata_grande_alt: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 11.6,
    width: 24,
    height: 8,
    life: 58,
  },
  neji: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 11.7,
    width: 24,
    height: 8,
    life: 58,
  },
  sakura: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 11.4,
    width: 24,
    height: 8,
    life: 58,
  },
  kimimaro: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 11.8,
    width: 24,
    height: 8,
    life: 60,
  },
  ns_kimimaro: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 11.8,
    width: 24,
    height: 8,
    life: 60,
  },
  pein: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 11.2,
    width: 24,
    height: 8,
    life: 60,
  },
  shikamaru_shippuden_alt: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 11.5,
    width: 24,
    height: 8,
    life: 60,
  },
  ns_mashu_ti: {
    kind: "kunai",
    imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
    speed: 11.5,
    width: 24,
    height: 8,
    life: 60,
  },
};

class Fighter {
  constructor(config) {
    this.charId = config.charId || "";
    this.name = config.name || "Fighter";
    this.color = config.color || "#FF6B00";

    // Position & movement
    this.x = config.x || 200;
    this.y = config.y || 300;
    this.vx = 0;
    this.vy = 0;
    this.width = 30;
    this.height = 50;
    this.grounded = false;
    this.facingRight =
      config.facingRight !== undefined ? config.facingRight : true;

    // Stats
    this.healthMultiplier = Number.isFinite(config.healthMultiplier)
      ? config.healthMultiplier
      : 1.3;
    this.maxHealth = Math.round((config.maxHealth || 100) * this.healthMultiplier);
    this.health = this.maxHealth;
    this.maxChakra = config.maxChakra || 100;
    this.chakra = this.maxChakra;
    this.maxStamina = config.maxStamina || 100;
    this.stamina = this.maxStamina;
    this.speed = config.speed || 3;
    this.jumpPower = config.jumpPower || -10;
    this.attackPower = config.attackPower || 10;
    this.defense = config.defense || 1;
    this.chakraRegen = config.chakraRegen || 0.08;
    this.staminaRegen = config.staminaRegen || 0.22;
    this.staminaRegenDelay = config.staminaRegenDelay || 40;

    // State machine
    this.state = "IDLE"; // IDLE, WALK, JUMP, ATTACK_LIGHT, ATTACK_HEAVY, SPECIAL, BLOCK, HIT, KO, DASH
    this.stateTimer = 0;
    this.hitFlash = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.attackHasHit = false; // Prevent multi-hit per attack
    this.staminaDelayTimer = 0;
    this.hitstunTimer = 0;
    this.blockstunTimer = 0;
    this.blockTimer = Number.POSITIVE_INFINITY;
    this.chargeTimer = 0;
    this.standHeight = this.height;
    this.crouchEnabled = config.crouchEnabled ?? true;
    this.crouchHeightRatio = config.crouchHeightRatio || 0.72;
    this.crouchSpeedMultiplier = config.crouchSpeedMultiplier || 0.58;

    // Advanced combat actions
    this.dashCost = config.dashCost || 22;
    this.dashDuration = config.dashDuration || 10;
    this.dashCooldown = config.dashCooldown || 18;
    this.dashSpeedMultiplier = config.dashSpeedMultiplier || 2.6;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.dashDirection = this.facingRight ? 1 : -1;
    this.inputBufferFrames = Math.max(1, config.inputBufferFrames || 12);
    this.inputBuffer = {
      light: 0,
      heavy: 0,
      special: 0,
      projectile: 0,
      special1: 0,
      special2: 0,
      special3: 0,
      special4: 0,
      teleport: 0,
      transform: 0,
      dash: 0,
      jump: 0,
    };
    this._prevBufferedInputUp = false;
    this.spawnedProjectiles = [];
    this.spawnedSounds = [];
    this.behaviorDriver = null;
    this.directSpritePath = null;
    this.teleportBehindEnabled = config.teleportBehindEnabled ?? true;
    this.teleportBehindCost = Number.isFinite(config.teleportBehindCost)
      ? config.teleportBehindCost
      : 18;
    this.teleportBehindCooldown = Number.isFinite(config.teleportBehindCooldown)
      ? config.teleportBehindCooldown
      : this.dashCooldown;
    this.teleportBehindOffset = Number.isFinite(config.teleportBehindOffset)
      ? config.teleportBehindOffset
      : 56;
    this.teleportBehindMaxCharges = Number.isFinite(config.teleportBehindMaxCharges)
      ? Math.max(1, Math.round(config.teleportBehindMaxCharges))
      : 2;
    this.teleportBehindCharges = this.teleportBehindMaxCharges;
    this.teleportBehindCooldownTimer = 0;
    this.teleportBehindRecoveryCooldown = Number.isFinite(config.teleportBehindRecoveryCooldown)
      ? config.teleportBehindRecoveryCooldown
      : 90;

    // Sprite system
    this.spriteSheet = null;
    this.useFullSprite = false; // true when drawing full image (no atlas slicing)
    this.frameWidth = 64;
    this.frameHeight = 64;
    this.displayScale = config.displayScale || 0.75;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animFrameTimer = 0;
    this.animSpeed = 8;
    this.prevX = this.x;
    this.prevY = this.y;
    this.renderX = this.x;
    this.renderY = this.y;
    this.renderMotionTime = 0;

    // Attacks data (overridden per character)
    this.attacks = {
      light: {
        damage: 8,
        range: 35,
        hitHeight: 30,
        duration: 10,
        chakraCost: 0,
        knockback: 3,
        offsetY: -10,
        hitstun: 11,
        blockstun: 8,
        hitstop: 4,
      },
      heavy: {
        damage: 15,
        range: 40,
        hitHeight: 35,
        duration: 18,
        chakraCost: 0,
        knockback: 6,
        offsetY: -5,
        hitstun: 15,
        blockstun: 11,
        hitstop: 6,
      },
      special: {
        damage: 25,
        range: 60,
        hitHeight: 40,
        duration: 26,
        chakraCost: 30,
        knockback: 10,
        offsetY: -15,
        hitstun: 19,
        blockstun: 13,
        hitstop: 7,
      },
      projectile: {
        damage: 5,
        range: 150,
        hitHeight: 30,
        duration: 16,
        chakraCost: 0,
        knockback: 2,
        offsetY: -10,
        hitstun: 10,
        blockstun: 7,
        hitstop: 2,
      },
    };

    // Global special-variant system (shared controls with Kakashi scheme).
    // Other characters can use these out of the box; Kakashi overrides with his own styles.
    this.specialStyles = config.specialStyles || {
      a: {
        name: "STYLE_A",
        state: "SPECIAL",
        profileOverrides: {
          duration: 24,
          damageMultiplier: 1.0,
          rangeMultiplier: 1.0,
          knockbackMultiplier: 1.0,
          moveSpeed: 1.2,
        },
      },
      s1: {
        name: "STYLE_1",
        state: "ATTACK_HEAVY_2",
        profileOverrides: {
          duration: 22,
          damageMultiplier: 1.2,
          rangeMultiplier: 1.1,
          knockbackMultiplier: 1.2,
          moveSpeed: 1.8,
        },
      },
      s2: {
        name: "STYLE_2",
        state: "SPECIAL_TRANSFORM",
        profileOverrides: {
          duration: 20,
          damageMultiplier: 1.08,
          rangeMultiplier: 1.0,
          knockbackMultiplier: 0.95,
          moveSpeed: 0.8,
        },
      },
      s3: {
        name: "STYLE_3",
        state: "ATTACK_LIGHT_3",
        profileOverrides: {
          duration: 20,
          damageMultiplier: 1.14,
          rangeMultiplier: 1.12,
          knockbackMultiplier: 0.95,
          moveSpeed: 2.2,
        },
      },
      s4: {
        name: "STYLE_4",
        state: "SPECIAL",
        profileOverrides: {
          duration: 28,
          damageMultiplier: 1.24,
          rangeMultiplier: 1.16,
          knockbackMultiplier: 1.28,
          moveSpeed: 0.9,
        },
        projectile: {
          kind: "style4_burst",
          spawnFrame: 10,
          speed: 10.5,
          width: 24,
          height: 24,
          life: 75,
          color: "#f4f7fa",
          spinSpeed: 0.22,
        },
      },
    };
    this.pendingSpecialStyle = config.pendingSpecialStyle || "a";
    this.mappedDefaultProjectile = null;
    this.mappedProjectileByState = {};

    // Combo definitions (true chain system, not single hit only).
    this.comboChains = {
      light: [
        {
          duration: 12,
          damageMultiplier: 1.0,
          rangeMultiplier: 1.0,
          knockbackMultiplier: 0.9,
        },
        {
          duration: 13,
          damageMultiplier: 1.15,
          rangeMultiplier: 1.06,
          knockbackMultiplier: 1.05,
        },
        {
          duration: 16,
          damageMultiplier: 1.35,
          rangeMultiplier: 1.12,
          knockbackMultiplier: 1.35,
        },
      ],
      heavy: [
        {
          duration: 20,
          damageMultiplier: 1.2,
          rangeMultiplier: 1.08,
          knockbackMultiplier: 1.15,
        },
        {
          duration: 26,
          damageMultiplier: 1.45,
          rangeMultiplier: 1.15,
          knockbackMultiplier: 1.5,
        },
      ],
      special: [
        {
          duration: 24,
          damageMultiplier: 1.0,
          rangeMultiplier: 1.0,
          knockbackMultiplier: 1.0,
        },
      ],
    };
    this.comboTree = null;
    this.currentComboNodeId = null;
    this.currentComboNode = null;
    this.comboHitCount = 0;
    this.comboHitTimer = 0;
    this.comboHitResetFrames = 45;
    this.lastAttackConnected = false;

    this.currentAttackData = null;
    this.currentAttackType = null;
    this.currentAttackStep = 0;
    this.currentAttackTotalSteps = 0;
    this.currentAttackDuration = 0;
    this.attackBuffer = null;
    this.comboCancelRatio = 0.72;
    // Input-driven combo chaining by default (no mandatory hit confirm).
    this.requireHitForComboRoutes = config.requireHitForComboRoutes ?? false;
    // Global animation pacing for attacks (1.0 = responsive baseline).
    this.attackDurationScale = config.attackDurationScale || 0.65;
    // Cinematic no-hit states (1.0 = no added slowdown).
    this.specialTransformDurationScale =
      config.specialTransformDurationScale || 1.0;
    this.chargeDelay = config.chargeDelay ?? 18;
    this.chargeRate = config.chargeRate ?? 0.45;

    // Animations definition (sprite sheet row/frame mapping)
    this.animations = {
      IDLE: { row: 0, frames: 4, speed: 14 },
      WALK: { row: 1, frames: 4, speed: 10 },
      CROUCH: { row: 0, frames: 2, speed: 12 },
      CROUCH_WALK: { row: 1, frames: 4, speed: 10 },
      CROUCH_ATTACK: { row: 3, frames: 3, speed: 7 },
      CROUCH_THROW: { row: 4, frames: 3, speed: 7 },
      RUN_ATTACK: { row: 4, frames: 4, speed: 7 },
      RUN: { row: 1, frames: 6, speed: 8 },
      KOMA_SUPPORT: { row: 5, frames: 3, speed: 7 },
      THROW: { row: 4, frames: 3, speed: 7 },
      JUMP: { row: 2, frames: 2, speed: 12 },
      ATTACK_LIGHT: { row: 3, frames: 3, speed: 7 },
      ATTACK_HEAVY: { row: 4, frames: 4, speed: 8 },
      SPECIAL: { row: 5, frames: 5, speed: 9 },
      BLOCK: { row: 6, frames: 1, speed: 14 },
      HIT: { row: 7, frames: 2, speed: 8 },
      KO: { row: 8, frames: 3, speed: 12 },
      CHARGE: { row: 0, frames: 2, speed: 10 },
      DASH: { row: 1, frames: 2, speed: 7 },
    };

    this._refreshComboTree();
  }

  loadSprite(path, options = {}) {
    if (!path) return;

    if (typeof SpriteFactory === "undefined") {
      this.spriteSheet = new Image();
      this.spriteSheet.src = path;
      this.useFullSprite = true;
      return;
    }

    SpriteFactory.build(path, options)
      .then((result) => {
        if (!result || !result.image) return;
        this.spriteSheet = result.image;
        this.useFullSprite = false;
        if (result.frameWidth) this.frameWidth = result.frameWidth;
        if (result.frameHeight) this.frameHeight = result.frameHeight;
        if (result.animations) this.animations = result.animations;
      })
      .catch((err) => {
        console.warn("Sprite load failed, trying sprite fallback chain:", err);
        this._loadSpriteFallback(path, options);
      });
  }

  _loadSpriteFallback(path, options = {}) {
    const directCandidates = [];
    if (options.fallbackPath) directCandidates.push(options.fallbackPath);
    if (path) directCandidates.push(path);
    this._tryLoadFirstImagePath(directCandidates).then((loaded) => {
      if (loaded) return;
      this._loadSpriteFallbackFromMapping(options).then((mappingLoaded) => {
        if (mappingLoaded) return;
        console.warn("Sprite fallback failed, using placeholder.");
      });
    });
  }

  _loadSpriteFallbackFromMapping(options = {}) {
    const mappingPath = options.mappingPath;
    if (!mappingPath) return Promise.resolve(false);

    return fetch(mappingPath)
      .then((r) => (r.ok ? r.json() : null))
      .then((mapping) => {
        if (!mapping || typeof mapping !== "object") return false;
        const stateMap = mapping.stateMap || {};
        const preferredStates = [
          "IDLE",
          "WALK",
          "RUN",
          "JUMP",
          "ATTACK_LIGHT_1",
          "ATTACK_HEAVY_1",
          "SPECIAL",
          "HIT",
          "KO",
        ];
        const allStateKeys = Object.keys(stateMap);
        const orderedStates = preferredStates.concat(
          allStateKeys.filter((k) => !preferredStates.includes(k)),
        );

        const fileCandidates = [];
        orderedStates.forEach((state) => {
          const arr = Array.isArray(stateMap[state]) ? stateMap[state] : [];
          arr.forEach((entry) => {
            if (typeof entry !== "string") return;
            const clean = entry.replace(/\\/g, "/");
            const fileName = clean.split("/").pop();
            if (fileName) fileCandidates.push(fileName);
          });
        });

        const uniqFiles = [...new Set(fileCandidates)];
        if (!uniqFiles.length) return false;

        const baseCandidates = [
          options.assetsBasePath,
          "assets/organized/shared/sb3",
          "assets/organized/shared/sb3_fullpack",
          "assets/organized/characters/projectile_pool/pool/sb3_fullpack",
        ].filter(Boolean);

        const pathCandidates = [];
        uniqFiles.forEach((fileName) => {
          baseCandidates.forEach((base) => {
            pathCandidates.push(`${base.replace(/\/$/, "")}/${fileName}`);
          });
        });

        return this._tryLoadFirstImagePath(pathCandidates);
      })
      .catch(() => false);
  }

  _tryLoadFirstImagePath(paths = []) {
    const cleanPaths = [...new Set(paths.filter((p) => this._looksLikeImagePath(p)))];
    if (!cleanPaths.length) return Promise.resolve(false);

    const tryIndex = (idx) => {
      if (idx >= cleanPaths.length) return Promise.resolve(false);
      const candidate = cleanPaths[idx];
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.spriteSheet = img;
          this.useFullSprite = true;
          this.frameWidth = img.naturalWidth || 64;
          this.frameHeight = img.naturalHeight || 64;
          this.directSpritePath = candidate;
          resolve(true);
        };
        img.onerror = () => resolve(false);
        img.src = candidate;
      }).then((ok) => (ok ? true : tryIndex(idx + 1)));
    };

    return tryIndex(0);
  }

  _looksLikeImagePath(path) {
    if (!path || typeof path !== "string") return false;
    return /\.(png|jpg|jpeg|gif|webp)$/i.test(path);
  }

  reset(x, facingRight) {
    this.x = x;
    this.y = 300;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.chakra = this.maxChakra;
    this.stamina = this.maxStamina;
    this.state = "IDLE";
    this.stateTimer = 0;
    this.hitFlash = 0;
    this.comboCount = 0;
    this.facingRight = facingRight;
    this.attackHasHit = false;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animFrameTimer = 0;
    this.prevX = this.x;
    this.prevY = this.y;
    this.renderX = this.x;
    this.renderY = this.y;
    this.renderMotionTime = 0;
    this.staminaDelayTimer = 0;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.teleportBehindCharges = this.teleportBehindMaxCharges;
    this.teleportBehindCooldownTimer = 0;
    this.comboHitCount = 0;
    this.comboHitTimer = 0;
    this.hitstunTimer = 0;
    this.blockstunTimer = 0;
    this.blockTimer = Number.POSITIVE_INFINITY;
    this.chargeTimer = 0;
    this.lastAttackConnected = false;
    this.spawnedProjectiles = [];
    this.spawnedSounds = [];
    Object.keys(this.inputBuffer).forEach((key) => {
      this.inputBuffer[key] = 0;
    });
    this._prevBufferedInputUp = false;
    this._clearAttackContext();
  }

  _setState(nextState) {
    if (this.state === nextState) return;
    if (nextState === "BLOCK") this.blockTimer = 0;
    else if (this.state === "BLOCK") this.blockTimer = Number.POSITIVE_INFINITY;
    this.state = nextState;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animFrameTimer = 0;
  }

  _clearAttackContext() {
    this.currentAttackData = null;
    this.currentAttackType = null;
    this.currentAttackStep = 0;
    this.currentAttackTotalSteps = 0;
    this.currentAttackDuration = 0;
    this.attackBuffer = null;
    this.currentComboNodeId = null;
    this.currentComboNode = null;
    this.lastAttackConnected = false;
  }

  _syncStandDimensions() {
    if (
      this.grounded &&
      this.state !== "CROUCH" &&
      this.state !== "CROUCH_WALK" &&
      this.state !== "CROUCH_ATTACK"
    ) {
      this.standHeight = Math.max(this.standHeight, this.height);
    }
  }

  _canChargeChakra(input = null, opponent = null) {
    if (!input || !input.block || !this.grounded) return false;
    if (
      input.left ||
      input.right ||
      input.up ||
      input.down ||
      input.light ||
      input.heavy ||
      input.special ||
      input.transform ||
      input.dash
    ) {
      return false;
    }
    if (this.isAttacking()) return false;
    if (this.state === "HIT" || this.state === "KO" || this._isDashLikeState()) {
      return false;
    }
    if (this.hitstunTimer > 0 || this.blockstunTimer > 0) return false;
    if (this.chakra >= this.maxChakra) return false;
    if (opponent) {
      const dist = Math.abs((opponent.x || 0) - this.x);
      const threatRange = opponent.isAttacking?.() ? 150 : 110;
      if (dist <= threatRange) return false;
    }
    return true;
  }

  _applyCrouchBody(crouching) {
    if (!this.crouchEnabled || !this.grounded) return;
    const targetHeight = crouching
      ? Math.max(24, Math.round(this.standHeight * this.crouchHeightRatio))
      : this.standHeight;
    if (targetHeight !== this.height) this.height = targetHeight;
  }

  _startCrouchAttack(type = "light") {
    if (!this.grounded) return false;
    const resolvedType = type === "heavy" ? "heavy" : "light";
    return this._startAttack(resolvedType, 1, {
      state: "CROUCH_ATTACK",
      duration: resolvedType === "heavy" ? 16 : 13,
      rangeMultiplier: resolvedType === "heavy" ? 1.02 : 0.92,
      hitHeightMultiplier: 0.62,
      damageMultiplier: resolvedType === "heavy" ? 1.08 : 0.92,
      knockbackMultiplier: resolvedType === "heavy" ? 1.1 : 0.88,
    });
  }

  _startProjectileThrow() {
    if (!this.grounded) return false;
    const crouching = this.state === "CROUCH" || this.state === "CROUCH_WALK";
    const state = crouching ? "CROUCH_THROW" : "THROW";

    let pConfig =
      this.mappedProjectileByState[state] ||
      this.mappedDefaultProjectile ||
      this._resolveCharacterDefaultProjectile();
    if (!pConfig) {
      pConfig = {
        kind: "kunai",
        speed: 12,
        damage: 5,
        width: 24,
        height: 8,
        life: 60,
        imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
      };
    }

    return this._startAttack("projectile", 1, {
      state: state,
      duration: 16,
      projectile: pConfig,
    });
  }

  _spendStamina(amount) {
    this.stamina = Math.max(0, this.stamina - amount);
    this.staminaDelayTimer = this.staminaRegenDelay;
  }

  _hasBufferedAction(action) {
    return (this.inputBuffer[action] || 0) > 0;
  }

  _consumeBufferedAction(action) {
    if (!this._hasBufferedAction(action)) return false;
    this.inputBuffer[action] = 0;
    return true;
  }

  bufferInput(input, dtScale = 1) {
    Object.keys(this.inputBuffer).forEach((action) => {
      this.inputBuffer[action] = Math.max(
        0,
        this.inputBuffer[action] - dtScale,
      );
    });

    const nextInput = { ...(input || {}) };

    if (nextInput.special) {
      this._applyDirectionalSpecialStyle(nextInput);
    }

    const bufferWindow = this.inputBufferFrames;

    if (nextInput.light) this.inputBuffer.light = bufferWindow;
    if (nextInput.heavy) this.inputBuffer.heavy = bufferWindow;
    if (nextInput.special) this.inputBuffer.special = bufferWindow;
    if (nextInput.projectile) this.inputBuffer.projectile = bufferWindow;
    if (nextInput.special1) this.inputBuffer.special1 = bufferWindow;
    if (nextInput.special2) this.inputBuffer.special2 = bufferWindow;
    if (nextInput.special3) this.inputBuffer.special3 = bufferWindow;
    if (nextInput.special4) this.inputBuffer.special4 = bufferWindow;
    if (nextInput.teleport) this.inputBuffer.teleport = bufferWindow;
    if (nextInput.transform) this.inputBuffer.transform = bufferWindow;
    if (nextInput.dash) this.inputBuffer.dash = bufferWindow;

    const upHeld = !!nextInput.up;
    if (upHeld && !this._prevBufferedInputUp) {
      this.inputBuffer.jump = bufferWindow;
    }
    this._prevBufferedInputUp = upHeld;
  }

  _applyDirectionalSpecialStyle(input = {}) {
    if (!input || !this.specialStyles) return;

    const left = !!input.left && !input.right;
    const right = !!input.right && !input.left;
    const forward = this.facingRight ? right : left;
    const backward = this.facingRight ? left : right;

    if (input.up) {
      if (this.specialStyles.kamui) this._setPendingSpecialStyle("kamui");
      else if (this.specialStyles.s1) this._setPendingSpecialStyle("s1");
      return;
    }

    if (input.down) {
      if (this.specialStyles.tsukuyomi) this._setPendingSpecialStyle("tsukuyomi");
      else if (this.specialStyles.s2) this._setPendingSpecialStyle("s2");
      return;
    }

    if (backward) {
      if (this.specialStyles.amaterasu) this._setPendingSpecialStyle("amaterasu");
      else if (this.specialStyles.s3) this._setPendingSpecialStyle("s3");
      return;
    }

    if (forward) {
      if (this.specialStyles.s4) this._setPendingSpecialStyle("s4");
      else if (this.specialStyles.raikiri) this._setPendingSpecialStyle("raikiri");
      else if (this.specialStyles.a) this._setPendingSpecialStyle("a");
      return;
    }

    if (this.specialStyles.raikiri) this._setPendingSpecialStyle("raikiri");
    else if (this.specialStyles.a) this._setPendingSpecialStyle("a");
  }

  _resolveSpecialHotkeyBinding(slot = 1) {
    if (!this.specialStyles) return null;
    const normalizedSlot = Math.max(1, Math.min(4, Number(slot) || 1));
    const bindingsBySlot = {
      1: [
        { style: "raikiri", direction: "neutral" },
        { style: "a", direction: "neutral" },
      ],
      2: [
        { style: "kamui", direction: "up" },
        { style: "s1", direction: "up" },
      ],
      3: [
        { style: "tsukuyomi", direction: "down" },
        { style: "s2", direction: "down" },
      ],
      4: [
        { style: "amaterasu", direction: "back" },
        { style: "s3", direction: "back" },
        { style: "s4", direction: "forward" },
      ],
    };
    const candidates = bindingsBySlot[normalizedSlot] || bindingsBySlot[1];
    return candidates.find((entry) => this.specialStyles[entry.style]) || null;
  }

  _buildDirectionalInputForSpecial(direction = "neutral") {
    const input = {
      up: false,
      down: false,
      left: false,
      right: false,
      special: true,
    };
    if (direction === "up") {
      input.up = true;
      return input;
    }
    if (direction === "down") {
      input.down = true;
      return input;
    }
    if (direction === "forward") {
      if (this.facingRight) input.right = true;
      else input.left = true;
      return input;
    }
    if (direction === "back") {
      if (this.facingRight) input.left = true;
      else input.right = true;
      return input;
    }
    return input;
  }

  _tryStartSpecialHotkey(slot = 1) {
    if (this.chakra < this.attacks.special.chakraCost) return false;
    const binding = this._resolveSpecialHotkeyBinding(slot);
    if (!binding) return false;
    this._setPendingSpecialStyle(binding.style);
    return this._startAttackFromInput(
      "special",
      this._buildDirectionalInputForSpecial(binding.direction),
    );
  }

  consumeSpawnedProjectiles() {
    if (!this.spawnedProjectiles.length) return [];
    const out = this.spawnedProjectiles;
    this.spawnedProjectiles = [];
    return out;
  }

  emitSound(id, volume = 1.0) {
    if (!id) return;
    this.spawnedSounds.push({ id, volume });
  }

  consumeSpawnedSounds() {
    if (!this.spawnedSounds.length) return [];
    const out = this.spawnedSounds;
    this.spawnedSounds = [];
    return out;
  }

  _refreshComboTree() {
    this.comboTree = this._buildDefaultComboTree();
  }

  setBehaviorDriver(driver) {
    this.behaviorDriver = driver || null;
  }

  async loadMappingConfig(mappingPath) {
    if (!mappingPath) return null;
    if (typeof fetch !== "function") return null;

    if (!Fighter._mappingJsonCache) Fighter._mappingJsonCache = new Map();
    if (Fighter._mappingJsonCache.has(mappingPath)) {
      return Fighter._mappingJsonCache.get(mappingPath);
    }

    const promise = fetch(mappingPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Unable to load mapping (${response.status}): ${mappingPath}`,
          );
        }
        return response.json();
      })
      .catch((err) => {
        Fighter._mappingJsonCache.delete(mappingPath);
        throw err;
      });

    Fighter._mappingJsonCache.set(mappingPath, promise);
    return promise;
  }

  async loadComboConfigFromMapping(mappingPath) {
    const mapping = await this.loadMappingConfig(mappingPath);
    if (!mapping || typeof mapping !== "object") return null;
    if (!mapping.combo || typeof mapping.combo !== "object") return null;
    return mapping.combo;
  }

  _normalizeComboStep(step, fallback = {}) {
    const out = { ...fallback };
    if (!step || typeof step !== "object") return out;

    if (typeof step.state === "string" && step.state.trim()) {
      out.state = step.state.trim().toUpperCase();
    }

    const numericKeys = [
      "duration",
      "damageMultiplier",
      "rangeMultiplier",
      "knockbackMultiplier",
      "hitHeightMultiplier",
      "hitstun",
      "blockstun",
      "hitstop",
      "moveSpeed",
      "startupFrames",
      "activeFrames",
      "activeStart",
      "activeEnd",
      "cancelStart",
      "hitConfirmCancelStart",
    ];
    numericKeys.forEach((key) => {
      if (step[key] === undefined) return;
      const parsed = Number(step[key]);
      if (Number.isFinite(parsed)) out[key] = parsed;
    });

    if (step.motion && typeof step.motion === "object") {
      const motion = {};
      [
        "windupEnd",
        "burstEnd",
        "windupMul",
        "burstMul",
        "recoveryMul",
      ].forEach((key) => {
        const parsed = Number(step.motion[key]);
        if (Number.isFinite(parsed)) motion[key] = parsed;
      });
      if (Object.keys(motion).length) out.motion = motion;
    }

    if (step.noHit === true) out.noHit = true;
    else if (
      step.noHit === false &&
      Object.prototype.hasOwnProperty.call(out, "noHit")
    )
      delete out.noHit;

    return out;
  }

  applyComboConfig(comboConfig = null) {
    if (!comboConfig || typeof comboConfig !== "object") return false;

    const settings = comboConfig.settings || {};
    const comboCancelRatio = Number(settings.comboCancelRatio);
    if (Number.isFinite(comboCancelRatio)) {
      this.comboCancelRatio = Math.max(0.1, Math.min(0.95, comboCancelRatio));
    }

    const comboHitResetFrames = Number(settings.comboHitResetFrames);
    if (Number.isFinite(comboHitResetFrames)) {
      this.comboHitResetFrames = Math.max(1, Math.round(comboHitResetFrames));
    }

    if (typeof settings.requireHitForComboRoutes === "boolean") {
      this.requireHitForComboRoutes = settings.requireHitForComboRoutes;
    }

    const attackDurationScale = Number(settings.attackDurationScale);
    if (Number.isFinite(attackDurationScale)) {
      this.attackDurationScale = Math.max(
        0.2,
        Math.min(1.0, attackDurationScale),
      );
    }

    const specialTransformDurationScale = Number(
      settings.specialTransformDurationScale,
    );
    if (Number.isFinite(specialTransformDurationScale)) {
      this.specialTransformDurationScale = Math.max(
        0.2,
        Math.min(1.0, specialTransformDurationScale),
      );
    }

    const chains = comboConfig.chains || {};
    const nextChains = { ...this.comboChains };
    ["light", "heavy", "special"].forEach((type) => {
      if (!Array.isArray(chains[type]) || !chains[type].length) return;
      const prev = Array.isArray(this.comboChains[type])
        ? this.comboChains[type]
        : [];
      nextChains[type] = chains[type].map((step, idx) =>
        this._normalizeComboStep(step, prev[idx] || {}),
      );
    });
    this.comboChains = nextChains;

    this._refreshComboTree();

    const rootRoutes = comboConfig.rootRoutes || {};
    ["light", "heavy", "special"].forEach((type) => {
      const routeMap = rootRoutes[type];
      if (!routeMap || typeof routeMap !== "object") return;
      const cleanRouteMap = {};
      Object.entries(routeMap).forEach(([k, v]) => {
        if (typeof v === "string" && v.trim()) cleanRouteMap[k] = v.trim();
      });
      if (Object.keys(cleanRouteMap).length) {
        this._setComboRootRoute(type, cleanRouteMap);
      }
    });

    const nodePatches = comboConfig.nodePatches || {};
    if (nodePatches && typeof nodePatches === "object") {
      Object.entries(nodePatches).forEach(([nodeId, patch]) => {
        if (!nodeId || typeof patch !== "object" || !patch) return;
        this._patchComboNode(nodeId, patch);
      });
    }

    this.lastAppliedComboConfig = JSON.parse(JSON.stringify(comboConfig));
    return true;
  }

  applyMappingRuntimeConfig(mappingConfig = null) {
    if (!mappingConfig || typeof mappingConfig !== "object") return false;
    if (mappingConfig.combo && typeof mappingConfig.combo === "object") {
      this.applyComboConfig(mappingConfig.combo);
    }
    this.applyProjectileConfig(mappingConfig);
    return true;
  }

  applyProjectileConfig(mappingConfig = null) {
    this.mappedDefaultProjectile = null;
    this.mappedProjectileByState = {};
    if (!mappingConfig || typeof mappingConfig !== "object") return false;

    const globalProjectile = this._mergeProjectileWithFx(
      mappingConfig.projectile || null,
    );
    if (globalProjectile && typeof globalProjectile === "object") {
      this.mappedDefaultProjectile = { ...globalProjectile };
    }

    const byState = mappingConfig.projectileByState;
    if (byState && typeof byState === "object") {
      Object.entries(byState).forEach(([state, config]) => {
        if (typeof state !== "string" || !state.trim()) return;
        const normalized = this._mergeProjectileWithFx(config || null);
        if (!normalized || typeof normalized !== "object") return;
        this.mappedProjectileByState[state.trim().toUpperCase()] = {
          ...normalized,
        };
      });
    }

    return true;
  }

  _setComboRootRoute(type, routeMap) {
    if (!this.comboTree?.root || !this.comboTree.root[type] || !routeMap)
      return;
    this.comboTree.root[type] = {
      ...this.comboTree.root[type],
      ...routeMap,
    };
  }

  _patchComboNode(nodeId, patch = {}) {
    if (!this.comboTree?.nodes || !nodeId || !patch) return;
    const current = this.comboTree.nodes[nodeId];
    if (!current) return;

    const merged = {
      ...current,
      ...patch,
      profileOverrides: {
        ...(current.profileOverrides || {}),
        ...(patch.profileOverrides || {}),
      },
      routes: {
        ...(current.routes || {}),
      },
    };

    if (patch.routes) {
      for (const [type, routeMap] of Object.entries(patch.routes)) {
        merged.routes[type] = {
          ...(current.routes?.[type] || {}),
          ...(routeMap || {}),
        };
      }
    }

    this.comboTree.nodes[nodeId] = merged;
  }

  _buildDefaultComboTree() {
    const lightLen = Math.max(1, this._getComboChain("light").length);
    const heavyLen = Math.max(1, this._getComboChain("heavy").length);
    const tree = {
      root: {
        light: {
          neutral: "L_N_1",
          forward: "L_F_1",
          down: "L_D_1",
          air: "L_A_1",
          back: "L_N_1",
        },
        heavy: {
          neutral: "H_N_1",
          forward: "H_F_1",
          down: "H_D_1",
          air: "H_A_1",
          back: "H_N_1",
        },
        special: {
          neutral: "S_N_1",
          up: "S_U_1",
          down: "S_D_1",
          back: "S_B_1",
          forward: "S_F_1",
          any: "S_N_1",
        },
      },
      nodes: {},
    };

    const lightVariants = {
      N: {},
      F: { rangeMultiplier: 1.08, knockbackMultiplier: 1.1 },
      D: { hitHeightMultiplier: 0.72, damageMultiplier: 0.96 },
      A: {
        hitHeightMultiplier: 0.68,
        damageMultiplier: 0.9,
        knockbackMultiplier: 0.86,
      },
    };
    const heavyVariants = {
      N: {},
      F: { rangeMultiplier: 1.12, knockbackMultiplier: 1.15 },
      D: { hitHeightMultiplier: 0.74, damageMultiplier: 0.95 },
      A: {
        hitHeightMultiplier: 0.7,
        damageMultiplier: 0.9,
        knockbackMultiplier: 0.9,
      },
    };
    const specialVariants = {
      N: {},
      U: {
        rangeMultiplier: 1.06,
        hitHeightMultiplier: 1.08,
        moveSpeed: 1.0,
      },
      D: {
        damageMultiplier: 1.08,
        knockbackMultiplier: 0.96,
      },
      B: {
        moveSpeed: 0.65,
        rangeMultiplier: 0.96,
      },
      F: {
        moveSpeed: 1.18,
        rangeMultiplier: 1.12,
        knockbackMultiplier: 1.12,
      },
    };

    const makeDirectionalRoute = (prefix, nextStep, maxStep) => {
      const s = Math.min(nextStep, maxStep);
      return {
        neutral: `${prefix}_N_${s}`,
        forward: `${prefix}_F_${s}`,
        down: `${prefix}_D_${s}`,
        air: `${prefix}_A_${Math.min(s, 2)}`,
        back: `${prefix}_N_${s}`,
      };
    };

    for (let step = 1; step <= lightLen; step++) {
      for (const [key, overrides] of Object.entries(lightVariants)) {
        const id = `L_${key}_${step}`;
        const routes = {};
        if (step < lightLen)
          routes.light = makeDirectionalRoute("L", step + 1, lightLen);
        routes.heavy = makeDirectionalRoute("H", 1, heavyLen);
        routes.special = {
          neutral: "S_N_1",
          up: "S_U_1",
          down: "S_D_1",
          back: "S_B_1",
          forward: "S_F_1",
          any: "S_N_1",
        };
        tree.nodes[id] = {
          id,
          type: "light",
          step,
          profileOverrides: overrides,
          routes,
          requiresHitOnRoute: this.requireHitForComboRoutes,
        };
      }
    }

    for (let step = 1; step <= heavyLen; step++) {
      for (const [key, overrides] of Object.entries(heavyVariants)) {
        const id = `H_${key}_${step}`;
        const routes = {};
        if (step < heavyLen)
          routes.heavy = makeDirectionalRoute("H", step + 1, heavyLen);
        routes.special = {
          neutral: "S_N_1",
          up: "S_U_1",
          down: "S_D_1",
          back: "S_B_1",
          forward: "S_F_1",
          any: "S_N_1",
        };
        tree.nodes[id] = {
          id,
          type: "heavy",
          step,
          profileOverrides: overrides,
          routes,
          requiresHitOnRoute: this.requireHitForComboRoutes,
        };
      }
    }

    for (const [key, overrides] of Object.entries(specialVariants)) {
      const id = `S_${key}_1`;
      tree.nodes[id] = {
        id,
        type: "special",
        step: 1,
        profileOverrides: overrides,
        routes: {},
        requiresHitOnRoute: false,
      };
    }

    tree.nodes.S_1 = {
      ...tree.nodes.S_N_1,
      id: "S_1",
    };

    return tree;
  }

  _resolveComboDirection(input, type = "light") {
    const routeType =
      type === "special" ? "special" : type === "heavy" ? "heavy" : "light";
    if (!input) {
      return routeType === "special"
        ? "neutral"
        : this.grounded
          ? "neutral"
          : "air";
    }

    const down = !!input.down && !input.up;
    const up = !!input.up && !input.down;
    const left = !!input.left;
    const right = !!input.right;

    if (routeType === "special") {
      if (up) return "up";
      if (down) return "down";
      if (left !== right) {
        const movingRight = right && !left;
        const forward = this.facingRight ? movingRight : !movingRight;
        return forward ? "forward" : "back";
      }
      return "neutral";
    }

    if (down) return "down";
    // Allow "up + attack" on ground to deliberately trigger air-route openers.
    if (up) return "air";
    if (!this.grounded) return "air";

    if (left === right) return "neutral";

    const movingRight = right && !left;
    const forward = this.facingRight ? movingRight : !movingRight;
    return forward ? "forward" : "back";
  }

  _resolveDirectionalRoute(routeMap, direction) {
    if (!routeMap) return null;
    return routeMap[direction] || routeMap.any || routeMap.neutral || null;
  }

  _resolveRootComboNode(buffered) {
    const root = this.comboTree?.root?.[buffered.type];
    return this._resolveDirectionalRoute(root, buffered.direction);
  }

  _startComboNode(nodeId) {
    const node = this.comboTree?.nodes?.[nodeId];
    if (!node) return false;
    const started = this._startAttack(
      node.type,
      node.step,
      node.profileOverrides,
    );
    if (!started) return false;
    this.currentComboNodeId = nodeId;
    this.currentComboNode = node;
    return true;
  }

  _startAttackFromInput(type, input) {
    if (!this.comboTree) return this._startAttack(type);
    const buffered = {
      type,
      direction: this._resolveComboDirection(input, type),
    };
    const nodeId = this._resolveRootComboNode(buffered);
    if (!nodeId) return this._startAttack(type);
    return this._startComboNode(nodeId);
  }

  _getComboDamageScale() {
    if (this.comboHitCount <= 0) return 1;
    if (this.comboHitCount === 1) return 0.85;
    if (this.comboHitCount === 2) return 0.72;
    if (this.comboHitCount === 3) return 0.6;
    return 0.5;
  }

  onAttackConnected() {
    this.lastAttackConnected = true;
    this.comboHitCount += 1;
    this.comboHitTimer = this.comboHitResetFrames;
  }

  _getComboChain(type) {
    return (
      this.comboChains[type] || [
        { duration: this.attacks[type]?.duration || 12 },
      ]
    );
  }

  _getComboStepProfile(type, requestedStep = 1) {
    const chain = this._getComboChain(type);
    const idx = Math.max(
      0,
      Math.min(chain.length - 1, (requestedStep | 0) - 1),
    );
    return {
      profile: chain[idx],
      step: idx + 1,
      total: chain.length,
    };
  }

  _buildAttackWindow(duration, attackType, motion, profile = {}) {
    const safeDuration = Math.max(1, Math.round(Number(duration) || 1));
    const fallbackWindupEnd =
      attackType === "special" ? 0.24 : attackType === "heavy" ? 0.2 : 0.15;
    const fallbackBurstEnd =
      attackType === "special" ? 0.74 : attackType === "heavy" ? 0.68 : 0.62;
    const motionWindupEnd = this._clamp01(
      Number(motion?.windupEnd) || fallbackWindupEnd,
    );
    const motionBurstEnd = Math.max(
      motionWindupEnd + 0.08,
      Math.min(0.96, Number(motion?.burstEnd) || fallbackBurstEnd),
    );
    const defaultActiveStart =
      safeDuration <= 1
        ? 0
        : Math.max(
          1,
          Math.min(
            safeDuration - 1,
            Math.round(safeDuration * Math.max(0.08, motionWindupEnd * 0.8)),
          ),
        );
    const defaultActiveEnd =
      safeDuration <= 1
        ? 1
        : Math.max(
          defaultActiveStart + 1,
          Math.min(
            safeDuration,
            Math.round(
              safeDuration *
              Math.min(
                0.95,
                motionBurstEnd + (attackType === "special" ? 0.08 : 0.05),
              ),
            ),
          ),
        );
    const ratioCancelStart = Math.max(
      0,
      Math.min(
        safeDuration,
        Math.round(safeDuration * (1 - this.comboCancelRatio)),
      ),
    );
    const requestedActiveStart = Number(
      profile.activeStart ?? profile.startupFrames,
    );
    const activeStart = Math.max(
      0,
      Math.min(
        safeDuration - 1,
        Number.isFinite(requestedActiveStart)
          ? Math.round(requestedActiveStart)
          : defaultActiveStart,
      ),
    );
    const requestedActiveEnd = Number(profile.activeEnd);
    const requestedActiveFrames = Number(profile.activeFrames);
    let activeEnd = defaultActiveEnd;
    if (Number.isFinite(requestedActiveEnd)) {
      activeEnd = Math.round(requestedActiveEnd);
    } else if (Number.isFinite(requestedActiveFrames)) {
      activeEnd = activeStart + Math.round(requestedActiveFrames);
    }
    activeEnd = Math.max(
      activeStart + 1,
      Math.min(safeDuration, activeEnd),
    );
    const requestedCancelStart = Number(profile.cancelStart);
    const cancelStart = Math.max(
      activeStart,
      Math.min(
        safeDuration,
        Number.isFinite(requestedCancelStart)
          ? Math.round(requestedCancelStart)
          : Math.max(activeEnd, ratioCancelStart),
      ),
    );
    const requestedHitConfirmCancelStart = Number(
      profile.hitConfirmCancelStart,
    );
    const hitConfirmCancelStart = Math.max(
      activeStart,
      Math.min(
        cancelStart,
        Number.isFinite(requestedHitConfirmCancelStart)
          ? Math.round(requestedHitConfirmCancelStart)
          : activeStart,
      ),
    );

    return {
      startupFrames: activeStart,
      activeStart,
      activeEnd,
      activeFrames: Math.max(1, activeEnd - activeStart),
      recoveryFrames: Math.max(0, safeDuration - activeEnd),
      cancelStart,
      hitConfirmCancelStart,
    };
  }

  _buildAttackData(type, profile = {}) {
    const base = this.attacks[type] || this.attacks.light;
    const attackType =
      type === "special" ? "special" : type === "heavy" ? "heavy" : "light";
    const defaultMotion =
      attackType === "special"
        ? {
          windupEnd: 0.33,
          burstEnd: 0.68,
          windupMul: 0.15,
          burstMul: 1.6,
          recoveryMul: 0.76,
        }
        : attackType === "heavy"
          ? {
            windupEnd: 0.28,
            burstEnd: 0.62,
            windupMul: 0.22,
            burstMul: 1.38,
            recoveryMul: 0.82,
          }
          : {
            windupEnd: 0.22,
            burstEnd: 0.58,
            windupMul: 0.32,
            burstMul: 1.2,
            recoveryMul: 0.88,
          };
    const motion = { ...defaultMotion, ...(profile.motion || {}) };
    if (profile.noHit) {
      const rawDuration = Math.max(
        1,
        Math.round(profile.duration ?? base.duration),
      );
      const scaledDuration = Math.max(
        1,
        Math.round(rawDuration * this.specialTransformDurationScale),
      );
      return {
        ...base,
        type: attackType,
        damage: 0,
        range: 0,
        hitHeight: 0,
        duration: scaledDuration,
        knockback: 0,
        hitstun: 0,
        blockstun: 0,
        hitstop: 0,
        moveSpeed: 0,
        motion,
        startupFrames: scaledDuration,
        activeStart: scaledDuration,
        activeEnd: scaledDuration,
        activeFrames: 0,
        recoveryFrames: 0,
        cancelStart: scaledDuration,
        hitConfirmCancelStart: scaledDuration,
        noHit: true,
      };
    }

    const damageMultiplier = profile.damageMultiplier ?? 1;
    const rangeMultiplier = profile.rangeMultiplier ?? 1;
    const knockbackMultiplier = profile.knockbackMultiplier ?? 1;
    const hitHeightMultiplier = profile.hitHeightMultiplier ?? 1;
    const fallbackHitstun =
      type === "special" ? 19 : type === "heavy" ? 15 : 11;
    const fallbackBlockstun =
      type === "special" ? 13 : type === "heavy" ? 11 : 8;
    const fallbackHitstop = type === "special" ? 7 : type === "heavy" ? 6 : 4;

    const rawDuration = Math.max(
      1,
      Math.round(profile.duration ?? base.duration),
    );
    const scaledDuration = Math.max(
      1,
      Math.round(rawDuration * this.attackDurationScale),
    );
    const attackWindow = this._buildAttackWindow(
      scaledDuration,
      attackType,
      motion,
      profile,
    );
    const projectileConfig = profile.projectile || base.projectile
      ? this._mergeProjectileWithFx(profile.projectile || base.projectile)
      : undefined;

    return {
      ...base,
      type: attackType,
      damage: Math.max(
        1,
        Math.round(base.damage * damageMultiplier),
      ),
      range: Math.max(8, Math.round(base.range * rangeMultiplier)),
      hitHeight: Math.max(
        10,
        Math.round((base.hitHeight || this.height * 0.6) * hitHeightMultiplier),
      ),
      duration: scaledDuration,
      knockback: Math.max(
        1,
        Number((base.knockback * knockbackMultiplier).toFixed(2)),
      ),
      hitstun: Math.max(
        1,
        Math.round(profile.hitstun ?? base.hitstun ?? fallbackHitstun),
      ),
      blockstun: Math.max(
        1,
        Math.round(profile.blockstun ?? base.blockstun ?? fallbackBlockstun),
      ),
      hitstop: Math.max(
        1,
        Math.round(profile.hitstop ?? base.hitstop ?? fallbackHitstop),
      ),
      moveSpeed: Math.max(0, Number(profile.moveSpeed ?? base.moveSpeed ?? 0)),
      motion,
      ...attackWindow,
      noHit: false,
      ...(projectileConfig ? { projectile: projectileConfig } : {}),
    };
  }

  _computeAttackMoveMultiplier(attackData) {
    if (!attackData || !attackData.motion) return 1;
    const duration = Math.max(1, Number(attackData.duration) || 1);
    const elapsed = Math.max(0, duration - Math.max(0, this.stateTimer));
    const progress = Math.max(0, Math.min(1, elapsed / duration));

    const windupEnd = Math.max(
      0.01,
      Math.min(0.9, Number(attackData.motion.windupEnd) || 0.25),
    );
    const burstEnd = Math.max(
      windupEnd + 0.01,
      Math.min(0.99, Number(attackData.motion.burstEnd) || 0.6),
    );
    const windupMul = Math.max(
      0,
      Math.min(1.2, Number(attackData.motion.windupMul) || 0.3),
    );
    const burstMul = Math.max(
      0.7,
      Math.min(2.2, Number(attackData.motion.burstMul) || 1.25),
    );
    const recoveryMul = Math.max(
      0.4,
      Math.min(1.4, Number(attackData.motion.recoveryMul) || 0.9),
    );

    if (progress <= windupEnd) {
      const t = progress / windupEnd;
      return windupMul + (1 - windupMul) * t * 0.65;
    }
    if (progress <= burstEnd) {
      const t = (progress - windupEnd) / (burstEnd - windupEnd);
      return 1 + (burstMul - 1) * t;
    }
    const t = (progress - burstEnd) / (1 - burstEnd);
    return burstMul + (recoveryMul - burstMul) * t;
  }

  _captureAttackBuffer(input) {
    const setBuffer = (type) => {
      if (this.attackBuffer?.type === "special" && type !== "special")
        return false;
      this.attackBuffer = {
        type,
        direction: this._resolveComboDirection(input || {}, type),
      };
      return true;
    };

    if (
      this._hasBufferedAction("special") &&
      this.chakra >= this.attacks.special.chakraCost
    ) {
      if (setBuffer("special")) this._consumeBufferedAction("special");
      return;
    }
    if (this._hasBufferedAction("projectile")) {
      if (setBuffer("projectile")) this._consumeBufferedAction("projectile");
      return;
    }
    if (this._hasBufferedAction("heavy")) {
      if (setBuffer("heavy")) this._consumeBufferedAction("heavy");
      return;
    }
    if (this._hasBufferedAction("light")) {
      if (setBuffer("light")) this._consumeBufferedAction("light");
    }
  }

  _tryConsumeAttackBuffer() {
    if (!this.attackBuffer || !this.isAttacking()) return false;

    const attackData = this.currentAttackData;
    if (attackData) {
      const duration = Math.max(
        1,
        Number(attackData.duration) || Number(this.currentAttackDuration) || 1,
      );
      const elapsed = this._getAttackElapsedFrames(attackData);
      let cancelStart = this.lastAttackConnected
        ? Number(attackData.hitConfirmCancelStart)
        : Number(attackData.cancelStart);
      if (attackData.noHit) {
        cancelStart = duration;
      } else if (!Number.isFinite(cancelStart)) {
        cancelStart = Math.round(duration * (1 - this.comboCancelRatio));
      }
      if (Number.isFinite(cancelStart) && elapsed < cancelStart) return false;
    } else {
      const duration = Math.max(1, this.currentAttackDuration || 1);
      if (this.stateTimer > duration * this.comboCancelRatio) return false;
    }

    const buffered = this.attackBuffer;
    this.attackBuffer = null;
    if (!buffered || !buffered.type) return false;

    // Cancel route to special from any non-special attack.
    if (
      buffered.type === "special" &&
      this.currentAttackType !== "special" &&
      this.chakra >= this.attacks.special.chakraCost
    ) {
      if (this.comboTree) {
        const specialNode = this._resolveRootComboNode(buffered);
        if (specialNode) return this._startComboNode(specialNode);
      }
      return this._startAttack("special", 1);
    }

    if (buffered.type === "projectile" && this.currentAttackType !== "projectile") {
      return this._startProjectileThrow();
    }

    // Combo-tree dynamic routes (directional + hit confirm).
    if (this.comboTree && this.currentComboNode) {
      if (
        this.currentComboNode.requiresHitOnRoute &&
        !this.lastAttackConnected
      ) {
        return false;
      }
      const routeMap = this.currentComboNode.routes?.[buffered.type];
      const nextNodeId = this._resolveDirectionalRoute(
        routeMap,
        buffered.direction,
      );
      if (!nextNodeId) return false;
      return this._startComboNode(nextNodeId);
    }

    // Fallback legacy chain behavior.
    const currentType = this.currentAttackType;
    if (buffered.type === currentType && currentType !== "special") {
      if (this.currentAttackStep < this.currentAttackTotalSteps) {
        return this._startAttack(currentType, this.currentAttackStep + 1);
      }
      return false;
    }

    if (buffered.type === "heavy" && currentType === "light") {
      return this._startAttack("heavy", 1);
    }

    return false;
  }

  _isSpecialChainStepComplete() {
    return (
      this.currentAttackType === "special" &&
      this.currentAttackStep > 0 &&
      this.currentAttackStep < this.currentAttackTotalSteps
    );
  }

  update(input, opponent, dtScale = 1) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.renderMotionTime += Number.isFinite(dtScale) ? dtScale : 1;
    this._syncStandDimensions();
    this.bufferInput(input, dtScale);
    const wantsCharge = this._canChargeChakra(input, opponent);

    if (
      this.state === "BLOCK" &&
      !wantsCharge &&
      !!input?.block &&
      this.grounded &&
      this.blockstunTimer <= 0
    ) {
      this.blockTimer = Number.isFinite(this.blockTimer)
        ? this.blockTimer + dtScale
        : 0;
    } else if (
      this.state !== "BLOCK" ||
      !input?.block ||
      !this.grounded ||
      this.blockstunTimer > 0
    ) {
      this.blockTimer = Number.POSITIVE_INFINITY;
    }
    if (!wantsCharge) this.chargeTimer = 0;

    // Decrease timers
    if (this.stateTimer > 0) this.stateTimer -= dtScale;
    if (this.hitFlash > 0) this.hitFlash -= dtScale;
    if (this.hitstunTimer > 0) this.hitstunTimer -= dtScale;
    if (this.blockstunTimer > 0) this.blockstunTimer -= dtScale;
    if (this.teleportBehindCooldownTimer > 0) {
      this.teleportBehindCooldownTimer -= dtScale;
      if (this.teleportBehindCooldownTimer <= 0) {
        this.teleportBehindCooldownTimer = 0;
        this.teleportBehindCharges = this.teleportBehindMaxCharges;
      }
    }
    if (this.comboTimer > 0) {
      this.comboTimer -= dtScale;
    } else {
      this.comboCount = 0;
    }
    if (this.comboHitTimer > 0) {
      this.comboHitTimer -= dtScale;
    } else {
      this.comboHitCount = 0;
    }
    if (this.dashTimer > 0) this.dashTimer -= dtScale;
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dtScale;
    if (this.staminaDelayTimer > 0) this.staminaDelayTimer -= dtScale;

    this.chakra = Math.min(
      this.maxChakra,
      this.chakra + this.chakraRegen * dtScale,
    );
    if (this.staminaDelayTimer <= 0 && !this._isDashLikeState()) {
      this.stamina = Math.min(
        this.maxStamina,
        this.stamina + this.staminaRegen * dtScale,
      );
    }

    if (this.behaviorDriver && typeof this.behaviorDriver.tick === "function") {
      this.behaviorDriver.tick(input, dtScale);
      if (this.directSpritePath) {
        this._updateAnimation(dtScale);
        return;
      }
    } else {
      this.directSpritePath = null;
    }

    // State transitions
    // Allow KO to update its animation by removing the early return,
    // but prevent other actions.
    if (this.state === "KO") {
      if (this.hitstunTimer > 0) this.hitstunTimer -= dtScale;
      this._applyCrouchBody(false);
      this._updateAnimation(dtScale);
      return;
    }

    // Auto-face opponent initially before inputs override it
    const isMovingWithKeys = input && (input.left || input.right);
    if (
      opponent &&
      !isMovingWithKeys &&
      this.state !== "HIT" &&
      !this.isAttacking() &&
      this.state !== "BLOCK" &&
      !this._isDashLikeState()
    ) {
      this.facingRight = opponent.x > this.x;
    }

    // Active attack flow with combo buffer windows.
    if (this.isAttacking() && this.stateTimer > 0) {
      this._captureAttackBuffer(input);
      this._tryConsumeAttackBuffer();
      if ((this.currentAttackData?.moveSpeed || 0) > 0) {
        const dir = this.facingRight ? 1 : -1;
        const moveMul = this._computeAttackMoveMultiplier(this.currentAttackData);
        this.vx = dir * this.currentAttackData.moveSpeed * moveMul;
      } else {
        this.vx = 0;
      }

      // Jutsu Projectile Spawn check
      if (this.currentAttackData?.projectile) {
        const timePassed = this.currentAttackData.duration - this.stateTimer;
        const pConfig = this.currentAttackData.projectile;
        const spawnTarget =
          pConfig.spawnFrame || Math.floor(this.currentAttackData.duration / 2);
        if (!this.projectileSpawned && timePassed >= spawnTarget) {
          this.fireJutsuProjectile(pConfig);
          this.projectileSpawned = true;
        }
      }

      this._updateAnimation(dtScale);
      return;
    }

    // Dash flow.
    if (this._isDashLikeState() && this.dashTimer > 0) {
      if (this.state === "DASH") {
        this.vx = this.dashDirection * this.speed * this.dashSpeedMultiplier;
      } else {
        this.vx = 0;
      }
      this._updateAnimation(dtScale);
      return;
    }
    if (this._isDashLikeState() && this.dashTimer <= 0) {
      this._setState(this.grounded ? "IDLE" : "JUMP");
    }

    // Hit stun wait.
    if (this.state === "HIT" && this.stateTimer > 0) {
      this._applyCrouchBody(false);
      this._updateAnimation(dtScale);
      return;
    }

    // Block stun wait.
    if (this.state === "BLOCK" && this.blockstunTimer > 0) {
      this._applyCrouchBody(false);
      this.vx *= Math.pow(0.72, dtScale);
      this._updateAnimation(dtScale);
      return;
    }

    // Reset state after attack/hit finishes
    if (this.isAttacking() && this.stateTimer <= 0) {
      // Auto-chain special phases (e.g. transform -> special hit).
      if (this._isSpecialChainStepComplete()) {
        this._startAttack("special", this.currentAttackStep + 1);
        this._updateAnimation(dtScale);
        return;
      }

      // Last-frame buffer consume safety.
      this._captureAttackBuffer(input);
      if (this._tryConsumeAttackBuffer()) {
        this._updateAnimation(dtScale);
        return;
      }

      this._clearAttackContext();
      this._applyCrouchBody(false);
      this._setState(this.grounded ? "IDLE" : "JUMP");
      this.attackHasHit = false;
    }

    if (this.state === "HIT" && this.stateTimer <= 0) {
      this._applyCrouchBody(false);
      this._setState(this.grounded ? "IDLE" : "JUMP");
      this.attackHasHit = false;
      this.hitstunTimer = 0;
    }

    // Landing recovery: leave JUMP state as soon as we are grounded again.
    if (this.grounded && this.state === "JUMP" && !this.isAttacking()) {
      this._applyCrouchBody(false);
      const movingHorizontally =
        Math.abs(this.vx) > 0.2 || (input && (input.left || input.right));
      this._setState(movingHorizontally ? "WALK" : "IDLE");
    }

    if (
      this.state === "BLOCK" &&
      this.blockstunTimer <= 0 &&
      (!input || !input.block || wantsCharge)
    ) {
      this._applyCrouchBody(false);
      this._setState(this.grounded ? "IDLE" : "JUMP");
      this.blockstunTimer = 0;
    }
    if (this.state === "CHARGE" && !wantsCharge) {
      this._setState(this.grounded ? "IDLE" : "JUMP");
    }

    // Handle input
    if (input) {
      if (wantsCharge) {
        this.chargeTimer += dtScale;
        this.vx = 0;
        if (this.chargeTimer >= this.chargeDelay) {
          this._setState("CHARGE");
          this.chakra = Math.min(
            this.maxChakra,
            this.chakra + this.chargeRate * dtScale,
          );
        } else if (this.state === "BLOCK") {
          this._setState("IDLE");
        }
        this._applyCrouchBody(false);
        this._updateAnimation(dtScale);
        return;
      }

      // Block
      if (input.block && this.grounded) {
        this._setState("BLOCK");
        this.vx = 0;
      }
      // Dash
      else if (this._hasBufferedAction("dash") && this.startDash(input)) {
        this._consumeBufferedAction("dash");
        // Dash takes priority over normal attacks/move for this frame.
      }
      // Movement
      else {
        const crouchHeld = !!(
          this.crouchEnabled &&
          this.grounded &&
          input.down &&
          !input.up
        );
        if (crouchHeld) {
          this._applyCrouchBody(true);

          let crouchAttackStarted = false;
          if (this._hasBufferedAction("heavy")) {
            crouchAttackStarted = this._startCrouchAttack("heavy");
            if (crouchAttackStarted) this._consumeBufferedAction("heavy");
          }
          if (!crouchAttackStarted && this._hasBufferedAction("light")) {
            crouchAttackStarted = this._startCrouchAttack("light");
            if (crouchAttackStarted) this._consumeBufferedAction("light");
          }
          if (crouchAttackStarted) {
            this._updateAnimation(dtScale);
            return;
          }

          if (input.left && !input.right) {
            this.vx = -this.speed * this.crouchSpeedMultiplier;
            this.facingRight = false;
            this._setState("CROUCH_WALK");
          } else if (input.right && !input.left) {
            this.vx = this.speed * this.crouchSpeedMultiplier;
            this.facingRight = true;
            this._setState("CROUCH_WALK");
          } else {
            this.vx = 0;
            this._setState("CROUCH");
          }

          this._updateAnimation(dtScale);
          return;
        }

        this._applyCrouchBody(false);
        let attackStarted = false;
        if (!attackStarted && this._hasBufferedAction("transform")) {
          if (typeof this._startTransform === "function") {
            attackStarted = this._startTransform();
          } else if (this.specialStyles && this.specialStyles.transform) {
            this._setPendingSpecialStyle("transform");
            attackStarted = this._startAttack("special", 1);
          }
          if (attackStarted) this._consumeBufferedAction("transform");
        }
        if (
          !attackStarted &&
          this._hasBufferedAction("special") &&
          this.chakra >= this.attacks.special.chakraCost
        ) {
          attackStarted = this._startAttackFromInput("special", input);
          if (attackStarted) this._consumeBufferedAction("special");
        }
        if (!attackStarted && this._hasBufferedAction("special1")) {
          attackStarted = this._tryStartSpecialHotkey(1);
          if (attackStarted) this._consumeBufferedAction("special1");
        }
        if (!attackStarted && this._hasBufferedAction("special2")) {
          attackStarted = this._tryStartSpecialHotkey(2);
          if (attackStarted) this._consumeBufferedAction("special2");
        }
        if (!attackStarted && this._hasBufferedAction("special3")) {
          attackStarted = this._tryStartSpecialHotkey(3);
          if (attackStarted) this._consumeBufferedAction("special3");
        }
        if (!attackStarted && this._hasBufferedAction("special4")) {
          attackStarted = this._tryStartSpecialHotkey(4);
          if (attackStarted) this._consumeBufferedAction("special4");
        }
        if (!attackStarted && this._hasBufferedAction("projectile")) {
          attackStarted = this._startProjectileThrow();
          if (attackStarted) this._consumeBufferedAction("projectile");
        }
        if (!attackStarted && this._hasBufferedAction("teleport")) {
          attackStarted = this.startTeleportBehind(opponent);
          if (attackStarted) this._consumeBufferedAction("teleport");
        }
        if (!attackStarted && this._hasBufferedAction("heavy")) {
          attackStarted = this._startAttackFromInput("heavy", input);
          if (attackStarted) this._consumeBufferedAction("heavy");
        }
        if (!attackStarted && this._hasBufferedAction("light")) {
          attackStarted = this._startAttackFromInput("light", input);
          if (attackStarted) this._consumeBufferedAction("light");
        }
        if (attackStarted) {
          this._updateAnimation(dtScale);
          return;
        }

        if (input.left) {
          this.vx = -this.speed;
          this.facingRight = false;
          if (this.grounded) this._setState("WALK");
        } else if (input.right) {
          this.vx = this.speed;
          this.facingRight = true;
          if (this.grounded) this._setState("WALK");
        } else if (
          this.grounded &&
          (this.state === "WALK" ||
            this.state === "RUN" ||
            this.state === "CROUCH" ||
            this.state === "CROUCH_WALK")
        ) {
          this._setState("IDLE");
        }

        // Jump
        if (this._hasBufferedAction("jump") && this.grounded) {
          this._consumeBufferedAction("jump");
          this.vy = this.jumpPower;
          this.grounded = false;
          this._setState("JUMP");
        }

        // Fast fall
        if (input.down && !this.grounded) {
          this.vy += 0.8;
        }
      }
    }

    if (!this.grounded && !this.isAttacking()) {
      this._setState("JUMP");
    }

    this._updateAnimation(dtScale);
  }

  _startAttack(type, requestedStep = 1, profileOverrides = null) {
    const attackType =
      type === "special" ? "special" : type === "heavy" ? "heavy" : "light";
    if (
      attackType === "special" &&
      requestedStep <= 1 &&
      this.chakra < this.attacks.special.chakraCost
    ) {
      return false;
    }
    if (this._isDashLikeState() && this.dashTimer > 0) return false;

    const { profile, step, total } = this._getComboStepProfile(
      attackType,
      requestedStep,
    );
    let mergedProfileOverrides = profileOverrides || null;
    if (attackType === "special" && requestedStep <= 1) {
      const style = this.specialStyles?.[this.pendingSpecialStyle];
      if (style) {
        mergedProfileOverrides = {
          ...(style.profileOverrides || {}),
          ...(profileOverrides || {}),
        };
        if (style.state && !mergedProfileOverrides.state) {
          mergedProfileOverrides.state = style.state;
        }
      }
    }

    const resolvedProfile = mergedProfileOverrides
      ? { ...profile, ...mergedProfileOverrides }
      : profile;
    const attackData = this._buildAttackData(attackType, resolvedProfile);
    const key =
      attackType === "special"
        ? "SPECIAL"
        : `ATTACK_${attackType.toUpperCase()}`;
    const resolvedState = resolvedProfile.state || key;

    if (attackType === "special") {
      this._setState(resolvedState);
      if (step === 1) {
        this.chakra -= this.attacks.special.chakraCost;
        if ((this.name || "").toUpperCase().includes("KIMIMARO")) {
          this.emitSound("sb3_meow", 0.82);
        }
      }
    } else {
      this._setState(resolvedState);
    }
    // Ensure attack visuals start immediately at frame 0 even when state labels repeat.
    this.animFrame = 0;
    this.animFrameTimer = 0;
    this.animTimer = 0;

    this.currentAttackData = attackData;
    if (attackType === "special" && requestedStep <= 1) {
      const style = this.specialStyles?.[this.pendingSpecialStyle];
      if (style?.projectile) {
        this.currentAttackData.projectile = this._mergeProjectileWithFx(
          style.projectile,
        );
      }
    }
    const mappedProjectile =
      this._resolveMappedProjectileForState(resolvedState) ||
      (attackType === "special" ? this.mappedDefaultProjectile : null);
    if (mappedProjectile) {
      this.currentAttackData.projectile = this._mergeProjectileWithFx(
        mappedProjectile,
      );
    }
    this.currentAttackType = attackType;
    this.currentAttackStep = step;
    this.currentAttackTotalSteps = total;
    this.currentAttackDuration = attackData.duration;
    this.stateTimer = attackData.duration;
    this.dashTimer = 0;
    this.vx = 0;
    this.attackHasHit = false;
    this.comboCount = step;
    this.comboTimer = 20;
    this.attackBuffer = null;
    this.lastAttackConnected = false;
    this.projectileSpawned = false;
    return true;
  }

  _setPendingSpecialStyle(style) {
    if (!style || !this.specialStyles || !this.specialStyles[style]) return;
    this.pendingSpecialStyle = style;
  }

  _resolveMappedProjectileForState(state = "") {
    if (!state || !this.mappedProjectileByState) return null;
    const key = String(state).trim().toUpperCase();
    if (!key) return null;
    const mapped = this.mappedProjectileByState[key];
    return mapped ? { ...mapped } : null;
  }

  _resolveFxProfile(fxProfileId) {
    if (!fxProfileId) return null;
    const bank = typeof FX_BANK !== "undefined" ? FX_BANK : null;
    if (!bank || !bank[fxProfileId]) return null;
    return { ...bank[fxProfileId] };
  }

  _resolveCharacterDefaultProjectile() {
    const key = String(this.charId || "").trim().toLowerCase();
    if (!key) return null;
    const projectile = CHARACTER_DEFAULT_PROJECTILES[key];
    if (!projectile || typeof projectile !== "object") return null;
    return this._mergeProjectileWithFx({ ...projectile });
  }

  _resolveProjectileVisualProfile(projectile = null) {
    if (!projectile || typeof projectile !== "object") return null;
    if (typeof resolveProjectileVisualProfile !== "function") return null;
    return resolveProjectileVisualProfile(projectile, { allowDefault: false });
  }

  _mergeProjectileWithFx(projectile = null) {
    if (!projectile || typeof projectile !== "object") return projectile;
    const fx =
      this._resolveFxProfile(projectile.fxProfileId) ||
      this._resolveProjectileVisualProfile(projectile);
    if (!fx) return this._applySharedKunaiProjectileVisual({ ...projectile });
    const merged = { ...fx, ...projectile };
    delete merged.fxProfileId;
    return this._applySharedKunaiProjectileVisual(merged);
  }

  _shouldUseSharedKunaiProjectileVisual() {
    const ctorName = String(this?.constructor?.name || "");
    const fighterName = String(this?.name || "");
    return !(
      SHARED_KUNAI_PROJECTILE_EXCEPTIONS.test(ctorName) ||
      SHARED_KUNAI_PROJECTILE_EXCEPTIONS.test(fighterName)
    );
  }

  _applySharedKunaiProjectileVisual(projectile) {
    if (!projectile || typeof projectile !== "object") return projectile;
    const hasAnimatedVisual =
      (Array.isArray(projectile.imageFrames) && projectile.imageFrames.length > 0) ||
      !!projectile.spriteConfig;

    const userOverride = this._resolveUserProjectileOverride();
    if (userOverride && !hasAnimatedVisual) {
      return {
        ...projectile,
        ...userOverride,
      };
    }
    if (!this._shouldUseSharedKunaiProjectileVisual()) return projectile;
    return {
      ...projectile,
      imagePath: SHARED_KUNAI_PROJECTILE_IMAGE,
      imageScale: projectile.imageScale ?? 0.95,
      rotateWithVelocity: true,
    };
  }

  _resolveUserProjectileOverride() {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const key = this.charId || String(this.name || "").toLowerCase();
    if (!key) return null;
    try {
      const raw = window.localStorage.getItem("shinobi.projectileUserMap");
      if (!raw) return null;
      const map = JSON.parse(raw);
      if (!map || typeof map !== "object") return null;
      const entry = map[key];
      if (!entry || typeof entry !== "object" || !entry.imagePath) return null;
      return {
        imagePath: String(entry.imagePath),
        kind: entry.kind ? String(entry.kind) : undefined,
        imageScale: Number.isFinite(Number(entry.imageScale))
          ? Number(entry.imageScale)
          : 1.0,
        rotateWithVelocity: false,
      };
    } catch (e) {
      return null;
    }
  }

  canDash() {
    return (
      this.grounded &&
      this.state !== "HIT" &&
      this.state !== "KO" &&
      !this.isAttacking() &&
      this.dashCooldownTimer <= 0 &&
      this.stamina >= this.dashCost
    );
  }

  canTeleportBehind(opponent = null) {
    return (
      this.teleportBehindEnabled &&
      !!opponent &&
      this.teleportBehindCharges > 0 &&
      this.teleportBehindCooldownTimer <= 0 &&
      this.grounded &&
      this.state !== "HIT" &&
      this.state !== "KO" &&
      !this.isAttacking() &&
      this.dashCooldownTimer <= 0 &&
      this.stamina >= this.teleportBehindCost
    );
  }

  startTeleportBehind(opponent = null) {
    if (!this.canTeleportBehind(opponent)) return false;

    const offset = Math.max(24, Number(this.teleportBehindOffset) || 56);
    const behindDir = opponent.facingRight ? -1 : 1;
    const teleportState = this._resolveTeleportAnimationState();
    const teleportDuration = Math.max(
      6,
      Math.min(24, this._getAnimationPlaybackDuration(teleportState, 8)),
    );

    this._spendStamina(this.teleportBehindCost);
    this.teleportBehindCharges = Math.max(0, this.teleportBehindCharges - 1);
    if (this.teleportBehindCharges <= 0) {
      this.teleportBehindCooldownTimer = this.teleportBehindRecoveryCooldown;
    }
    this.dashCooldownTimer = this.teleportBehindCharges > 0 ? 0 : this.teleportBehindCooldown;
    this.dashTimer = 0;
    this._clearAttackContext();
    this.attackHasHit = false;
    this.vx = 0;
    this.vy = 0;
    this.dashDirection = 0;
    this.x = opponent.x + behindDir * offset;
    this.facingRight = opponent.x > this.x;
    this._applyCrouchBody(false);
    this._setState(teleportState);
    this.dashTimer = teleportDuration;
    this.stateTimer = Math.max(this.stateTimer, teleportDuration);
    this.emitSound?.("kakashi_teleport", 0.9);
    return true;
  }

  startDash(input = null) {
    if (!this.canDash()) return false;

    const left = !!(input && input.left);
    const right = !!(input && input.right);
    let dir = this.facingRight ? 1 : -1;
    if (left && !right) dir = -1;
    if (right && !left) dir = 1;

    this._spendStamina(this.dashCost);
    this.dashCooldownTimer = this.dashCooldown;
    this.dashTimer = this.dashDuration;
    this.dashDirection = dir;
    this._clearAttackContext();
    this.attackHasHit = false;
    this.vx = dir * this.speed * this.dashSpeedMultiplier;
    this._setState("DASH");
    return true;
  }

  applyGuardStagger(frames = 12) {
    const stun = Math.max(1, Math.round(Number(frames) || 12));
    if (this.state === "KO") return false;
    this._clearAttackContext();
    this.attackHasHit = false;
    this.dashTimer = 0;
    this.blockstunTimer = 0;
    this.hitstunTimer = Math.max(this.hitstunTimer, stun);
    this.stateTimer = this.hitstunTimer;
    this.vx = 0;
    this._applyCrouchBody(false);
    this._setState("HIT");
    return true;
  }

  fireJutsuProjectile(projConfig) {
    const dir = this.facingRight ? 1 : -1;
    const width = projConfig.width || 40;
    const height = projConfig.height || 40;
    const damage = projConfig.damage || this.currentAttackData?.damage || 20;
    const knockback =
      projConfig.knockback || this.currentAttackData?.knockback || 10;
    const projectile = this._mergeProjectileWithFx({
      owner: this,
      kind: projConfig.kind || "jutsu_ball",
      x: this.x + dir * (this.width * 0.5 + width / 2),
      y: this.y - this.height * 0.5 + (projConfig.offsetY || 0),
      vx: dir * (projConfig.speed || 12),
      vy: projConfig.vy || 0,
      radius: width / 2,
      width: width,
      height: height,
      damage,
      knockback,
      life: projConfig.life || 100,
      color: projConfig.color || "#ff5722",
      spin: dir * (projConfig.spinSpeed || 0),
      rotation: dir > 0 ? 0 : Math.PI,
      rotateWithVelocity: projConfig.rotateWithVelocity,
      attackData: {
        type: this.currentAttackData?.type || "special",
        projectile: true,
        damage,
        knockback,
        hitstun: Math.max(
          1,
          Math.round(
            projConfig.hitstun || this.currentAttackData?.hitstun || 14,
          ),
        ),
        blockstun: Math.max(
          1,
          Math.round(
            projConfig.blockstun || this.currentAttackData?.blockstun || 10,
          ),
        ),
        hitstop: Math.max(
          1,
          Math.round(
            projConfig.hitstop || this.currentAttackData?.hitstop || 5,
          ),
        ),
        ignoreBlock: !!projConfig.ignoreBlock,
      },
      ...(projConfig.fxProfileId ? { fxProfileId: projConfig.fxProfileId } : {}),
    });
    this.spawnedProjectiles.push(projectile);
  }

  isAttacking() {
    if (this.currentAttackData && this.currentAttackType && this.stateTimer > 0) {
      return true;
    }
    return (
      this.state === "SPECIAL" ||
      this.state === "SPECIAL_TRANSFORM" ||
      this.state === "CROUCH_ATTACK" ||
      this.state === "RUN_ATTACK" ||
      this.state === "THROW" ||
      this.state.startsWith("ATTACK_LIGHT") ||
      this.state.startsWith("ATTACK_HEAVY")
    );
  }

  getCurrentAttackData() {
    if (this.isAttacking() && this.currentAttackData)
      return this.currentAttackData;
    if (this.state === "ATTACK_LIGHT") return this.attacks.light;
    if (this.state === "ATTACK_HEAVY") return this.attacks.heavy;
    if (this.state === "SPECIAL") return this.attacks.special;
    return null;
  }

  takeHit(attackData, attackerX) {
    if (this.state === "BLOCK" && !attackData.ignoreBlock) {
      // Reduced damage when blocking
      const dmg = Math.max(1, attackData.damage * 0.2 - this.defense);
      this.health = Math.max(0, this.health - dmg);
      this.hitFlash = Math.max(this.hitFlash, 5);
      this._clearAttackContext();
      this.vx = (this.x > attackerX ? 1 : -1) * attackData.knockback * 0.3;
      this.vy = Math.min(this.vy, 0);
      this.attackHasHit = false;
      this.dashTimer = 0;
      this.blockstunTimer = Math.max(4, Math.round(attackData.blockstun || 8));
      this.stateTimer = this.blockstunTimer;
      this.hitstunTimer = 0;
      return false; // Blocked
    }

    const dmg = Math.max(1, attackData.damage - this.defense);
    this.health = Math.max(0, this.health - dmg);
    this.hitFlash = 8;
    this._setState("HIT");
    this._clearAttackContext();
    this.hitstunTimer = Math.max(
      8,
      Math.round(attackData.hitstun || 10 + (attackData.knockback || 0) * 1.2),
    );
    this.blockstunTimer = 0;
    this.stateTimer = this.hitstunTimer;
    this.attackHasHit = false;
    this.dashTimer = 0;
    this.comboHitCount = 0;
    this.comboHitTimer = 0;

    // Knockback
    const dir = this.x > attackerX ? 1 : -1;
    this.vx = dir * attackData.knockback;
    this.vy = -attackData.knockback * 0.5;
    this.grounded = false;

    if (this.health <= 0) {
      this._setState("KO");
      this._clearAttackContext();
      this.hitstunTimer = 0;
      this.blockstunTimer = 0;
      this.stateTimer = 60;
    }

    return true; // Hit landed
  }

  _getExistingAnimationKey(candidate) {
    if (!candidate || !this.animations) return null;
    if (this.animations[candidate]) return candidate;
    const target = String(candidate).toUpperCase();
    for (const key of Object.keys(this.animations)) {
      if (String(key).toUpperCase() === target) return key;
    }
    return null;
  }

  _isDashLikeState(state = this.state) {
    const s = String(state || "").toUpperCase();
    return s === "DASH" || s === "TELEPORT" || s === "SPECIAL_TELEPORT";
  }

  _resolveTeleportAnimationState() {
    return (
      this._getExistingAnimationKey("SPECIAL_TELEPORT") ||
      this._getExistingAnimationKey("TELEPORT") ||
      this._getExistingAnimationKey("DASH") ||
      this._getExistingAnimationKey("RUN") ||
      this._getExistingAnimationKey("IDLE") ||
      "DASH"
    );
  }

  _getAnimationPlaybackDuration(state = this.state, fallback = 8) {
    const animKey = this._resolveAnimationStateKey(state);
    const anim = this.animations?.[animKey];
    if (!anim) return Math.max(1, Number(fallback) || 8);

    const frameCount = Math.max(1, Number(anim.frames) || 1);
    let frameDurations = Array.isArray(anim.frameDurations)
      ? anim.frameDurations
      : null;
    if (!frameDurations || !frameDurations.length) {
      const step = Math.max(1, Number(anim.speed) || 8);
      frameDurations = Array.from({ length: frameCount }, () => step);
    }

    const total = frameDurations
      .slice(0, frameCount)
      .reduce((sum, value) => sum + Math.max(1, Number(value) || 1), 0);
    return Math.max(1, Math.round(total || fallback || 8));
  }

  _findAnimationKeyByPrefix(prefix) {
    if (!prefix || !this.animations) return null;
    const target = String(prefix).toUpperCase();
    for (const key of Object.keys(this.animations)) {
      if (String(key).toUpperCase().startsWith(target)) return key;
    }
    return null;
  }

  getRenderPose(_camera, _renderer, _spriteInfo) {
    return null;
  }

  _clamp01(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, value));
  }

  _getLoopPhase(period = 24) {
    const safePeriod = Math.max(1, Number(period) || 24);
    const time = Number(this.renderMotionTime) || 0;
    return (((time % safePeriod) + safePeriod) % safePeriod) / safePeriod;
  }

  _getAttackProgress(fallbackDuration = 1) {
    if (!this.isAttacking()) return 0;
    const duration = Math.max(
      1,
      Number(this.currentAttackDuration) || Number(fallbackDuration) || 1,
    );
    const timer = Math.max(0, Number(this.stateTimer) || 0);
    return this._clamp01(1 - timer / duration);
  }

  _getAttackElapsedFrames(attackData = this.currentAttackData) {
    if (!attackData || !this.isAttacking()) return 0;
    const duration = Math.max(
      1,
      Number(attackData.duration) || Number(this.currentAttackDuration) || 1,
    );
    const timer = Math.max(0, Number(this.stateTimer) || 0);
    return Math.max(0, duration - timer);
  }

  isAttackActiveFrame(attackData = this.currentAttackData) {
    if (!attackData || attackData.noHit) return false;
    const duration = Math.max(1, Number(attackData.duration) || 1);
    const start = Math.max(
      0,
      Math.min(duration - 1, Math.round(Number(attackData.activeStart) || 0)),
    );
    const end = Math.max(
      start + 1,
      Math.min(duration, Math.round(Number(attackData.activeEnd) || duration)),
    );
    const elapsed = this._getAttackElapsedFrames(attackData);
    return elapsed >= start && elapsed < end;
  }

  getAttackPhase(attackData = this.currentAttackData) {
    if (!attackData || !this.isAttacking()) return "neutral";
    const duration = Math.max(1, Number(attackData.duration) || 1);
    const activeStart = Math.max(
      0,
      Math.min(duration - 1, Math.round(Number(attackData.activeStart) || 0)),
    );
    const activeEnd = Math.max(
      activeStart + 1,
      Math.min(duration, Math.round(Number(attackData.activeEnd) || duration)),
    );
    const elapsed = this._getAttackElapsedFrames(attackData);
    if (elapsed < activeStart) return "startup";
    if (elapsed < activeEnd) return "active";
    return "recovery";
  }

  _getStateProgress(fallbackDuration = 12) {
    const duration = Math.max(1, Number(fallbackDuration) || 12);
    const timer = Math.max(0, Number(this.stateTimer) || 0);
    return this._clamp01(1 - Math.min(duration, timer) / duration);
  }

  _getWindowPulse(progress, start = 0, end = 1) {
    const p = this._clamp01(progress);
    const a = this._clamp01(start);
    const b = Math.max(a + 0.001, this._clamp01(end));
    if (p <= a || p >= b) return 0;
    const t = (p - a) / (b - a);
    return Math.sin(t * Math.PI);
  }

  _resolveAnimationStateKey(state = this.state) {
    const exact = this._getExistingAnimationKey(state);
    if (exact) return exact;

    const s = String(state || "").toUpperCase();
    const fallbacks = [];
    if (s.startsWith("ATTACK_LIGHT")) {
      fallbacks.push("ATTACK_LIGHT");
    } else if (s.startsWith("ATTACK_HEAVY")) {
      fallbacks.push("ATTACK_HEAVY", "ATTACK_LIGHT");
    } else if (
      s === "RUN_ATTACK" ||
      s === "THROW" ||
      s === "CROUCH_THROW" ||
      s === "CROUCH_ATTACK"
    ) {
      fallbacks.push(s, "ATTACK_HEAVY", "ATTACK_LIGHT");
    } else if (
      s.startsWith("SPECIAL") ||
      s === "CHIDORI_LONG" ||
      s === "KAMUI" ||
      s === "TSUKUYOMI" ||
      s === "AMATERASU" ||
      s === "KOMA_SUPPORT"
    ) {
      fallbacks.push("SPECIAL", "ATTACK_HEAVY", "ATTACK_LIGHT");
    } else if (s === "CROUCH" || s === "CROUCH_WALK") {
      fallbacks.push("CROUCH", "IDLE");
    } else if (s === "RUN") {
      fallbacks.push("RUN", "WALK", "IDLE");
    } else if (s === "CHARGE") {
      fallbacks.push("CHARGE", "IDLE");
    } else if (s === "DASH") {
      fallbacks.push("DASH", "RUN", "WALK", "IDLE");
    } else if (s === "BLOCK") {
      fallbacks.push("BLOCK", "IDLE");
    } else if (s === "HIT" || s === "KO") {
      fallbacks.push(s, "HIT", "IDLE");
    } else if (s === "JUMP") {
      fallbacks.push("JUMP", "IDLE");
    }

    for (const key of fallbacks) {
      const resolved = this._getExistingAnimationKey(key);
      if (resolved) return resolved;
    }

    if (s.startsWith("ATTACK_LIGHT")) {
      const prefixed = this._findAnimationKeyByPrefix("ATTACK_LIGHT");
      if (prefixed) return prefixed;
    }
    if (s.startsWith("ATTACK_HEAVY")) {
      const prefixed = this._findAnimationKeyByPrefix("ATTACK_HEAVY");
      if (prefixed) return prefixed;
    }
    if (s.startsWith("SPECIAL") || s === "CHIDORI_LONG" || s === "KAMUI" || s === "TSUKUYOMI" || s === "AMATERASU") {
      const prefixed = this._findAnimationKeyByPrefix("SPECIAL");
      if (prefixed) return prefixed;
    }

    return (
      this._getExistingAnimationKey("IDLE") ||
      Object.keys(this.animations || {})[0] ||
      "IDLE"
    );
  }

  getCurrentFrame() {
    const animKey = this._resolveAnimationStateKey(this.state);
    const anim = this.animations[animKey] || this.animations.IDLE;
    const maxFrame = Math.max(0, (anim.frames || 1) - 1);
    const clampedFrame = Math.max(0, Math.min(this.animFrame, maxFrame));
    return {
      x: clampedFrame * this.frameWidth,
      y: anim.row * this.frameHeight,
    };
  }

  _updateAnimation(dtScale = 1) {
    const animKey = this._resolveAnimationStateKey(this.state);
    const anim = this.animations[animKey] || this.animations.IDLE;
    const frameCount = Math.max(1, anim.frames || 1);
    // Safety clamp: prevent stale animFrame from previous state overflowing current animation
    if (this.animFrame >= frameCount) this.animFrame = frameCount - 1;
    if (this.animFrame < 0) this.animFrame = 0;
    let frameDurations = Array.isArray(anim.frameDurations)
      ? anim.frameDurations
      : null;
    if (!frameDurations || !frameDurations.length) {
      const step = Math.max(1, anim.speed || 8);
      frameDurations = Array.from({ length: frameCount }, () => step);
    }

    // Attack animations should map exactly to their stateTimer duration.
    if (this.isAttacking() && frameCount >= 1) {
      const lastFrame = frameCount - 1;

      const duration = Math.max(1, this.currentAttackDuration || 1);
      const safeTimer = isNaN(this.stateTimer) ? 0 : this.stateTimer;
      // How much time has passed out of the total duration
      const elapsed = Math.max(0, duration - Math.max(0, safeTimer));
      const progress = Math.min(1, Math.max(0, elapsed / duration));

      // Map progress to the frame index
      let targetFrame = Math.floor(progress * frameCount);
      if (isNaN(targetFrame)) targetFrame = 0;
      this.animFrame = Math.max(0, Math.min(lastFrame, targetFrame));

      this.animFrameTimer = 0;
      this.animTimer = 0;
      return;
    }

    // HIT and KO should play once and freeze on the final frame
    if ((this.state === "HIT" || this.state === "KO" || this.state === "BLOCK") && frameCount >= 1) {
      const lastFrame = frameCount - 1;

      if (this.animFrame < lastFrame) {
        this.animFrameTimer += isNaN(dtScale) ? 1 : dtScale;
        let safety = 0;
        while (this.animFrame < lastFrame && safety < 16) {
          const idx = isNaN(this.animFrame) ? 0 : this.animFrame;
          const frameStep = Math.max(
            1,
            Number(frameDurations[idx % frameDurations.length]) ||
            Math.max(1, anim.speed || 8)
          );
          if (this.animFrameTimer < frameStep) break;
          this.animFrameTimer -= frameStep;
          this.animFrame = (isNaN(this.animFrame) ? 0 : this.animFrame) + 1;
          safety += 1;
        }
      } else {
        this.animFrameTimer = 0;
      }
      this.animTimer = 0;
      return;
    }

    // Jump should not loop like walk/idle: use frame 0 while rising, frame 1 while falling.
    if (this.state === "JUMP" && frameCount >= 2) {
      this.animTimer = 0;
      this.animFrameTimer = 0;
      this.animFrame = this.vy < 0 ? 0 : 1;
      return;
    }

    let paceScale = 1;
    if (
      this.state === "WALK" ||
      this.state === "RUN" ||
      this.state === "CROUCH_WALK"
    ) {
      const baseMove = Math.max(0.001, this.speed || 1);
      const velocityRatio = Math.abs(this.vx || 0) / baseMove;
      paceScale = Math.max(0.55, Math.min(1.85, velocityRatio || 1));
    }

    this.animFrameTimer += dtScale * paceScale;
    const frameStep = Math.max(
      1,
      Number(frameDurations[this.animFrame % frameDurations.length]) ||
      Math.max(1, anim.speed || 8),
    );
    if (this.animFrameTimer >= frameStep) {
      this.animFrameTimer -= frameStep;
      this.animFrame = (this.animFrame + 1) % frameCount;
    }
  }

  // Health percentage
  getHealthPercent() {
    return this.health / this.maxHealth;
  }

  // Chakra percentage
  getChakraPercent() {
    return this.chakra / this.maxChakra;
  }

  // Stamina percentage
  getStaminaPercent() {
    return this.stamina / this.maxStamina;
  }
}
