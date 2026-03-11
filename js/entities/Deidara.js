/* ============================================
   DEIDARA — Character Entity
   ============================================ */

class DeidaraFighter extends Fighter {
  constructor(config) {
    super({
      name: 'DEIDARA',
      color: '#FFD54F',
      speed: 4.0,
      jumpPower: -12.0,
      attackPower: 13,
      defense: 0.95,
      maxHealth: 95,
      maxChakra: 120,
      chakraRegen: 0.14,
      ...config,
    });

    this.attacks = {
      light: { damage: 8, range: 40, hitHeight: 30, duration: 12, chakraCost: 0, knockback: 3.2, offsetY: -10 },
      heavy: { damage: 15, range: 50, hitHeight: 35, duration: 22, chakraCost: 0, knockback: 6.2, offsetY: -8 },
      special: { damage: 36, range: 110, hitHeight: 52, duration: 46, chakraCost: 38, knockback: 14, offsetY: -14, moveSpeed: 0.8, name: 'C3 DETONATION' },
    };

    this.specialStyles = {
      ...this.specialStyles,
      a: {
        name: 'C1 BIRD',
        state: 'SPECIAL',
        profileOverrides: {
          duration: 36,
          damageMultiplier: 1.0,
          rangeMultiplier: 1.1,
          knockbackMultiplier: 1.0,
          moveSpeed: 0.9,
        },
        projectile: {
          fxProfileId: 'CLAY_BIRD',
          spawnFrame: 8,
          damage: 22,
          knockback: 8,
          speed: 10.8,
          life: 80,
          spinSpeed: 0,
          rotateWithVelocity: false,
        },
      },
      s1: {
        name: 'C2 DRAGON',
        state: 'ATTACK_LIGHT_2',
        profileOverrides: {
          duration: 40,
          damageMultiplier: 1.12,
          rangeMultiplier: 1.22,
          knockbackMultiplier: 1.1,
          moveSpeed: 0.7,
        },
        projectile: {
          fxProfileId: 'CLAY_BIRD',
          spawnFrame: 11,
          damage: 28,
          knockback: 10,
          speed: 9.8,
          life: 86,
          width: 52,
          height: 36,
          spinSpeed: 0,
          rotateWithVelocity: false,
        },
      },
      s2: {
        name: 'C3 BOMB',
        state: 'ATTACK_HEAVY_1',
        profileOverrides: {
          duration: 46,
          damageMultiplier: 1.2,
          rangeMultiplier: 1.35,
          knockbackMultiplier: 1.22,
          moveSpeed: 0.45,
        },
        projectile: {
          fxProfileId: 'CLAY_BOMB',
          spawnFrame: 12,
          damage: 32,
          knockback: 12.5,
          life: 78,
          speed: 6.7,
          width: 48,
          height: 48,
          spinSpeed: 0,
          rotateWithVelocity: false,
        },
      },
      s3: {
        name: 'C4 MICRO BOMB',
        state: 'ATTACK_HEAVY_2',
        profileOverrides: {
          duration: 42,
          damageMultiplier: 1.16,
          rangeMultiplier: 1.28,
          knockbackMultiplier: 1.1,
          moveSpeed: 0.6,
        },
        projectile: {
          fxProfileId: 'CLAY_BOMB',
          spawnFrame: 10,
          damage: 30,
          knockback: 11,
          life: 74,
          speed: 8.4,
          width: 34,
          height: 34,
          spinSpeed: 0,
          rotateWithVelocity: false,
        },
      },
      s4: {
        name: 'C3 DETONATION',
        state: 'ATTACK_LIGHT_3',
        profileOverrides: {
          duration: 50,
          damageMultiplier: 1.3,
          rangeMultiplier: 1.45,
          knockbackMultiplier: 1.45,
          moveSpeed: 0.3,
        },
        projectile: {
          fxProfileId: 'CLAY_BOMB',
          spawnFrame: 13,
          damage: 34,
          knockback: 13,
          life: 74,
          speed: 6.5,
          width: 56,
          height: 56,
          spinSpeed: 0,
          rotateWithVelocity: false,
        },
      },
    };

  }
}
