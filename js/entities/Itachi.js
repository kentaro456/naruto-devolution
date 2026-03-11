/* ============================================
   ITACHI — Character Entity
   ============================================ */

class ItachiFighter extends Fighter {
    constructor(config) {
        super({
            name: 'ITACHI',
            color: '#7A0F1C',
            displayScale: 1.8,
            speed: 4.2,
            jumpPower: -11.5,
            attackPower: 12,
            defense: 1.2,
            maxHealth: 95,
            maxChakra: 120,
            chakraRegen: 0.15,
            ...config,
        });

        this.attacks = {
            light: { damage: 8, range: 40, hitHeight: 32, duration: 10, chakraCost: 0, knockback: 3.0, offsetY: -10 },
            heavy: { damage: 16, range: 48, hitHeight: 34, duration: 20, chakraCost: 0, knockback: 6.0, offsetY: -8 },
            special: { damage: 28, range: 80, hitHeight: 40, duration: 36, chakraCost: 40, knockback: 10, offsetY: -12, moveSpeed: 4.0, name: 'FIREBALL JUTSU' },
        };

        this.specialStyles = {
            ...this.specialStyles,
            a: {
                name: 'FIREBALL JUTSU',
                state: 'SPECIAL',
                profileOverrides: { duration: 44, damageMultiplier: 1.0, rangeMultiplier: 1.05, knockbackMultiplier: 1.0, moveSpeed: 1.2 },
                projectile: {
                    fxProfileId: 'FIREBALL_NVS',
                    spawnFrame: 14,
                    speed: 9.0,
                    width: 84,
                    height: 62,
                    life: 76,
                    damage: 24,
                    knockback: 8.5,
                    offsetY: -160, // Raised to mouth level (calculated based on scale)
                }
            },
            s1: {
                name: 'TSUKUYOMI',
                state: 'SPECIAL_TRANSFORM',
                profileOverrides: { duration: 46, damageMultiplier: 1.25, rangeMultiplier: 1.15, knockbackMultiplier: 0.65, moveSpeed: 0.8 },
            },
            s2: {
                name: 'AMATERASU',
                state: 'SPECIAL',
                profileOverrides: { duration: 48, damageMultiplier: 1.45, rangeMultiplier: 1.25, knockbackMultiplier: 1.3, moveSpeed: 0.8 },
                projectile: {
                    fxProfileId: 'PHOENIX_FLAME',
                    spawnFrame: 16,
                    speed: 8.4,
                    width: 86,
                    height: 62,
                    life: 76,
                    damage: 30,
                    knockback: 10.5,
                    offsetY: -160, // Raised to mouth level
                },
            },
            s3: {
                name: 'CROW CLONE',
                state: 'SPECIAL_TRANSFORM',
                profileOverrides: { duration: 30, damageMultiplier: 0.85, rangeMultiplier: 0.9, knockbackMultiplier: 1.35, moveSpeed: 5.2 },
            },
            s4: {
                name: 'SUSANOO',
                state: 'SPECIAL',
                profileOverrides: { duration: 58, damageMultiplier: 1.8, rangeMultiplier: 1.6, knockbackMultiplier: 2.0, moveSpeed: 0.45 },
                projectile: {
                    fxProfileId: 'PHOENIX_FLAME',
                    spawnFrame: 20,
                    speed: 7.2,
                    width: 110,
                    height: 90,
                    life: 56,
                    damage: 36,
                    knockback: 14,
                    color: '#ffaa00',
                    offsetY: -180, // Raised (Susanoo might be slightly higher/lower, tweak as needed)
                }
            },
        };

        this.comboChains = {
            light: [
                { state: 'ATTACK_LIGHT_1', duration: 14 },
                { state: 'ATTACK_LIGHT_2', duration: 16 },
                { state: 'ATTACK_LIGHT_3', duration: 24 }
            ],
            heavy: [
                { state: 'ATTACK_HEAVY_1', duration: 22 },
                { state: 'ATTACK_HEAVY_2', duration: 30 }
            ],
            special: [
                { state: 'SPECIAL', duration: 36 }
            ]
        };

        this.teleporting = false;
        this.teleportDashDuration = 14;
        this.teleportMoveSpeed = 8.5;
        this.comboCancelRatio = 0.6;
        this.comboHitResetFrames = 42;
        this.attackDurationScale = 1.0;
        this.specialTransformDurationScale = 1.0;
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

        // Itachi dissolves into crows (TELEPORT or DASH)
        if (this.animations && this.animations['TELEPORT']) {
            this._setState('TELEPORT');
        } else {
            this._setState('DASH');
        }

        this.teleporting = true;
        this.emitSound('kakashi_teleport', 0.9);
        return true;
    }

    update(input, opponent, dtScale = 1) {
        const adaptedInput = { ...input };
        if (adaptedInput.dash) {
            this._startTeleport(opponent);
            adaptedInput.dash = false;
        }

        super.update(adaptedInput, opponent, dtScale);

        if (this.teleporting) {
            if ((this.state === 'DASH' || this.state === 'TELEPORT') && this.dashTimer > 0) {
                const dir = this.facingRight ? 1 : -1;
                this.vx = dir * this.teleportMoveSpeed;
            } else {
                this.vx = 0;
                this.teleporting = false;
            }
        }
    }
}
