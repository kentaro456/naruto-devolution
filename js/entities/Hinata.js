/* ============================================
   HINATA — Character Entity
   ============================================ */

class HinataFighter extends Fighter {
  constructor(config) {
    super({
      name: 'HINATA',
      color: '#7986CB',
      speed: 3.5,
      jumpPower: -11.2,
      attackPower: 11,
      defense: 1.3,
      maxHealth: 100,
      maxChakra: 110,
      chakraRegen: 0.13,
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
      name: 'Gentle Fist',
    };
  }
}
