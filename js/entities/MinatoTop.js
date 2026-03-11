/* ============================================
   MINATO NAMIKAZE — The Yellow Flash
   ============================================ */

class MinatoFighter extends Fighter {
    constructor(config) {
        super({
            name: 'MINATO',
            color: '#F7C948',
            speed: 5.2,
            jumpPower: -13,
            attackPower: 11,
            defense: 1.0,
            maxHealth: 90,
            maxChakra: 110,
            chakraRegen: 0.14,
            ...config,
        });

        /* ── Attack Profiles ── */
        this.attacks = {
            light: { damage: 7, range: 40, hitHeight: 32, duration: 18, chakraCost: 0, knockback: 2.5, offsetY: -10 },
            heavy: { damage: 14, range: 48, hitHeight: 34, duration: 28, chakraCost: 0, knockback: 5.5, offsetY: -8 },
            special: { damage: 28, range: 78, hitHeight: 42, duration: 90, chakraCost: 35, knockback: 13, offsetY: -12, moveSpeed: 5.5, name: 'RASENGAN' },
        };

        /* ── Special Styles ── */
        this.specialStyles = {
            ...this.specialStyles,
            a: {
                name: 'RASENGAN',
                state: 'SPECIAL',
                profileOverrides: { duration: 90, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 1.0, moveSpeed: 5.5 },
            },
            s1: {
                name: 'HIRAISHIN: LEVEL 1',
                state: 'SPECIAL_TELEPORT',
                profileOverrides: { duration: 40, damageMultiplier: 1.1, rangeMultiplier: 1.2, knockbackMultiplier: 1.1, moveSpeed: 9.0 },
            },
            s2: {
                name: 'HIRAISHIN: LEVEL 2',
                state: 'ATTACK_HEAVY_2',
                profileOverrides: { duration: 48, damageMultiplier: 1.4, rangeMultiplier: 1.2, knockbackMultiplier: 1.5, moveSpeed: 13.0 },
            },
            s3: {
                name: 'YELLOW FLASH',
                state: 'ATTACK_LIGHT_3',
                profileOverrides: { duration: 32, damageMultiplier: 1.2, rangeMultiplier: 1.4, knockbackMultiplier: 1.2, moveSpeed: 11.0 },
            },
            s4: {
                name: 'FLYING THUNDER GOD SLASH',
                state: 'SPECIAL',
                profileOverrides: { duration: 58, damageMultiplier: 1.6, rangeMultiplier: 1.5, knockbackMultiplier: 2.0, moveSpeed: 16.0 },
                projectile: {
                    kind: 'hiraishin_kunai',
                    spawnFrame: 12,
                    speed: 20,
                    width: 28,
                    height: 28,
                    life: 55,
                    color: '#F7C948',
                    spinSpeed: 0.2,
                },
            },
        };

        /* ── Combo Chains ── */
        this.comboChains = {
            light: [
                { state: 'ATTACK_LIGHT_1', duration: 18, cancelWindow: [10, 16] },
                { state: 'ATTACK_LIGHT_2', duration: 20, cancelWindow: [12, 18] },
                { state: 'ATTACK_LIGHT_3', duration: 28, cancelWindow: [18, 26] },
            ],
            heavy: [
                { state: 'ATTACK_HEAVY_1', duration: 28, cancelWindow: [18, 26] },
                { state: 'ATTACK_HEAVY_2', duration: 36, cancelWindow: [24, 34] },
            ],
            special: [
                { state: 'SPECIAL', duration: 90 },
            ],
        };

        /* ── Teleport System ── */
        this.teleporting = false;
        this.teleportPhase = 'none';       // 'vanish' | 'travel' | 'appear' | 'none'
        this.teleportTimer = 0;
        this.teleportOrigin = { x: 0, y: 0 };
        this.teleportTarget = { x: 0, y: 0 };
        this.teleportDashDuration = 16;
        this.teleportMoveSpeed = 10;
        this.teleportVanishFrames = 5;
        this.teleportAppearFrames = 6;

        /* ── Hiraishin Markers (kunai left on stage) ── */
        this.hiraishinMarkers = [];
        this.maxMarkers = 3;
        this.markerLifespan = 600;   // frames

        /* ── After-image Trail ── */
        this.afterimages = [];
        this.afterimageMax = 8;
        this.afterimageRate = 2;     // spawn every N frames while dashing/teleporting
        this.afterimageDecay = 0.12;
        this.afterimageTimer = 0;

        /* ── Yellow Flash VFX ── */
        this.flashVFX = {
            active: false,
            alpha: 0,
            maxAlpha: 0.9,
            x: 0, y: 0,
            radius: 0,
            maxRadius: 120,
            timer: 0,
            duration: 18,
        };

        /* ── Rasengan VFX ── */
        this.rasenganVFX = {
            active: false,
            charge: 0,
            maxCharge: 1.0,
            chargeSpeed: 0.025,
            radius: 0,
            baseRadius: 20,
            maxRadius: 38,
            rotation: 0,
            rotationSpeed: 0.35,
            particles: [],
            coreAlpha: 0,
            rings: 3,
            impactTimer: 0,
        };

        /* ── Speed Lines (for rush moves) ── */
        this.speedLines = [];

        /* ── Chakra Cloak Glow ── */
        this.chakraGlow = {
            active: false,
            alpha: 0,
            pulsePhase: 0,
            color: '#F7C948',
        };

        /* ── Timing ── */
        this.comboCancelRatio = 0.60;
        this.comboHitResetFrames = 36;

        /* ── Animation Definitions ── */
        this._defineAnimations();
    }

    /* =========================================
       Animation Definitions
       ========================================= */
    _defineAnimations() {
        // Frame data: each entry = { duration (frames), hitbox?, fx? }
        this.animData = {
            IDLE: {
                loop: true,
                frameDuration: 8,
                frames: [
                    { bodyOffset: { y: 0 }, armAngle: 0 },
                    { bodyOffset: { y: -1 }, armAngle: 2 },
                    { bodyOffset: { y: -2 }, armAngle: 3 },
                    { bodyOffset: { y: -1 }, armAngle: 2 },
                ],
            },
            RUN: {
                loop: true,
                frameDuration: 4,
                frames: [
                    { bodyOffset: { y: 0 }, lean: 12, armSwing: 25 },
                    { bodyOffset: { y: -3 }, lean: 14, armSwing: -15 },
                    { bodyOffset: { y: -1 }, lean: 12, armSwing: 20 },
                    { bodyOffset: { y: -4 }, lean: 15, armSwing: -20 },
                ],
                spawnAfterimages: true,
            },
            DASH: {
                loop: false,
                frameDuration: 2,
                frames: [
                    { bodyOffset: { y: -2 }, lean: 25, scale: { x: 1.15, y: 0.9 }, alpha: 0.7 },
                    { bodyOffset: { y: -3 }, lean: 30, scale: { x: 1.2, y: 0.85 }, alpha: 0.5 },
                    { bodyOffset: { y: -2 }, lean: 28, scale: { x: 1.18, y: 0.88 }, alpha: 0.3 },
                    { bodyOffset: { y: -1 }, lean: 20, scale: { x: 1.1, y: 0.92 }, alpha: 0.5 },
                    { bodyOffset: { y: 0 }, lean: 15, scale: { x: 1.05, y: 0.95 }, alpha: 0.7 },
                    { bodyOffset: { y: 0 }, lean: 8, scale: { x: 1.0, y: 1.0 }, alpha: 0.9 },
                ],
                spawnAfterimages: true,
                trailColor: '#F7C948',
            },
            TELEPORT: {
                loop: false,
                frameDuration: 2,
                frames: [
                    // Vanish phase
                    { alpha: 1.0, scale: { x: 1.0, y: 1.0 }, flash: false },
                    { alpha: 0.8, scale: { x: 1.1, y: 0.9 }, flash: true },
                    { alpha: 0.5, scale: { x: 1.3, y: 0.7 }, flash: true },
                    { alpha: 0.2, scale: { x: 1.6, y: 0.5 }, flash: true },
                    { alpha: 0.0, scale: { x: 2.0, y: 0.3 }, flash: true },
                    // Travel (invisible)
                    { alpha: 0.0, scale: { x: 0.1, y: 0.1 }, flash: false },
                    { alpha: 0.0, scale: { x: 0.1, y: 0.1 }, flash: false },
                    // Appear phase
                    { alpha: 0.0, scale: { x: 0.3, y: 2.0 }, flash: true },
                    { alpha: 0.3, scale: { x: 0.5, y: 1.5 }, flash: true },
                    { alpha: 0.6, scale: { x: 0.7, y: 1.2 }, flash: true },
                    { alpha: 0.85, scale: { x: 0.9, y: 1.05 }, flash: true },
                    { alpha: 1.0, scale: { x: 1.0, y: 1.0 }, flash: false },
                ],
                triggerFlashVFX: true,
            },
            ATTACK_LIGHT_1: {
                loop: false,
                frameDuration: 3,
                frames: [
                    { armAngle: -10, bodyOffset: { y: 0 }, lean: 0, phase: 'windup' },
                    { armAngle: -30, bodyOffset: { y: -1 }, lean: 5, phase: 'windup' },
                    { armAngle: 60, bodyOffset: { y: -2 }, lean: 10, phase: 'active', hitboxActive: true },
                    { armAngle: 80, bodyOffset: { y: -1 }, lean: 12, phase: 'active', hitboxActive: true },
                    { armAngle: 50, bodyOffset: { y: 0 }, lean: 5, phase: 'recovery' },
                    { armAngle: 20, bodyOffset: { y: 0 }, lean: 0, phase: 'recovery' },
                ],
            },
            ATTACK_LIGHT_2: {
                loop: false,
                frameDuration: 3,
                frames: [
                    { armAngle: 20, bodyOffset: { y: 0 }, lean: 5, phase: 'windup' },
                    { armAngle: -20, bodyOffset: { y: -2 }, lean: -5, phase: 'windup' },
                    { armAngle: -70, bodyOffset: { y: -3 }, lean: -10, phase: 'active', hitboxActive: true },
                    { armAngle: -85, bodyOffset: { y: -2 }, lean: -8, phase: 'active', hitboxActive: true },
                    { armAngle: -40, bodyOffset: { y: -1 }, lean: -3, phase: 'recovery' },
                    { armAngle: 0, bodyOffset: { y: 0 }, lean: 0, phase: 'recovery' },
                ],
            },
            ATTACK_LIGHT_3: {
                loop: false,
                frameDuration: 4,
                frames: [
                    { armAngle: 0, bodyOffset: { y: 0 }, lean: 0, phase: 'windup', bodySquash: { x: 1.0, y: 1.0 } },
                    { armAngle: -15, bodyOffset: { y: -4 }, lean: 0, phase: 'windup', bodySquash: { x: 0.9, y: 1.15 } },
                    { armAngle: 45, bodyOffset: { y: -8 }, lean: 15, phase: 'active', hitboxActive: true, bodySquash: { x: 1.1, y: 0.95 } },
                    { armAngle: 90, bodyOffset: { y: -6 }, lean: 20, phase: 'active', hitboxActive: true, bodySquash: { x: 1.15, y: 0.9 } },
                    { armAngle: 70, bodyOffset: { y: -3 }, lean: 12, phase: 'active', hitboxActive: true },
                    { armAngle: 30, bodyOffset: { y: -1 }, lean: 5, phase: 'recovery' },
                    { armAngle: 10, bodyOffset: { y: 0 }, lean: 0, phase: 'recovery' },
                ],
                spawnAfterimages: true,
            },
            ATTACK_HEAVY_1: {
                loop: false,
                frameDuration: 4,
                frames: [
                    { armAngle: -20, bodyOffset: { y: 0 }, lean: -8, phase: 'windup' },
                    { armAngle: -45, bodyOffset: { y: -2 }, lean: -12, phase: 'windup' },
                    { armAngle: -60, bodyOffset: { y: -3 }, lean: -15, phase: 'windup' },
                    { armAngle: 75, bodyOffset: { y: -4 }, lean: 18, phase: 'active', hitboxActive: true, screenShake: 2 },
                    { armAngle: 95, bodyOffset: { y: -2 }, lean: 22, phase: 'active', hitboxActive: true, screenShake: 3 },
                    { armAngle: 60, bodyOffset: { y: -1 }, lean: 10, phase: 'recovery' },
                    { armAngle: 25, bodyOffset: { y: 0 }, lean: 3, phase: 'recovery' },
                    { armAngle: 0, bodyOffset: { y: 0 }, lean: 0, phase: 'recovery' },
                ],
            },
            ATTACK_HEAVY_2: {
                loop: false,
                frameDuration: 4,
                frames: [
                    { armAngle: 20, bodyOffset: { y: 0 }, lean: 5, phase: 'windup' },
                    { armAngle: 40, bodyOffset: { y: -3 }, lean: 10, phase: 'windup', bodySquash: { x: 0.92, y: 1.1 } },
                    { armAngle: -30, bodyOffset: { y: -6 }, lean: -5, phase: 'active', hitboxActive: true, bodySquash: { x: 1.1, y: 0.92 } },
                    { armAngle: -80, bodyOffset: { y: -8 }, lean: -15, phase: 'active', hitboxActive: true, screenShake: 4 },
                    { armAngle: -90, bodyOffset: { y: -6 }, lean: -18, phase: 'active', hitboxActive: true, screenShake: 5 },
                    { armAngle: -50, bodyOffset: { y: -3 }, lean: -8, phase: 'recovery' },
                    { armAngle: -20, bodyOffset: { y: -1 }, lean: -3, phase: 'recovery' },
                    { armAngle: 0, bodyOffset: { y: 0 }, lean: 0, phase: 'recovery' },
                ],
                spawnAfterimages: true,
            },
            SPECIAL: {
                loop: false,
                frameDuration: 3,
                frames: [
                    // Charge-up (13 frames)
                    { armAngle: 10, bodyOffset: { y: 0 }, lean: 0, phase: 'charge', rasengan: 0.0 },
                    { armAngle: 12, bodyOffset: { y: 0 }, lean: 0, phase: 'charge', rasengan: 0.05 },
                    { armAngle: 15, bodyOffset: { y: -1 }, lean: 0, phase: 'charge', rasengan: 0.15 },
                    { armAngle: 17, bodyOffset: { y: -1 }, lean: 1, phase: 'charge', rasengan: 0.22 },
                    { armAngle: 20, bodyOffset: { y: -2 }, lean: 2, phase: 'charge', rasengan: 0.3 },
                    { armAngle: 22, bodyOffset: { y: -2 }, lean: 2, phase: 'charge', rasengan: 0.4 },
                    { armAngle: 25, bodyOffset: { y: -2 }, lean: 3, phase: 'charge', rasengan: 0.5 },
                    { armAngle: 27, bodyOffset: { y: -2 }, lean: 4, phase: 'charge', rasengan: 0.6 },
                    { armAngle: 30, bodyOffset: { y: -3 }, lean: 5, phase: 'charge', rasengan: 0.7 },
                    { armAngle: 32, bodyOffset: { y: -3 }, lean: 5, phase: 'charge', rasengan: 0.75 },
                    { armAngle: 35, bodyOffset: { y: -3 }, lean: 5, phase: 'charge', rasengan: 0.9 },
                    { armAngle: 38, bodyOffset: { y: -4 }, lean: 10, phase: 'charge', rasengan: 0.95 },
                    { armAngle: 42, bodyOffset: { y: -4 }, lean: 15, phase: 'charge', rasengan: 1.0 },
                    // Rush forward (5 frames)
                    { armAngle: 50, bodyOffset: { y: -5 }, lean: 20, phase: 'rush', rasengan: 1.0, rushSpeed: 0.4 },
                    { armAngle: 55, bodyOffset: { y: -5 }, lean: 24, phase: 'rush', rasengan: 1.0, rushSpeed: 0.7 },
                    { armAngle: 60, bodyOffset: { y: -6 }, lean: 28, phase: 'rush', rasengan: 1.0, rushSpeed: 1.0 },
                    { armAngle: 68, bodyOffset: { y: -6 }, lean: 30, phase: 'rush', rasengan: 1.0, rushSpeed: 1.0 },
                    { armAngle: 75, bodyOffset: { y: -5 }, lean: 32, phase: 'rush', rasengan: 1.0, rushSpeed: 1.0, hitboxActive: true },
                    // Impact (6 frames)
                    { armAngle: 80, bodyOffset: { y: -4 }, lean: 28, phase: 'impact', rasengan: 1.1, hitboxActive: true, screenShake: 6 },
                    { armAngle: 82, bodyOffset: { y: -4 }, lean: 25, phase: 'impact', rasengan: 1.3, hitboxActive: true, screenShake: 8 },
                    { armAngle: 85, bodyOffset: { y: -3 }, lean: 20, phase: 'impact', rasengan: 1.4, hitboxActive: true, screenShake: 10 },
                    { armAngle: 85, bodyOffset: { y: -3 }, lean: 18, phase: 'impact', rasengan: 1.2, hitboxActive: true },
                    { armAngle: 80, bodyOffset: { y: -2 }, lean: 15, phase: 'impact', rasengan: 1.0, hitboxActive: true },
                    { armAngle: 70, bodyOffset: { y: -2 }, lean: 12, phase: 'impact', rasengan: 0.8 },
                    // Recovery (5 frames)
                    { armAngle: 60, bodyOffset: { y: -2 }, lean: 10, phase: 'recovery', rasengan: 0.5 },
                    { armAngle: 45, bodyOffset: { y: -1 }, lean: 8, phase: 'recovery', rasengan: 0.3 },
                    { armAngle: 30, bodyOffset: { y: -1 }, lean: 5, phase: 'recovery', rasengan: 0.1 },
                    { armAngle: 20, bodyOffset: { y: 0 }, lean: 2, phase: 'recovery', rasengan: 0.0 },
                    { armAngle: 10, bodyOffset: { y: 0 }, lean: 0, phase: 'recovery', rasengan: 0.0 },
                ],
                spawnAfterimages: true,
            },
            SPECIAL_TELEPORT: {
                loop: false,
                frameDuration: 3,
                frames: [
                    // Throw kunai pose
                    { armAngle: -30, bodyOffset: { y: 0 }, lean: -5, phase: 'throw' },
                    { armAngle: 70, bodyOffset: { y: -1 }, lean: 10, phase: 'throw', spawnKunai: true },
                    // Vanish
                    { alpha: 0.7, bodyOffset: { y: -2 }, phase: 'vanish', flash: true },
                    { alpha: 0.3, bodyOffset: { y: -2 }, phase: 'vanish', flash: true },
                    { alpha: 0.0, bodyOffset: { y: -2 }, phase: 'vanish', flash: true },
                    // Invisible frames (teleporting)
                    { alpha: 0.0, phase: 'travel' },
                    { alpha: 0.0, phase: 'travel' },
                    // Reappear behind
                    { alpha: 0.0, bodyOffset: { y: -3 }, phase: 'appear', flash: true },
                    { alpha: 0.4, bodyOffset: { y: -2 }, phase: 'appear', flash: true },
                    { alpha: 0.8, bodyOffset: { y: -1 }, phase: 'appear', flash: true },
                    // Strike
                    { alpha: 1.0, armAngle: 85, bodyOffset: { y: -3 }, lean: 20, phase: 'strike', hitboxActive: true, screenShake: 4 },
                    { alpha: 1.0, armAngle: 70, bodyOffset: { y: -2 }, lean: 15, phase: 'strike', hitboxActive: true },
                    // Recovery
                    { alpha: 1.0, armAngle: 30, bodyOffset: { y: -1 }, lean: 5, phase: 'recovery' },
                    { alpha: 1.0, armAngle: 0, bodyOffset: { y: 0 }, lean: 0, phase: 'recovery' },
                ],
                triggerFlashVFX: true,
                spawnAfterimages: true,
            },
