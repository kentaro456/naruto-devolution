/* ============================================
   MADARA — Character Entity
   ============================================ */

class MadaraFighter extends Fighter {
    constructor(config) {
        super({
            name: 'MADARA',
            color: '#5B1E1E',
            speed: 3.6,
            jumpPower: -11.0,
            attackPower: 14,
            defense: 1.5,
            maxHealth: 110,
            maxChakra: 130,
            chakraRegen: 0.16,
            ...config,
        });

        this.attacks = {
            light: { damage: 10, range: 45, hitHeight: 34, duration: 14, chakraCost: 0, knockback: 4.0, offsetY: -10 },
            heavy: { damage: 18, range: 55, hitHeight: 38, duration: 25, chakraCost: 0, knockback: 7.0, offsetY: -8 },
            special: { damage: 32, range: 90, hitHeight: 45, duration: 42, chakraCost: 45, knockback: 14, offsetY: -12, moveSpeed: 1.5, name: 'MAJESTIC DESTROYER FLAME' },
        };

        this.specialStyles = {
            ...this.specialStyles,
            a: {
                name: 'MAJESTIC DESTROYER FLAME',
                state: 'SPECIAL',
                profileOverrides: { duration: 42, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 1.0, moveSpeed: 1.5 },
                projectile: {
                    kind: 'phoenixflame1', // Huge fire from fullpack
                    spawnFrame: 18,
                    speed: 14,
                    width: 60,
                    height: 60,
                    life: 100,
                    color: '#ff2200',
                }
            },
            s1: {
                name: 'TENGAI SHINSEI', // Meteor
                state: 'SPECIAL_TRANSFORM',
                profileOverrides: { duration: 50, damageMultiplier: 1.5, rangeMultiplier: 2.5, knockbackMultiplier: 2.0, moveSpeed: 0.5 },
                projectile: {
                    kind: 'EarthJutsu', // From fullpack
                    spawnFrame: 25,
                    speed: 20,
                    width: 100,
                    height: 100,
                    life: 60,
                    color: '#8b4513',
                }
            },
            s2: {
                name: 'WOOD DRAGON JUTSU',
                state: 'ATTACK_HEAVY_2',
                profileOverrides: { duration: 35, damageMultiplier: 1.3, rangeMultiplier: 1.8, knockbackMultiplier: 1.6, moveSpeed: 2.0 },
                projectile: {
                    kind: 'windattack1', // Repurposing wind effect
                    spawnFrame: 15,
                    speed: 18,
                    width: 70,
                    height: 40,
                    life: 60,
                    color: '#228b22', // Green hue for wood
                }
            },
            s3: {
                name: 'UCHIHA REFLECTION',
                state: 'BLOCK',
                profileOverrides: { duration: 30, damageMultiplier: 1.2, rangeMultiplier: 0.8, knockbackMultiplier: 2.5, moveSpeed: 0.2 },
            },
            s4: {
                name: 'PERFECT SUSANOO',
                state: 'SPECIAL',
                profileOverrides: { duration: 70, damageMultiplier: 2.5, rangeMultiplier: 2.5, knockbackMultiplier: 3.5, moveSpeed: 0.5 },
                projectile: {
                    kind: 'style4_burst', // Neutral energy burst (avoid character-sprite projectile)
                    spawnFrame: 30,
                    speed: 30,
                    width: 90,
                    height: 120,
                    life: 45,
                    color: '#1a5276', // Blue susanoo
                }
            },
        };

        this.comboChains = {
            light: [
                { state: 'ATTACK_LIGHT_1', duration: 16 },
                { state: 'ATTACK_LIGHT_2', duration: 18 },
                { state: 'ATTACK_LIGHT_3', duration: 25 }
            ],
            heavy: [
                { state: 'ATTACK_HEAVY_1', duration: 26 },
                { state: 'ATTACK_HEAVY_2', duration: 32 }
            ],
            special: [
                { state: 'SPECIAL', duration: 42 }
            ]
        };

        this.teleporting = false;
        this.teleportDashDuration = 18;
        this.teleportMoveSpeed = 7.0; // Madara's dash is methodical
        this.comboCancelRatio = 0.55;
        this.comboHitResetFrames = 48;
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

        if (this.animations && this.animations['DASH']) {
            this._setState('DASH');
        } else {
            this._setState('RUN');
        }

        this.teleporting = true;
        this.emitSound('kakashi_teleport', 0.8); // Deeper dash sound
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
            if ((this.state === 'DASH' || this.state === 'RUN') && this.dashTimer > 0) {
                const dir = this.facingRight ? 1 : -1;
                this.vx = dir * this.teleportMoveSpeed;
            } else {
                this.vx = 0;
                this.teleporting = false;
            }
        }
    }

}
