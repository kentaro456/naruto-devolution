/* ============================================
   SHIKAMARU — Character Entity
   ============================================ */

class ShikamaruFighter extends Fighter {
  constructor(config) {
    super({
      name: 'SHIKAMARU',
      color: '#4CAF50',
      speed: 3.2,
      jumpPower: -10.5,
      attackPower: 10,
      defense: 1.4,
      maxHealth: 105,
      maxChakra: 100,
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
      name: 'Shadow Possession',
    };
  }
}
