/* ============================================
   NARUTO — Character Entity
   ============================================ */

class NarutoFighter extends Fighter {
    constructor(config) {
        const narutoForm = config?.narutoForm === 'kyuubi' ? 'kyuubi' : 'base';
        const narutoFamily = config?.narutoFamily === 'shippuden' ? 'shippuden' : 'kid';
        super({
            name: 'NARUTO',
            color: '#FF8C00',
            speed: 3.5,
            jumpPower: -11,
            attackPower: 10,
            defense: 1,
            maxHealth: 100,
            maxChakra: 100,
            chakraRegen: 0.1,
            ...config,
        });

        this.initialNarutoForm = narutoForm;
        this.narutoForm = narutoForm;
        this.narutoFamily = narutoFamily;
        this.transformCost = config?.transformCost || 28;
        this.transformDuration = config?.transformDuration || 56;
        this.transformPending = false;

        this.specialStyles = {
            ...this.specialStyles,
            a: {
                name: 'RASENGAN',
                state: 'SPECIAL',
                profileOverrides: { duration: 70, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 1.0, moveSpeed: 2.2 },
            },
            s1: {
                name: 'OODAMA RASENGAN',
                state: 'SPECIAL',
                profileOverrides: { duration: 80, damageMultiplier: 1.3, rangeMultiplier: 1.2, knockbackMultiplier: 1.5, moveSpeed: 2.0 },
            },
            s2: {
                name: 'TAJUU KAGE BUNSHIN',
                state: 'SPECIAL_TRANSFORM',
                profileOverrides: { duration: 60, damageMultiplier: 0.8, rangeMultiplier: 0.8, knockbackMultiplier: 0.8, moveSpeed: 0.0 },
                projectile: {
                    fxProfileId: 'SHADOW_CLONE_ASSIST',
                    kind: 'shadowclones1', // Fullpack
                    spawnFrame: 30,
                    speed: 15,
                    width: 40,
                    height: 40,
                    life: 50,
                    color: '#ff8c00',
                }
            },
            s3: {
                name: 'RASEN SHURIKEN',
                state: 'SPECIAL',
                profileOverrides: { duration: 90, damageMultiplier: 1.8, rangeMultiplier: 1.5, knockbackMultiplier: 2.5, moveSpeed: 1.0 },
                projectile: {
                    kind: 'rasenshuriken', // Fullpack
                    spawnFrame: 45,
                    speed: 12,
                    width: 60,
                    height: 60,
                    life: 80,
                    color: '#e0ffff',
                    spinSpeed: 0.3,
                }
            },
            s4: {
                name: 'KYUUBI BURST',
                state: 'SPECIAL_TRANSFORM',
                profileOverrides: { duration: 65, damageMultiplier: 1.2, rangeMultiplier: 1.4, knockbackMultiplier: 2.0, moveSpeed: 0.0 },
            },
        };

        this.formSprites = {
            base: null,
            kyuubi: null,
        };
        this.formCombos = {
            base: null,
            kyuubi: null,
        };
        this.baseSpeed = this.speed;
        this.kyuubiSpeed = this.baseSpeed + 0.3;

        // Advanced combo tuning remains the same across forms.
        this.comboCancelRatio = 0.52;
        this.comboHitResetFrames = 50;
        this._applyNarutoForm(this.narutoForm, { force: true });
    }

    configureFormSprites(selectedData) {
        if (!selectedData?.sprite) return;
        const options = { ...(selectedData.spriteConfig || {}), fallbackPath: selectedData.thumbnail };
        if (typeof CHARACTER_ROSTER === 'undefined') {
            this.loadSprite(selectedData.sprite, options);
            if (options.mappingPath) this._loadFormCombo(this.narutoForm, options.mappingPath);
            return;
        }

        const family = selectedData?.narutoFamily === 'shippuden' || this.narutoFamily === 'shippuden'
            ? 'shippuden'
            : 'kid';
        this.narutoFamily = family;
        const baseId = family === 'shippuden' ? 'naruto_shippuden' : 'naruto';
        const kyuubiId = family === 'shippuden' ? 'naruto_shippuden_kyuubi' : 'naruto_kyuubi';

        const baseData = CHARACTER_ROSTER.find((c) => c.id === baseId) || selectedData;
        const kyuubiData = CHARACTER_ROSTER.find((c) => c.id === kyuubiId);

        this._loadFormSprite('base', baseData);
        if (kyuubiData) {
            this._loadFormSprite('kyuubi', kyuubiData);
        } else {
            const baseOptions = { ...(baseData.spriteConfig || {}), fallbackPath: baseData.thumbnail };
            if (this.narutoForm === 'base') this.loadSprite(baseData.sprite, baseOptions);
            if (baseOptions.mappingPath) this._loadFormCombo('base', baseOptions.mappingPath);
        }
    }

    _loadFormSprite(form, rosterEntry) {
        if (!rosterEntry?.sprite) return;
        const options = { ...(rosterEntry.spriteConfig || {}), fallbackPath: rosterEntry.thumbnail };
        if (options.mappingPath) this._loadFormCombo(form, options.mappingPath);

        if (typeof SpriteFactory === 'undefined') {
            if (this.narutoForm === form) this.loadSprite(rosterEntry.sprite, options);
            return;
        }

        SpriteFactory.build(rosterEntry.sprite, options)
            .then((result) => {
                if (!result?.image) return;
                this.formSprites[form] = result;
                if (this.narutoForm === form) this._applyFormSprite(form);
            })
            .catch((err) => {
                console.warn(`Naruto ${form} sprite load failed:`, err);
                if (this.narutoForm !== form) return;
                this.loadSprite(rosterEntry.sprite, options);
            });
    }

    _loadFormCombo(form, mappingPath) {
        if (!mappingPath || typeof this.loadComboConfigFromMapping !== 'function') return;
        this.loadComboConfigFromMapping(mappingPath)
            .then((combo) => {
                if (!combo) return;
                this.formCombos[form] = combo;
                if (this.narutoForm === form) this.applyComboConfig(combo);
            })
            .catch((err) => {
                console.warn(`Naruto ${form} combo config load failed:`, err);
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

    _applyNarutoComboRoutes() {
        this._setComboRootRoute('light', { back: 'L_N_1' });
        this._setComboRootRoute('heavy', { back: 'H_N_1' });
        this._patchComboNode('L_F_1', {
            profileOverrides: { rangeMultiplier: 1.16, damageMultiplier: 0.98, duration: 18 },
        });
        this._patchComboNode('L_F_2', {
            profileOverrides: { rangeMultiplier: 1.18, duration: 18 },
            routes: {
                heavy: { forward: 'H_F_1', neutral: 'H_N_1' },
                special: { any: 'S_1' },
            },
        });
        this._patchComboNode('L_D_2', {
            profileOverrides: { hitHeightMultiplier: 0.65, duration: 18 },
            routes: {
                heavy: { down: 'H_D_1', neutral: 'H_N_1' },
            },
        });
        this._patchComboNode('L_A_1', {
            profileOverrides: { hitHeightMultiplier: 0.62, damageMultiplier: 0.86, duration: 18 },
            routes: {
                light: { air: 'L_A_2' },
                heavy: { air: 'H_A_1' },
            },
        });
        this._patchComboNode('H_F_1', {
            profileOverrides: { rangeMultiplier: 1.2, knockbackMultiplier: 1.22, duration: 24 },
            routes: {
                heavy: { forward: 'H_F_2', neutral: 'H_N_2' },
                special: { any: 'S_1' },
            },
        });
        this._patchComboNode('H_F_2', {
            profileOverrides: { damageMultiplier: 1.6, knockbackMultiplier: 1.72, duration: 30 },
            routes: { special: { any: 'S_1' } },
        });
    }

    _applyNarutoForm(form, { force = false } = {}) {
        const nextForm = form === 'kyuubi' ? 'kyuubi' : 'base';
        if (!force && this.narutoForm === nextForm) return;

        this.narutoForm = nextForm;

        if (nextForm === 'kyuubi') {
            this.color = '#D84315';
            this.speed = this.kyuubiSpeed;
            this.attacks = {
                light: { damage: 8, range: 37, hitHeight: 30, duration: 24, chakraCost: 0, knockback: 3.4, offsetY: -10 },
                heavy: { damage: 16, range: 45, hitHeight: 34, duration: 24, chakraCost: 0, knockback: 5.8, offsetY: -8 },
                special: { damage: 35, range: 76, hitHeight: 48, duration: 70, chakraCost: 32, knockback: 14, offsetY: -14, moveSpeed: 2.7, name: 'KYUUBI RASENGAN' },
            };
            this.comboChains = {
                light: [
                    { state: 'ATTACK_LIGHT_1', duration: 24, damageMultiplier: 1.05, rangeMultiplier: 1.02, knockbackMultiplier: 0.95 },
                    { state: 'ATTACK_LIGHT_2', duration: 24, damageMultiplier: 1.2, rangeMultiplier: 1.08, knockbackMultiplier: 1.1 },
                    { state: 'ATTACK_LIGHT_3', duration: 30, damageMultiplier: 1.42, rangeMultiplier: 1.15, knockbackMultiplier: 1.35 },
                ],
                heavy: [
                    { state: 'ATTACK_HEAVY_1', duration: 24, damageMultiplier: 1.3, rangeMultiplier: 1.12, knockbackMultiplier: 1.28 },
                    { state: 'ATTACK_HEAVY_2', duration: 24, damageMultiplier: 1.62, rangeMultiplier: 1.22, knockbackMultiplier: 1.68 },
                ],
                special: [
                    { state: 'SPECIAL', duration: 70, damageMultiplier: 1.2, rangeMultiplier: 1.1, knockbackMultiplier: 1.25 },
                ],
            };
        } else {
            this.color = '#FF8C00';
            this.speed = this.baseSpeed;
            this.attacks = {
                light: { damage: 7, range: 35, hitHeight: 28, duration: 18, chakraCost: 0, knockback: 3, offsetY: -10 },
                heavy: { damage: 14, range: 42, hitHeight: 32, duration: 30, chakraCost: 0, knockback: 5, offsetY: -8 },
                special: { damage: 30, range: 70, hitHeight: 45, duration: 70, chakraCost: 35, knockback: 12, offsetY: -15, moveSpeed: 2.2, name: 'RASENGAN' },
            };
            this.comboChains = {
                light: [
                    { state: 'ATTACK_LIGHT_1', duration: 18, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 0.9 },
                    { state: 'ATTACK_LIGHT_2', duration: 18, damageMultiplier: 1.15, rangeMultiplier: 1.06, knockbackMultiplier: 1.05 },
                    { state: 'ATTACK_LIGHT_3', duration: 24, damageMultiplier: 1.35, rangeMultiplier: 1.12, knockbackMultiplier: 1.3 },
                ],
                heavy: [
                    { state: 'ATTACK_HEAVY_1', duration: 30, damageMultiplier: 1.2, rangeMultiplier: 1.1, knockbackMultiplier: 1.2 },
                    { state: 'ATTACK_HEAVY_2', duration: 30, damageMultiplier: 1.5, rangeMultiplier: 1.2, knockbackMultiplier: 1.55 },
                ],
                special: [
                    { state: 'SPECIAL', duration: 70, damageMultiplier: 1.2, rangeMultiplier: 1.1, knockbackMultiplier: 1.25 },
                ],
            };
        }

        this._refreshComboTree();
        this._applyNarutoComboRoutes();
        const combo = this.formCombos[this.narutoForm];
        if (combo) this.applyComboConfig(combo);
        this._applyFormSprite(this.narutoForm);
    }

    _canStartTransform() {
        if (this.initialNarutoForm !== 'base') return false;
        if (this.narutoForm !== 'base') return false;
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

    _startProjectileThrow() {
        // User requested to remove Naruto's projectile action
        return false;
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
            this._applyNarutoForm('kyuubi');
        }
    }

    reset(x, facingRight) {
        super.reset(x, facingRight);
        this.transformPending = false;
        this._applyNarutoForm(this.initialNarutoForm, { force: true });
    }
}
