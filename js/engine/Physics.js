/* ============================================
   PHYSICS ENGINE — Advanced Fighting Game Physics
   ============================================
   Fully-featured physics system including:
   • Variable gravity (normal, hitstun, juggle, float)
   • Air control & air friction
   • Ground friction with surface types
   • Wall bounce & ground bounce with decay
   • Launch mechanics (horizontal, diagonal, vertical, spike)
   • Weight classes affecting knockback
   • Terminal velocity (horizontal & vertical)
   • Corner push resolution
   • Fast-fall & float mechanics
   • Dash / air-dash physics
   • Projectile physics (gravity, homing, acceleration)
   • Step-based collision for fast objects
   • Ground snap tolerance
   • Platform support (pass-through)
   • Knockback decay & DI (Directional Influence)
   • Freeze frames physics skip
   • Stage hazard zones
   • Debug / training data exposure
   ============================================ */

class Physics {
    constructor(config = {}) {
        /* ──── Gravity ──── */
        this.gravity = config.gravity ?? 0.55;
        this.hitstunGravity = config.hitstunGravity ?? 0.42;
        this.juggleGravity = config.juggleGravity ?? 0.50;
        this.launchGravity = config.launchGravity ?? 0.35;
        this.floatGravity = config.floatGravity ?? 0.12;
        this.fastFallGravity = config.fastFallGravity ?? 1.10;
        this.projectileGravity = config.projectileGravity ?? 0.0;

        /* ──── Friction ──── */
        this.groundFriction = config.groundFriction ?? 0.75;
        this.airFriction = config.airFriction ?? 0.97;
        this.hitstunFriction = config.hitstunFriction ?? 0.94;
        this.iceFriction = config.iceFriction ?? 0.98;
        this.mudFriction = config.mudFriction ?? 0.70;
        this.stopThreshold = config.stopThreshold ?? 0.15;

        /* ──── Terminal Velocities ──── */
        this.terminalVelocityY = config.terminalVelocityY ?? 14;
        this.terminalVelocityX = config.terminalVelocityX ?? 12;
        this.fastFallTerminal = config.fastFallTerminal ?? 18;

        /* ──── Bounce ──── */
        this.wallBounceDecay = config.wallBounceDecay ?? 0.55;
        this.groundBounceDecay = config.groundBounceDecay ?? 0.45;
        this.wallBounceMinVX = config.wallBounceMinVX ?? 2.8;
        this.groundBounceMinVY = config.groundBounceMinVY ?? 3.5;
        this.maxBounces = config.maxBounces ?? 3;
        this.bounceSpeedThreshold = config.bounceSpeedThreshold ?? 2.0;

        /* ──── Air Control ──── */
        this.airControlFactor = config.airControlFactor ?? 0.35;
        this.airControlMax = config.airControlMax ?? 3.5;
        this.hitstunAirControl = config.hitstunAirControl ?? 0.05;

        /* ──── Knockback ──── */
        this.knockbackDecay = config.knockbackDecay ?? 0.96;
        this.diInfluence = config.diInfluence ?? 0.12;
        this.baseKnockbackScale = config.baseKnockbackScale ?? 1.0;
        this.comboGravityScale = config.comboGravityScale ?? 1.0;

        /* ──── Ground ──── */
        this.groundY = config.groundY ?? 350;
        this.groundSnapTolerance = config.groundSnapTolerance ?? 4;
        this.ceilingY = config.ceilingY ?? -100;

        /* ──── Stage ──── */
        this.stageLeft = config.stageLeft ?? 0;
        this.stageRight = config.stageRight ?? 800;
        this.wallPushStrength = config.wallPushStrength ?? 1.5;

        /* ──── Platforms ──── */
        this.platforms = config.platforms ?? [];

        /* ──── Hazard Zones ──── */
        this.hazardZones = config.hazardZones ?? [];

        /* ──── Step-based collision ──── */
        this.maxPhysicsSteps = config.maxPhysicsSteps ?? 4;
        this.stepThreshold = config.stepThreshold ?? 8;

        /* ──── Surface Type (per-stage override) ──── */
        this.surfaceType = 'normal'; // normal, ice, mud, bouncy

        /* ──── Weight Classes ──── */
        this.weightClasses = {
            feather: { gravityMult: 0.85, knockbackMult: 1.25, fallSpeed: 0.80 },
            light: { gravityMult: 0.92, knockbackMult: 1.12, fallSpeed: 0.90 },
            medium: { gravityMult: 1.00, knockbackMult: 1.00, fallSpeed: 1.00 },
            heavy: { gravityMult: 1.08, knockbackMult: 0.85, fallSpeed: 1.10 },
            superheavy: { gravityMult: 1.18, knockbackMult: 0.70, fallSpeed: 1.22 },
        };

        /* ──── Debug / Metrics ──── */
        this._debugData = {
            lastGravityApplied: 0,
            lastFrictionApplied: 0,
            groundCollisions: 0,
            wallCollisions: 0,
            bouncesTriggered: 0,
            platformLandings: 0,
            stepsUsed: 0,
            hazardHits: 0,
        };

        /* ──── Callback hooks ──── */
        this.onWallBounce = null;  // (fighter, wallSide) => {}
        this.onGroundBounce = null;  // (fighter) => {}
        this.onGroundLand = null;  // (fighter) => {}
        this.onCeilingHit = null;  // (fighter) => {}
        this.onHazardEnter = null;  // (fighter, hazard) => {}
    }

    /* ═══════════════════════════════════════════
       CONFIGURATION
       ═══════════════════════════════════════════ */

    /**
     * Set the ground level for the current stage
     */
    setGroundLevel(y) {
        this.groundY = y;
    }

    /**
     * Configure stage boundaries
     */
    setStageBounds(left, right, groundY, ceilingY) {
        this.stageLeft = left ?? this.stageLeft;
        this.stageRight = right ?? this.stageRight;
        this.groundY = groundY ?? this.groundY;
        this.ceilingY = ceilingY ?? this.ceilingY;
    }

    /**
     * Set surface type for current stage
     */
    setSurfaceType(type) {
        const valid = ['normal', 'ice', 'mud', 'bouncy'];
        this.surfaceType = valid.includes(type) ? type : 'normal';
    }

    /**
     * Set platforms for current stage
     * @param {Array} platforms - [{x, y, width, passThrough}]
     */
    setPlatforms(platforms) {
        this.platforms = (platforms || []).map(p => ({
            x: p.x ?? 0,
            y: p.y ?? 0,
            width: p.width ?? 100,
            passThrough: p.passThrough !== false,
            surfaceType: p.surfaceType || 'normal',
            active: p.active !== false,
        }));
    }

    /**
     * Set hazard zones for current stage
     * @param {Array} zones - [{x, y, width, height, damage, knockbackX, knockbackY, type}]
     */
    setHazardZones(zones) {
        this.hazardZones = (zones || []).map(z => ({
            x: z.x ?? 0,
            y: z.y ?? 0,
            width: z.width ?? 50,
            height: z.height ?? 50,
            damage: z.damage ?? 5,
            knockbackX: z.knockbackX ?? 0,
            knockbackY: z.knockbackY ?? -5,
            type: z.type || 'damage',   // damage, lava, electric, wind
            cooldown: 0,
            maxCooldown: z.cooldown ?? 60,
            active: z.active !== false,
        }));
    }

    /**
     * Apply a complete stage configuration
     */
    applyStageConfig(stage) {
        if (!stage) return;
        this.setGroundLevel(stage.groundY ?? 350);
        this.setStageBounds(
            stage.stageLeft ?? 0,
            stage.stageRight ?? stage.width ?? 800,
            stage.groundY ?? 350,
            stage.ceilingY ?? -100
        );
        this.setSurfaceType(stage.surfaceType || 'normal');
        this.setPlatforms(stage.platforms || []);
        this.setHazardZones(stage.hazardZones || []);
    }

    /**
     * Get the debug data for training mode display
     */
    getDebugData() {
        return { ...this._debugData };
    }

    /**
     * Reset debug counters
     */
    resetDebugCounters() {
        Object.keys(this._debugData).forEach(k => this._debugData[k] = 0);
    }

    _normState(fighter) {
        return (fighter?.state || '').toUpperCase();
    }

    _isHitstunState(fighter, state = this._normState(fighter)) {
        return state === 'HIT' || state === 'HITSTUN' || state === 'KNOCKDOWN' || state === 'LAUNCHED';
    }

    _isBlockingState(fighter, state = this._normState(fighter)) {
        return state === 'BLOCK' || state === 'BLOCKING' || state === 'BLOCKSTUN';
    }

    _isDashingState(fighter, state = this._normState(fighter)) {
        return state === 'DASH' || state === 'DASHING' || fighter?._isDashing;
    }

    /* ═══════════════════════════════════════════
       WEIGHT SYSTEM
       ═══════════════════════════════════════════ */

    /**
     * Get weight class modifiers for a fighter
     */
    _getWeightMods(fighter) {
        const wc = fighter.weightClass || fighter.weight || 'medium';
        return this.weightClasses[wc] || this.weightClasses.medium;
    }

    /* ═══════════════════════════════════════════
       GRAVITY SELECTION
       ═══════════════════════════════════════════ */

    /**
     * Determine which gravity value to use based on fighter state
     */
    _selectGravity(fighter) {
        const wm = this._getWeightMods(fighter);
        let g = this.gravity;

        // State-specific gravity
        const state = this._normState(fighter);

        if (fighter._isFloating || state === 'FLOATING') {
            g = this.floatGravity;
        } else if (fighter._fastFalling || state === 'FASTFALL') {
            g = this.fastFallGravity;
        } else if (state === 'LAUNCHED' || fighter._launched) {
            g = this.launchGravity;
        } else if (this._isHitstunState(fighter, state)) {
            // Juggle gravity increases with combo count
            const juggleCount = fighter._juggleCount || 0;
            const juggleScale = 1 + juggleCount * 0.04 * this.comboGravityScale;
            g = this.hitstunGravity * Math.min(1.8, juggleScale);
        } else if (!fighter.grounded) {
            g = this.gravity;
        }

        // Apply weight modifier
        g *= wm.gravityMult;

        this._debugData.lastGravityApplied = g;
        return g;
    }

    /* ═══════════════════════════════════════════
       FRICTION SELECTION
       ═══════════════════════════════════════════ */

    /**
     * Determine which friction value to use
     */
    _selectFriction(fighter, isGrounded) {
        const state = this._normState(fighter);

        let f;

        if (!isGrounded) {
            // Air friction
            if (this._isHitstunState(fighter, state)) {
                f = this.hitstunFriction;
            } else {
                f = this.airFriction;
            }
        } else {
            // Ground friction based on surface
            const surface = fighter._currentSurface || this.surfaceType;
            switch (surface) {
                case 'ice': f = this.iceFriction; break;
                case 'mud': f = this.mudFriction; break;
                case 'bouncy': f = this.groundFriction; break;
                default: f = this.groundFriction; break;
            }

            // Reduce friction during dashing
            if (this._isDashingState(fighter, state)) {
                f = Math.min(0.99, f + (1 - f) * 0.6);
            }

            // Reduce friction during blocking (slight slide)
            if (this._isBlockingState(fighter, state)) {
                f = Math.min(0.98, f + (1 - f) * 0.3);
            }
        }

        this._debugData.lastFrictionApplied = f;
        return f;
    }

    /* ═══════════════════════════════════════════
       TERMINAL VELOCITY
       ═══════════════════════════════════════════ */

    /**
     * Clamp velocities to terminal limits
     */
    _applyTerminalVelocity(fighter) {
        const wm = this._getWeightMods(fighter);

        // Horizontal terminal velocity
        const maxVX = this.terminalVelocityX;
        fighter.vx = Math.max(-maxVX, Math.min(maxVX, fighter.vx));

        // Vertical terminal velocity
        const isFastFalling = fighter._fastFalling ||
            (fighter.state || '').toUpperCase() === 'FASTFALL';
        const maxVY = isFastFalling
            ? this.fastFallTerminal * wm.fallSpeed
            : this.terminalVelocityY * wm.fallSpeed;

        fighter.vy = Math.max(-maxVY * 1.5, Math.min(maxVY, fighter.vy));
    }

    /* ═══════════════════════════════════════════
       MAIN UPDATE — FIGHTER
       ═══════════════════════════════════════════ */

    /**
     * Update physics for a single fighter
     * Uses step-based integration for fast-moving objects
     */
    update(fighter, dtScale = 1) {
        if (!fighter) return;

        // Skip physics during freeze/hitstop (handled by game)
        if (fighter._physicsFreeze) return;

        const speed = Math.sqrt(
            (fighter.vx || 0) ** 2 +
            (fighter.vy || 0) ** 2
        ) * dtScale;

        // Step-based physics for fast objects
        const steps = speed > this.stepThreshold
            ? Math.min(this.maxPhysicsSteps, Math.ceil(speed / this.stepThreshold))
            : 1;

        const subDt = dtScale / steps;
        this._debugData.stepsUsed = steps;

        for (let step = 0; step < steps; step++) {
            this._physicsStep(fighter, subDt);
        }

        // Post-step processing
        this._applyTerminalVelocity(fighter);
        this._checkHazardZones(fighter, dtScale);
    }

    /**
     * Single physics integration step
     */
    _physicsStep(fighter, dt) {
        const wasGrounded = fighter.grounded;
        const state = this._normState(fighter);

        /* ──── 1. Gravity ──── */
        if (!fighter.grounded) {
            const g = this._selectGravity(fighter);
            fighter.vy += g * dt;
        }

        /* ──── 2. Air Control (DI) ──── */
        if (!fighter.grounded) {
            this._applyAirControl(fighter, dt);
        }

        /* ──── 3. Integrate Position ──── */
        const prevX = fighter.x;
        const prevY = fighter.y;

        fighter.x += (fighter.vx || 0) * dt;
        fighter.y += (fighter.vy || 0) * dt;

        /* ──── 4. Friction ──── */
        const friction = this._selectFriction(fighter, fighter.grounded);
        fighter.vx *= Math.pow(friction, dt);

        // Horizontal stop threshold
        if (fighter.grounded && Math.abs(fighter.vx) < this.stopThreshold) {
            fighter.vx = 0;
        }

        /* ──── 5. Ground Collision ──── */
        this._resolveGroundCollision(fighter, wasGrounded);

        /* ──── 6. Platform Collision ──── */
        if (!fighter.grounded) {
            this._resolvePlatformCollision(fighter, prevY);
        }

        /* ──── 7. Ceiling Collision ──── */
        this._resolveCeilingCollision(fighter);

        /* ──── 8. Wall Collision ──── */
        this._resolveWallCollision(fighter, state);

        /* ──── 9. Bouncy Surface ──── */
        if (this.surfaceType === 'bouncy' && fighter.grounded && fighter.vy === 0) {
            // On bouncy surfaces, add a small upward velocity
            if (wasGrounded === false && Math.abs(prevY - fighter.y) > 1) {
                const bounceV = Math.min(4, Math.abs(fighter._prevVY || 0) * 0.3);
                if (bounceV > 1) {
                    fighter.vy = -bounceV;
                    fighter.grounded = false;
                }
            }
        }
    }

    /* ═══════════════════════════════════════════
       AIR CONTROL
       ═══════════════════════════════════════════ */

    _applyAirControl(fighter, dt) {
        const state = (fighter.state || '').toUpperCase();

        // Determine air control factor based on state
        let control;
        if (this._isHitstunState(fighter, state)) {
            control = this.hitstunAirControl;

            // Directional Influence (DI) — subtle influence during hitstun
            if (fighter._diInput) {
                const diX = fighter._diInput.x || 0;
                const diY = fighter._diInput.y || 0;
                fighter.vx += diX * this.diInfluence * dt;
                fighter.vy += diY * this.diInfluence * 0.5 * dt;
            }
        } else {
            control = this.airControlFactor;
        }

        // Apply air control from fighter's input direction
        if (typeof fighter._airControlInput !== 'undefined' && fighter._airControlInput !== 0) {
            const target = fighter._airControlInput * this.airControlMax;
            const diff = target - fighter.vx;
            fighter.vx += diff * control * dt;
        }
    }

    /* ═══════════════════════════════════════════
       COLLISION RESOLUTION
       ═══════════════════════════════════════════ */

    /**
     * Ground collision detection and resolution
     */
    _resolveGroundCollision(fighter, wasGrounded) {
        if (fighter.y >= this.groundY) {
            // Store previous velocity for bounce calculations
            fighter._prevVY = fighter.vy;

            // Check for ground bounce
            if (!wasGrounded && fighter._groundBounce && this._shouldGroundBounce(fighter)) {
                this._doGroundBounce(fighter);
                return;
            }

            // Normal landing
            fighter.y = this.groundY;
            fighter.grounded = true;

            // Landing detection
            if (!wasGrounded) {
                fighter._justLanded = true;
                fighter._bounceCount = 0;
                fighter._launched = false;
                fighter._fastFalling = false;

                this._debugData.groundCollisions++;

                // Callback
                if (this.onGroundLand) {
                    this.onGroundLand(fighter);
                }

                // Set current surface
                fighter._currentSurface = this.surfaceType;

                // Landing lag velocity reduction
                const state = this._normState(fighter);
                if (!this._isHitstunState(fighter, state)) {
                    fighter.vx *= 0.7;
                }
            }

            fighter.vy = 0;
        } else {
            fighter.grounded = false;

            // Ground snap — if very close to ground and falling slowly
            if (!wasGrounded &&
                fighter.vy > 0 &&
                fighter.vy < 2 &&
                (this.groundY - fighter.y) <= this.groundSnapTolerance) {
                fighter.y = this.groundY;
                fighter.vy = 0;
                fighter.grounded = true;
                fighter._justLanded = true;
                fighter._currentSurface = this.surfaceType;
            }
        }
    }

    /**
     * Ground bounce mechanics
     */
    _shouldGroundBounce(fighter) {
        const bc = fighter._bounceCount || 0;
        return bc < this.maxBounces &&
            Math.abs(fighter.vy) > this.groundBounceMinVY;
    }

    _doGroundBounce(fighter) {
        const bc = fighter._bounceCount || 0;
        const decay = Math.pow(this.groundBounceDecay, bc + 1);
        const bounceVY = Math.abs(fighter.vy) * decay;

        if (bounceVY < this.bounceSpeedThreshold) {
            // Too slow to bounce — just land
            fighter.y = this.groundY;
            fighter.vy = 0;
            fighter.grounded = true;
            fighter._groundBounce = false;
            fighter._bounceCount = 0;
            fighter._justLanded = true;
            return;
        }

        fighter.y = this.groundY - 1;
        fighter.vy = -bounceVY;
        fighter.vx *= 0.85;
        fighter.grounded = false;
        fighter._bounceCount = bc + 1;

        this._debugData.bouncesTriggered++;

        if (this.onGroundBounce) {
            this.onGroundBounce(fighter);
        }
    }

    /**
     * Platform collision (pass-through platforms)
     */
    _resolvePlatformCollision(fighter, prevY) {
        if (!this.platforms.length) return;

        for (const plat of this.platforms) {
            if (!plat.active) continue;

            const hw = plat.width / 2;
            const platLeft = plat.x - hw;
            const platRight = plat.x + hw;

            // Check horizontal bounds
            const fhw = (fighter.width || 40) / 2;
            if (fighter.x + fhw < platLeft || fighter.x - fhw > platRight) continue;

            // Pass-through: only collide when falling through from above
            if (plat.passThrough) {
                if (prevY <= plat.y && fighter.y >= plat.y && fighter.vy >= 0) {
                    // Check if fighter is holding down to drop through
                    if (fighter._holdingDown) continue;

                    fighter.y = plat.y;
                    fighter.vy = 0;
                    fighter.grounded = true;
                    fighter._justLanded = true;
                    fighter._currentSurface = plat.surfaceType || this.surfaceType;
                    fighter._onPlatform = plat;

                    this._debugData.platformLandings++;
                    break;
                }
            } else {
                // Solid platform — collide from all sides
                const platTop = plat.y;
                const platThickness = 10;
                const platBottom = plat.y + platThickness;

                // Top collision (landing)
                if (prevY <= platTop && fighter.y >= platTop && fighter.vy >= 0) {
                    fighter.y = platTop;
                    fighter.vy = 0;
                    fighter.grounded = true;
                    fighter._justLanded = true;
                    fighter._currentSurface = plat.surfaceType || this.surfaceType;
                    fighter._onPlatform = plat;
                    this._debugData.platformLandings++;
                    break;
                }

                // Bottom collision (bonk)
                if (prevY >= platBottom && fighter.y <= platBottom && fighter.vy < 0) {
                    fighter.y = platBottom;
                    fighter.vy = Math.abs(fighter.vy) * 0.2;
                    break;
                }
            }
        }
    }

    /**
     * Ceiling collision
     */
    _resolveCeilingCollision(fighter) {
        if (fighter.y - (fighter.height || 80) < this.ceilingY) {
            fighter.y = this.ceilingY + (fighter.height || 80);
            if (fighter.vy < 0) {
                fighter.vy = Math.abs(fighter.vy) * 0.15;
            }

            if (this.onCeilingHit) {
                this.onCeilingHit(fighter);
            }
        }
    }

    /**
     * Wall / stage boundary collision
     */
    _resolveWallCollision(fighter, state) {
        const hw = (fighter.width || 40) / 2;

        // Left wall
        if (fighter.x - hw < this.stageLeft) {
            fighter.x = this.stageLeft + hw;

            if (this._shouldWallBounce(fighter, state)) {
                this._doWallBounce(fighter, 'left');
            } else {
                if (fighter.vx < 0) fighter.vx = 0;
            }

            this._debugData.wallCollisions++;
        }

        // Right wall
        if (fighter.x + hw > this.stageRight) {
            fighter.x = this.stageRight - hw;

            if (this._shouldWallBounce(fighter, state)) {
                this._doWallBounce(fighter, 'right');
            } else {
                if (fighter.vx > 0) fighter.vx = 0;
            }

            this._debugData.wallCollisions++;
        }
    }

    /**
     * Check if a wall bounce should occur
     */
    _shouldWallBounce(fighter, state) {
        if (!state) state = this._normState(fighter);
        const isInHitstun = this._isHitstunState(fighter, state);
        const fastEnough = Math.abs(fighter.vx) >= this.wallBounceMinVX;
        const canBounce = (fighter._bounceCount || 0) < this.maxBounces;

        return isInHitstun && fastEnough && canBounce;
    }

    _doWallBounce(fighter, side) {
        const bc = fighter._bounceCount || 0;
        const decay = Math.pow(this.wallBounceDecay, bc + 1);
        const bounceVX = Math.abs(fighter.vx) * decay;

        if (bounceVX < this.bounceSpeedThreshold) {
            fighter.vx = 0;
            return;
        }

        fighter.vx = side === 'left' ? bounceVX : -bounceVX;
        fighter.vy = Math.min(fighter.vy, -Math.abs(fighter.vx) * 0.4);
        fighter.grounded = false;
        fighter._bounceCount = bc + 1;

        this._debugData.bouncesTriggered++;

        if (this.onWallBounce) {
            this.onWallBounce(fighter, side);
        }
    }

    /* ═══════════════════════════════════════════
       HAZARD ZONES
       ═══════════════════════════════════════════ */

    _checkHazardZones(fighter, dtScale) {
        if (!this.hazardZones.length) return;

        for (const hz of this.hazardZones) {
            if (!hz.active) continue;
            if (hz.cooldown > 0) { hz.cooldown -= dtScale; continue; }

            const fhw = (fighter.width || 40) / 2;
            const fhh = fighter.height || 80;

            // AABB overlap check
            const overlap =
                fighter.x + fhw > hz.x &&
                fighter.x - fhw < hz.x + hz.width &&
                fighter.y > hz.y &&
                fighter.y - fhh < hz.y + hz.height;

            if (!overlap) continue;

            // Apply hazard effect
            hz.cooldown = hz.maxCooldown;
            this._debugData.hazardHits++;

            switch (hz.type) {
                case 'lava':
                    fighter.vx += hz.knockbackX * 0.5;
                    fighter.vy = Math.min(fighter.vy, hz.knockbackY);
                    fighter.grounded = false;
                    break;

                case 'electric':
                    fighter.vx *= 0.3;
                    fighter.vy = hz.knockbackY;
                    fighter.grounded = false;
                    break;

                case 'wind':
                    fighter.vx += hz.knockbackX;
                    fighter.vy += hz.knockbackY * 0.3;
                    break;

                default: // damage
                    fighter.vx += hz.knockbackX;
                    fighter.vy = Math.min(fighter.vy, hz.knockbackY);
                    fighter.grounded = false;
                    break;
            }

            if (this.onHazardEnter) {
                this.onHazardEnter(fighter, hz);
            }
        }
    }

    /* ═══════════════════════════════════════════
       KNOCKBACK APPLICATION
       ═══════════════════════════════════════════ */

    /**
     * Apply basic knockback to a fighter
     */
    applyKnockback(fighter, directionX, power, options = {}) {
        if (!fighter) return;

        const wm = this._getWeightMods(fighter);
        const scaledPower = power * this.baseKnockbackScale * wm.knockbackMult;

        const angleRad = (options.angle ?? 45) * Math.PI / 180;
        const isSpike = options.spike ?? false;
        const isLaunch = options.launch ?? false;
        const fixedKB = options.fixed ?? false;

        if (fixedKB) {
            // Fixed knockback — ignores weight
            fighter.vx = directionX * scaledPower * Math.cos(angleRad);
            fighter.vy = isSpike
                ? scaledPower * 0.6
                : -scaledPower * Math.sin(angleRad);
        } else {
            // Normal knockback
            fighter.vx = directionX * scaledPower * 0.7;
            fighter.vy = isSpike
                ? scaledPower * 0.5
                : -scaledPower * Math.sin(angleRad) * 0.5;
        }

        fighter.grounded = false;

        if (isLaunch) {
            fighter._launched = true;
            fighter._groundBounce = true;
        }

        if (isSpike) {
            fighter.vy = Math.abs(fighter.vy); // Force downward
            fighter._groundBounce = true;
        }
    }

    /**
     * Apply directional knockback with a specific angle
     */
    applyDirectionalKnockback(fighter, angle, power, options = {}) {
        if (!fighter) return;

        const wm = this._getWeightMods(fighter);
        const scaledPower = power * this.baseKnockbackScale * wm.knockbackMult;

        const angleRad = angle * Math.PI / 180;
        fighter.vx = Math.cos(angleRad) * scaledPower;
        fighter.vy = -Math.sin(angleRad) * scaledPower;
        fighter.grounded = false;

        if (options.launch) fighter._launched = true;
        if (options.groundBounce) fighter._groundBounce = true;
    }

    /**
     * Apply a launch (strong upward knockback)
     */
    applyLaunch(fighter, directionX, power, options = {}) {
        this.applyKnockback(fighter, directionX, power, {
            ...options,
            launch: true,
            angle: options.angle ?? 70,
        });
    }

    /**
     * Apply a spike (downward knockback, usually aerial)
     */
    applySpike(fighter, directionX, power, options = {}) {
        this.applyKnockback(fighter, directionX, power, {
            ...options,
            spike: true,
        });
    }

    /**
     * Apply a wall-splat knockback
     */
    applyWallSplat(fighter, directionX, power) {
        if (!fighter) return;

        const wm = this._getWeightMods(fighter);
        const scaledPower = power * this.baseKnockbackScale * wm.knockbackMult;

        fighter.vx = directionX * scaledPower * 1.2;
        fighter.vy = -scaledPower * 0.15;
        fighter.grounded = false;
        fighter._bounceCount = 0; // Reset for fresh wall bounce
    }

    /**
     * Apply slide knockback (along the ground)
     */
    applySlide(fighter, directionX, power) {
        if (!fighter) return;

        const wm = this._getWeightMods(fighter);
        fighter.vx = directionX * power * wm.knockbackMult * 0.8;
        // Keep on ground
        if (fighter.grounded) {
            fighter.vy = 0;
        }
    }

    /* ═══════════════════════════════════════════
       SPECIAL MOVEMENT PHYSICS
       ═══════════════════════════════════════════ */

    /**
     * Apply dash velocity
     */
    applyDash(fighter, directionX, speed, options = {}) {
        if (!fighter) return;

        const airDash = options.airDash ?? !fighter.grounded;

        fighter.vx = directionX * speed;

        if (airDash) {
            fighter.vy = options.dashVY ?? fighter.vy * 0.3;
            fighter._isAirDashing = true;

            // Cancel fast-fall
            fighter._fastFalling = false;
        }

        fighter._isDashing = true;
    }

    /**
     * Apply jump velocity
     */
    applyJump(fighter, power, options = {}) {
        if (!fighter) return;

        const wm = this._getWeightMods(fighter);
        const jumpPower = power / Math.sqrt(wm.gravityMult);

        fighter.vy = -jumpPower;
        fighter.grounded = false;
        fighter._onPlatform = null;
        fighter._fastFalling = false;
        fighter._launched = false;

        // Short hop
        if (options.shortHop) {
            fighter.vy *= 0.65;
        }

        // Double jump (reduced power)
        if (options.doubleJump) {
            fighter.vy *= 0.8;
        }

        // Directional jump
        if (options.directionX) {
            fighter.vx += options.directionX * (power * 0.25);
        }
    }

    /**
     * Apply fast-fall
     */
    applyFastFall(fighter) {
        if (!fighter || fighter.grounded) return;
        if (fighter.vy < 0) return; // Can only fast-fall while descending

        fighter._fastFalling = true;
        fighter.vy = Math.max(fighter.vy, this.fastFallGravity * 4);
    }

    /**
     * Apply float state (reduced gravity)
     */
    applyFloat(fighter, duration) {
        if (!fighter) return;
        fighter._isFloating = true;
        fighter._floatTimer = duration || 60;
    }

    /**
     * Apply teleport (instant position change with no velocity)
     */
    applyTeleport(fighter, targetX, targetY, options = {}) {
        if (!fighter) return;

        fighter.x = targetX;
        fighter.y = Math.min(targetY, this.groundY);

        if (!options.keepVelocity) {
            fighter.vx = 0;
            fighter.vy = 0;
        }

        fighter.grounded = fighter.y >= this.groundY;
    }

    /* ═══════════════════════════════════════════
       PROJECTILE PHYSICS
       ═══════════════════════════════════════════ */

    /**
     * Update physics for a single projectile
     */
    updateProjectile(proj, dtScale = 1) {
        if (!proj) return false; // false = still alive

        // Apply projectile gravity if any
        const pGrav = proj.gravity ?? this.projectileGravity;
        if (pGrav) {
            proj.vy = (proj.vy || 0) + pGrav * dtScale;
        }

        // Acceleration
        if (proj.acceleration) {
            const accDir = proj.vx >= 0 ? 1 : -1;
            proj.vx += accDir * proj.acceleration * dtScale;
        }

        // Homing behavior
        if (proj.homing && proj.target) {
            this._applyHoming(proj, dtScale);
        }

        // Sine wave movement
        if (proj.wave) {
            proj._wavePhase = (proj._wavePhase || 0) + (proj.wave.speed || 0.1) * dtScale;
            proj.y += Math.sin(proj._wavePhase) * (proj.wave.amplitude || 2) * dtScale;
        }

        // Integrate position
        proj.x += (proj.vx || 0) * dtScale;
        proj.y += (proj.vy || 0) * dtScale;

        // Rotation
        proj.rotation = 0;

        // Travel tracking
        proj.travel = (proj.travel || 0) + Math.sqrt(
            ((proj.vx || 0) * dtScale) ** 2 +
            ((proj.vy || 0) * dtScale) ** 2
        );

        // Life countdown
        proj.life -= dtScale;

        // Check if projectile should be destroyed
        const maxDist = proj.maxDistance || 500;
        const dead = proj.life <= 0 || proj.travel >= maxDist;
        const outOfBounds =
            proj.x < this.stageLeft - 80 ||
            proj.x > this.stageRight + 80 ||
            proj.y < this.ceilingY - 80 ||
            proj.y > this.groundY + 80;

        // Ground collision for gravity projectiles
        if (pGrav > 0 && proj.y >= this.groundY) {
            if (proj.bounceOnGround) {
                proj.y = this.groundY - 1;
                proj.vy = -Math.abs(proj.vy) * 0.5;
                if (Math.abs(proj.vy) < 1) return true; // destroy
            } else {
                return true; // destroy on ground hit
            }
        }

        return dead || outOfBounds;
    }

    /**
     * Update physics for all projectiles in an array
     * Removes dead projectiles automatically
     */
    updateProjectiles(projectiles, dtScale = 1) {
        if (!projectiles || !projectiles.length) return;

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const shouldDestroy = this.updateProjectile(projectiles[i], dtScale);
            if (shouldDestroy) {
                projectiles.splice(i, 1);
            }
        }
    }

    /**
     * Homing projectile behavior
     */
    _applyHoming(proj, dtScale) {
        const target = proj.target;
        if (!target || target.state === 'KO') return;

        const dx = target.x - proj.x;
        const dy = (target.y - (target.height || 0) * 0.5) - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1) return;

        const homingStrength = proj.homing.strength || 0.05;
        const maxTurn = proj.homing.maxTurn || 0.1;

        // Calculate desired angle
        const desiredAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(proj.vy || 0, proj.vx || 0);

        // Smooth turn
        let angleDiff = desiredAngle - currentAngle;
        // Normalize to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        const turn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff * homingStrength));
        const newAngle = currentAngle + turn * dtScale;
        const speed = Math.sqrt((proj.vx || 0) ** 2 + (proj.vy || 0) ** 2);

        proj.vx = Math.cos(newAngle) * speed;
        proj.vy = Math.sin(newAngle) * speed;
    }

    /* ═══════════════════════════════════════════
       PUSH-BOX RESOLUTION
       ═══════════════════════════════════════════ */

    /**
     * Resolve push-box overlap between two fighters
     */
    resolvePushBox(f1, f2, options = {}) {
        if (!f1 || !f2) return;

        const w1 = f1.width || 40;
        const w2 = f2.width || 40;
        const hw1 = w1 / 2;
        const hw2 = w2 / 2;

        const overlap = (hw1 + hw2) - Math.abs(f1.x - f2.x);
        if (overlap <= 0) return;

        const pushForce = options.force ?? 0.5;
        const push = overlap * pushForce;

        // Check wall constraints
        const f1AtLeftWall = f1.x - hw1 <= this.stageLeft;
        const f1AtRightWall = f1.x + hw1 >= this.stageRight;
        const f2AtLeftWall = f2.x - hw2 <= this.stageLeft;
        const f2AtRightWall = f2.x + hw2 >= this.stageRight;

        const f1AtWall = f1AtLeftWall || f1AtRightWall;
        const f2AtWall = f2AtLeftWall || f2AtRightWall;

        if (f1AtWall && !f2AtWall) {
            // Only push f2
            const dir = f1.x < f2.x ? 1 : -1;
            f2.x += dir * push * 2;
        } else if (f2AtWall && !f1AtWall) {
            // Only push f1
            const dir = f2.x < f1.x ? 1 : -1;
            f1.x += dir * push * 2;
        } else if (f1AtWall && f2AtWall) {
            // Both at walls — compress (shouldn't really happen)
            const mid = (f1.x + f2.x) / 2;
            const minDist = hw1 + hw2 + 1;
            if (f1.x < f2.x) {
                f1.x = mid - minDist / 2;
                f2.x = mid + minDist / 2;
            } else {
                f1.x = mid + minDist / 2;
                f2.x = mid - minDist / 2;
            }
        } else {
            // Normal push
            if (f1.x < f2.x) {
                f1.x -= push;
                f2.x += push;
            } else {
                f1.x += push;
                f2.x -= push;
            }
        }

        // Add slight velocity push for feel
        if (options.addVelocity !== false) {
            const velPush = overlap * 0.08;
            if (f1.x < f2.x) {
                f1.vx -= velPush;
                f2.vx += velPush;
            } else {
                f1.vx += velPush;
                f2.vx -= velPush;
            }
        }

        // Ensure within bounds after push
        f1.x = Math.max(this.stageLeft + hw1, Math.min(this.stageRight - hw1, f1.x));
        f2.x = Math.max(this.stageLeft + hw2, Math.min(this.stageRight - hw2, f2.x));
    }

    /**
     * Corner push — extra pressure when an opponent is cornered
     */
    applyCornerPush(fighter, opponent, pushStrength) {
        if (!fighter || !opponent) return;

        const hw = (opponent.width || 40) / 2;
        const atLeft = opponent.x - hw <= this.stageLeft + 10;
        const atRight = opponent.x + hw >= this.stageRight - 10;

        if (!atLeft && !atRight) return;

        // The non-cornered fighter gets pushed back
        const dir = atLeft ? 1 : -1;
        fighter.vx += dir * (pushStrength || this.wallPushStrength);
    }

    /* ═══════════════════════════════════════════
       UTILITY METHODS
       ═══════════════════════════════════════════ */

    /**
     * Check if a position is on the ground
     */
    isOnGround(y) {
        return y >= this.groundY - this.groundSnapTolerance;
    }

    /**
     * Check if a position is near a wall
     */
    isNearWall(x, threshold = 30) {
        const hw = 20; // approximate half-width
        return (x - hw < this.stageLeft + threshold) ||
            (x + hw > this.stageRight - threshold);
    }

    /**
     * Check which wall side a position is closest to
     * Returns: 'left', 'right', or null
     */
    getClosestWall(x, threshold = 50) {
        const hw = 20;
        if (x - hw < this.stageLeft + threshold) return 'left';
        if (x + hw > this.stageRight - threshold) return 'right';
        return null;
    }

    /**
     * Get distance to nearest wall
     */
    distanceToWall(x) {
        return Math.min(
            Math.abs(x - this.stageLeft),
            Math.abs(x - this.stageRight)
        );
    }

    /**
     * Check if a fighter is in a corner (against wall with opponent close)
     */
    isInCorner(fighter, opponent, cornerThreshold = 60) {
        if (!fighter || !opponent) return false;
        const nearWall = this.isNearWall(fighter.x, cornerThreshold);
        const opponentClose = Math.abs(fighter.x - opponent.x) < 100;
        return nearWall && opponentClose;
    }

    /**
     * Get the height above ground for a given y position
     */
    getAltitude(y) {
        return Math.max(0, this.groundY - y);
    }

    /**
     * Calculate total speed
     */
    getSpeed(fighter) {
        if (!fighter) return 0;
        return Math.sqrt((fighter.vx || 0) ** 2 + (fighter.vy || 0) ** 2);
    }

    /**
     * Get the trajectory angle in degrees
     */
    getTrajectoryAngle(fighter) {
        if (!fighter) return 0;
        return Math.atan2(-(fighter.vy || 0), fighter.vx || 0) * 180 / Math.PI;
    }

    /**
     * Predict where a fighter will land given current velocity
     * Returns {x, y, frames} or null if already grounded
     */
    predictLanding(fighter) {
        if (!fighter || fighter.grounded) return null;

        let x = fighter.x;
        let y = fighter.y;
        let vx = fighter.vx || 0;
        let vy = fighter.vy || 0;
        let frames = 0;
        const maxFrames = 300;
        const g = this._selectGravity(fighter);
        const fric = this.airFriction;

        while (y < this.groundY && frames < maxFrames) {
            vy += g;
            vx *= fric;
            x += vx;
            y += vy;
            frames++;
        }

        return { x, y: this.groundY, frames };
    }

    /**
     * Simulate a knockback trajectory and return predicted path
     * Useful for AI planning and trajectory visualization
     */
    simulateKnockback(startX, startY, vx, vy, maxFrames = 120) {
        const path = [];
        let x = startX, y = startY;
        const g = this.hitstunGravity;
        const fric = this.hitstunFriction;

        for (let i = 0; i < maxFrames; i++) {
            vy += g;
            vx *= fric;
            x += vx;
            y += vy;

            path.push({ x, y, frame: i });

            // Stop at ground
            if (y >= this.groundY) {
                path[path.length - 1].y = this.groundY;
                break;
            }

            // Stop at walls
            const hw = 20;
            if (x - hw < this.stageLeft) {
                x = this.stageLeft + hw;
                vx = Math.abs(vx) * this.wallBounceDecay;
            }
            if (x + hw > this.stageRight) {
                x = this.stageRight - hw;
                vx = -Math.abs(vx) * this.wallBounceDecay;
            }
        }

        return path;
    }

    /**
     * Freeze/unfreeze physics for a fighter (during hitstop)
     */
    setFreeze(fighter, frozen) {
        if (!fighter) return;
        fighter._physicsFreeze = !!frozen;
    }

    /**
     * Reset all physics state on a fighter
     */
    resetFighter(fighter) {
        if (!fighter) return;
        fighter.vx = 0;
        fighter.vy = 0;
        fighter.grounded = true;
        fighter._bounceCount = 0;
        fighter._groundBounce = false;
        fighter._launched = false;
        fighter._fastFalling = false;
        fighter._isFloating = false;
        fighter._floatTimer = 0;
        fighter._isDashing = false;
        fighter._isAirDashing = false;
        fighter._physicsFreeze = false;
        fighter._juggleCount = 0;
        fighter._currentSurface = 'normal';
        fighter._onPlatform = null;
        fighter._justLanded = false;
        fighter._diInput = null;
        fighter._airControlInput = 0;
        fighter._holdingDown = false;
    }

    /**
     * Clone the current physics configuration
     */
    cloneConfig() {
        return {
            gravity: this.gravity,
            hitstunGravity: this.hitstunGravity,
            juggleGravity: this.juggleGravity,
            launchGravity: this.launchGravity,
            floatGravity: this.floatGravity,
            fastFallGravity: this.fastFallGravity,
            groundFriction: this.groundFriction,
            airFriction: this.airFriction,
            hitstunFriction: this.hitstunFriction,
            terminalVelocityY: this.terminalVelocityY,
            terminalVelocityX: this.terminalVelocityX,
            wallBounceDecay: this.wallBounceDecay,
            groundBounceDecay: this.groundBounceDecay,
            airControlFactor: this.airControlFactor,
            diInfluence: this.diInfluence,
            groundY: this.groundY,
            stageLeft: this.stageLeft,
            stageRight: this.stageRight,
            ceilingY: this.ceilingY,
            surfaceType: this.surfaceType,
        };
    }

    /**
     * Apply a configuration preset
     */
    applyPreset(presetName) {
        const presets = {
            standard: {
                gravity: 0.55, hitstunGravity: 0.42, groundFriction: 0.82,
                airFriction: 0.97, wallBounceDecay: 0.55, groundBounceDecay: 0.45,
                terminalVelocityY: 14, airControlFactor: 0.35,
            },
            floaty: {
                gravity: 0.35, hitstunGravity: 0.28, groundFriction: 0.85,
                airFriction: 0.98, wallBounceDecay: 0.6, groundBounceDecay: 0.5,
                terminalVelocityY: 10, airControlFactor: 0.5,
            },
            heavy: {
                gravity: 0.75, hitstunGravity: 0.6, groundFriction: 0.78,
                airFriction: 0.96, wallBounceDecay: 0.45, groundBounceDecay: 0.35,
                terminalVelocityY: 18, airControlFactor: 0.25,
            },
            anime: {
                gravity: 0.45, hitstunGravity: 0.35, groundFriction: 0.80,
                airFriction: 0.97, wallBounceDecay: 0.65, groundBounceDecay: 0.55,
                terminalVelocityY: 16, airControlFactor: 0.45,
                diInfluence: 0.15,
            },
            moon: {
                gravity: 0.20, hitstunGravity: 0.15, groundFriction: 0.88,
                airFriction: 0.99, wallBounceDecay: 0.7, groundBounceDecay: 0.65,
                terminalVelocityY: 8, airControlFactor: 0.6,
            },
        };

        const preset = presets[presetName];
        if (!preset) {
            console.warn(`Physics preset "${presetName}" not found.`);
            return;
        }

        Object.keys(preset).forEach(key => {
            if (this.hasOwnProperty(key)) {
                this[key] = preset[key];
            }
        });
    }
}
