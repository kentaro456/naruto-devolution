/* ============================================
   FX BANK — Shared projectile / VFX profiles
   ============================================ */

const PROJECTILE_POOL_BASE = 'assets/organized/characters/projectile_pool/pool/sb3_fullpack';
const NVS_SHARED_BASE = 'assets/organized/shared/sb3_nvs';
const SHARED_FULLPACK_BASE = 'assets/organized/shared/sb3_fullpack';
const KAKASHI_SHARED_BASE = 'assets/organized/shared/sb3/kakashi_new';
const DEIDARA_POOL_BASE = 'assets/organized/characters/deidara/pool/master_naruto_sprites_sb3';
const DEIDARA_SHARED_BASE = 'assets/organized/characters/deidara/frames';
const SASORI_SHARED_BASE = 'assets/organized/shared/sb3_fullpack';
const SASUKE_EMS_POOL_BASE = 'assets/organized/characters/sasuke_ems/pool/master_naruto_sprites_sb3';
const NARUTO_POOL_BASE = 'assets/organized/characters/naruto/pool/master_naruto_sprites_sb3';

const pngSeries = (base, stems = []) => stems.map((stem) => `${base}/${stem}.png`);

const FX_BANK = {
  CLAY_BIRD: {
    kind: 'claybird',
    imageFrames: [
      `${DEIDARA_POOL_BASE}/sprite1__11.png`,
      `${DEIDARA_POOL_BASE}/sprite1__12.png`,
      `${DEIDARA_POOL_BASE}/sprite1__13.png`,
      `${DEIDARA_POOL_BASE}/sprite1__14.png`,
      `${DEIDARA_POOL_BASE}/sprite1__15.png`,
      `${DEIDARA_SHARED_BASE}/clay_guy__jump5.png`,
    ],
    width: 48,
    height: 34,
    life: 70,
    speed: 10,
    imageScale: 0.9,
    rotateWithVelocity: false,
    color: '#d9d9d9',
  },

  CLAY_BOMB: {
    kind: 'claybomb',
    imageFrames: [
      `${SHARED_FULLPACK_BASE}/projectile__c1.png`,
      `${SHARED_FULLPACK_BASE}/projectile__c2.png`,
      `${SHARED_FULLPACK_BASE}/projectile__c3.png`,
      `${SHARED_FULLPACK_BASE}/projectile__c4.png`,
      `${SHARED_FULLPACK_BASE}/projectile__c5.png`,
      `${SHARED_FULLPACK_BASE}/projectile__c6.png`,
    ],
    explosionFrames: [
      `${SHARED_FULLPACK_BASE}/projectile__c4.png`,
      `${SHARED_FULLPACK_BASE}/projectile__c5.png`,
      `${SHARED_FULLPACK_BASE}/projectile__c6.png`,
      `${SHARED_FULLPACK_BASE}/projectile__c7.png`,
      `${SHARED_FULLPACK_BASE}/projectile__c8.png`,
      `${SHARED_FULLPACK_BASE}/projectile__c9.png`,
      `${SHARED_FULLPACK_BASE}/projectile__costume17.png`,
    ],
    width: 36,
    height: 36,
    life: 66,
    speed: 7,
    imageScale: 0.85,
    explosive: true,
    color: '#f2f2f2',
  },

  PUPPET_STRIKE: {
    kind: 'puppet_strike',
    imageFrames: [
      `${SASORI_SHARED_BASE}/sasori__puppet_stance_1.png`,
      `${SASORI_SHARED_BASE}/sasori__puppet_stance_2.png`,
      `${SASORI_SHARED_BASE}/sasori__puppet_stance_3.png`,
      `${SASORI_SHARED_BASE}/sasori__puppeteering_1.png`,
      `${SASORI_SHARED_BASE}/sasori__puppeteering_2.png`,
    ],
    width: 54,
    height: 42,
    life: 62,
    speed: 9,
    imageScale: 1.0,
    color: '#c8c8c8',
  },

  SAND_BURIAL: {
    kind: 'sandburial',
    imageFrames: [
      `${PROJECTILE_POOL_BASE}/projectile__sandburial1.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial2.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial3.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial4.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial5.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial6.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial7.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial8.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial9.png`,
    ],
    explosionFrames: [
      `${PROJECTILE_POOL_BASE}/projectile__sandburial10.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial11.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial12.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial13.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial14.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial15.png`,
      `${PROJECTILE_POOL_BASE}/projectile__sandburial16.png`,
    ],
    width: 44,
    height: 34,
    life: 74,
    speed: 7.4,
    imageScale: 0.95,
    rotateWithVelocity: false,
    explosive: true,
    color: '#c7a56a',
  },

  PHOENIX_FLAME: {
    kind: 'phoenix_flame',
    imageFrames: [
      `${PROJECTILE_POOL_BASE}/projectile__phoenixflame1.png`,
      `${PROJECTILE_POOL_BASE}/projectile__phoenixflame2.png`,
      `${PROJECTILE_POOL_BASE}/projectile__phoenixflame3.png`,
      `${PROJECTILE_POOL_BASE}/projectile__phoenixflame4.png`,
    ],
    width: 74,
    height: 54,
    life: 70,
    speed: 9.2,
    imageScale: 1.2,
    rotateWithVelocity: false,
    explosive: false,
    color: '#ff6d00',
  },

  FIREBALL_NVS: {
    kind: 'fireball_nvs',
    imageFrames: [
      `${NVS_SHARED_BASE}/fireball__01.png`,
      `${NVS_SHARED_BASE}/fireball__02.png`,
      `${NVS_SHARED_BASE}/fireball__03.png`,
      `${NVS_SHARED_BASE}/fireball__04.png`,
      `${NVS_SHARED_BASE}/fireball__05.png`,
      `${NVS_SHARED_BASE}/fireball__06.png`,
      `${NVS_SHARED_BASE}/fireball__07.png`,
      `${NVS_SHARED_BASE}/fireball__08.png`,
      `${NVS_SHARED_BASE}/fireball__09.png`,
      `${NVS_SHARED_BASE}/fireball__10.png`,
      `${NVS_SHARED_BASE}/fireball__11.png`,
      `${NVS_SHARED_BASE}/fireball__12.png`,
    ],
    width: 84,
    height: 62,
    life: 76,
    speed: 8.8,
    imageScale: 1.08,
    rotateWithVelocity: false,
    explosive: true,
    color: '#ff6a00',
  },

  FLASH_NVS: {
    kind: 'flash_nvs',
    imageFrames: [
      `${NVS_SHARED_BASE}/flash__01.png`,
      `${NVS_SHARED_BASE}/flash__02.png`,
    ],
    width: 110,
    height: 80,
    life: 20,
    speed: 0,
    imageScale: 1.0,
    rotateWithVelocity: false,
    visualOnly: true,
    color: '#f5f5f5',
  },

  RAIN_NVS: {
    kind: 'rain_nvs',
    imageFrames: [
      `${NVS_SHARED_BASE}/rain__01.png`,
      `${NVS_SHARED_BASE}/rain__02.png`,
      `${NVS_SHARED_BASE}/rain__03.png`,
      `${NVS_SHARED_BASE}/rain__04.png`,
      `${NVS_SHARED_BASE}/rain__05.png`,
      `${NVS_SHARED_BASE}/rain__06.png`,
      `${NVS_SHARED_BASE}/rain__07.png`,
      `${NVS_SHARED_BASE}/rain__08.png`,
    ],
    width: 128,
    height: 96,
    life: 60,
    speed: 0,
    imageScale: 1.0,
    rotateWithVelocity: false,
    visualOnly: true,
    color: '#9db5cf',
  },

  SHADOW_CLONE_ASSIST: {
    kind: 'shadow_clone_assist',
    imageFrames: [
      `${PROJECTILE_POOL_BASE}/projectile__shadowclones1.png`,
      `${PROJECTILE_POOL_BASE}/projectile__shadowclones2.png`,
      `${PROJECTILE_POOL_BASE}/projectile__shadowclones3.png`,
      `${PROJECTILE_POOL_BASE}/projectile__shadowclones4.png`,
      `${PROJECTILE_POOL_BASE}/projectile__shadowclones5.png`,
      `${PROJECTILE_POOL_BASE}/projectile__shadowclones6.png`,
      `${PROJECTILE_POOL_BASE}/projectile__shadowclones7.png`,
      `${PROJECTILE_POOL_BASE}/projectile__shadowclones8.png`,
      `${PROJECTILE_POOL_BASE}/projectile__shadowclones9.png`,
      `${PROJECTILE_POOL_BASE}/projectile__shadowclones10.png`,
    ],
    width: 62,
    height: 62,
    life: 56,
    speed: 8.4,
    imageScale: 1.0,
    rotateWithVelocity: false,
    color: '#ffb347',
  },

  KUNAI_BASIC: {
    kind: 'kunai',
    imagePath: 'assets/organized/shared/sb3/kakashi_new_kunai_1bbd5e3413dd4843a707d8269c761a1f.png',
    width: 24,
    height: 8,
    speed: 9,
    life: 80,
    rotateWithVelocity: true,
    color: '#d6dfe8',
  },
};

const PROJECTILE_VISUAL_BANK = {
  GAMABUNTA_FIRE: {
    imageFrames: pngSeries(NVS_SHARED_BASE, [
      'fireball__01',
      'fireball__02',
      'fireball__03',
      'fireball__04',
      'fireball__05',
      'fireball__06',
      'fireball__07',
      'fireball__08',
      'fireball__09',
      'fireball__10',
      'fireball__11',
      'fireball__12',
    ]),
    imageScale: 1.35,
    rotateWithVelocity: false,
  },
  rasenshuriken: {
    imageFrames: pngSeries(PROJECTILE_POOL_BASE, [
      'projectile__rasenshuriken',
      'projectile__rasenshuriken1',
      'projectile__rasenshuriken2',
      'projectile__rasenshuriken3',
      'projectile__rasenshuriken4',
      'projectile__rasenshuriken6',
      'projectile__rasenshuriken7',
      'projectile__rasenshuriken8',
      'projectile__rasenshuriken9',
      'projectile__rasenshuriken10',
    ]),
    imageScale: 1.05,
    rotateWithVelocity: false,
  },
  windattack1: {
    imageFrames: pngSeries(PROJECTILE_POOL_BASE, [
      'projectile__windattack1',
      'projectile__windattack2',
      'projectile__windattack3',
      'projectile__windattack4',
      'projectile__windattack5',
      'projectile__windattack6',
      'projectile__windattack7',
      'projectile__windattack8',
      'projectile__windattack9',
    ]),
    imageScale: 1.0,
    rotateWithVelocity: false,
  },
  EarthJutsu: {
    imageFrames: pngSeries(PROJECTILE_POOL_BASE, [
      'projectile__earthjutsu',
      'projectile__earthjutsu1',
      'projectile__earthjutsu2',
      'projectile__earthjutsu3',
      'projectile__earthjutsu4',
      'projectile__earthjutsu5',
      'projectile__earthjutsu6',
      'projectile__earthjutsu7',
      'projectile__earthjutsu8',
      'projectile__earthjutsu9',
      'projectile__earthjutsu10',
      'projectile__earthjutsu11',
      'projectile__earthjutsu12',
    ]),
    imageScale: 1.08,
    rotateWithVelocity: false,
  },
  fireball_small: {
    imageFrames: pngSeries(PROJECTILE_POOL_BASE, [
      'projectile__phoenixflame1',
      'projectile__phoenixflame2',
      'projectile__phoenixflame3',
      'projectile__phoenixflame4',
    ]),
    imageScale: 1.0,
    rotateWithVelocity: false,
  },
  style4_burst: {
    imageFrames: pngSeries(SHARED_FULLPACK_BASE, [
      'projectile__c1',
      'projectile__c2',
      'projectile__c3',
      'projectile__c4',
      'projectile__c5',
      'projectile__c6',
      'projectile__c7',
      'projectile__c8',
      'projectile__c9',
    ]),
    imageScale: 0.92,
    rotateWithVelocity: false,
  },
  hiraishin_kunai: {
    imagePath: `${KAKASHI_SHARED_BASE}/kunai__kunai_special.png`,
    imageScale: 0.95,
    rotateWithVelocity: true,
  },
  water_shark: {
    imageFrames: pngSeries(NARUTO_POOL_BASE, [
      'naruto__water_jutsu',
      'naruto__water_jutsu2',
      'naruto__water_jutsu3',
      'naruto__water_jutsu4',
      'naruto__water_jutsu5',
      'naruto__water_jutsu6',
      'naruto__water_jutsu7',
      'naruto__water_jutsu8',
    ]),
    imageScale: 1.18,
    rotateWithVelocity: false,
  },
  susanoo_arrow: {
    imageFrames: pngSeries(SASUKE_EMS_POOL_BASE, [
      'sasuke_eternal__susanoo',
      'sasuke_eternal__susanoo2',
    ]),
    imageScale: 1.25,
    rotateWithVelocity: true,
  },
  susanoo_slash: {
    imageFrames: pngSeries(SASUKE_EMS_POOL_BASE, [
      'sasuke_eternal__susanoo',
      'sasuke_eternal__susanoo2',
    ]),
    imageScale: 1.42,
    rotateWithVelocity: true,
  },
  default: {
    imagePath: `${PROJECTILE_POOL_BASE}/projectile__kunai.png`,
    imageScale: 0.95,
    rotateWithVelocity: true,
  },
};

const PROJECTILE_VISUAL_ALIASES = {
  earthjutsu: 'EarthJutsu',
  fireball: 'fireball_small',
  phoenixflame1: 'phoenix_flame',
  shadowclones1: 'shadow_clone_assist',
  windattack: 'windattack1',
};

function cloneProjectileVisualProfile(profile) {
  if (!profile) return null;
  const cloned = { ...profile };
  if (profile._isDefaultProjectileVisual) cloned._isDefaultProjectileVisual = true;
  if (Array.isArray(profile.imageFrames)) cloned.imageFrames = [...profile.imageFrames];
  if (Array.isArray(profile.explosionFrames)) cloned.explosionFrames = [...profile.explosionFrames];
  if (profile.spriteConfig && typeof profile.spriteConfig === 'object') {
    cloned.spriteConfig = { ...profile.spriteConfig };
  }
  return cloned;
}

function resolveProjectileVisualProfile(projectileOrKind, options = {}) {
  const projectile = projectileOrKind && typeof projectileOrKind === 'object'
    ? projectileOrKind
    : null;
  const rawKind = projectile ? projectile.kind : projectileOrKind;
  const fxProfileId = projectile ? projectile.fxProfileId : options.fxProfileId;
  const allowDefault = !!options.allowDefault;
  const exactKind = typeof rawKind === 'string' ? rawKind.trim() : '';
  const lowerKind = exactKind.toLowerCase();
  const aliasKind = PROJECTILE_VISUAL_ALIASES[exactKind] || PROJECTILE_VISUAL_ALIASES[lowerKind] || exactKind;

  const tryResolve = (key) => {
    if (!key) return null;
    if (PROJECTILE_VISUAL_BANK[key]) return cloneProjectileVisualProfile(PROJECTILE_VISUAL_BANK[key]);
    if (FX_BANK[key]) return cloneProjectileVisualProfile(FX_BANK[key]);
    const fxMatch = Object.values(FX_BANK).find((entry) => entry?.kind === key);
    return cloneProjectileVisualProfile(fxMatch);
  };

  const resolved = tryResolve(fxProfileId) || tryResolve(aliasKind) || tryResolve(exactKind);
  if (resolved) return resolved;
  if (!allowDefault) return null;
  const fallback = cloneProjectileVisualProfile(PROJECTILE_VISUAL_BANK.default);
  if (fallback) fallback._isDefaultProjectileVisual = true;
  return fallback;
}

if (typeof window !== 'undefined') {
  window.FX_BANK = FX_BANK;
  window.PROJECTILE_VISUAL_BANK = PROJECTILE_VISUAL_BANK;
  window.resolveProjectileVisualProfile = resolveProjectileVisualProfile;
}
