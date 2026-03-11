/* ============================================
   SASORI — Character Entity
   ============================================ */

class SasoriFighter extends Fighter {
  constructor(config) {
    super({
      name: 'SASORI',
      color: '#8E5A2B',
      speed: 3.8,
      jumpPower: -11.0,
      attackPower: 12,
      defense: 1.2,
      maxHealth: 102,
      maxChakra: 122,
      chakraRegen: 0.15,
      ...config,
    });

    this.attacks.special = {
      ...this.attacks.special,
      damage: 27,
      range: 88,
      duration: 42,
      chakraCost: 34,
      knockback: 11,
      name: 'PUPPET ASSAULT',
    };

    this.specialStyles = {
      ...this.specialStyles,
      a: {
        name: 'PUPPET STRIKE',
        state: 'SPECIAL',
        profileOverrides: {
          duration: 36,
          damageMultiplier: 1.1,
          rangeMultiplier: 1.2,
          knockbackMultiplier: 1.1,
          moveSpeed: 1.2,
        },
        projectile: {
          fxProfileId: 'PUPPET_STRIKE',
          spawnFrame: 12,
          damage: 24,
          knockback: 9,
        },
      },
      s1: {
        name: 'IRON SAND',
        state: 'SPECIAL_TRANSFORM',
        profileOverrides: {
          duration: 34,
          damageMultiplier: 1.0,
          rangeMultiplier: 1.1,
          knockbackMultiplier: 1.0,
          moveSpeed: 0.5,
        },
      },
      s2: {
        name: 'PUPPET FLURRY',
        state: 'ATTACK_HEAVY_2',
        profileOverrides: {
          duration: 30,
          damageMultiplier: 1.22,
          rangeMultiplier: 1.12,
          knockbackMultiplier: 1.18,
          moveSpeed: 2.2,
        },
      },
      s3: {
        name: 'PUPPET DASH',
        state: 'RUN_ATTACK',
        profileOverrides: {
          duration: 22,
          damageMultiplier: 0.96,
          rangeMultiplier: 1.0,
          knockbackMultiplier: 0.9,
          moveSpeed: 4.0,
        },
      },
      s4: {
        name: 'PUPPET BOMBS',
        state: 'SPECIAL',
        profileOverrides: {
          duration: 44,
          damageMultiplier: 1.35,
          rangeMultiplier: 1.2,
          knockbackMultiplier: 1.4,
          moveSpeed: 0.4,
        },
        projectile: {
          fxProfileId: 'CLAY_BOMB',
          spawnFrame: 14,
          damage: 30,
          knockback: 12,
        },
      },
    };
  }
}
