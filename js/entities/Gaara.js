/* ============================================
   GAARA — Character Entity
   ============================================ */

class GaaraFighter extends Fighter {
  constructor(config) {
    super({
      name: 'GAARA',
      color: '#C19A6B',
      speed: 3.4,
      jumpPower: -10.8,
      attackPower: 13,
      defense: 1.35,
      maxHealth: 108,
      maxChakra: 120,
      chakraRegen: 0.14,
      ...config,
    });

    this.attacks.special = {
      ...this.attacks.special,
      damage: 30,
      range: 120,
      hitHeight: 46,
      duration: 46,
      chakraCost: 36,
      knockback: 12,
      name: 'SAND BURIAL',
    };

    // Gaara fights as a long-range sand controller.
    this.attacks.light = {
      ...this.attacks.light,
      range: 58,
      hitHeight: 34,
      duration: 16,
      knockback: 3.6,
    };
    this.attacks.heavy = {
      ...this.attacks.heavy,
      range: 76,
      hitHeight: 40,
      duration: 28,
      knockback: 7.2,
    };

    this.specialStyles = {
      ...this.specialStyles,
      a: {
        name: 'SAND BURIAL',
        state: 'SPECIAL',
        profileOverrides: {
          duration: 42,
          damageMultiplier: 1.15,
          rangeMultiplier: 1.3,
          knockbackMultiplier: 1.2,
          moveSpeed: 0.6,
        },
        projectile: {
          fxProfileId: 'SAND_BURIAL',
          spawnFrame: 10,
          damage: 28,
          knockback: 10.5,
          speed: 7.6,
          life: 76,
        },
      },
      s1: {
        name: 'SAND COFFIN',
        state: 'SPECIAL_TRANSFORM',
        profileOverrides: {
          duration: 38,
          damageMultiplier: 1.08,
          rangeMultiplier: 1.1,
          knockbackMultiplier: 1.0,
          moveSpeed: 0.4,
        },
        projectile: {
          fxProfileId: 'SAND_BURIAL',
          spawnFrame: 14,
          damage: 24,
          knockback: 9,
          speed: 6.6,
          life: 84,
          width: 50,
          height: 40,
        },
      },
      s2: {
        name: 'SAND SPEAR',
        state: 'ATTACK_HEAVY_2',
        profileOverrides: {
          duration: 32,
          damageMultiplier: 1.2,
          rangeMultiplier: 1.2,
          knockbackMultiplier: 1.35,
          moveSpeed: 1.0,
        },
        projectile: {
          fxProfileId: 'SAND_BURIAL',
          spawnFrame: 8,
          damage: 30,
          knockback: 12,
          speed: 8.2,
          life: 68,
          width: 38,
          height: 30,
        },
      },
      s3: {
        name: 'DESERT DASH',
        state: 'RUN_ATTACK',
        profileOverrides: {
          duration: 24,
          damageMultiplier: 0.95,
          rangeMultiplier: 1.0,
          knockbackMultiplier: 0.85,
          moveSpeed: 4.8,
        },
      },
      s4: {
        name: 'SAND TSUNAMI',
        state: 'SPECIAL',
        profileOverrides: {
          duration: 54,
          damageMultiplier: 1.4,
          rangeMultiplier: 1.6,
          knockbackMultiplier: 1.5,
          moveSpeed: 0.3,
        },
        projectile: {
          fxProfileId: 'SAND_BURIAL',
          spawnFrame: 12,
          damage: 36,
          knockback: 14,
          speed: 6.2,
          life: 88,
          width: 56,
          height: 44,
        },
      },
    };
  }
}
