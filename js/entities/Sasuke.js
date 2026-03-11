/* ============================================
   SASUKE — Character Entity
   ============================================ */

class SasukeFighter extends Fighter {
    constructor(config) {
        super({
            name: 'SASUKE',
            color: '#1A237E',
            speed: 3.8,
            jumpPower: -11.5,
            attackPower: 12,
            defense: 1,
            maxHealth: 95,
            maxChakra: 110,
            chakraRegen: 0.09,
            ...config,
        });

        this.initialSasukeForm = config?.sasukeForm === 'cs2' ? 'cs2' : 'base';
        this.sasukeForm = this.initialSasukeForm;
        this.transformCost = config?.transformCost || 30;
        this.transformDuration = config?.transformDuration || 32;
        this.transformPending = false;

        this.specialStyles = {
            ...this.specialStyles,
            a: {
                name: 'CHIDORI',
                state: 'SPECIAL',
                profileOverrides: { duration: 38, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 1.0, moveSpeed: 3.0 },
            },
            s1: {
                name: 'CHIDORI NAGASHI',
                state: 'SPECIAL',
                profileOverrides: { duration: 40, damageMultiplier: 1.2, rangeMultiplier: 0.8, knockbackMultiplier: 1.8, moveSpeed: 0.0 },
            },
            s2: {
                name: 'KIRIN',
                state: 'SPECIAL_TRANSFORM',
                profileOverrides: { duration: 60, damageMultiplier: 2.0, rangeMultiplier: 2.5, knockbackMultiplier: 2.5, moveSpeed: 0.0 },
                projectile: {
                    kind: 'windattack1', // Repurposing as lightning placeholder from fullpack
                    spawnFrame: 30,
                    speed: 25,
                    width: 80,
                    height: 80,
                    life: 50,
                    color: '#00ccff',
                }
            },
            s3: {
                name: 'FIREBALL JUTSU',
                state: 'ATTACK_HEAVY_2',
                profileOverrides: { duration: 35, damageMultiplier: 1.5, rangeMultiplier: 1.5, knockbackMultiplier: 1.2, moveSpeed: 0.5 },
                projectile: {
                    fxProfileId: 'FIREBALL_NVS',
                    kind: 'phoenixflame1', // Fullpack
                    spawnFrame: 15,
                    speed: 9.0,
                    width: 84,
                    height: 62,
                    life: 76,
                    color: '#ff4400',
                }
            },
            s4: {
                name: 'SUSANOO',
                state: 'SPECIAL',
                profileOverrides: { duration: 65, damageMultiplier: 2.2, rangeMultiplier: 2.2, knockbackMultiplier: 3.0, moveSpeed: 0.5 },
                projectile: {
                    kind: 'susanoo_arrow', // Symbolic
                    spawnFrame: 25,
                    speed: 35,
                    width: 25,
                    height: 80,
                    life: 40,
                    color: '#6a1b9a',
                }
            },
        };

        this.formSprites = {
            base: null,
            cs2: null,
        };
        this.formCombos = {
            base: null,
            cs2: null,
        };
        this.baseSpeed = this.speed;
        this.cs2Speed = this.baseSpeed + 0.25;

        this.comboCancelRatio = 0.49;
        this.comboHitResetFrames = 48;
        this._applySasukeForm(this.sasukeForm, { force: true });
    }

    configureFormSprites(selectedData) {
        if (!selectedData?.sprite) return;

        const roster = (typeof CHARACTER_ROSTER !== 'undefined' && Array.isArray(CHARACTER_ROSTER))
            ? CHARACTER_ROSTER
            : [];
        const baseData = roster.find((c) => c.id === 'sasuke') || selectedData;
        const cs2Data = roster.find((c) => c.id === 'sasuke_cs2') || selectedData;

        const baseOptions = {
            ...(baseData.spriteConfig || selectedData.spriteConfig || {}),
            fallbackPath: baseData.thumbnail || selectedData.thumbnail,
        };
        const cs2Options = {
            ...(cs2Data.spriteConfig || selectedData.spriteConfig || {}),
            fallbackPath: cs2Data.thumbnail || selectedData.thumbnail,
        };

        this._loadFormSprite('base', baseData.sprite || selectedData.sprite, baseOptions);
        this._loadFormSprite('cs2', cs2Data.sprite || selectedData.sprite, cs2Options);
    }

    _loadFormSprite(form, manifestPath, options) {
        if (!manifestPath || !options) return;
        if (options.mappingPath) this._loadFormCombo(form, options.mappingPath);

        if (typeof SpriteFactory === 'undefined') {
            if (this.sasukeForm === form) this.loadSprite(manifestPath, options);
            return;
        }

        SpriteFactory.build(manifestPath, options)
            .then((result) => {
                if (!result?.image) return;
                this.formSprites[form] = result;
                if (this.sasukeForm === form) this._applyFormSprite(form);
            })
            .catch((err) => {
                console.warn(`Sasuke ${form} sprite load failed:`, err);
                if (this.sasukeForm !== form) return;
                this.loadSprite(manifestPath, options);
            });
    }

    _loadFormCombo(form, mappingPath) {
        if (!mappingPath || typeof this.loadComboConfigFromMapping !== 'function') return;
        this.loadComboConfigFromMapping(mappingPath)
            .then((combo) => {
                if (!combo) return;
                this.formCombos[form] = combo;
                if (this.sasukeForm === form) this.applyComboConfig(combo);
            })
            .catch((err) => {
                console.warn(`Sasuke ${form} combo config load failed:`, err);
            });
    }

    _applyFormSprite(form) {
        const sprite = this.formSprites[form];
        if (!sprite?.image) return false;

        this.spriteSheet = sprite.image;
        this.useFullSprite = !sprite.animations;
        if (sprite.frameWidth) this.frameWidth = sprite.frameWidth;
        if (sprite.frameHeight) this.frameHeight = sprite.frameHeight;
        if (sprite.animations) this.animations = sprite.animations;
        this.animFrame = 0;
        this.animTimer = 0;
        return true;
    }

    _applySasukeComboRoutes() {
        this._setComboRootRoute('heavy', { back: 'H_F_1' });
        this._patchComboNode('L_N_1', {
            profileOverrides: { rangeMultiplier: 1.08, duration: 18 },
        });
        this._patchComboNode('L_N_2', {
            profileOverrides: { duration: 18, damageMultiplier: 1.08 },
            routes: {
                heavy: { forward: 'H_F_1', neutral: 'H_N_1' },
            },
        });
        this._patchComboNode('L_F_2', {
            routes: { special: { any: 'S_1' } },
        });
        this._patchComboNode('L_A_1', {
            profileOverrides: { hitHeightMultiplier: 0.66, damageMultiplier: 0.9, duration: 20 },
            routes: { heavy: { air: 'H_A_1' } },
        });
        this._patchComboNode('H_F_1', {
            profileOverrides: { rangeMultiplier: 1.24, damageMultiplier: 1.08, duration: 30 },
            routes: {
                heavy: { forward: 'H_F_2', neutral: 'H_N_2' },
                special: { any: 'S_1' },
            },
        });
        this._patchComboNode('H_F_2', {
            profileOverrides: { damageMultiplier: 1.55, knockbackMultiplier: 1.62, duration: 38 },
            routes: { special: { any: 'S_1' } },
        });
        this._patchComboNode('H_D_1', {
            profileOverrides: { hitHeightMultiplier: 0.63, duration: 30, knockbackMultiplier: 1.22 },
            routes: { special: { any: 'S_1' } },
        });
    }

    _applySasukeForm(form, { force = false } = {}) {
        const nextForm = form === 'cs2' ? 'cs2' : 'base';
        if (!force && this.sasukeForm === nextForm) return;

        this.sasukeForm = nextForm;

        if (nextForm === 'cs2') {
            this.color = '#6A1B9A';
            this.speed = this.cs2Speed;
            this.attacks = {
                light: { damage: 9, range: 38, hitHeight: 30, duration: 10, chakraCost: 0, knockback: 3.4, offsetY: -10 },
                heavy: { damage: 18, range: 47, hitHeight: 36, duration: 22, chakraCost: 0, knockback: 6.5, offsetY: -8 },
                special: { damage: 36, range: 82, hitHeight: 42, duration: 36, chakraCost: 36, knockback: 15, offsetY: -12, moveSpeed: 3.5, name: 'CHIDORI CS2' },
            };
            this.comboChains = {
                light: [
                    { state: 'ATTACK_LIGHT_1', duration: 28, damageMultiplier: 1.02, rangeMultiplier: 1.02, knockbackMultiplier: 0.95 },
                    { state: 'ATTACK_LIGHT_2', duration: 28, damageMultiplier: 1.18, rangeMultiplier: 1.08, knockbackMultiplier: 1.1 },
                    { state: 'ATTACK_LIGHT_3', duration: 34, damageMultiplier: 1.42, rangeMultiplier: 1.16, knockbackMultiplier: 1.35 },
                ],
                heavy: [
                    { state: 'ATTACK_HEAVY_1', duration: 38, damageMultiplier: 1.28, rangeMultiplier: 1.14, knockbackMultiplier: 1.24 },
                    { state: 'ATTACK_HEAVY_2', duration: 46, damageMultiplier: 1.6, rangeMultiplier: 1.24, knockbackMultiplier: 1.66 },
                ],
                special: [
                    { state: 'SPECIAL', duration: 36, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 1.0 },
                ],
            };
        } else {
            this.color = '#1A237E';
            this.speed = this.baseSpeed;
            this.attacks = {
                light: { damage: 8, range: 36, hitHeight: 28, duration: 11, chakraCost: 0, knockback: 3, offsetY: -10 },
                heavy: { damage: 16, range: 44, hitHeight: 34, duration: 24, chakraCost: 0, knockback: 6, offsetY: -8 },
                special: { damage: 32, range: 75, hitHeight: 40, duration: 38, chakraCost: 40, knockback: 14, offsetY: -12, moveSpeed: 3.0, name: 'CHIDORI' },
            };
            this.comboChains = {
                light: [
                    { state: 'ATTACK_LIGHT_1', duration: 30, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 0.92 },
                    { state: 'ATTACK_LIGHT_2', duration: 30, damageMultiplier: 1.14, rangeMultiplier: 1.07, knockbackMultiplier: 1.06 },
                    { state: 'ATTACK_LIGHT_3', duration: 36, damageMultiplier: 1.36, rangeMultiplier: 1.14, knockbackMultiplier: 1.32 },
                ],
                heavy: [
                    { state: 'ATTACK_HEAVY_1', duration: 40, damageMultiplier: 1.22, rangeMultiplier: 1.12, knockbackMultiplier: 1.2 },
                    { state: 'ATTACK_HEAVY_2', duration: 48, damageMultiplier: 1.54, rangeMultiplier: 1.22, knockbackMultiplier: 1.6 },
                ],
                special: [
                    { state: 'SPECIAL', duration: 38, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 1.0 },
                ],
            };
        }

        this._refreshComboTree();
        this._applySasukeComboRoutes();
        const combo = this.formCombos[this.sasukeForm];
        if (combo) this.applyComboConfig(combo);
        this._applyFormSprite(this.sasukeForm);
    }

    _canStartTransform() {
        if (this.initialSasukeForm !== 'base') return false;
        if (this.sasukeForm !== 'base') return false;
        if (this.transformPending) return false;
        if (!this.grounded) return false;
        if (this.chakra < this.transformCost) return false;
        if (this.state === 'KO' || this.state === 'HIT' || this.state === 'BLOCK' || this.state === 'DASH') return false;
        if (this.isAttacking()) return false;
        return true;
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

        if (this.transformPending && !this.isAttacking() && this.state !== 'HIT' && this.state !== 'KO') {
            this.transformPending = false;
            this._applySasukeForm('cs2');
        }
    }

    reset(x, facingRight) {
        super.reset(x, facingRight);
        this.transformPending = false;
        this._applySasukeForm(this.initialSasukeForm, { force: true });
    }
}
