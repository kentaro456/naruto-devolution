/* ============================================
   OROCHIMARU — Character Entity
   ============================================ */

class OrochimaruFighter extends Fighter {
  constructor(config) {
    super({
      name: 'OROCHIMARU',
      color: '#9C27B0',
      speed: 3.6,
      jumpPower: -11,
      attackPower: 14,
      defense: 1.2,
      maxHealth: 115,
      maxChakra: 130,
      chakraRegen: 0.15,
      ...config,
    });

    this.attacks.special = {
      ...this.attacks.special,
      damage: 28,
      range: 80,
      hitHeight: 44,
      duration: 42,
      chakraCost: 34,
      knockback: 11,
      name: 'Hidden Shadow Snake',
    };
  }
}
