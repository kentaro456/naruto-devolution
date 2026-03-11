/* ============================================
   SAKURA — Character Entity
   ============================================ */

class SakuraFighter extends Fighter {
    constructor(config) {
        super({
            name: 'SAKURA',
            color: '#E91E63',
            speed: 3.2,
            jumpPower: -10.5,
            attackPower: 14,
            defense: 2,
            maxHealth: 105,
            maxChakra: 90,
            chakraRegen: 0.12,
            ...config,
        });

        // Custom attacks — Sakura hits hard but slower
        this.attacks = {
            light: { damage: 9, range: 34, hitHeight: 28, duration: 32, chakraCost: 0, knockback: 4, offsetY: -10 },
            heavy: { damage: 18, range: 45, hitHeight: 36, duration: 42, chakraCost: 0, knockback: 7, offsetY: -5 },
            special: { damage: 35, range: 55, hitHeight: 50, duration: 50, chakraCost: 30, knockback: 15, offsetY: -10, name: 'SHANNARŌ' },
        };

        this.comboChains = {
            light: [
                { state: 'ATTACK_LIGHT_1', duration: 32, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 0.9 },
                { state: 'ATTACK_LIGHT_2', duration: 32, damageMultiplier: 1.15, rangeMultiplier: 1.08, knockbackMultiplier: 1.1 },
                { state: 'ATTACK_LIGHT_3', duration: 34, damageMultiplier: 1.35, rangeMultiplier: 1.12, knockbackMultiplier: 1.35 },
            ],
            heavy: [
                { state: 'ATTACK_HEAVY_1', duration: 42, damageMultiplier: 1.2, rangeMultiplier: 1.08, knockbackMultiplier: 1.15 },
                { state: 'ATTACK_HEAVY_2', duration: 48, damageMultiplier: 1.45, rangeMultiplier: 1.15, knockbackMultiplier: 1.5 },
            ],
            special: [
                { state: 'SPECIAL', duration: 50, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 1.0 },
            ],
        };

        this.comboCancelRatio = 0.38;
        this.comboHitResetFrames = 55;
        this._setComboRootRoute('heavy', { forward: 'H_N_1', back: 'H_N_1' });
        this._patchComboNode('L_N_1', {
            profileOverrides: { state: 'ATTACK_LIGHT_1', damageMultiplier: 1.05, duration: 32 },
        });
        this._patchComboNode('L_N_2', {
            profileOverrides: { state: 'ATTACK_LIGHT_2', duration: 32, knockbackMultiplier: 1.08 },
            routes: { heavy: { neutral: 'H_N_1', down: 'H_D_1' } },
        });
        this._patchComboNode('L_D_1', {
            profileOverrides: { state: 'ATTACK_LIGHT_2', hitHeightMultiplier: 0.6, damageMultiplier: 1.08, duration: 34 },
            routes: { heavy: { down: 'H_D_1', neutral: 'H_N_1' } },
        });
        this._patchComboNode('L_A_1', {
            profileOverrides: { state: 'ATTACK_LIGHT_3', damageMultiplier: 0.88, hitHeightMultiplier: 0.66, duration: 28 },
            routes: { heavy: { air: 'H_A_1' } },
        });
        this._patchComboNode('H_N_1', {
            profileOverrides: { state: 'ATTACK_HEAVY_1', damageMultiplier: 1.25, knockbackMultiplier: 1.25, duration: 42 },
            routes: { heavy: { neutral: 'H_N_2', forward: 'H_F_2' } },
        });
        this._patchComboNode('H_D_1', {
            profileOverrides: { state: 'ATTACK_HEAVY_1', hitHeightMultiplier: 0.68, damageMultiplier: 1.2, knockbackMultiplier: 1.35, duration: 44 },
            routes: { special: { any: 'S_1' } },
        });
        this._patchComboNode('H_N_2', {
            profileOverrides: { state: 'ATTACK_HEAVY_2', damageMultiplier: 1.75, knockbackMultiplier: 1.9, duration: 48 },
            routes: { special: { any: 'S_1' } },
        });
        this._patchComboNode('H_F_2', {
            profileOverrides: { state: 'ATTACK_HEAVY_2', damageMultiplier: 1.7, rangeMultiplier: 1.16, knockbackMultiplier: 1.85, duration: 46 },
            routes: { special: { any: 'S_1' } },
        });
    }
}
