class JiraiyaFighter extends Fighter {
    constructor(config) {
        super({
            name: 'JIRAIYA',
            color: '#B22222',
            speed: 3.5,
            jumpPower: -11.0,
            attackPower: 14,
            defense: 1.1,
            maxHealth: 105,
            maxChakra: 120,
            chakraRegen: 0.16,
            crouchEnabled: true,
            dashSpeedMultiplier: 3.5,
            dashDuration: 12,
            ...config,
        });

        this.attacks = {
            light: { damage: 8, range: 45, hitHeight: 35, duration: 16, chakraCost: 0, knockback: 3 },
            heavy: { damage: 16, range: 55, hitHeight: 40, duration: 24, chakraCost: 0, knockback: 6 },
            special: { damage: 40, range: 250, hitHeight: 60, duration: 220, chakraCost: 50, knockback: 20, offsetY: -40, name: 'TOAD FLAME BULLET' }
        };

        // Proper 3-hit combo chains mapping to our ATTACK_LIGHT_1,2,3 and ATTACK_HEAVY_1,2,3
        this.comboChains = {
            light: [
                { duration: 14, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 0.8 },
                { duration: 16, damageMultiplier: 1.1, rangeMultiplier: 1.1, knockbackMultiplier: 1.0 },
                { duration: 22, damageMultiplier: 1.3, rangeMultiplier: 1.2, knockbackMultiplier: 1.5 }
            ],
            heavy: [
                { duration: 18, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 1.0 },
                { duration: 22, damageMultiplier: 1.2, rangeMultiplier: 1.1, knockbackMultiplier: 1.2 },
                { duration: 32, damageMultiplier: 1.5, rangeMultiplier: 1.3, knockbackMultiplier: 2.0 }
            ],
            special: [{ duration: 220, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 1.0 }]
        };

        this.specialStyles = {
            ...this.specialStyles,
            a: {
                name: 'TOAD FLAME BULLET',
                state: 'SPECIAL',
                profileOverrides: { duration: 180, damageMultiplier: 1.5, rangeMultiplier: 2.5, knockbackMultiplier: 2.0, moveSpeed: 0 },
                projectile: {
                    fxProfileId: 'GAMABUNTA_FIRE',
                    spawnFrame: 27, // Spawn fire during jgama29 onwards
                    damage: 35,
                    knockback: 15,
                    speed: 16,
                    life: 60,
                    width: 130,
                    height: 90,
                    color: '#ff4400'
                }
            },
            s1: {
                name: 'NEEDLE JIZO',
                state: 'SPECIAL_TRANSFORM',
                profileOverrides: { duration: 40, damageMultiplier: 1.0, rangeMultiplier: 1.2, knockbackMultiplier: 2.0, moveSpeed: 0 },
            },
            s2: {
                name: 'RASENGAN UPWARD',
                state: 'RUN_ATTACK',
                profileOverrides: { duration: 30, damageMultiplier: 1.4, rangeMultiplier: 1.3, knockbackMultiplier: 2.5, moveSpeed: 2.0 },
            },
            s3: {
                name: 'AERIAL LIGHT',
                state: 'SPECIAL_AIR_LIGHT',
                profileOverrides: { duration: 20, damageMultiplier: 1.1, rangeMultiplier: 1.2, knockbackMultiplier: 1.2, moveSpeed: 1.0 },
            },
            s4: {
                name: 'AERIAL HEAVY DROP',
                state: 'SPECIAL_AIR_HEAVY',
                profileOverrides: { duration: 35, damageMultiplier: 1.8, rangeMultiplier: 1.5, knockbackMultiplier: 3.0, moveSpeed: 3.0 },
            }
        };
    }
}

if (typeof window !== 'undefined') {
    window.JiraiyaFighter = JiraiyaFighter;
}
