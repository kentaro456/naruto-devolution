/* ============================================
   SAKON — Character Entity
   ============================================ */

class SakonFighter extends Fighter {
  constructor(config) {
    super({
      name: 'SAKON',
      color: '#4A148C',
      speed: 3.6,
      jumpPower: -11,
      attackPower: 13,
      defense: 1.15,
      maxHealth: 105,
      maxChakra: 100,
      chakraRegen: 0.12,
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
      name: 'Parasite Demon',
    };
  }
}
