/* ============================================
   LEE — Character Entity (manual visual mapping)
   ============================================ */

class LeeFighter extends Fighter {
    constructor(config) {
        super({
            name: 'LEE',
            color: '#2ECC71',
            speed: 3.95,
            jumpPower: -11.4,
            attackPower: 12,
            defense: 1,
            maxHealth: 96,
            maxChakra: 92,
            chakraRegen: 0.08,
            displayScale: 2.15, // Added explicitly since his native sprite is 102px tall
            ...config,
        });

        // Fast taijutsu profile.
        this.attacks = {
            light: { damage: 7, range: 38, hitHeight: 30, duration: 10, chakraCost: 0, knockback: 3.1, offsetY: -10, moveSpeed: 1.3, hitstun: 10, blockstun: 7, hitstop: 3 },
            heavy: { damage: 14, range: 48, hitHeight: 34, duration: 16, chakraCost: 0, knockback: 6.1, offsetY: -8, moveSpeed: 1.85, hitstun: 14, blockstun: 10, hitstop: 5 },
            special: { damage: 28, range: 62, hitHeight: 44, duration: 28, chakraCost: 28, knockback: 12.5, offsetY: -12, moveSpeed: 4.8, hitstun: 20, blockstun: 12, hitstop: 6, name: 'PRIMARY LOTUS' },
        };
        this.baseAttacks = JSON.parse(JSON.stringify(this.attacks));
        this.baseSpeed = this.speed;
        this.baseDisplayScale = this.displayScale;
        this.gatesOpen = false;
        this.transformPending = false;
        this.transformCost = 26;
        this.transformDuration = 26;
        this.inputBufferFrames = 10;
        this.attackDurationScale = 0.62;

        // States are manually assigned from visual sprite content.
        this.comboChains = {
            light: [
                { state: 'ATTACK_LIGHT_1', duration: 14, damageMultiplier: 1.0, rangeMultiplier: 1.02, knockbackMultiplier: 0.92, moveSpeed: 1.5, activeStart: 1, activeEnd: 5, cancelStart: 5, hitConfirmCancelStart: 2, motion: { windupEnd: 0.1, burstEnd: 0.4, windupMul: 0.65, burstMul: 1.38, recoveryMul: 0.76 } },
                { state: 'ATTACK_LIGHT_2', duration: 15, damageMultiplier: 1.1, rangeMultiplier: 1.08, knockbackMultiplier: 1.08, moveSpeed: 1.7, activeStart: 1, activeEnd: 5, cancelStart: 5, hitConfirmCancelStart: 2, motion: { windupEnd: 0.1, burstEnd: 0.42, windupMul: 0.64, burstMul: 1.42, recoveryMul: 0.74 } },
                { state: 'ATTACK_LIGHT_3', duration: 17, damageMultiplier: 1.28, rangeMultiplier: 1.14, knockbackMultiplier: 1.28, moveSpeed: 2.0, activeStart: 2, activeEnd: 6, cancelStart: 6, hitConfirmCancelStart: 3, motion: { windupEnd: 0.12, burstEnd: 0.44, windupMul: 0.6, burstMul: 1.48, recoveryMul: 0.74 } },
            ],
            heavy: [
                { state: 'ATTACK_HEAVY_1', duration: 18, damageMultiplier: 1.18, rangeMultiplier: 1.12, knockbackMultiplier: 1.2, moveSpeed: 2.3, activeStart: 2, activeEnd: 7, cancelStart: 7, hitConfirmCancelStart: 3, motion: { windupEnd: 0.14, burstEnd: 0.46, windupMul: 0.54, burstMul: 1.56, recoveryMul: 0.8 } },
                { state: 'ATTACK_HEAVY_2', duration: 22, damageMultiplier: 1.48, rangeMultiplier: 1.2, knockbackMultiplier: 1.6, moveSpeed: 2.7, activeStart: 3, activeEnd: 8, cancelStart: 8, hitConfirmCancelStart: 4, motion: { windupEnd: 0.16, burstEnd: 0.48, windupMul: 0.5, burstMul: 1.64, recoveryMul: 0.82 } },
            ],
            special: [
                { state: 'SPECIAL', duration: 28, damageMultiplier: 1.0, rangeMultiplier: 1.05, knockbackMultiplier: 1.0, moveSpeed: 5.2, activeStart: 4, activeEnd: 12, cancelStart: 14, hitConfirmCancelStart: 7, motion: { windupEnd: 0.16, burstEnd: 0.52, windupMul: 0.48, burstMul: 1.58, recoveryMul: 0.82 } },
            ],
        };

        this.comboCancelRatio = 0.74;
        this.comboHitResetFrames = 40;

        // Direction + attack => distinct opener animations.
        this._setComboRootRoute('light', { back: 'L_D_1' });
        this._setComboRootRoute('heavy', { back: 'H_D_1' });
        this._patchComboNode('L_N_1', {
            profileOverrides: { state: 'ATTACK_LIGHT_1', duration: 14, moveSpeed: 1.5, activeStart: 1, activeEnd: 5, cancelStart: 5, hitConfirmCancelStart: 2 },
        });
        this._patchComboNode('L_F_1', {
            profileOverrides: { state: 'ATTACK_LIGHT_3', rangeMultiplier: 1.18, duration: 15, moveSpeed: 2.15, activeStart: 2, activeEnd: 6, cancelStart: 6, hitConfirmCancelStart: 3 },
        });
        this._patchComboNode('L_D_1', {
            profileOverrides: { state: 'ATTACK_LIGHT_2', hitHeightMultiplier: 0.64, duration: 15, moveSpeed: 1.4, activeStart: 1, activeEnd: 5, cancelStart: 5, hitConfirmCancelStart: 2 },
        });
        this._patchComboNode('L_A_1', {
            profileOverrides: { state: 'ATTACK_LIGHT_3', hitHeightMultiplier: 0.7, damageMultiplier: 0.9, duration: 14, moveSpeed: 1.6, activeStart: 1, activeEnd: 5, cancelStart: 5, hitConfirmCancelStart: 2 },
        });
        this._patchComboNode('L_N_2', {
            routes: {
                heavy: { neutral: 'H_N_1', forward: 'H_F_1', down: 'H_D_1' },
                special: { any: 'S_1' },
            },
        });
        this._patchComboNode('L_F_2', {
            routes: { special: { any: 'S_1' } },
        });
        this._patchComboNode('L_D_2', {
            routes: { heavy: { down: 'H_D_1', neutral: 'H_N_1' } },
        });

        this._patchComboNode('H_N_1', {
            profileOverrides: { state: 'ATTACK_HEAVY_1', duration: 18, moveSpeed: 2.3, activeStart: 2, activeEnd: 7, cancelStart: 7, hitConfirmCancelStart: 3 },
        });
        this._patchComboNode('H_F_1', {
            profileOverrides: { state: 'ATTACK_HEAVY_2', rangeMultiplier: 1.22, duration: 20, moveSpeed: 2.8, activeStart: 2, activeEnd: 7, cancelStart: 7, hitConfirmCancelStart: 3 },
            routes: {
                heavy: { neutral: 'H_N_2', forward: 'H_F_2' },
                special: { any: 'S_1' },
            },
        });
        this._patchComboNode('H_D_1', {
            profileOverrides: { state: 'ATTACK_HEAVY_1', hitHeightMultiplier: 0.68, duration: 18, moveSpeed: 2.0, activeStart: 2, activeEnd: 7, cancelStart: 7, hitConfirmCancelStart: 3 },
            routes: { special: { any: 'S_1' } },
        });
        this._patchComboNode('H_A_1', {
            profileOverrides: { state: 'ATTACK_HEAVY_2', hitHeightMultiplier: 0.72, damageMultiplier: 0.92, duration: 18, moveSpeed: 2.4, activeStart: 2, activeEnd: 7, cancelStart: 7, hitConfirmCancelStart: 3 },
            routes: { special: { any: 'S_1' } },
        });
        this._patchComboNode('H_N_2', {
            profileOverrides: { state: 'ATTACK_HEAVY_2', damageMultiplier: 1.58, knockbackMultiplier: 1.74, duration: 22, moveSpeed: 2.8, activeStart: 3, activeEnd: 8, cancelStart: 8, hitConfirmCancelStart: 4 },
            routes: { special: { any: 'S_1' } },
        });
        this._patchComboNode('H_F_2', {
            profileOverrides: { state: 'ATTACK_HEAVY_2', damageMultiplier: 1.62, knockbackMultiplier: 1.82, duration: 22, moveSpeed: 3.0, activeStart: 3, activeEnd: 8, cancelStart: 8, hitConfirmCancelStart: 4 },
            routes: { special: { any: 'S_1' } },
        });
    }

    _canStartTransform() {
        if (this.transformPending) return false;
        if (!this.grounded) return false;
        if (this.chakra < this.transformCost) return false;
        if (this.state === 'KO' || this.state === 'HIT' || this.state === 'BLOCK' || this.state === 'DASH') return false;
        if (this.isAttacking()) return false;
        return true;
    }

    _stateForCurrentForm(state) {
        if (!this.gatesOpen) return state;
        const map = {
            IDLE: 'GATE_IDLE',
            WALK: 'GATE_WALK',
            RUN: 'GATE_RUN',
            JUMP: 'GATE_JUMP',
            HIT: 'GATE_HIT',
            KO: 'GATE_KO',
            ATTACK_LIGHT_1: 'GATE_ATTACK_LIGHT_1',
            ATTACK_LIGHT_2: 'GATE_ATTACK_LIGHT_2',
            ATTACK_LIGHT_3: 'GATE_ATTACK_LIGHT_3',
            ATTACK_HEAVY_1: 'GATE_ATTACK_HEAVY_1',
            ATTACK_HEAVY_2: 'GATE_ATTACK_HEAVY_2',
            ATTACK_LIGHT: 'GATE_ATTACK_LIGHT_1',
            ATTACK_HEAVY: 'GATE_ATTACK_HEAVY_1',
            RUN_ATTACK: 'GATE_RUN_ATTACK',
            THROW: 'GATE_THROW',
            SPECIAL: 'GATE_SPECIAL',
        };
        const mapped = map[state] || state;
        if (this.animations && this.animations[mapped]) return mapped;
        return state;
    }

    _setState(nextState) {
        super._setState(this._stateForCurrentForm(nextState));
    }

    _applyLeeForm(openGates) {
        this.gatesOpen = !!openGates;
        if (this.gatesOpen) {
            this.speed = this.baseSpeed * 1.18;
            this.displayScale = this.baseDisplayScale * 1.03;
            this.attacks.light = { ...this.baseAttacks.light, damage: Math.round(this.baseAttacks.light.damage * 1.2), range: Math.round(this.baseAttacks.light.range * 1.1), knockback: Number((this.baseAttacks.light.knockback * 1.18).toFixed(2)) };
            this.attacks.heavy = { ...this.baseAttacks.heavy, damage: Math.round(this.baseAttacks.heavy.damage * 1.22), range: Math.round(this.baseAttacks.heavy.range * 1.12), knockback: Number((this.baseAttacks.heavy.knockback * 1.2).toFixed(2)) };
            this.attacks.special = { ...this.baseAttacks.special, damage: Math.round(this.baseAttacks.special.damage * 1.25), range: Math.round(this.baseAttacks.special.range * 1.15), knockback: Number((this.baseAttacks.special.knockback * 1.24).toFixed(2)), name: 'PRIMARY LOTUS (OPEN GATES)' };
        } else {
            this.speed = this.baseSpeed;
            this.displayScale = this.baseDisplayScale;
            this.attacks = JSON.parse(JSON.stringify(this.baseAttacks));
        }
    }

    _startTransform() {
        if (!this._canStartTransform()) return false;

        this.chakra = Math.max(0, this.chakra - this.transformCost);
        this.transformPending = true;
        this._setState('SPECIAL_TRANSFORM');
        this.currentAttackData = {
            damage: 0,
            range: 0,
            hitHeight: 0,
            duration: this.transformDuration,
            knockback: 0,
            offsetY: 0,
            noHit: true,
        };
        this.currentAttackType = 'special';
        this.currentAttackStep = 1;
        this.currentAttackTotalSteps = 1;
        this.currentAttackDuration = this.transformDuration;
        this.stateTimer = this.transformDuration;
        this.vx = 0;
        this.dashTimer = 0;
        this.attackHasHit = false;
        this.attackBuffer = null;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.currentComboNodeId = null;
        this.currentComboNode = null;
        this.lastAttackConnected = false;
        return true;
    }

    update(input, opponent, dtScale = 1) {
        if (this._hasBufferedAction('transform')) {
            if (this._startTransform()) this._consumeBufferedAction('transform');
        }

        super.update(input, opponent, dtScale);

        if (this.transformPending && (this.state === 'HIT' || this.state === 'KO')) {
            this.transformPending = false;
            return;
        }

        // Toggle mode each time player presses T and transform animation ends.
        if (this.transformPending && !this.isAttacking() && this.state !== 'HIT' && this.state !== 'KO') {
            this.transformPending = false;
            this._applyLeeForm(!this.gatesOpen);
            this._setState('IDLE');
        }
    }

    reset(x, facingRight) {
        super.reset(x, facingRight);
        this.transformPending = false;
        this._applyLeeForm(false);
    }
}
