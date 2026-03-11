/* ============================================
   MINATO NAMIKAZE — Character Entity
   ============================================ */

class MinatoFighter extends Fighter {
    constructor(config) {
        super({
            name: 'MINATO',
            color: '#F7C948',
            speed: 4.8,
            jumpPower: -11.8,
            attackPower: 11,
            defense: 1.0,
            maxHealth: 94,
            maxChakra: 110,
            chakraRegen: 0.14,
            ...config,
        });

        this.attacks = {
            light: { damage: 7, range: 38, hitHeight: 30, duration: 18, chakraCost: 0, knockback: 2.8, offsetY: -10 },
            heavy: { damage: 14, range: 48, hitHeight: 34, duration: 28, chakraCost: 0, knockback: 5.6, offsetY: -8 },
            special: { damage: 28, range: 78, hitHeight: 42, duration: 44, chakraCost: 35, knockback: 13, offsetY: -12, moveSpeed: 5.5, name: 'RASENGAN' },
        };

        this.specialStyles = {
            ...this.specialStyles,
            a: {
                name: 'RASENGAN',
                state: 'SPECIAL',
                profileOverrides: {
                    duration: 44,
                    damageMultiplier: 1.0,
                    rangeMultiplier: 1.0,
                    knockbackMultiplier: 1.0,
                    moveSpeed: 5.5,
                },
            },
            s1: {
                name: 'HIRAISHIN',
                state: 'SPECIAL_TRANSFORM',
                profileOverrides: {
                    duration: 34,
                    damageMultiplier: 1.05,
                    rangeMultiplier: 1.15,
                    knockbackMultiplier: 1.1,
                    moveSpeed: 8.5,
                },
            },
            s2: {
                name: 'FLASH STEP',
                state: 'ATTACK_HEAVY_2',
                profileOverrides: {
                    duration: 28,
                    damageMultiplier: 1.2,
                    rangeMultiplier: 1.15,
                    knockbackMultiplier: 1.25,
                    moveSpeed: 9.5,
                },
            },
        };

        this.comboChains = {
            light: [
                { state: 'ATTACK_LIGHT_1', duration: 18, cancelWindow: [10, 16] },
                { state: 'ATTACK_LIGHT_2', duration: 20, cancelWindow: [12, 18] },
                { state: 'ATTACK_LIGHT_3', duration: 24, cancelWindow: [14, 20] },
            ],
            heavy: [
                { state: 'ATTACK_HEAVY_1', duration: 28, cancelWindow: [18, 24] },
                { state: 'ATTACK_HEAVY_2', duration: 34, cancelWindow: [22, 28] },
            ],
            special: [
                { state: 'SPECIAL', duration: 44 },
            ],
        };

        this.comboCancelRatio = 0.58;
        this.comboHitResetFrames = 38;
        this._setComboRootRoute('heavy', { forward: 'H_N_1', back: 'H_N_1' });
        this._patchComboNode('L_N_1', {
            profileOverrides: { state: 'ATTACK_LIGHT_1', duration: 18, damageMultiplier: 1.0 },
        });
        this._patchComboNode('L_N_2', {
            profileOverrides: { state: 'ATTACK_LIGHT_2', duration: 20, damageMultiplier: 1.08 },
            routes: { heavy: { neutral: 'H_N_1', forward: 'H_N_1' } },
        });
        this._patchComboNode('L_N_3', {
            profileOverrides: { state: 'ATTACK_LIGHT_3', duration: 24, damageMultiplier: 1.2, knockbackMultiplier: 1.15 },
            routes: { special: { any: 'S_1' } },
        });
        this._patchComboNode('H_N_1', {
            profileOverrides: { state: 'ATTACK_HEAVY_1', duration: 28, damageMultiplier: 1.2, knockbackMultiplier: 1.2 },
            routes: { heavy: { neutral: 'H_N_2' }, special: { any: 'S_1' } },
        });
        this._patchComboNode('H_N_2', {
            profileOverrides: { state: 'ATTACK_HEAVY_2', duration: 34, damageMultiplier: 1.45, knockbackMultiplier: 1.5 },
            routes: { special: { any: 'S_1' } },
        });
    }
}
