/* ============================================
   KISAME — Character Entity
   ============================================ */

class KisameFighter extends Fighter {
    constructor(config) {
        super({
            name: 'KISAME',
            color: '#0E6BA8',
            speed: 5.2,
            jumpPower: -10,
            attackPower: 14,
            defense: 7,
            maxHealth: 110,
            maxChakra: 90,
            chakraRegen: 0.05,
            displayScale: 1.6, // Added explicitly since his native sprite is 150px tall
            ...config,
        });

        // Kisame relies on heavy hits and a potent projectile special
        this.attacks = {
            light: { damage: 10, range: 42, hitHeight: 32, duration: 22, chakraCost: 0, knockback: 4, offsetY: -10 },
            heavy: { damage: 18, range: 50, hitHeight: 36, duration: 32, chakraCost: 0, knockback: 7, offsetY: -6 },
            special: {
                damage: 30,
                range: 60,
                hitHeight: 40,
                duration: 45,
                chakraCost: 40,
                knockback: 14,
                offsetY: -90, // Adjusted to spawn from his chest/center instead of feet
                name: 'WATER SHARK BOMB',
                projectile: {
                    kind: 'water_shark',
                    spawnFrame: 18,
                    speed: 14,
                    width: 50,
                    height: 50,
                    life: 120,
                    color: '#00BFFF',
                    spinSpeed: 0,
                }
            },
        };

        this.comboCancelRatio = 0.6;
    }
}
