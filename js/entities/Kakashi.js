/* ============================================
   KAKASHI — Character Entity
   ============================================ */

class KakashiFighter extends Fighter {
    constructor(config) {
        super({
            name: 'KAKASHI',
            color: '#546E7A',
            speed: 3.6,
            jumpPower: -11,
            attackPower: 11,
            defense: 1.5,
            maxHealth: 100,
            maxChakra: 120,
            chakraRegen: 0.07,
            ...config,
        });

        // Custom attacks — balanced and versatile
        this.attacks = {
            light: { damage: 8, range: 38, hitHeight: 30, duration: 10, chakraCost: 0, knockback: 3, offsetY: -10 },
            heavy: { damage: 15, range: 46, hitHeight: 34, duration: 23, chakraCost: 0, knockback: 5, offsetY: -6 },
            special: { damage: 28, range: 80, hitHeight: 38, duration: 42, chakraCost: 45, knockback: 11, offsetY: -15, moveSpeed: 3.2, name: 'RAIKIRI' },
        };
        this.specialStyles = {
            raikiri: { name: 'RAIKIRI', damage: 30, range: 82, hitHeight: 38, duration: 40, chakraCost: 42, knockback: 12, moveSpeed: 3.3, hitstun: 21, blockstun: 13, hitstop: 7 },
            kamui: { name: 'KAMUI', damage: 32, range: 94, hitHeight: 42, duration: 44, chakraCost: 48, knockback: 10, moveSpeed: 1.8, hitstun: 23, blockstun: 14, hitstop: 8 },
            tsukuyomi: { name: 'TSUKUYOMI', damage: 34, range: 90, hitHeight: 44, duration: 46, chakraCost: 50, knockback: 9, moveSpeed: 1.6, hitstun: 25, blockstun: 15, hitstop: 8 },
            amaterasu: { name: 'AMATERASU', damage: 36, range: 96, hitHeight: 46, duration: 48, chakraCost: 54, knockback: 13, moveSpeed: 1.4, hitstun: 27, blockstun: 16, hitstop: 9 },
        };
        this.pendingSpecialStyle = 'raikiri';
        this.teleporting = false;
        this.teleportDashDuration = 16;
        this.teleportMoveSpeed = 6.3; // ~100 steps over full teleport sequence
        this.attackDurationScale = 1.0;
        this.specialTransformDurationScale = 1.0;

        this.comboChains = {
            light: [
                { state: 'ATTACK_LIGHT_1', duration: 19 },
                { state: 'ATTACK_LIGHT_2', duration: 20 },
                { state: 'ATTACK_LIGHT_3', duration: 30 }
            ],
            heavy: [
                { state: 'ATTACK_HEAVY_1', duration: 22 },
                { state: 'ATTACK_HEAVY_2', duration: 26 }
            ],
            special: [
                { state: 'SPECIAL', duration: 48 }
            ]
        };

        this.comboCancelRatio = 0.56;
        this.comboHitResetFrames = 47;
        this._setComboRootRoute('light', { back: 'L_D_1' });
        this._patchComboNode('L_F_1', {
            profileOverrides: { rangeMultiplier: 1.12, duration: 10 },
        });
        this._patchComboNode('L_N_2', {
            profileOverrides: { knockbackMultiplier: 1.08, duration: 10 },
            routes: {
                heavy: { forward: 'H_F_1', neutral: 'H_N_1' },
                special: { any: 'S_1' },
            },
        });
        this._patchComboNode('L_A_1', {
            profileOverrides: { hitHeightMultiplier: 0.66, damageMultiplier: 0.9, duration: 9 },
            routes: { heavy: { air: 'H_A_1' }, special: { any: 'S_1' } },
        });
        this._patchComboNode('H_F_1', {
            profileOverrides: { rangeMultiplier: 1.18, knockbackMultiplier: 1.2, duration: 16 },
            routes: {
                heavy: { forward: 'H_F_2', neutral: 'H_N_2' },
                special: { any: 'S_1' },
            },
        });
        this._patchComboNode('H_A_1', {
            profileOverrides: { hitHeightMultiplier: 0.66, damageMultiplier: 0.92, duration: 14 },
            routes: { special: { any: 'S_1' } },
        });
        this._patchComboNode('H_F_2', {
            profileOverrides: { damageMultiplier: 1.48, knockbackMultiplier: 1.58, duration: 20 },
            routes: { special: { any: 'S_1' } },
        });
    }

    _setState(newState) {
        if (newState === 'WALK' && Math.abs(this.vx) >= Math.max(2.4, this.speed * 0.9)) {
            newState = 'RUN';
        }
        super._setState(newState);
    }

    _setPendingSpecialStyle(style) {
        if (!style || !this.specialStyles[style]) return;
        this.pendingSpecialStyle = style;
    }

    _applyKakashiInput(input = {}) {
        const out = { ...input };
        const forward = this.facingRight ? !!input.right : !!input.left;
        const backward = this.facingRight ? !!input.left : !!input.right;

        // Dash is repurposed as teleport for Kakashi.
        if (out.dash) out.dash = false;
        out.teleport = !!input.dash;

        // Select special style with standard controls when pressing special.
        if (input.special) {
            if (input.up) this._setPendingSpecialStyle('kamui');
            else if (input.down) this._setPendingSpecialStyle('tsukuyomi');
            else if (backward) this._setPendingSpecialStyle('amaterasu');
            else this._setPendingSpecialStyle('raikiri');
        }

        return out;
    }

    _startAttack(type, requestedStep = 1, profileOverrides = null) {
        if (type !== 'special' || requestedStep > 1) {
            return super._startAttack(type, requestedStep, profileOverrides);
        }

        const style = this.specialStyles[this.pendingSpecialStyle] || this.specialStyles.raikiri;
        const prevSpecial = { ...(this.attacks.special || {}) };
        this.attacks.special = {
            ...this.attacks.special,
            ...style,
        };

        const specialStateByStyle = {
            raikiri: 'CHIDORI_LONG',
            kamui: 'KAMUI',
            tsukuyomi: 'TSUKUYOMI',
            amaterasu: 'AMATERASU',
        };
        const styleState = specialStateByStyle[this.pendingSpecialStyle] || 'SPECIAL';
        const started = super._startAttack(type, requestedStep, {
            ...(profileOverrides || {}),
            state: styleState,
        });
        if (started) {
            this.emitSound('kakashi_sharingan', 0.8);
            if (this.pendingSpecialStyle === 'kamui') this.emitSound('kakashi_kamui', 0.94);
            else if (this.pendingSpecialStyle === 'tsukuyomi') {
                this.emitSound('kakashi_tsukuyomi', 0.94);
                this.emitSound(Math.random() < 0.5 ? 'kakashi_tsukuyomi_alt1' : 'kakashi_tsukuyomi_alt2', 0.78);
            } else if (this.pendingSpecialStyle === 'amaterasu') this.emitSound('kakashi_amaterasu', 0.96);
            else this.emitSound('kakashi_handsign', 0.88);
        }
        // Keep the style name visible during SPECIAL UI text.
        if (!started) {
            this.attacks.special = prevSpecial;
        }
        return started;
    }

    _startTeleport(opponent) {
        if (!this.canDash()) return false;

        this._spendStamina(this.dashCost);
        this.dashCooldownTimer = this.dashCooldown;
        this.dashTimer = this.teleportDashDuration;
        this.dashDirection = this.facingRight ? 1 : -1;
        this._clearAttackContext();
        this.attackHasHit = false;
        this.vx = 0;
        this._setState('DASH');

        this.teleporting = true;
        return true;
    }

    update(input, opponent, dtScale = 1) {
        const adaptedInput = this._applyKakashiInput(input || {});
        if (adaptedInput.teleport) {
            this._startTeleport(opponent);
            this.emitSound('kakashi_teleport', 0.95);
        }
        super.update(adaptedInput, opponent, dtScale);

        if (this.teleporting) {
            // Scratch D-teleport moves forward while teleport frames play.
            if (this.state === 'DASH' && this.dashTimer > 0) {
                const dir = this.facingRight ? 1 : -1;
                this.vx = dir * this.teleportMoveSpeed;
            } else {
                this.vx = 0;
            }
            if (this.state !== 'DASH' || this.dashTimer <= 0) {
                this.teleporting = false;
            }
        }

        // Custom VFX spawning for Mangekyou Specials
        if (
            opponent &&
            this.isAttacking() &&
            this.currentAttackType === 'special' &&
            ['kamui', 'tsukuyomi', 'amaterasu'].includes(this.pendingSpecialStyle)
        ) {
            // Spawn the overlay effect once per attack, around the middle of the animation
            if (this.animFrame >= 1 && !this.mangekyouEffectSpawned) {
                this.mangekyouEffectSpawned = true;
                const isKamui = this.pendingSpecialStyle === 'kamui';
                const isAmaterasu = this.pendingSpecialStyle === 'amaterasu';

                const eyeState = this.pendingSpecialStyle.toUpperCase(); // KAMUI, TSUKUYOMI, or AMATERASU (maps to Mangekyou eye)
                const effectState = 'EFFECT_' + eyeState; // EFFECT_KAMUI, EFFECT_TSUKUYOMI, etc. (maps to portal/flames)

                const targetX = isKamui || isAmaterasu ? opponent.x : (this.x + opponent.x) / 2;
                const lifeDur = this.currentAttackDuration - (this.stateTimer || 0) + 30;

                // 1. Spawn Giant Mangekyou Eye on screen center
                this.spawnedProjectiles.push({
                    owner: this,
                    kind: 'mangekyou_eye',
                    x: (this.x + opponent.x) / 2, // Center between players
                    y: (this.y + opponent.y) / 2 - 40,
                    vx: 0,
                    vy: 0,
                    width: 0, height: 0, radius: 0, // Visual only
                    life: lifeDur, maxLife: lifeDur,
                    spriteConfig: {
                        state: eyeState,
                        scale: 3.5, // Huge scale for the giant eye
                        animateByLife: false,
                        flipOnReverse: false,
                        offsetY: 0,
                        alpha: 0.85
                    }
                });

                // 2. Spawn the actual attack effect (Kamui portal, Amaterasu flames) on the enemy
                this.spawnedProjectiles.push({
                    owner: this,
                    kind: 'mangekyou_effect',
                    x: targetX,
                    y: isAmaterasu ? opponent.y + 20 : opponent.y - 20,
                    vx: 0,
                    vy: 0,
                    width: 60, height: 60,
                    radius: 50,
                    life: lifeDur, maxLife: lifeDur,
                    attackData: {
                        damage: this.attacks.special.damage * 0.5,
                        hitstun: this.attacks.special.hitstun,
                        blockstun: this.attacks.special.blockstun,
                        knockback: this.attacks.special.knockback,
                        projectile: true
                    },
                    spriteConfig: {
                        state: effectState,
                        scale: isKamui ? 2.5 : 3.0,
                        animateByLife: false,
                        flipOnReverse: false,
                        offsetY: 0
                    }
                });
            }
        } else {
            this.mangekyouEffectSpawned = false;
        }
    }
}
