/* ============================================
   KABUTO — Character Entity
   ============================================ */

class KabutoFighter extends Fighter {
  constructor(config) {
    super({
      name: 'KABUTO',
      color: '#78909C',
      speed: 3.5,
      jumpPower: -11,
      attackPower: 11,
      defense: 1.3,
      maxHealth: 110,
      maxChakra: 120,
      chakraRegen: 0.16,
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
      name: 'Chakra Scalpel',
    };
  }
}
