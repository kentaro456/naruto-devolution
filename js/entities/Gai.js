/* ============================================
   GAI — Character Entity
   ============================================ */

class GaiFighter extends Fighter {
  constructor(config) {
    super({
      name: 'GAI',
      color: '#2E7D32',
      speed: 4.6,
      jumpPower: -12.2,
      attackPower: 12,
      defense: 1.1,
      maxHealth: 98,
      maxChakra: 95,
      chakraRegen: 0.09,
      ...config,
    });

    this.attacks.light = { ...this.attacks.light, duration: 9, knockback: 2.8 };
    this.attacks.heavy = { ...this.attacks.heavy, duration: 17, knockback: 6.8 };
    this.attacks.special = {
      ...this.attacks.special,
      damage: 29,
      range: 76,
      duration: 34,
      chakraCost: 30,
      knockback: 13,
      moveSpeed: 4.2,
      name: 'MORNING PEACOCK',
    };

    this.specialStyles = {
      ...this.specialStyles,
      a: {
        name: 'PRIMARY LOTUS',
        state: 'SPECIAL',
        profileOverrides: {
          duration: 30,
          damageMultiplier: 1.1,
          rangeMultiplier: 1.1,
          knockbackMultiplier: 1.2,
          moveSpeed: 4.5,
        },
      },
      s1: {
        name: 'LEAF HURRICANE',
        state: 'ATTACK_HEAVY_2',
        profileOverrides: {
          duration: 24,
          damageMultiplier: 1.2,
          rangeMultiplier: 1.12,
          knockbackMultiplier: 1.25,
          moveSpeed: 3.2,
        },
      },
      s2: {
        name: 'INNER GATE',
        state: 'SPECIAL_TRANSFORM',
        profileOverrides: {
          duration: 36,
          damageMultiplier: 1.05,
          rangeMultiplier: 1.0,
          knockbackMultiplier: 0.95,
          moveSpeed: 0.7,
        },
      },
      s3: {
        name: 'DYNAMIC ENTRY',
        state: 'RUN_ATTACK',
        profileOverrides: {
          duration: 20,
          damageMultiplier: 1.0,
          rangeMultiplier: 1.05,
          knockbackMultiplier: 1.0,
          moveSpeed: 5.2,
        },
      },
      s4: {
        name: 'MORNING PEACOCK',
        state: 'SPECIAL',
        profileOverrides: {
          duration: 38,
          damageMultiplier: 1.35,
          rangeMultiplier: 1.2,
          knockbackMultiplier: 1.4,
          moveSpeed: 2.0,
        },
      },
    };
  }
}
