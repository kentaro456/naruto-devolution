/* ============================================
   TEMARI — Character Entity
   ============================================ */

class TemariFighter extends Fighter {
  constructor(config) {
    super({
      name: 'TEMARI',
      color: '#26A69A',
      speed: 3.4,
      jumpPower: -11,
      attackPower: 13,
      defense: 1.1,
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
      name: 'Wind Scythe',
    };
  }
}
