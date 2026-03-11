/* ============================================
   GAME — Core Game Class & State Machine
   ============================================
   Fully-featured version including:
   • Fixed-timestep loop with FPS tracking
   • Advanced multi-difficulty AI (easy → impossible)
   • Full combo system with damage-scaling & milestones
   • Screen flash, slow-motion, dramatic finish, cinematic bars
   • Announcer / text-popup system
   • Clash detection when both players swing simultaneously
   • Wall-bounce & ground-bounce mechanics
   • Rich particle VFX (hit, guard, perfect-guard, clash, KO,
     dust, charge, dash, projectile-trail)
   • Floating damage numbers & combo counters
   • Perfect-block reward mechanic
   • Comprehensive match statistics + post-match recap
   • Training mode (infinite HP/chakra/stamina, hitbox display,
     frame data, input history, position reset, dummy behaviour)
   • Per-round replay buffer
   • Push-box overlap resolution & auto-face
   • Auto-pause on tab visibility change
   • Keyboard shortcuts for every debug/training toggle
   • Sound effect hooks
   • Round-win tracking with visual indicators
   • Juggle limit & gravity scaling
   • Guard crush / chip damage
   • Rage / comeback mechanic
   ============================================ */

class Game {
    constructor() {
        /* ──── Core Systems ──── */
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.input = new InputManager();
        this.physics = new Physics();
        this.camera = new Camera(this.renderer.gameWidth, this.renderer.gameHeight);
        this.uiBridge = typeof window !== 'undefined' ? window.UIBridge ?? null : null;

        /* ──── State Machine ──── */
        this.state = 'MENU';
        this.previousState = null;

        /* ──── Fighters & Stage ──── */
        this.fighter1 = null;
        this.fighter2 = null;
        this.currentStage = null;

        /* ──── VFX Layers ──── */
        this.particles = [];
        this.projectiles = [];
        this.textPopups = [];        // floating damage / combo text
        this.afterImages = [];        // dash/teleport after-images

        /* ──── Fight Config ──── */
        this.roundTimer = 99;
        this.roundTimerAccum = 0;
        this.round = 1;
        this.maxRounds = 3;
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.splashTimer = 0;
        this.splashPhase = 0;     // 0 = MANCHE X   1 = COMBAT !   2 = fade-out
        this.roundEndPending = false;
        this.fightStarted = false;

        /* ──── Hitstop & Slow-motion ──── */
        this.hitstopTimer = 0;
        this.slowMotionTimer = 0;
        this.slowMotionScale = 0.30;
        this.globalTimeScale = 1;

        /* ──── Combo Tracking ──── */
        this.combo = {
            p1: this._blankCombo(),
            p2: this._blankCombo(),
        };
        this.COMBO_WINDOW = 35;
        this.COMBO_DISPLAY_DURATION = 100;
        this.JUGGLE_LIMIT = 10;   // max air hits before forced drop

        /* ──── Match Statistics ──── */
        this.stats = this._emptyStats();

        /* ──── Selection Memory ──── */
        this._p1CharId = null;
        this._p2CharId = null;
        this._stageId = null;
        this._bossId = null;
        this.playerSelection = null;
        this.cpuSelection = null;
        this.selectedStage = null;
        this.selectPhase = 'player';

        /* ──── DOM References ──── */
        this.splashOverlay = null;
        this.splashText = null;
        this.resultOverlay = null;
        this.resultText = null;
        this.resultWinner = null;
        this.pauseOverlay = null;
        this.comboGuideOverlay = null;

        /* ──── UI Flags ──── */
        this.pauseMenuActive = false;
        this.comboGuideOpen = false;
        this.comboGuideOpenedFromFight = false;
        this.mappingConfigCache = new Map();

        /* ──── AI System ──── */
        this.fightMode = 'player-vs-cpu';
        this.aiEnabled = false;
        this.aiDifficulty = 'normal';   // easy / normal / hard / impossible
        this.aiControllers = {
            p1: this._createAIControllerState(),
            p2: this._createAIControllerState(),
        };

        /* ──── Training Mode ──── */
        this.trainingMode = false;
        this.trainingConfig = {
            infiniteHealth: true,
            infiniteChakra: true,
            infiniteStamina: true,
            showHitboxes: false,
            showFrameData: false,
            showInputHistory: true,
            dummyAction: 'stand',   // stand / jump / crouch / block / random / reversal
            autoRecover: true,
            resetPosition: false,
            showDamageData: true,
        };
        this.inputHistory = { p1: [], p2: [] };
        this.INPUT_HISTORY_MAX = 40;
        this.showControlsOverlay = false;
        this.hudName1 = 'NINJA 1';
        this.hudName2 = 'NINJA 2';
        this.p1BufferedHp = null;
        this.p2BufferedHp = null;

        /* ──── Announcer ──── */
        this.announcer = { text: '', timer: 0, queue: [], color: '#FFD700', scale: 1 };

        /* ──── Screen Effects ──── */
        this.screenFlash = { active: false, color: '#fff', alpha: 0, decay: 0.08 };
        this.screenDarken = { active: false, alpha: 0, target: 0, speed: 0.04 };
        this.cinematicBars = { active: false, height: 0, target: 0 };
        this.screenShake = { x: 0, y: 0 };

        /* ──── Clash ──── */
        this.clashCooldown = 0;

        /* ──── Dramatic Finish ──── */
        this.dramaticFinish = false;
        this.dramaticTimer = 0;

        /* ──── Comeback / Rage ──── */
        this.rageThreshold = 0.25; // activate below 25% HP

        /* ──── Replay Buffer ──── */
        this.replayBuffer = [];
        this.replayMaxFrames = 10800;   // 3 min @ 60 fps

        /* ──── Performance ──── */
        this.maxParticles = 200;
        this.maxProjectiles = 24;
        this.maxAfterImages = 30;
        this.frameCount = 0;
        this.fpsAccum = 0;
        this.currentFPS = 60;
        this.fpsUpdateTimer = 0;
        this.totalFrames = 0;

        /* ──── Sound Hooks ──── */
        this.soundEnabled = true;
        this.soundQueue = [];
        this.stageEffectTimers = Object.create(null);

        /* ──── Bind Events ──── */
        this._onGlobalKeyDown = this._onGlobalKeyDown.bind(this);
        this._onVisibilityChange = this._onVisibilityChange.bind(this);
        window.addEventListener('keydown', this._onGlobalKeyDown);
        document.addEventListener('visibilitychange', this._onVisibilityChange);

        /* ──── Start Loop ──── */
        this.lastTime = performance.now();
        this.fixedStepMs = 1000 / 60;
        this.maxAccumulatedMs = 250;
        this.accumulatedMs = 0;
        this.renderAlpha = 0;
        this._initUIBridgeState();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    /* ═══════════════════════════════════════════
       CLEANUP
       ═══════════════════════════════════════════ */
    destroy() {
        window.removeEventListener('keydown', this._onGlobalKeyDown);
        document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }

    /* ═══════════════════════════════════════════
       SMALL HELPERS
       ═══════════════════════════════════════════ */
    _blankCombo() {
        return {
            count: 0, damage: 0, timer: 0,
            maxCount: 0, maxDamage: 0,
            displayTimer: 0, lastHitType: '',
            juggleCount: 0,
            hits: [],        // array of {type, damage, frame}
            isActive: false
        };
    }

    _emptyStats() {
        const b = () => ({
            totalDamage: 0, hitsLanded: 0, hitsTaken: 0,
            blocksPerformed: 0, specialsUsed: 0, maxCombo: 0,
            perfectRounds: 0, timeouts: 0, clashesWon: 0,
            perfectBlocks: 0, wallBounces: 0, comebackWins: 0,
            projectilesFired: 0, projectilesHit: 0,
            totalBlockDamage: 0, throwsLanded: 0
        });
        return { p1: b(), p2: b() };
    }

    _normState(fighter) {
        return (fighter?.state || '').toUpperCase();
    }

    _isHitstunState(fighter) {
        const s = this._normState(fighter);
        return s === 'HIT' || s === 'HITSTUN' || s === 'KNOCKDOWN' || s === 'LAUNCHED';
    }

    _isBlockingState(fighter) {
        const s = this._normState(fighter);
        return s === 'BLOCK' || s === 'BLOCKING' || s === 'BLOCKSTUN';
    }

    _isDashingState(fighter) {
        const s = this._normState(fighter);
        return s === 'DASH' || s === 'DASHING' || !!fighter?._isDashing;
    }

    _isChargingState(fighter) {
        const s = this._normState(fighter);
        return s === 'CHARGE' || s === 'CHARGING' || (typeof fighter?.isCharging === 'function' && fighter.isCharging());
    }

    _isPerfectBlock(fighter) {
        return this._isBlockingState(fighter)
            && Number.isFinite(fighter?.blockTimer)
            && fighter.blockTimer <= 4;
    }

    _applyPerfectBlock(def, defKey, atk, att) {
        this.stats[defKey].perfectBlocks++;
        this._triggerHitstop(att, true);
        this.camera.shake(1.5, 5);
        this._spawnPerfectGuard(def.x, def.y - def.height * 0.5);
        this._announce('PERFECT BLOCK!', '#f97316', 50);
        this._queueSound('perfect_block');

        if (typeof def.chakra !== 'undefined') {
            def.chakra = Math.min(def.maxChakra, def.chakra + 6);
        }
        if (typeof def.stamina !== 'undefined') {
            def.stamina = Math.min(def.maxStamina, def.stamina + 10);
        }
        if (atk && typeof atk.applyGuardStagger === 'function') {
            atk.applyGuardStagger(12);
        }
    }

    _isRunningState(fighter) {
        const s = this._normState(fighter);
        return (s === 'IDLE' || s === 'WALK' || s === 'WALKING') && Math.abs(fighter?.vx || 0) > 2 && !!fighter?.grounded;
    }

    _isNoAutoFaceState(fighter) {
        const s = this._normState(fighter);
        return s === 'KO' || s === 'BLOCKSTUN' || this._isHitstunState(fighter);
    }

    _transitionTo(s) {
        this.previousState = this.state;
        this.state = s;
    }

    _lerp(a, b, t) {
        return a + (b - a) * Math.min(1, Math.max(0, t));
    }

    _setUIState(partial) {
        if (this.uiBridge && typeof this.uiBridge.setState === 'function') {
            this.uiBridge.setState(partial);
        }
    }

    _initUIBridgeState() {
        if (this.uiBridge && typeof this.uiBridge.setGame === 'function') {
            this.uiBridge.setGame(this);
        }
        this._syncRosterData();
        this._syncMenuState();
        this._applyCharacterSelectCopy();
    }

    _syncRosterData() {
        this._setUIState({
            roster: Array.isArray(CHARACTER_ROSTER) ? CHARACTER_ROSTER : [],
            stages: Array.isArray(STAGES) ? STAGES : [],
        });
    }

    _syncMenuState() {
        this._setUIState({
            fightMode: this.fightMode || 'player-vs-cpu',
            soundEnabled: !!this.soundEnabled,
        });
    }

    _applyCharacterSelectCopy() {
        const soloTraining = this.isSoloTrainingMode();
        const cpuVsCpu = this._isCpuControlled('p1');
        this._setUIState({
            selectTitle: soloTraining
                ? 'ENTRAINEMENT LIBRE'
                : (cpuVsCpu ? 'SÉLECTION DES COMBATTANTS' : 'SÉLECTION DU NINJA'),
            p1Label: cpuVsCpu ? 'CPU A' : 'NINJA 1',
            p2Label: soloTraining ? '---' : (cpuVsCpu ? 'CPU B' : 'RIVAL'),
            fightMode: this.fightMode || 'player-vs-cpu',
        });
    }

    _resetCharacterSelectFlow() {
        this.playerSelection = null;
        this.cpuSelection = null;
        this.selectedStage = null;
        this.selectPhase = 'player';
    }

    _resetHudState() {
        this.hudName1 = 'NINJA 1';
        this.hudName2 = 'NINJA 2';
        this.p1BufferedHp = null;
        this.p2BufferedHp = null;
    }

    _showMenu() {
        this._setUIState({
            menuVisible: true,
            charSelectVisible: false,
            pauseVisible: false,
            comboGuideVisible: false,
            resultVisible: false,
            splashVisible: false,
        });
        this._syncMenuState();
    }

    _hideMenu() {
        this._setUIState({ menuVisible: false });
    }

    _showCharacterSelect(mode = null) {
        if (mode) {
            const allowed = new Set(['player-vs-cpu', 'cpu-vs-cpu', 'training-solo']);
            this.fightMode = allowed.has(mode) ? mode : 'player-vs-cpu';
        }
        this._resetCharacterSelectFlow();
        this._applyCharacterSelectCopy();
        this._setUIState({
            menuVisible: false,
            charSelectVisible: true,
            resultVisible: false,
            selectedPlayerId: null,
            selectedCpuId: null,
            selectedStageId: null,
            stageSelectVisible: false,
            p1Name: '???',
            p2Name: '???',
        });
        this._primeStagePreviewCache();
    }

    _hideCharacterSelect() {
        this._setUIState({
            charSelectVisible: false,
            stageSelectVisible: false,
        });
    }

    selectCharacter(charId) {
        const char = Array.isArray(CHARACTER_ROSTER)
            ? CHARACTER_ROSTER.find((entry) => entry.id === charId)
            : null;
        if (!char) return;

        try { SoundManager.play('sb3_pop', 0.7); SoundManager.play('ns_pack_next', 0.4); } catch (e) { }

        if (this.selectPhase === 'player') {
            this.playerSelection = charId;
            if (this.isSoloTrainingMode()) {
                this.selectPhase = 'stage';
                this._setUIState({
                    selectedPlayerId: charId,
                    selectedCpuId: null,
                    p1Name: char.name,
                    p2Name: '---',
                    stageSelectVisible: true,
                });
            } else {
                this.selectPhase = 'cpu';
                this._setUIState({
                    selectedPlayerId: charId,
                    p1Name: char.name,
                });
            }
            return;
        }

        if (this.selectPhase === 'cpu') {
            this.cpuSelection = charId;
            this.selectPhase = 'stage';
            this._setUIState({
                selectedCpuId: charId,
                p2Name: char.name,
                stageSelectVisible: true,
            });
        }
    }

    selectStage(stageId) {
        this.selectedStage = stageId;
        this._setUIState({ selectedStageId: stageId });
        try { SoundManager.play('sb3_pop', 0.85); SoundManager.play('ns_pack_next', 0.45); } catch (e) { }
        const stage = Array.isArray(STAGES)
            ? STAGES.find((entry) => entry.id === stageId) || STAGES[0]
            : null;
        const loadToken = (this._stageLoadToken || 0) + 1;
        this._stageLoadToken = loadToken;
        this._selectionStartTime = performance.now();

        this._hideCharacterSelect();
        this._setStageLoadingState(true, stage);

        Promise.resolve()
            .then(() => this._preloadStageAssets(stage))
            .catch((error) => {
                console.warn('Stage preload failed:', error);
            });

        if (this._stageLoadToken !== loadToken) return;
        this.startFight(this.playerSelection, this.cpuSelection, this.selectedStage, {
            keepStageLoading: true,
            preselectedStage: stage,
            stageLoadToken: loadToken,
            selectionStartTime: this._selectionStartTime,
        });
    }

    _primeStagePreviewCache() {
        if (!Array.isArray(STAGES) || !this.renderer || typeof this.renderer._getBackgroundEntry !== 'function') {
            return;
        }

        STAGES.forEach((stage) => {
            if (!stage?.backgroundImage) return;
            try {
                this.renderer._getBackgroundEntry(stage.backgroundImage);
            } catch (error) {
                console.warn('Stage cache warmup failed:', error);
            }
        });
    }

    _showHud() {
        this._setUIState({ hudVisible: true });
    }

    _hideHud() {
        this._setUIState({ hudVisible: false });
    }

    _setStageLoadingState(visible, stage = null) {
        const stageName = stage?.name || 'Arène';
        this._setUIState({
            stageLoadingVisible: !!visible,
            loadingTitle: visible ? 'Préparation du combat' : 'Chargement',
            loadingMessage: visible
                ? `${stageName} est prêt. Chargement des combattants et finalisation du duel.`
                : 'React charge maintenant le runtime du jeu. Le HTML reste limite au bootstrap Vite.',
        });
    }

    _setHudNames(name1, name2) {
        this.hudName1 = name1;
        this.hudName2 = name2;
    }

    _withTimeout(promise, timeoutMs, label = 'async task') {
        return new Promise((resolve) => {
            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                console.warn(`[perf] timeout after ${timeoutMs}ms: ${label}`);
                resolve(null);
            }, timeoutMs);

            Promise.resolve(promise)
                .then((value) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    resolve(value);
                })
                .catch((error) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    console.warn(`${label} failed:`, error);
                    resolve(null);
                });
        });
    }

    _clamp01(value) {
        return Math.max(0, Math.min(1, Number(value) || 0));
    }

    _formatHp(fighter) {
        const hp = Math.max(0, Math.round(fighter.health || 0));
        const maxHp = Math.max(1, Math.round(fighter.maxHealth || 1));
        return `${hp} / ${maxHp}`;
    }

    _resolveHudStateText(fighter) {
        if (!fighter) return '';
        if (fighter.state === 'KO') return 'KO';
        if (fighter._rageActive) return 'RAGE';
        if (fighter.state === 'BLOCK' || (fighter.blockstunTimer || 0) > 0) return 'BLOCK';
        if (fighter.state === 'DASH') return 'DASH';
        return '';
    }

    _updateBufferedHealth(p1Target, p2Target) {
        if (this.p1BufferedHp === null) this.p1BufferedHp = p1Target;
        if (this.p2BufferedHp === null) this.p2BufferedHp = p2Target;

        if (this.p1BufferedHp > p1Target) {
            const d1 = this.p1BufferedHp - p1Target;
            this.p1BufferedHp -= Math.max(0.0045, d1 * 0.12);
        } else {
            this.p1BufferedHp = p1Target;
        }

        if (this.p2BufferedHp > p2Target) {
            const d2 = this.p2BufferedHp - p2Target;
            this.p2BufferedHp -= Math.max(0.0045, d2 * 0.12);
        } else {
            this.p2BufferedHp = p2Target;
        }

        this.p1BufferedHp = this._clamp01(this.p1BufferedHp);
        this.p2BufferedHp = this._clamp01(this.p2BufferedHp);
    }

    _updateHud(fighter1, fighter2, timer, round) {
        const p1Target = this._clamp01(fighter1.getHealthPercent());
        const hasP2 = !!fighter2 && !this.isSoloTrainingMode();
        const p2Target = hasP2 ? this._clamp01(fighter2.getHealthPercent()) : 0;
        this._updateBufferedHealth(p1Target, p2Target);

        this._setUIState({
            hud: {
                p1: {
                    name: this.hudName1,
                    healthPercent: p1Target,
                    bufferedHealthPercent: this.p1BufferedHp,
                    chakraPercent: fighter1.getChakraPercent(),
                    staminaPercent: fighter1.getStaminaPercent(),
                    healthText: this._formatHp(fighter1),
                    stateText: this._resolveHudStateText(fighter1),
                },
                p2: hasP2
                    ? {
                        name: this.hudName2,
                        healthPercent: p2Target,
                        bufferedHealthPercent: this.p2BufferedHp,
                        chakraPercent: fighter2.getChakraPercent(),
                        staminaPercent: fighter2.getStaminaPercent(),
                        healthText: this._formatHp(fighter2),
                        stateText: this._resolveHudStateText(fighter2),
                    }
                    : null,
                timer: Math.ceil(timer),
                round,
            },
        });
    }

    _easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    _easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 :
            Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    _applyRenderInterpolation(alpha) {
        const lerp = (a, b, t) => a + (b - a) * t;
        const t = Math.min(1, Math.max(0, Number(alpha) || 0));
        [this.fighter1, this.fighter2].forEach((f) => {
            if (!f) return;
            const px = Number.isFinite(f.prevX) ? f.prevX : f.x;
            const py = Number.isFinite(f.prevY) ? f.prevY : f.y;
            f.renderX = lerp(px, f.x, t);
            f.renderY = lerp(py, f.y, t);
        });
        this.projectiles.forEach((p) => {
            if (!p) return;
            const px = Number.isFinite(p.prevX) ? p.prevX : p.x;
            const py = Number.isFinite(p.prevY) ? p.prevY : p.y;
            p.renderX = lerp(px, p.x, t);
            p.renderY = lerp(py, p.y, t);
        });
    }

    _queueSound(id, volume = 1.0) {
        if (!this.soundEnabled) return;
        this.soundQueue.push({ id, volume, time: performance.now() });
    }

    _processSounds() {
        // Hook for external sound system
        if (typeof SoundManager !== 'undefined' && this.soundQueue.length) {
            this.soundQueue.forEach(s => {
                try { SoundManager.play(s.id, s.volume); } catch (e) { }
            });
        }
        this.soundQueue = [];
    }

    _createAIControllerState() {
        return {
            decisionTimer: 0,
            decision: null,
            comboStep: 0,
            reactionBuffer: [],
        };
    }

    _resetAIControllers() {
        this.aiControllers = {
            p1: this._createAIControllerState(),
            p2: this._createAIControllerState(),
        };
    }

    setFightMode(mode = 'player-vs-cpu') {
        const normalized = mode === 'cpu-vs-cpu'
            ? 'cpu-vs-cpu'
            : mode === 'training-solo'
                ? 'training-solo'
                : 'player-vs-cpu';
        this.fightMode = normalized;
        this._syncMenuState();
        this._applyCharacterSelectCopy();
        return this.fightMode;
    }

    isCpuVsCpuMode() {
        return this.fightMode === 'cpu-vs-cpu';
    }

    isSoloTrainingMode() {
        return this.fightMode === 'training-solo';
    }

    _isCpuControlled(slot) {
        if (this.isSoloTrainingMode()) return false;
        if (slot === 'p2') return true;
        return this.fightMode === 'cpu-vs-cpu';
    }

    toggleSound(nextEnabled = !this.soundEnabled, { announce = true } = {}) {
        this.soundEnabled = !!nextEnabled;
        if (typeof SoundManager !== 'undefined') {
            if (typeof SoundManager.setMuted === 'function') {
                SoundManager.setMuted(!this.soundEnabled);
            } else if (!this.soundEnabled && typeof SoundManager.stopBgm === 'function') {
                SoundManager.stopBgm();
            }
        }

        if (this.soundEnabled) {
            this._resumeStateBgm();
        }

        this._syncMenuState();

        if (announce && this.state !== 'MENU' && typeof this._announce === 'function') {
            this._announce(
                this.soundEnabled ? 'SON: ON' : 'SON: OFF',
                this.soundEnabled ? '#66BB6A' : '#EF5350',
                50
            );
        }
        return this.soundEnabled;
    }

    _resumeStateBgm() {
        if (!this.soundEnabled || typeof SoundManager === 'undefined') return;
        if (this.state === 'MENU') {
            SoundManager.playBgm('bgm_main_theme', 0.4);
            return;
        }
        if (this.state === 'CHARACTER_SELECT' || this.state === 'BOSS_SELECT') {
            SoundManager.playBgm('bgm_select', 0.4);
            return;
        }
        if (this.currentStage) {
            const bgmId = this.currentStage?.bgmTrack || 'bgm_battle';
            const bgmVol = Number.isFinite(this.currentStage?.bgmVolume) ? this.currentStage.bgmVolume : 0.3;
            SoundManager.playBgm(bgmId, bgmVol);
        }
    }

    /* ═══════════════════════════════════════════
       STATE TRANSITIONS
       ═══════════════════════════════════════════ */
    goToMenu() {
        this._stageLoadToken = (this._stageLoadToken || 0) + 1;
        this._cleanup();
        this._setStageLoadingState(false);
        this._transitionTo('MENU');
        this._showMenu();
        this._hideCharacterSelect();
        this._hideHud();
        this._setUIState({
            resultVisible: false,
            splashVisible: false,
            pauseVisible: false,
            comboGuideVisible: false,
        });
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playBgm('bgm_main_theme', 0.4);
            SoundManager.play('ns_pack_next', 0.45);
        }
    }

    goToCharacterSelect(mode = this.fightMode) {
        this._stageLoadToken = (this._stageLoadToken || 0) + 1;
        this.setFightMode(mode);
        this._cleanup();
        this._setStageLoadingState(false);
        this._transitionTo('CHARACTER_SELECT');
        this._hideMenu();
        this._showCharacterSelect(this.fightMode);
        this._hideHud();
        this._setUIState({
            resultVisible: false,
            splashVisible: false,
            pauseVisible: false,
            comboGuideVisible: false,
        });
        if (typeof SoundManager !== 'undefined') SoundManager.playBgm('bgm_select', 0.4);
    }





    startFight(p1CharId, p2CharId, stageId, options = {}) {
        this._cleanup();
        const fightSetupStartedAt = performance.now();
        const soloTraining = this.isSoloTrainingMode();
        this._p1CharId = p1CharId;
        const availableOpponents = Array.isArray(CHARACTER_ROSTER)
            ? CHARACTER_ROSTER.filter((c) => c.id !== p1CharId)
            : [];
        const fallbackOpponent = availableOpponents.length
            ? availableOpponents[Math.floor(Math.random() * availableOpponents.length)].id
            : p1CharId;
        this._p2CharId = soloTraining ? null : (p2CharId || fallbackOpponent);
        this._stageId = stageId;
        this._bossId = null;
        this.aiEnabled = this._isCpuControlled('p1') || this._isCpuControlled('p2');
        this.aiDifficulty = this.aiDifficulty || 'normal';
        if (soloTraining) this.trainingMode = true;

        /* Create fighters */
        this.fighter1 = createFighter(p1CharId, { x: 250, facingRight: true });
        this.fighter2 = soloTraining ? null : createFighter(this._p2CharId, { x: 550, facingRight: false });

        const p1Data = CHARACTER_ROSTER.find(c => c.id === p1CharId);
        const p2Data = this._p2CharId ? CHARACTER_ROSTER.find(c => c.id === this._p2CharId) : null;
        const setupToken = (this._fightSetupToken || 0) + 1;
        this._fightSetupToken = setupToken;
        const assetJobs = [
            this._withTimeout(
                this._loadFighterAssets(this.fighter1, p1Data, setupToken, p1CharId),
                2500,
                `fighter assets ${p1CharId}`
            )
        ];
        if (this.fighter2) {
            assetJobs.push(
                this._withTimeout(
                    this._loadFighterAssets(this.fighter2, p2Data, setupToken, this._p2CharId),
                    2500,
                    `fighter assets ${this._p2CharId}`
                )
            );
        }

        /* Stage */
        this.currentStage = options.preselectedStage || STAGES.find(s => s.id === stageId) || STAGES[0];
        this.physics.setGroundLevel(this.currentStage.groundY);
        if (typeof this.camera.setGroundY === 'function') {
            this.camera.setGroundY(this.currentStage.groundY);
            if (this.currentStage.groundScreenPercent) {
                this.camera.setGroundScreenY(this.currentStage.groundScreenPercent);
            } else {
                this.camera.setGroundScreenY(0.72); // Default
            }
        }

        [this.fighter1, this.fighter2].filter(Boolean).forEach(f => {
            f.width = 55;
            f.height = 80;
        });

        this.round = 1;
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.stats = this._emptyStats();
        this.fightStarted = true;
        this.replayBuffer = [];
        this.inputHistory = { p1: [], p2: [] };

        if (typeof SoundManager !== 'undefined') {
            const bgmId = this.currentStage?.bgmTrack || 'bgm_battle';
            const bgmVol = Number.isFinite(this.currentStage?.bgmVolume) ? this.currentStage.bgmVolume : 0.3;
            SoundManager.playBgm(bgmId, bgmVol);
        }
        Promise.all(assetJobs).finally(() => {
            if (this._fightSetupToken !== setupToken) return;
            if (options.stageLoadToken && this._stageLoadToken !== options.stageLoadToken) return;
            if (!this.fightStarted || !this.fighter1) return;
            const fighterLoadMs = Math.round(performance.now() - fightSetupStartedAt);
            const totalSelectionMs = Number.isFinite(options.selectionStartTime)
                ? Math.round(performance.now() - options.selectionStartTime)
                : null;
            if (totalSelectionMs !== null) {
                console.info(`[perf] fight ready in ${totalSelectionMs}ms (${fighterLoadMs}ms fighters)`);
            } else {
                console.info(`[perf] fight ready in ${fighterLoadMs}ms (fighters only)`);
            }
            this._startRound();
        });
    }



    startRematch() {
        this._cleanup();
        this._setUIState({ resultVisible: false });
        this.startFight(this._p1CharId, this._p2CharId, this._stageId);
    }

    /* ─── Clean up everything between states ─── */
    _cleanup() {
        this.fightStarted = false;
        this._fightSetupToken = (this._fightSetupToken || 0) + 1;
        this._resetHudState();
        this.closeComboGuide({ resumeIfAutoPaused: false });
        this._closePauseMenu();
        this.hitstopTimer = 0;
        this.slowMotionTimer = 0;
        this.globalTimeScale = 1;
        this.projectiles = [];
        this.particles = [];
        this.textPopups = [];
        this.afterImages = [];
        this.roundEndPending = false;
        this.dramaticFinish = false;
        this.dramaticTimer = 0;
        this.clashCooldown = 0;
        this._resetAIControllers();
        if (this.screenFlash) { this.screenFlash.active = false; this.screenFlash.alpha = 0; }
        this.stageEffectTimers = Object.create(null);
        if (this.screenDarken) { this.screenDarken.active = false; this.screenDarken.alpha = 0; }
        if (this.cinematicBars) { this.cinematicBars.active = false; this.cinematicBars.height = 0; }
        if (this.screenShake) { this.screenShake.x = 0; this.screenShake.y = 0; }
        if (this.announcer) { this.announcer.timer = 0; this.announcer.queue = []; this.announcer.text = ''; }
        this.soundQueue = [];
    }

    _preloadStageAssets(stage) {
        if (!stage?.backgroundImage || !this.renderer || typeof this.renderer._getBackgroundEntry !== 'function') {
            return Promise.resolve();
        }

        const preloadStartedAt = performance.now();
        const entry = this.renderer._getBackgroundEntry(stage.backgroundImage);
        if (!entry || entry.loaded || entry.failed) return Promise.resolve();

        return new Promise((resolve) => {
            let settled = false;
            const finish = () => {
                if (settled) return;
                settled = true;
                clearTimeout(timeoutId);
                entry.image.onload = prevOnload;
                entry.image.onerror = prevOnerror;
                console.info(`[perf] stage background ${stage.id || 'unknown'} ready in ${Math.round(performance.now() - preloadStartedAt)}ms`);
                resolve();
            };
            const prevOnload = entry.image.onload;
            const prevOnerror = entry.image.onerror;
            const timeoutId = setTimeout(finish, 4000);

            entry.image.onload = () => {
                entry.loaded = true;
                if (typeof prevOnload === 'function') prevOnload();
                finish();
            };
            entry.image.onerror = () => {
                entry.failed = true;
                if (typeof prevOnerror === 'function') prevOnerror();
                finish();
            };
        });
    }

    _loadFighterAssets(fighter, data, setupToken = this._fightSetupToken, fighterId = data?.id || fighter?.charId || 'unknown') {
        if (!data) return Promise.resolve();

        // Form-based characters (Naruto/Sasuke) need form setup first
        if (data.sprite && typeof fighter.configureFormSprites === 'function') {
            fighter.configureFormSprites(data);
        }

        const quickVisualJob = this._loadFighterFallbackVisual(fighter, data, setupToken);
        this._hydrateFighterAssetsInBackground(fighter, data, setupToken, fighterId);
        return Promise.all([quickVisualJob]);
    }

    _canApplyFighterAssets(fighter, setupToken) {
        return (
            !!fighter &&
            this._fightSetupToken === setupToken &&
            (fighter === this.fighter1 || fighter === this.fighter2)
        );
    }

    _applyLoadedSpriteResult(fighter, result, setupToken) {
        if (!result || !result.image || !this._canApplyFighterAssets(fighter, setupToken)) return false;
        fighter.spriteSheet = result.image;
        fighter.useFullSprite = false;
        if (result.frameWidth) fighter.frameWidth = result.frameWidth;
        if (result.frameHeight) fighter.frameHeight = result.frameHeight;
        if (result.animations) fighter.animations = result.animations;
        return true;
    }

    _loadImageIntoFighter(fighter, path, setupToken) {
        if (!path) return Promise.resolve(false);
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                if (this._canApplyFighterAssets(fighter, setupToken)) {
                    fighter.spriteSheet = img;
                    fighter.useFullSprite = true;
                    fighter.frameWidth = img.naturalWidth || fighter.frameWidth || 64;
                    fighter.frameHeight = img.naturalHeight || fighter.frameHeight || 64;
                }
                resolve(true);
            };
            img.onerror = () => resolve(false);
            img.src = path;
        });
    }

    _loadFighterFallbackVisual(fighter, data, setupToken) {
        const candidates = [data?.thumbnail, data?.portrait, data?.sprite].filter(Boolean);
        const imageCandidates = candidates.filter((candidate) => /\.(png|jpg|jpeg|gif|webp)$/i.test(String(candidate)));
        if (!imageCandidates.length) return Promise.resolve();

        let chain = Promise.resolve(false);
        imageCandidates.forEach((path) => {
            chain = chain.then((loaded) => {
                if (loaded) return true;
                return this._loadImageIntoFighter(fighter, path, setupToken);
            });
        });
        return chain.then(() => undefined);
    }

    _hydrateFighterAssetsInBackground(fighter, data, setupToken, fighterId) {
        const startedAt = performance.now();
        const jobs = [
            this._applyComboConfigFromRoster(fighter, data),
        ];

        if (data?.sprite && typeof SpriteFactory !== 'undefined') {
            jobs.push(
                SpriteFactory.build(data.sprite, {
                    ...(data.spriteConfig || {}),
                    fallbackPath: data.thumbnail
                }).then((result) => {
                    this._applyLoadedSpriteResult(fighter, result, setupToken);
                }).catch((err) => {
                    console.warn(`Sprite load failed (${fighterId}):`, err);
                })
            );
        } else if (data?.sprite && /\.(png|jpg|jpeg|gif|webp)$/i.test(String(data.sprite))) {
            jobs.push(this._loadImageIntoFighter(fighter, data.sprite, setupToken));
        }

        Promise.allSettled(jobs).then(() => {
            if (!this._canApplyFighterAssets(fighter, setupToken)) return;
            console.info(`[perf] fighter assets hydrated for ${fighterId} in ${Math.round(performance.now() - startedAt)}ms`);
        });
    }

    /* ═══════════════════════════════════════════
       ROUND MANAGEMENT
       ═══════════════════════════════════════════ */
    _startRound() {
        this._cleanup();
        this.fightStarted = true;
        this._setStageLoadingState(false);
        const soloTraining = this.isSoloTrainingMode();
        const w = this.currentStage.width || 800;
        this.fighter1.reset(w * 0.25, true);
        this.fighter1.y = this.currentStage.groundY;
        if (this.fighter2) {
            this.fighter2.reset(w * 0.75, false);
            this.fighter2.y = this.currentStage.groundY;
        }
        [this.fighter1, this.fighter2].filter(Boolean).forEach(f => {
            f.width = 55;
            f.height = 80;
        });

        this.roundTimer = 99;
        this.roundTimerAccum = 0;
        this.roundEndPending = false;
        this.combo = {
            p1: this._blankCombo(),
            p2: this._blankCombo()
        };

        this._setHudNames(this.fighter1.name, soloTraining ? '---' : (this.fighter2?.name || 'RIVAL'));
        this._showHud();

        this._transitionTo('ROUND_SPLASH');
        this.splashPhase = 0;
        this._setUIState({
            splashText: `MANCHE ${this.round}`,
            splashVisible: true,
            resultVisible: false,
        });
        this.splashTimer = 55;

        this._queueSound('round_start');
        this._queueSound('ns_pack_next', 0.45);
    }

    _checkRoundEnd() {
        if (this.isSoloTrainingMode()) return;
        if (this.roundEndPending) return;
        let winner = null, isKO = false, isTimeout = false;

        if (this.fighter1.state === 'KO') {
            winner = 2; isKO = true;
        } else if (this.fighter2.state === 'KO') {
            winner = 1; isKO = true;
        } else if (this.roundTimer <= 0) {
            winner = this.fighter1.health >= this.fighter2.health ? 1 : 2;
            isTimeout = true;
        }
        if (!winner) return;

        this.roundEndPending = true;
        const wKey = winner === 1 ? 'p1' : 'p2';
        const lKey = winner === 1 ? 'p2' : 'p1';
        const wF = winner === 1 ? this.fighter1 : this.fighter2;
        const loser = winner === 1 ? this.fighter2 : this.fighter1;

        if (isTimeout) {
            this.stats[wKey].timeouts++;
            this._announce('TEMPS ÉCOULÉ !', '#FF9800', 70);
            this._queueSound('time_up');
        }

        if (wF.health >= wF.maxHealth) {
            this.stats[wKey].perfectRounds++;
            this._announce('PERFECT!', '#FFD700', 90);
            this._queueSound('perfect');
        }

        // Check comeback win
        if (wF.health < wF.maxHealth * this.rageThreshold) {
            this.stats[wKey].comebackWins++;
            this._announce('COMEBACK!', '#E040FB', 70);
        }

        if (winner === 1) this.p1Wins++; else this.p2Wins++;
        const winsNeeded = Math.ceil(this.maxRounds / 2);
        const matchOver = this.p1Wins >= winsNeeded || this.p2Wins >= winsNeeded;

        /* KO effects */
        if (isKO) {
            this._spawnKOParticles(loser.x, loser.y - loser.height * 0.5, matchOver ? 40 : 20);
            this._flashScreen('#FFFFFF', matchOver ? 0.9 : 0.5);
            this._announce('K.O.!', '#FF1744', 70);
            this._queueSound('ko');

            if (matchOver) {
                this._triggerDramaticFinish(wF, loser);
            }
        }

        /* End active combos */
        ['p1', 'p2'].forEach(k => {
            if (this.combo[k].count >= 2) this._endCombo(k);
        });

        const delay = matchOver ? (this.dramaticFinish ? 2800 : 1800) : 1800;
        this._transitionTo('PAUSED');

        setTimeout(() => {
            if (matchOver) this._showResult(winner);
            else { this.round++; this._startRound(); }
        }, delay);
    }

    _showResult(winner) {
        this._cleanup();
        this._setStageLoadingState(false);
        this._transitionTo('RESULT');
        this._hideHud();
        const name = winner === 1 ? this.fighter1.name : this.fighter2.name;
        this._setUIState({
            resultVisible: true,
            resultText: 'VICTOIRE !',
            resultWinner: name,
            resultStats: this._buildResultStats(),
        });
        this._queueSound('victory');
    }

    _buildResultStats() {
        const s1 = this.stats.p1, s2 = this.stats.p2;
        return {
            p1Name: this.fighter1.name,
            p2Name: this.fighter2.name,
            rows: [
                ['Dégâts infligés', s1.totalDamage, s2.totalDamage],
                ['Coups touchés', s1.hitsLanded, s2.hitsLanded],
                ['Combo max', s1.maxCombo, s2.maxCombo],
                ['Gardes réussies', s1.blocksPerformed, s2.blocksPerformed],
                ['Parades parfaites', s1.perfectBlocks, s2.perfectBlocks],
                ['Techniques utilisées', s1.specialsUsed, s2.specialsUsed],
                ['Projectiles lancés', s1.projectilesFired, s2.projectilesFired],
                ['Projectiles réussis', s1.projectilesHit, s2.projectilesHit],
                ['Rebonds muraux', s1.wallBounces, s2.wallBounces],
                ['Manches parfaites', s1.perfectRounds, s2.perfectRounds],
                ['Retours gagnants', s1.comebackWins, s2.comebackWins],
            ],
        };
    }

    /* ═══════════════════════════════════════════
       DRAMATIC FINISH
       ═══════════════════════════════════════════ */
    _triggerDramaticFinish(winner, loser) {
        this.dramaticFinish = true;
        this.dramaticTimer = 160;
        this._triggerSlowMotion(130, 0.12);
        this.camera.shake(7, 30);
        this._flashScreen('#FFFFFF', 0.95);
        this._setCinematicBars(true);
        this._announce('FIN IMPITOYABLE !', '#FF1744', 130);
        this._queueSound('dramatic_finish');

        // Create massive particle explosion
        for (let w = 0; w < 3; w++) {
            setTimeout(() => {
                this._spawnKOParticles(
                    loser.x + (Math.random() - 0.5) * 40,
                    loser.y - loser.height * 0.3,
                    15
                );
                this._flashScreen('#FFD700', 0.3);
            }, w * 200);
        }
    }

    /* ═══════════════════════════════════════════
       MAIN GAME LOOP
       ═══════════════════════════════════════════ */
    loop(time) {
        const rawDT = Math.max(0, Math.min(time - this.lastTime, 100));
        this.lastTime = time;

        /* FPS tracking */
        this.frameCount++;
        this.fpsAccum += rawDT;
        this.fpsUpdateTimer += rawDT;
        if (this.fpsUpdateTimer >= 500) {
            this.currentFPS = Math.round((this.frameCount / this.fpsAccum) * 1000);
            this.fpsAccum = 0;
            this.frameCount = 0;
            this.fpsUpdateTimer = 0;
        }

        this.accumulatedMs = Math.min(this.maxAccumulatedMs, this.accumulatedMs + rawDT);
        let steps = 0;
        while (this.accumulatedMs >= this.fixedStepMs && steps < 8) {
            this.update(this.fixedStepMs);
            this.accumulatedMs -= this.fixedStepMs;
            this.totalFrames++;
            steps++;
        }

        this.renderAlpha = this.accumulatedMs / this.fixedStepMs;
        this._applyRenderInterpolation(this.renderAlpha);
        this.render();
        this.input.endFrame();
        this._processSounds();
        requestAnimationFrame(this.loop);
    }

    update(dt) {
        const baseDtScale = dt / (1000 / 60);
        const dtScale = baseDtScale * this.globalTimeScale;

        switch (this.state) {
            case 'MENU':
            case 'CHARACTER_SELECT':
            case 'BOSS_SELECT':
                break;

            case 'ROUND_SPLASH':
                this._updateSplash(baseDtScale);
                break;

            case 'FIGHTING':
                this._updateFighting(dt, dtScale);
                break;

            case 'RESULT':
                this._updateParticles(dtScale);
                this._updateTextPopups(dtScale);
                this._updateAfterImages(dtScale);
                this._updateScreenEffects(dtScale);
                break;

            case 'PAUSED':
                this._updateParticles(dtScale * 0.25);
                this._updateTextPopups(dtScale * 0.25);
                this._updateAfterImages(dtScale * 0.25);
                this._updateScreenEffects(dtScale);
                if (this.dramaticFinish) {
                    this.dramaticTimer -= baseDtScale;
                    if (this.dramaticTimer <= 0) {
                        this.dramaticFinish = false;
                        this._setCinematicBars(false);
                    }
                }
                break;
        }

        this._updateAnnouncer(baseDtScale);
    }

    _updateSplash(dtScale) {
        this.splashTimer -= dtScale;

        if (this.splashPhase === 0 && this.splashTimer <= 30) {
            this.splashPhase = 1;
            this._setUIState({ splashText: 'COMBAT !' });
            this._queueSound('fight');
        }
        if (this.splashPhase === 1 && this.splashTimer <= 8) {
            this.splashPhase = 2;
        }
        if (this.splashTimer <= 0) {
            this._setUIState({ splashVisible: false });
            this._transitionTo('FIGHTING');
        }
    }

    /* ═══════════════════════════════════════════
       FIGHTING UPDATE
       ═══════════════════════════════════════════ */
    _updateFighting(dt, dtScale) {
        const f1 = this.fighter1, f2 = this.fighter2;
        const soloTraining = this.isSoloTrainingMode();
        if (!f1) return;
        if (!soloTraining && !f2) return;

        /* Slow-motion */
        if (this.slowMotionTimer > 0) {
            this.slowMotionTimer--;
            this.globalTimeScale = this.slowMotionScale;
            dtScale *= this.slowMotionScale;
        } else {
            this.globalTimeScale = 1;
        }

        /* Input */
        const p1In = this._isCpuControlled('p1')
            ? this._getAIInput('p1', f1, f2)
            : this.input.getPlayerInput(1);
        const p2In = soloTraining
            ? { up: false, down: false, left: false, right: false, light: false, heavy: false, special: false, block: false, transform: false, dash: false }
            : (this._isCpuControlled('p2')
                ? this._getAIInput('p2', f2, f1)
                : this.input.getPlayerInput(2));

        if (this.trainingMode && this.trainingConfig.showInputHistory) {
            this._recordInput(p1In, 'p1');
            if (!soloTraining) this._recordInput(p2In, 'p2');
        }

        /* Replay buffer */
        if (this.replayBuffer.length < this.replayMaxFrames) {
            this.replayBuffer.push({
                p1: { ...p1In },
                p2: { ...p2In },
                f: this.replayBuffer.length
            });
        }

        /* ── Hitstop freeze ── */
        if (this.hitstopTimer > 0) {
            if (typeof f1.bufferInput === 'function') f1.bufferInput(p1In, 0);
            if (!soloTraining && typeof f2?.bufferInput === 'function') f2.bufferInput(p2In, 0);
            this.hitstopTimer = Math.max(0, this.hitstopTimer - dtScale);
            this._updateScreenEffects(dtScale);
            this._updateHud(f1, soloTraining ? null : f2, this.roundTimer, this.round);
            return;
        }

        /* ── Fighter updates ── */
        f1.update(p1In, soloTraining ? null : f2, dtScale);
        if (!soloTraining && f2) f2.update(p2In, f1, dtScale);

        /* Spawned fighter-local sounds */
        const ns1 = f1.consumeSpawnedSounds ? f1.consumeSpawnedSounds() : [];
        const ns2 = (!soloTraining && f2?.consumeSpawnedSounds) ? f2.consumeSpawnedSounds() : [];
        if (ns1.length) ns1.forEach(s => this._queueSound(s.id, s.volume));
        if (ns2.length) ns2.forEach(s => this._queueSound(s.id, s.volume));

        /* Spawned projectiles */
        const np1 = f1.consumeSpawnedProjectiles ? f1.consumeSpawnedProjectiles() : [];
        const np2 = (!soloTraining && f2?.consumeSpawnedProjectiles) ? f2.consumeSpawnedProjectiles() : [];
        if (np1.length) {
            this.stats.p1.specialsUsed += np1.length;
            this.stats.p1.projectilesFired += np1.length;
            np1.forEach((p) => {
                p.prevX = p.x;
                p.prevY = p.y;
                p.renderX = p.x;
                p.renderY = p.y;
                // Default projectile = kunai (no rotation)
                if (!p.imagePath && !p.imageFrames && !p.spriteConfig) {
                    p.imagePath = 'assets/organized/shared/sb3/kakashi_new/kunai__kunai.png';
                    p.imageScale = p.imageScale || 1;
                }
                p.spin = 0;
                p.rotation = 0;
                p.rotateWithVelocity = false;
            });
            this.projectiles.push(...np1);
        }
        if (np2.length) {
            this.stats.p2.specialsUsed += np2.length;
            this.stats.p2.projectilesFired += np2.length;
            np2.forEach((p) => {
                p.prevX = p.x;
                p.prevY = p.y;
                p.renderX = p.x;
                p.renderY = p.y;
                // Default projectile = kunai (no rotation)
                if (!p.imagePath && !p.imageFrames && !p.spriteConfig) {
                    p.imagePath = 'assets/organized/shared/sb3/kakashi_new/kunai__kunai.png';
                    p.imageScale = p.imageScale || 1;
                }
                p.spin = 0;
                p.rotation = 0;
                p.rotateWithVelocity = false;
            });
            this.projectiles.push(...np2);
        }

        /* ── Rage / Comeback Mechanic ── */
        this._updateRage(f1);
        if (!soloTraining) this._updateRage(f2);

        /* ── Physics ── */
        this.physics.update(f1, dtScale);
        if (!soloTraining) this.physics.update(f2, dtScale);

        /* Stage bounds + wall bounce */
        const stageW = this.currentStage.width || 800;
        CollisionSystem.clampToStage(f1, stageW);
        if (!soloTraining) CollisionSystem.clampToStage(f2, stageW);
        this._wallBounce(f1, stageW, 'p1');
        if (!soloTraining) this._wallBounce(f2, stageW, 'p2');

        /* Ground bounce */
        this._groundBounce(f1);
        if (!soloTraining) this._groundBounce(f2);

        /* Push-box overlap */
        if (!soloTraining) this._pushBox(f1, f2);

        /* Auto-face */
        if (!soloTraining && !this._isNoAutoFaceState(f1)) f1.facingRight = f1.x < f2.x;
        if (!soloTraining && !this._isNoAutoFaceState(f2)) f2.facingRight = f2.x < f1.x;

        /* ── After images for dashing ── */
        this._updateDashAfterImages(f1);
        if (!soloTraining) this._updateDashAfterImages(f2);

        /* ── Clash ── */
        if (this.clashCooldown > 0) this.clashCooldown -= dtScale;
        if (!soloTraining && this.clashCooldown <= 0) this._checkClash(f1, f2);

        /* ── Hit resolution ── */
        if (!soloTraining) {
            this._resolveHit(f1, f2, 'p1', 'p2');
            this._resolveHit(f2, f1, 'p2', 'p1');
        }

        /* ── Projectiles ── */
        this._updateStageEffects(dtScale);
        this._updateProjectiles(dtScale);

        /* ── Combos ── */
        this._updateCombos(dtScale);

        /* ── Training ── */
        if (this.trainingMode) this._updateTraining(dtScale);

        /* ── Ambient particles ── */
        this._updateAmbientParticles(f1, soloTraining ? null : f2);

        /* ── Camera / particles / effects / timer ── */
        this.camera.update(f1, soloTraining ? f1 : f2, stageW, dtScale);
        this._updateParticles(dtScale);
        this._updateTextPopups(dtScale);
        this._updateAfterImages(dtScale);
        this._updateScreenEffects(dtScale);

        /* Timer */
        if (!soloTraining) {
            this.roundTimerAccum += dt * this.globalTimeScale;
            if (this.roundTimerAccum >= 1000) {
                this.roundTimerAccum -= 1000;
                this.roundTimer = Math.max(0, this.roundTimer - 1);
                if (this.roundTimer <= 10 && this.roundTimer > 0) {
                    this._announce(`${this.roundTimer}`, '#FF9800', 28);
                    this._queueSound('timer_tick');
                }
            }
        }

        this._updateHud(f1, soloTraining ? null : f2, this.roundTimer, this.round);
        this._checkRoundEnd();
    }

    /* ═══════════════════════════════════════════
       RAGE / COMEBACK MECHANIC
       ═══════════════════════════════════════════ */
    _updateRage(fighter) {
        if (!fighter || fighter.state === 'KO') return;
        const ratio = fighter.health / fighter.maxHealth;
        const shouldRage = ratio <= this.rageThreshold && ratio > 0;

        if (shouldRage && !fighter._rageActive) {
            fighter._rageActive = true;
            fighter._rageDamageBonus = 1.15; // 15% damage boost
            this._spawnRageAura(fighter);
        } else if (!shouldRage && fighter._rageActive) {
            fighter._rageActive = false;
            fighter._rageDamageBonus = 1.0;
        }

        // Visual rage aura
        if (fighter._rageActive && Math.random() < 0.3) {
            this._spawnRageParticle(fighter);
        }
    }

    _spawnRageAura(fighter) {
        this._announce('RAGE!', '#FF1744', 50);
        this._flashScreen('#FF1744', 0.25);
        const cols = ['#FF1744', '#FF5252', '#FF8A80', '#FFD740'];
        for (let i = 0; i < 12; i++) {
            const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 4;
            this._sp({
                x: fighter.x, y: fighter.y - fighter.height * 0.5,
                vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2,
                radius: 2 + Math.random() * 3,
                color: cols[Math.random() * cols.length | 0],
                life: 20 + Math.random() * 15,
                shrink: 0.95, glow: true, shape: 'circle'
            });
        }
    }

    _spawnRageParticle(fighter) {
        const cols = ['#FF1744', '#FF5252', '#D50000'];
        this._sp({
            x: fighter.x + (Math.random() - 0.5) * 30,
            y: fighter.y - Math.random() * fighter.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1 - Math.random() * 2,
            radius: 1 + Math.random() * 2,
            color: cols[Math.random() * cols.length | 0],
            life: 12 + Math.random() * 8,
            shrink: 0.94, glow: true
        });
    }

    /* ═══════════════════════════════════════════
       COMBAT RESOLUTION
       ═══════════════════════════════════════════ */
    _resolveHit(atk, def, atkKey, defKey) {
        if (!atk.isAttacking || !atk.isAttacking() || atk.attackHasHit) return;
        const raw = CollisionSystem.checkAttackHit(atk, def);
        if (!raw) return;

        const cc = this.combo[atkKey].count;
        const rageBonus = atk._rageDamageBonus || 1.0;
        const scaledDmg = Math.max(1, Math.round(raw.damage * this._comboScale(cc) * rageBonus));

        // Juggle limit check
        if (!def.grounded && this.combo[atkKey].juggleCount >= this.JUGGLE_LIMIT) {
            return; // Drop the combo if juggle limit reached
        }

        const att = { ...raw, damage: scaledDmg };

        /* Perfect-block check (defender started blocking ≤ 4 frames ago) */
        const perfectBlock = this._isPerfectBlock(def);

        const hit = def.takeHit(att, atk.x);
        atk.attackHasHit = true;

        if (hit) {
            const impact = this._getImpactProfile(att, atk);
            /* ── Successful hit ── */
            if (typeof atk.onAttackConnected === 'function') {
                atk.onAttackConnected(att);
            }

            this._triggerHitstop({ ...att, hitstop: (att.hitstop || 0) + impact.hitstopBonus }, false);
            this.camera.shake(att.knockback * 0.5 * impact.shakeMultiplier, impact.shakeDuration);

            // Determine particle intensity from knockback
            const power = att.knockback || 3;
            const hitX = def.x;
            const hitY = def.y - def.height * 0.5;
            this._spawnHit(hitX, hitY, power * impact.particlePower);
            this._spawnImpactBurst(hitX, hitY, impact, atk?.facingRight ? 1 : -1);

            // Stats
            this.stats[atkKey].hitsLanded++;
            this.stats[atkKey].totalDamage += scaledDmg;
            this.stats[defKey].hitsTaken++;

            // Combo system
            this._incCombo(atkKey, scaledDmg, att.type || 'hit');
            if (!def.grounded) this.combo[atkKey].juggleCount++;

            // Floating damage
            this._spawnDmgPopup(def.x, def.y - def.height - 10, scaledDmg);

            // Sound
            this._queueSound(power >= 5 ? 'hit_heavy' : 'hit_light');

            // Launch / bounce marking
            if (att.knockback >= 6 && !def.grounded) {
                this._markBounce(def);
            }

            // Critical hit flash on high damage
            if (impact.flashColor) {
                this._flashScreen(impact.flashColor, impact.flashAlpha);
            }
            if (impact.slowMoFrames > 0) {
                this._triggerSlowMotion(impact.slowMoFrames, impact.slowMoScale);
            }

        } else {
            /* ── Blocked ── */
            this.stats[defKey].blocksPerformed++;

            if (!perfectBlock) {
                const chipDmg = Math.max(0, Math.floor(scaledDmg * 0.08));
                if (chipDmg > 0 && typeof def.health !== 'undefined') {
                    def.health = Math.max(1, def.health - chipDmg);
                    this.stats[atkKey].totalDamage += chipDmg;
                    this.stats[defKey].totalBlockDamage += chipDmg;
                }
            }

            if (perfectBlock) {
                this._applyPerfectBlock(def, defKey, atk, att);
            } else {
                this._triggerHitstop(att, true);
                this.camera.shake(Math.max(0.8, att.knockback * 0.2), 6);
                this._spawnGuard(def.x, def.y - def.height * 0.55);
                this._queueSound('block');
            }
        }
    }

    /* ─── Push-box ─── */
    _pushBox(f1, f2) {
        const w1 = f1.width || 40, w2 = f2.width || 40;
        const overlap = (w1 / 2 + w2 / 2) - Math.abs(f1.x - f2.x);
        if (overlap <= 0) return;

        const push = overlap * 0.5;

        // Check if either fighter is against a wall
        const stageW = this.currentStage?.width || 800;
        const f1AtWall = f1.x <= w1 / 2 || f1.x >= stageW - w1 / 2;
        const f2AtWall = f2.x <= w2 / 2 || f2.x >= stageW - w2 / 2;

        if (f1AtWall && !f2AtWall) {
            // Only push f2
            f2.x += f1.x < f2.x ? push * 2 : -push * 2;
        } else if (f2AtWall && !f1AtWall) {
            // Only push f1
            f1.x += f1.x < f2.x ? -push * 2 : push * 2;
        } else {
            // Normal push
            if (f1.x < f2.x) { f1.x -= push; f2.x += push; }
            else { f1.x += push; f2.x -= push; }
        }
    }

    /* ─── Clash ─── */
    _checkClash(f1, f2) {
        if (!f1.isAttacking || !f1.isAttacking() || !f2.isAttacking || !f2.isAttacking()) return;
        if (f1.attackHasHit || f2.attackHasHit) return;
        if (Math.abs(f1.x - f2.x) > 70) return;

        this.clashCooldown = 30;
        f1.attackHasHit = true;
        f2.attackHasHit = true;

        const dir = f1.x < f2.x ? -1 : 1;
        if (typeof f1.vx !== 'undefined') f1.vx = dir * -5;
        if (typeof f2.vx !== 'undefined') f2.vx = dir * 5;

        const mx = (f1.x + f2.x) / 2;
        const my = Math.min(f1.y, f2.y) - 40;

        this._spawnClash(mx, my);
        this._flashScreen('#FFFFFF', 0.7);
        this.camera.shake(5, 15);
        this._triggerHitstop({ hitstop: 14, knockback: 3 }, false);
        this._triggerSlowMotion(15, 0.3);
        this._announce('CHOC !', '#FF6F00', 55);
        this._queueSound('clash');

        // Restore some resources for both
        [f1, f2].forEach(f => {
            if (typeof f.chakra !== 'undefined') {
                f.chakra = Math.min(f.maxChakra, f.chakra + 3);
            }
        });
    }

    /* ─── Wall bounce ─── */
    _wallBounce(f, stageW, key) {
        if (!f || !this._isHitstunState(f)) return;
        const hw = (f.width || 40) / 2;
        const atWall = f.x <= hw || f.x >= stageW - hw;
        const fastEnough = Math.abs(f.vx || 0) > 3;

        if (atWall && fastEnough) {
            if (typeof f.vx !== 'undefined') f.vx *= -0.65;
            if (typeof f.vy !== 'undefined') f.vy = Math.min(f.vy, -3.5);

            this._spawnHit(f.x, f.y - f.height * 0.5, 2);
            this._spawnDust(f.x, f.y, 6);
            this.camera.shake(3, 8);
            this._announce('WALL BOUNCE!', '#9C27B0', 42);
            this._queueSound('wall_bounce');
            if (key) this.stats[key === 'p1' ? 'p2' : 'p1'].wallBounces++;
        }
    }

    /* ─── Ground bounce ─── */
    _groundBounce(f) {
        if (!f || !f._groundBounce) return;
        const groundY = this.currentStage?.groundY || 350;

        if (f.y >= groundY && f._groundBounce) {
            f._groundBounce = false;
            if (typeof f.vy !== 'undefined' && f.vy > 2) {
                f.vy = -(f.vy * 0.5);
                f.y = groundY - 1;
                this._spawnDust(f.x, groundY, 8);
                this.camera.shake(2, 6);
                this._queueSound('ground_bounce');
            }
        }
    }

    _markBounce(f) {
        f._groundBounce = true;
    }

    /* ─── After Images ─── */
    _updateDashAfterImages(fighter) {
        if (!fighter) return;
        const isDashing = this._isDashingState(fighter);
        if (isDashing && this.totalFrames % 3 === 0) {
            if (this.afterImages.length >= this.maxAfterImages) {
                this.afterImages.shift();
            }
            this.afterImages.push({
                x: fighter.x,
                y: fighter.y,
                width: fighter.width,
                height: fighter.height,
                facingRight: fighter.facingRight,
                color: fighter._rageActive ? '#FF1744' : (fighter.color || '#4FC3F7'),
                alpha: 0.6,
                life: 12,
                maxLife: 12
            });
        }
    }

    _updateAfterImages(dtScale) {
        for (let i = this.afterImages.length - 1; i >= 0; i--) {
            const img = this.afterImages[i];
            img.life -= dtScale;
            img.alpha = Math.max(0, (img.life / img.maxLife) * 0.6);
            if (img.life <= 0) this.afterImages.splice(i, 1);
        }
    }

    /* ─── Ambient particles ─── */
    _updateAmbientParticles(f1, f2) {
        [f1, f2].forEach(fighter => {
            if (!fighter) return;

            // Landing dust
            if (fighter._justLanded) {
                this._spawnDust(fighter.x, fighter.y, 5);
                this._queueSound('land');
                fighter._justLanded = false;
            }

            // Charge particles
            const isCharging = this._isChargingState(fighter);
            if (isCharging && Math.random() < 0.45) {
                this._spawnCharge(fighter);
            }

            // Dash particles
            const isDashing = this._isDashingState(fighter);
            if (isDashing && Math.random() < 0.55) {
                this._spawnDash(fighter);
            }

            // Running dust
            const isRunning = this._isRunningState(fighter);
            if (isRunning && Math.random() < 0.15) {
                this._spawnDust(fighter.x, fighter.y, 1);
            }
        });
    }

    /* ═══════════════════════════════════════════
       COMBO SYSTEM
       ═══════════════════════════════════════════ */
    _incCombo(key, dmg, type) {
        const c = this.combo[key];
        c.count++;
        c.damage += dmg;
        c.timer = this.COMBO_WINDOW;
        c.lastHitType = type;
        c.isActive = true;
        c.hits.push({
            type,
            damage: dmg,
            frame: this.totalFrames,
            scaled: this._comboScale(c.count)
        });

        if (c.count > c.maxCount) c.maxCount = c.count;
        if (c.damage > c.maxDamage) c.maxDamage = c.damage;
        if (c.count > this.stats[key].maxCombo) this.stats[key].maxCombo = c.count;

        // Milestone announcements
        const milestones = {
            3: { text: 'NICE COMBO!', color: '#4CAF50', dur: 40 },
            5: { text: 'GREAT COMBO!', color: '#2196F3', dur: 50 },
            8: { text: 'AMAZING COMBO!', color: '#9C27B0', dur: 60 },
            10: { text: 'DEVASTATING!', color: '#FF6F00', dur: 65 },
            12: { text: 'INSANE COMBO!', color: '#FF1744', dur: 70 },
            15: { text: 'LEGENDARY!', color: '#FFD700', dur: 80 },
            20: { text: 'GODLIKE COMBO!', color: '#E040FB', dur: 90 },
        };

        if (milestones[c.count]) {
            const m = milestones[c.count];
            this._announce(m.text, m.color, m.dur);
            this._queueSound('combo_milestone');
            if (c.count >= 10) this._flashScreen(m.color, 0.15);
        } else if (c.count >= 20 && c.count % 5 === 0) {
            this._announce(`${c.count} HITS!`, '#FFD700', 60);
        }

        // Combo counter popup near the victim
        const defender = key === 'p1' ? this.fighter2 : this.fighter1;
        if (defender && c.count >= 2) {
            this._spawnComboPopup(defender.x, defender.y - defender.height - 25, c.count, c.damage);
        }
    }

    _endCombo(key) {
        const c = this.combo[key];
        if (c.count >= 2) {
            c.displayTimer = this.COMBO_DISPLAY_DURATION;
        }
        c.count = 0;
        c.damage = 0;
        c.timer = 0;
        c.juggleCount = 0;
        c.isActive = false;
        c.hits = [];
    }

    _updateCombos(dtScale) {
        ['p1', 'p2'].forEach(k => {
            const c = this.combo[k];
            if (c.timer > 0) {
                c.timer -= dtScale;
                if (c.timer <= 0) this._endCombo(k);
            }
            if (c.displayTimer > 0) {
                c.displayTimer -= dtScale;
            }
        });
    }

    _comboScale(n) {
        if (n <= 1) return 1.00;
        if (n <= 2) return 0.95;
        if (n <= 3) return 0.90;
        if (n <= 5) return 0.75;
        if (n <= 7) return 0.65;
        if (n <= 10) return 0.55;
        if (n <= 15) return 0.40;
        return 0.25;
    }

    /* ═══════════════════════════════════════════
       AI (MULTI-DIFFICULTY)
       ═══════════════════════════════════════════ */
    _getAIInput(controllerKey, ai, target) {
        const brain = this.aiControllers[controllerKey]
            || (this.aiControllers[controllerKey] = this._createAIControllerState());
        const dx = target.x - ai.x;
        const dist = Math.abs(dx);
        const D = this._aiParams();

        brain.decisionTimer--;
        if (brain.decisionTimer > 0 && brain.decision) {
            return this._aiApply(brain, brain.decision, ai, target, dist, dx, D);
        }

        brain.decisionTimer = D.interval + Math.floor(Math.random() * D.variance);

        const tAttacking = target.isAttacking ? target.isAttacking() : false;
        const projThreat = this.projectiles.some(p =>
            p.owner === target && Math.abs(p.x - ai.x) < 220);
        const lowHP = ai.health < ai.maxHealth * 0.3;
        const veryLowHP = ai.health < ai.maxHealth * 0.15;
        const tInHitstun = this._isHitstunState(target) || this._normState(target) === 'BLOCKSTUN';
        const tIsBlocking = this._isBlockingState(target);
        const aiAirborne = !ai.grounded;
        const tAirborne = !target.grounded;

        let d = 'neutral';

        // Priority-based decision making
        if (tAttacking && dist < 90 && Math.random() < D.block) {
            d = 'block';
        } else if (projThreat && Math.random() < D.block * 0.85) {
            d = dist < 110 ? 'block' : 'evade';
        } else if (tInHitstun && dist < 55 && Math.random() < D.aggro * 1.2) {
            d = 'combo'; // Capitalize on opponent's hitstun
        } else if (dist < 40 && Math.random() < D.aggro) {
            d = 'combo';
        } else if (dist < 70 && Math.random() < D.aggro * 0.8) {
            d = 'attack';
        } else if (ai.chakra > ai.maxChakra * 0.7 && dist < 80 && Math.random() < D.special) {
            d = 'special';
        } else if (dist > 180 && ai.chakra > 35 && Math.random() < D.zone) {
            d = 'special';
        } else if (dist > 250 && ai.chakra < ai.maxChakra * 0.28 && Math.random() < 0.55) {
            d = 'charge';
        } else if (dist > 250 && ai.chakra < ai.maxChakra * 0.5 && Math.random() < 0.3) {
            d = 'approach';
        } else if (dist > 140 && ai.stamina > 30 && Math.random() < D.dash) {
            d = 'approach';
        } else if (veryLowHP && Math.random() < 0.25) {
            d = 'retreat';
        } else if (lowHP && Math.random() < 0.12) {
            d = 'retreat';
        } else if (aiAirborne && dist < 60 && Math.random() < D.aggro * 0.5) {
            d = 'air_attack';
        } else if (tAirborne && dist < 100 && Math.random() < D.aggro * 0.4) {
            d = 'anti_air';
        } else if (tIsBlocking && dist < 50 && Math.random() < 0.15) {
            d = 'mixup_attempt'; // Pressure blocking opponents with a forward heavy.
        } else {
            d = Math.random() < 0.55 ? 'approach' : 'neutral';
        }

        brain.decision = d;
        return this._aiApply(brain, d, ai, target, dist, dx, D);
    }

    _aiApply(brain, d, ai, t, dist, dx, D) {
        const i = {
            up: false, down: false, left: false, right: false,
            light: false, heavy: false, special: false, block: false,
            transform: false, dash: false,
        };

        const moveToward = () => { i.left = dx < 0; i.right = dx > 0; };
        const moveAway = () => { i.left = dx > 0; i.right = dx < 0; };
        const applySpecialVariant = () => {
            if (!ai || !t) return;
            if (!t.grounded && dist < 110) {
                i.up = true;
                return;
            }
            if (this._isBlockingState(t) && dist < 70) {
                moveAway();
                return;
            }
            if (dist < 50) {
                i.down = true;
                return;
            }
            if (dist > 130) {
                moveToward();
                return;
            }
            if (Math.random() < 0.33) {
                moveToward();
            }
        };

        if (d !== 'combo') {
            brain.comboStep = 0;
        }

        switch (d) {
            case 'approach':
                moveToward();
                if (dist > 180 && ai.stamina > 25 && Math.random() < 0.1) i.dash = true;
                if (Math.random() < 0.02 && ai.grounded) i.up = true;
                break;

            case 'attack':
                if (dist > 50) moveToward();
                if (dist < 60) {
                    Math.random() < D.lightP ? (i.light = true) : (i.heavy = true);
                }
                break;

            case 'air_attack':
                if (dist > 40) moveToward();
                if (dist < 55) i.light = true;
                break;

            case 'anti_air':
                if (dist > 55) moveToward();
                if (!ai.grounded || Math.random() < 0.3) i.up = true;
                if (dist < 50) i.heavy = true;
                break;

            case 'combo':
                if (dist > 40) moveToward();
                brain.comboStep = brain.comboStep || 0;
                if (brain.comboStep < 2) {
                    i.light = true;
                    brain.comboStep++;
                } else if (brain.comboStep === 2) {
                    i.light = true;
                    brain.comboStep++;
                } else if (brain.comboStep === 3) {
                    i.heavy = true;
                    brain.comboStep++;
                } else if (brain.comboStep === 4) {
                    if (ai.chakra > 35 && Math.random() < D.special * 2) {
                        i.special = true;
                        applySpecialVariant();
                    } else {
                        i.heavy = true;
                    }
                    brain.comboStep++;
                } else {
                    if (ai.chakra > 50) {
                        i.special = true;
                        applySpecialVariant();
                    }
                    brain.comboStep = 0;
                }
                break;

            case 'special':
                if (ai.chakra > 35) {
                    i.special = true;
                    applySpecialVariant();
                }
                else if (dist > 50) moveToward();
                break;

            case 'charge':
                i.block = true;
                break;

            case 'block':
                i.block = true;
                if (dist > 90) moveAway();
                break;

            case 'evade':
                moveAway();
                if (ai.grounded && Math.random() < 0.35) i.up = true;
                if (ai.stamina > 20 && Math.random() < 0.25) i.dash = true;
                break;

            case 'retreat':
                moveAway();
                if (Math.random() < 0.15) i.block = true;
                if (ai.stamina > 30 && Math.random() < 0.08) i.dash = true;
                break;

            case 'mixup_attempt':
                moveToward();
                // Use a close forward-heavy to crack passive blocking.
                if (dist < 35) i.heavy = true;
                break;

            default: // neutral
                if (dist > 120) moveToward();
                if (Math.random() < 0.01 && ai.grounded) i.up = true;
                if (Math.random() < 0.05) i.block = true;
        }

        // Transform check
        if (typeof ai.canTransform === 'function' && ai.canTransform() && Math.random() < D.xform) {
            i.transform = true;
        }

        return i;
    }

    _aiParams() {
        const map = {
            easy: {
                interval: 22, variance: 18,
                block: 0.18, aggro: 0.25, lightP: 0.80,
                special: 0.04, zone: 0.04, dash: 0.02, xform: 0.001
            },
            normal: {
                interval: 12, variance: 8,
                block: 0.45, aggro: 0.50, lightP: 0.65,
                special: 0.12, zone: 0.10, dash: 0.05, xform: 0.005
            },
            hard: {
                interval: 5, variance: 3,
                block: 0.72, aggro: 0.68, lightP: 0.55,
                special: 0.22, zone: 0.16, dash: 0.12, xform: 0.012
            },
            impossible: {
                interval: 1, variance: 1,
                block: 0.95, aggro: 0.85, lightP: 0.50,
                special: 0.35, zone: 0.22, dash: 0.18, xform: 0.025
            },
        };
        return map[this.aiDifficulty] || map.normal;
    }

    /* ═══════════════════════════════════════════
       PROJECTILES
       ═══════════════════════════════════════════ */
    _updateProjectiles(dtScale) {
        const f1 = this.fighter1, f2 = this.fighter2;
        if (!f1 || (!f2 && !this.isSoloTrainingMode())) return;

        // Cap projectiles
        while (this.projectiles.length > this.maxProjectiles) {
            this.projectiles.shift();
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.prevX = p.x;
            p.prevY = p.y;
            p.x += p.vx * dtScale;
            p.y += (p.vy || 0) * dtScale;
            // Rotation disabled — projectiles fly straight
            p.rotation = 0;
            p.life -= dtScale;
            p.travel = (p.travel || 0) + Math.abs(p.vx) * dtScale;

            // Trail particles
            if (!p.visualOnly && Math.random() < 0.4) this._spawnTrail(p);

            const dead = p.life <= 0 || p.travel >= (p.maxDistance || 400);
            const stageW = this.currentStage.width || 800;
            const offStage = p.x < -50 || p.x > stageW + 50 ||
                p.y < -100 || p.y > (this.currentStage.groundY || 400) + 50;

            if (dead || offStage) {
                if (dead && p.explosive) {
                    this._spawnProjectileExplosion(p.x, p.y, p);
                    this._queueSound('kakashi_kunai_explosion', 0.95);
                    this._queueSound('kakashi_sample4', 0.62);
                }
                // Death particles
                if (dead && !offStage) {
                    for (let j = 0; j < 4; j++) {
                        this._sp({
                            x: p.x, y: p.y,
                            vx: (Math.random() - 0.5) * 3,
                            vy: (Math.random() - 0.5) * 3,
                            radius: 1.5, color: p.color || '#64B5F6',
                            life: 8, shrink: 0.9, glow: true
                        });
                    }
                }
                this.projectiles.splice(i, 1);
                continue;
            }

            /* Projectile-vs-projectile collision */
            let destroyed = false;
            for (let j = this.projectiles.length - 1; j > i; j--) {
                const o = this.projectiles[j];
                if (o.owner === p.owner) continue;
                if (p.visualOnly || o.visualOnly) continue;
                const pSize = p.radius || p.size || 8;
                const oSize = o.radius || o.size || 8;
                if (Math.abs(p.x - o.x) < pSize + oSize &&
                    Math.abs(p.y - o.y) < pSize + oSize) {
                    this._spawnClash((p.x + o.x) / 2, (p.y + o.y) / 2);
                    this._queueSound('projectile_clash');
                    this.projectiles.splice(j, 1);
                    this.projectiles.splice(i, 1);
                    destroyed = true;
                    break;
                }
            }
            if (destroyed) continue;
            if (p.visualOnly) continue;

            /* Hit detection */
            const def = p.owner === f1 ? f2 : f1;
            const atkKey = p.owner === f1 ? 'p1' : 'p2';
            const defKey = p.owner === f1 ? 'p2' : 'p1';
            if (!def || def.state === 'KO') continue;

            const attack = CollisionSystem.checkProjectileHit
                ? CollisionSystem.checkProjectileHit(p, def)
                : null;
            if (!attack) continue;

            const cc = this.combo[atkKey].count;
            const rageBonus = (p.owner && p.owner._rageDamageBonus) || 1.0;
            const dmg = Math.max(1, Math.round(attack.damage * this._comboScale(cc) * rageBonus));
            const att = { ...attack, damage: dmg };
            const perfectBlock = this._isPerfectBlock(def);
            const hit = def.takeHit(att, p.owner?.x ?? p.x);
            this.projectiles.splice(i, 1);

            if (hit) {
                const impact = this._getImpactProfile(att, p.owner);
                if (p.explosive) {
                    this._spawnProjectileExplosion(p.x, p.y, p);
                    this._queueSound('kakashi_kunai_explosion', 0.95);
                    this._queueSound('kakashi_sample4', 0.62);
                }
                if (p.owner && typeof p.owner.onAttackConnected === 'function') {
                    p.owner.onAttackConnected(att);
                }
                this._triggerHitstop({ ...att, hitstop: (att.hitstop || 0) + impact.hitstopBonus }, false);
                this.camera.shake(Math.max(1.2, att.knockback * 0.4) * impact.shakeMultiplier, Math.max(120, impact.shakeDuration - 18));
                this._spawnHit(def.x, def.y - def.height * 0.5, att.knockback * impact.particlePower);
                this._spawnImpactBurst(def.x, def.y - def.height * 0.5, impact, (p.vx || 0) >= 0 ? 1 : -1);
                this.stats[atkKey].hitsLanded++;
                this.stats[atkKey].totalDamage += dmg;
                this.stats[atkKey].projectilesHit++;
                this.stats[defKey].hitsTaken++;
                this._incCombo(atkKey, dmg, 'projectile');
                this._spawnDmgPopup(def.x, def.y - def.height - 10, dmg);
                this._queueSound('projectile_hit');
                if (impact.flashColor) this._flashScreen(impact.flashColor, Math.min(0.2, impact.flashAlpha));
            } else {
                if (p.explosive) {
                    this._spawnProjectileExplosion(p.x, p.y, p);
                    this._queueSound('kakashi_kunai_explosion', 0.95);
                    this._queueSound('kakashi_sample4', 0.62);
                }
                this.stats[defKey].blocksPerformed++;
                if (!perfectBlock) {
                    const chipDmg = Math.max(0, Math.floor(dmg * 0.05));
                    if (chipDmg > 0 && typeof def.health !== 'undefined') {
                        def.health = Math.max(1, def.health - chipDmg);
                    }
                }
                if (perfectBlock) {
                    this._applyPerfectBlock(def, defKey, p.owner, att);
                } else {
                    this._triggerHitstop(att, true);
                    this.camera.shake(Math.max(0.8, att.knockback * 0.2), 5);
                    this._spawnGuard(def.x, def.y - def.height * 0.55);
                    this._queueSound('block');
                }
            }
        }
    }

    _spawnProjectileExplosion(x, y, projectile) {
        const frames = Array.isArray(projectile?.explosionFrames)
            ? projectile.explosionFrames.filter(Boolean)
            : [];
        if (!frames.length) {
            this._spawnClash(x, y);
            return;
        }

        this.projectiles.push({
            owner: projectile.owner,
            kind: 'explosion_vfx',
            x,
            y,
            prevX: x,
            prevY: y,
            renderX: x,
            renderY: y,
            vx: 0,
            vy: 0,
            width: 1,
            height: 1,
            radius: 1,
            life: 22,
            maxLife: 22,
            travel: 0,
            maxDistance: 1,
            imageFrames: frames,
            imageScale: 1.25,
            imageOffsetY: 8,
            rotateWithVelocity: false,
            visualOnly: true,
        });
    }

    _getImpactProfile(att, attacker) {
        const type = (att?.type || attacker?.currentAttackType || 'light').toLowerCase();
        const damage = Number(att?.damage) || 0;
        const knockback = Number(att?.knockback) || 0;
        const isProjectile = !!att?.projectile;

        const profile = (type === 'special')
            ? {
                shakeMultiplier: 1.2,
                shakeDuration: 35,
                hitstopBonus: 2,
                particlePower: 1.2,
                burstCount: 8,
                burstSpeed: 3.8,
                flashColor: '#FFB74D',
                flashAlpha: 0.18,
                slowMoFrames: 0,
                slowMoScale: 1,
            }
            : (type === 'heavy')
                ? {
                    shakeMultiplier: 1.06,
                    shakeDuration: 25,
                    hitstopBonus: 1,
                    particlePower: 1.08,
                    burstCount: 6,
                    burstSpeed: 3.0,
                    flashColor: '',
                    flashAlpha: 0,
                    slowMoFrames: 0,
                    slowMoScale: 1,
                }
                : {
                    shakeMultiplier: 0.92,
                    shakeDuration: 18,
                    hitstopBonus: 0,
                    particlePower: 0.92,
                    burstCount: 4,
                    burstSpeed: 2.2,
                    flashColor: '',
                    flashAlpha: 0,
                    slowMoFrames: 0,
                    slowMoScale: 1,
                };

        if (isProjectile) {
            profile.shakeMultiplier *= 0.92;
            profile.burstCount = Math.max(3, profile.burstCount - 1);
        }
        if (damage >= 24 || knockback >= 12) {
            profile.shakeMultiplier *= 1.2;
            profile.shakeDuration += 10;
            profile.hitstopBonus += 2;
            profile.particlePower *= 1.22;
            profile.burstCount += 3;
            profile.burstSpeed += 1.0;
            profile.flashColor = '#FF7043';
            profile.flashAlpha = Math.max(profile.flashAlpha, 0.22);
            profile.slowMoFrames = 0;
            profile.slowMoScale = 1;
        }
        return profile;
    }

    _spawnImpactBurst(x, y, impact, direction = 1) {
        if (!impact) return;
        const dir = direction >= 0 ? 1 : -1;
        const count = Math.max(3, Math.floor(impact.burstCount || 4));
        const baseSpeed = Math.max(1.2, Number(impact.burstSpeed) || 2.4);
        const colors = ['#FFE082', '#FFB74D', '#FF8A65', '#FFF3E0'];
        for (let i = 0; i < count; i++) {
            const fan = (Math.random() - 0.5) * 1.2;
            const vx = dir * (baseSpeed + Math.random() * 2.4);
            const vy = fan * (baseSpeed * 0.9);
            this._sp({
                x,
                y: y + (Math.random() - 0.5) * 8,
                vx,
                vy,
                radius: 1.1 + Math.random() * 2.2,
                color: colors[Math.random() * colors.length | 0],
                life: 10 + Math.random() * 10,
                shrink: 0.92,
                shape: 'spark',
                glow: true,
            });
        }
    }

    _resolveStageFxProfile(fxProfileId) {
        if (!fxProfileId) return null;
        if (typeof FX_BANK === 'undefined' || !FX_BANK || !FX_BANK[fxProfileId]) return null;
        return { ...FX_BANK[fxProfileId] };
    }

    _spawnStageEffect(effect, index = 0) {
        if (!effect || !effect.fxProfileId || !this.currentStage) return;
        const profile = this._resolveStageFxProfile(effect.fxProfileId);
        if (!profile) return;

        const stageW = this.currentStage.width || 800;
        const groundY = this.currentStage.groundY || 530;
        const centerX = this.fighter1 && this.fighter2
            ? (this.fighter1.x + this.fighter2.x) * 0.5
            : stageW * 0.5;

        let x = centerX;
        if (effect.xMode === 'random') x = Math.random() * stageW;
        else if (effect.xMode === 'left') x = stageW * 0.2;
        else if (effect.xMode === 'right') x = stageW * 0.8;
        if (Number.isFinite(effect.x)) x = effect.x;
        if (Number.isFinite(effect.xJitter) && effect.xJitter > 0) {
            x += (Math.random() * 2 - 1) * effect.xJitter;
        }
        x = Math.max(-120, Math.min(stageW + 120, x));

        let y = Number.isFinite(effect.y) ? effect.y : (groundY - 220);
        if (Number.isFinite(effect.yJitter) && effect.yJitter > 0) {
            y += (Math.random() * 2 - 1) * effect.yJitter;
        }

        const width = Number.isFinite(effect.width) ? effect.width : (profile.width || 80);
        const height = Number.isFinite(effect.height) ? effect.height : (profile.height || 60);
        const life = Math.max(1, Number.isFinite(effect.life) ? effect.life : (profile.life || 50));

        this.projectiles.push({
            owner: null,
            kind: profile.kind || `stage_fx_${index}`,
            x,
            y,
            vx: Number.isFinite(effect.vx) ? effect.vx : 0,
            vy: Number.isFinite(effect.vy) ? effect.vy : 0,
            width,
            height,
            radius: Math.max(width, height) * 0.45,
            imagePath: profile.imagePath,
            imageFrames: Array.isArray(profile.imageFrames) ? [...profile.imageFrames] : undefined,
            imageScale: Number.isFinite(effect.imageScale) ? effect.imageScale : (profile.imageScale || 1),
            imageOffsetY: profile.imageOffsetY || 0,
            rotateWithVelocity: false,
            spin: 0,
            rotation: 0,
            life,
            maxLife: life,
            travel: 0,
            maxDistance: Number.MAX_SAFE_INTEGER,
            visualOnly: effect.visualOnly !== false,
            color: profile.color || '#ffffff',
            attackData: null,
        });
    }

    _updateStageEffects(dtScale) {
        if (!this.currentStage || !Array.isArray(this.currentStage.stageEffects)) return;
        this.currentStage.stageEffects.forEach((effect, i) => {
            if (!effect || !effect.fxProfileId) return;
            const key = `${this.currentStage.id || 'stage'}:${effect.fxProfileId}:${i}`;
            const interval = Math.max(2, Number(effect.interval) || 18);
            const jitter = Math.max(0, Number(effect.intervalJitter) || 0);

            if (!Number.isFinite(this.stageEffectTimers[key])) {
                this.stageEffectTimers[key] = interval + Math.random() * jitter;
            }

            this.stageEffectTimers[key] -= dtScale;
            if (this.stageEffectTimers[key] > 0) return;

            const burst = Math.max(1, Number(effect.burst) || 1);
            for (let n = 0; n < burst; n++) this._spawnStageEffect(effect, i);
            this.stageEffectTimers[key] = interval + Math.random() * jitter;
        });
    }

    /* ═══════════════════════════════════════════
       HITSTOP & SLOW-MOTION & SCREEN FX
       ═══════════════════════════════════════════ */
    _triggerHitstop(a, blocked) {
        const base = Number.isFinite(Number(a?.hitstop)) ? Number(a.hitstop) : 4;
        const scaled = blocked ? Math.max(2, Math.round(base * 0.6)) : Math.max(2, base);
        this.hitstopTimer = Math.max(this.hitstopTimer, scaled);
    }

    _triggerSlowMotion(frames, scale) {
        this.slowMotionTimer = Math.max(this.slowMotionTimer, frames);
        this.slowMotionScale = scale;
    }

    _flashScreen(color, intensity) {
        this.screenFlash.active = true;
        this.screenFlash.color = color;
        this.screenFlash.alpha = Math.min(1, intensity);
        this.screenFlash.decay = 0.06;
    }

    _setCinematicBars(on) {
        this.cinematicBars.active = true;
        this.cinematicBars.target = on ? 38 : 0;
    }

    _updateScreenEffects(dtScale) {
        // Flash
        if (this.screenFlash.active) {
            this.screenFlash.alpha -= this.screenFlash.decay * dtScale;
            if (this.screenFlash.alpha <= 0) {
                this.screenFlash.active = false;
                this.screenFlash.alpha = 0;
            }
        }

        // Darken
        if (this.screenDarken.active) {
            const d = this.screenDarken.target - this.screenDarken.alpha;
            this.screenDarken.alpha += d * this.screenDarken.speed * dtScale;
            if (Math.abs(d) < 0.01) {
                this.screenDarken.alpha = this.screenDarken.target;
                if (!this.screenDarken.target) this.screenDarken.active = false;
            }
        }

        // Cinematic bars
        if (this.cinematicBars.active) {
            const d = this.cinematicBars.target - this.cinematicBars.height;
            this.cinematicBars.height += d * 0.08 * dtScale;
            if (Math.abs(d) < 0.5) {
                this.cinematicBars.height = this.cinematicBars.target;
                if (!this.cinematicBars.target) this.cinematicBars.active = false;
            }
        }
    }

    /* ═══════════════════════════════════════════
       PARTICLE FACTORY
       ═══════════════════════════════════════════ */
    _sp(cfg) {
        if (this.particles.length >= this.maxParticles) this.particles.shift();
        this.particles.push({
            x: cfg.x || 0,
            y: cfg.y || 0,
            vx: cfg.vx || 0,
            vy: cfg.vy || 0,
            radius: cfg.radius || 2,
            alpha: cfg.alpha ?? 1,
            color: cfg.color || '#fff',
            life: cfg.life || 20,
            maxLife: cfg.life || 20,
            gravity: cfg.gravity || 0,
            friction: cfg.friction || 1,
            shrink: cfg.shrink ?? 0.97,
            shape: cfg.shape || 'circle',
            rotation: cfg.rotation || 0,
            rotationSpeed: cfg.rotationSpeed || 0,
            glow: cfg.glow || false,
        });
    }

    _spawnHit(x, y, power = 3) {
        const n = Math.min(18, 6 + Math.floor(power * 1.5));
        const cols = ['#FFD93D', '#FF6B00', '#FF5252', '#FFF', '#FFC107'];
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 2 + Math.random() * (3 + power);
            this._sp({
                x, y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                radius: 1.5 + Math.random() * (2 + power * 0.3),
                color: cols[Math.random() * cols.length | 0],
                life: 18 + Math.random() * 14,
                gravity: 0.08,
                shrink: 0.96,
                shape: Math.random() < 0.3 ? 'spark' : 'circle',
                glow: true
            });
        }
        // Impact ring
        this._sp({
            x, y,
            radius: 3 + power * 0.5,
            color: '#FFD93D',
            life: 10 + power,
            shrink: 1.15,
            alpha: 0.7,
            shape: 'ring',
            glow: true
        });
    }

    _spawnGuard(x, y) {
        const cols = ['#B0BEC5', '#ECEFF1', '#90CAF9', '#64B5F6'];
        for (let i = 0; i < 7; i++) {
            const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
            const s = 1.5 + Math.random() * 3;
            this._sp({
                x, y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                radius: 1.2 + Math.random() * 2,
                color: cols[Math.random() * cols.length | 0],
                life: 12 + Math.random() * 10,
                shrink: 0.95,
                shape: 'spark'
            });
        }
    }

    _spawnPerfectGuard(x, y) {
        const cols = ['#f97316', '#18FFFF', '#FFF', '#84FFFF'];
        for (let i = 0; i < 14; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 3 + Math.random() * 5;
            this._sp({
                x, y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                radius: 2 + Math.random() * 3,
                color: cols[Math.random() * cols.length | 0],
                life: 22 + Math.random() * 12,
                shrink: 0.94,
                shape: 'spark',
                glow: true
            });
        }
        // Ring effect
        this._sp({
            x, y,
            radius: 6,
            color: '#f97316',
            life: 16,
            shrink: 1.2,
            alpha: 0.9,
            shape: 'ring',
            glow: true
        });
    }

    _spawnClash(x, y) {
        const cols = ['#FFF', '#FFD700', '#FF6F00', '#FF5722', '#FFC107'];
        for (let i = 0; i < 20; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 3 + Math.random() * 6;
            this._sp({
                x, y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                radius: 2 + Math.random() * 3,
                color: cols[Math.random() * cols.length | 0],
                life: 22 + Math.random() * 14,
                gravity: 0.05,
                shrink: 0.95,
                shape: Math.random() < 0.4 ? 'spark' : 'circle',
                glow: true
            });
        }
        // Large impact rings
        for (let r = 0; r < 2; r++) {
            this._sp({
                x, y,
                radius: 6 + r * 5,
                color: r === 0 ? '#FFF' : '#FFD700',
                life: 12 + r * 4,
                shrink: 1.25 - r * 0.08,
                alpha: 1 - r * 0.3,
                shape: 'ring',
                glow: true
            });
        }
    }

    _spawnKOParticles(x, y, n = 25) {
        const cols = ['#FF1744', '#FF5252', '#FF8A80', '#FFF', '#FFD740', '#FF6D00'];
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 2 + Math.random() * 8;
            this._sp({
                x: x + (Math.random() - 0.5) * 35,
                y: y + (Math.random() - 0.5) * 35,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s - 2.5,
                radius: 2 + Math.random() * 5,
                color: cols[Math.random() * cols.length | 0],
                life: 35 + Math.random() * 30,
                gravity: 0.12,
                shrink: 0.96,
                shape: ['spark', 'square', 'circle'][Math.random() * 3 | 0],
                glow: true,
                rotationSpeed: (Math.random() - 0.5) * 0.3
            });
        }
        // Expanding rings
        for (let i = 0; i < 4; i++) {
            this._sp({
                x, y,
                radius: 5 + i * 5,
                color: i < 2 ? '#FF1744' : '#FFD740',
                life: 14 + i * 5,
                shrink: 1.2 - i * 0.04,
                alpha: 0.95 - i * 0.2,
                shape: 'ring',
                glow: true
            });
        }
    }

    _spawnDust(x, y, n = 4) {
        const cols = ['#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8'];
        for (let i = 0; i < n; i++) {
            this._sp({
                x: x + (Math.random() - 0.5) * 24,
                y,
                vx: (Math.random() - 0.5) * 2.5,
                vy: -Math.random() * 2,
                radius: 2 + Math.random() * 2.5,
                color: cols[Math.random() * cols.length | 0],
                life: 16 + Math.random() * 12,
                shrink: 0.98,
                gravity: 0.02
            });
        }
    }

    _spawnCharge(f) {
        const cols = ['#2196F3', '#64B5F6', '#1565C0', '#f97316'];
        const a = Math.random() * Math.PI * 2;
        const d = 22 + Math.random() * 28;
        this._sp({
            x: f.x + Math.cos(a) * d,
            y: f.y - f.height * 0.5 + Math.sin(a) * d,
            vx: -Math.cos(a) * 1.8,
            vy: -Math.sin(a) * 1.8,
            radius: 1 + Math.random() * 2.5,
            color: cols[Math.random() * cols.length | 0],
            life: 14 + Math.random() * 10,
            shrink: 0.93,
            glow: true
        });
    }

    _spawnDash(f) {
        const dir = f.facingRight ? -1 : 1;
        this._sp({
            x: f.x + dir * 12,
            y: f.y - Math.random() * f.height * 0.35,
            vx: dir * (1.8 + Math.random()),
            vy: (Math.random() - 0.5) * 0.6,
            radius: 1.5 + Math.random() * 1.8,
            color: '#B0BEC5',
            life: 9 + Math.random() * 7,
            shrink: 0.93,
            alpha: 0.55
        });
    }

    _spawnTrail(p) {
        this._sp({
            x: p.x + (Math.random() - 0.5) * 8,
            y: p.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            radius: 1 + Math.random() * 2.5,
            color: p.color || '#64B5F6',
            life: 9 + Math.random() * 7,
            shrink: 0.91,
            glow: true,
            alpha: 0.65
        });
    }

    _updateParticles(dtScale) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= Math.pow(p.friction, dtScale);
            p.vy *= Math.pow(p.friction, dtScale);
            p.vy += p.gravity * dtScale;
            p.x += p.vx * dtScale;
            p.y += p.vy * dtScale;
            p.life -= dtScale;
            p.alpha = Math.max(0, p.life / p.maxLife);
            p.rotation += p.rotationSpeed * dtScale;

            if (p.shape === 'ring') {
                p.radius *= Math.pow(p.shrink, dtScale);
            } else {
                p.radius *= Math.pow(p.shrink, dtScale);
            }

            if (p.life <= 0 || p.radius < 0.15) {
                this.particles.splice(i, 1);
            }
        }
    }

    /* ═══════════════════════════════════════════
       TEXT POPUPS
       ═══════════════════════════════════════════ */
    _spawnDmgPopup(x, y, dmg) {
        this.textPopups.push({
            x: x + (Math.random() - 0.5) * 15,
            y,
            text: `-${dmg}`,
            color: dmg >= 20 ? '#FF1744' : dmg >= 12 ? '#FF5722' : dmg >= 8 ? '#FF9800' : '#FFF',
            size: Math.min(24, 12 + dmg * 0.6),
            life: 55,
            maxLife: 55,
            vy: -1.4,
            vx: (Math.random() - 0.5) * 0.8,
            alpha: 1,
            type: 'damage',
            scale: 1.3 // Start slightly enlarged, then shrink
        });
    }

    _spawnComboPopup(x, y, count, totalDmg) {
        // Remove previous combo popup for same position
        this.textPopups = this.textPopups.filter(p => p.type !== 'combo');

        this.textPopups.push({
            x,
            y: y - 10,
            text: `${count} HITS`,
            subtext: `${totalDmg} DMG`,
            color: count >= 10 ? '#FFD700' : count >= 5 ? '#FF9800' : '#4CAF50',
            size: Math.min(18, 11 + count * 0.5),
            life: 40,
            maxLife: 40,
            vy: -0.3,
            vx: 0,
            alpha: 1,
            type: 'combo',
            scale: 1
        });
    }

    _updateTextPopups(dtScale) {
        for (let i = this.textPopups.length - 1; i >= 0; i--) {
            const p = this.textPopups[i];
            p.y += p.vy * dtScale;
            p.x += (p.vx || 0) * dtScale;
            p.life -= dtScale;
            p.alpha = Math.max(0, Math.min(1, p.life / (p.maxLife * 0.5)));
            if (p.scale && p.scale > 1) {
                p.scale = Math.max(1, p.scale - 0.02 * dtScale);
            }
            if (p.life <= 0) this.textPopups.splice(i, 1);
        }
    }

    /* ═══════════════════════════════════════════
       ANNOUNCER
       ═══════════════════════════════════════════ */
    _announce(text, color = '#FFD700', dur = 60) {
        this.announcer.queue.push({ text, color, duration: dur });
    }

    _updateAnnouncer(dtScale) {
        if (this.announcer.timer > 0) {
            this.announcer.timer -= dtScale;
            this.announcer.scale = Math.min(1, this.announcer.scale + 0.08 * dtScale);
            return;
        }
        if (this.announcer.queue.length) {
            const n = this.announcer.queue.shift();
            Object.assign(this.announcer, {
                text: n.text,
                color: n.color,
                timer: n.duration,
                scale: 0.2
            });
        } else {
            this.announcer.text = '';
        }
    }

    /* ═══════════════════════════════════════════
       TRAINING MODE
       ═══════════════════════════════════════════ */
    _updateTraining(dtScale) {
        const c = this.trainingConfig;
        const f1 = this.fighter1, f2 = this.fighter2;
        const hasP2 = !!f2 && !this.isSoloTrainingMode();

        if (c.infiniteHealth) {
            f1.health = f1.maxHealth;
            if (hasP2) f2.health = f2.maxHealth;
        }
        if (c.infiniteChakra) {
            f1.chakra = f1.maxChakra;
            if (hasP2) f2.chakra = f2.maxChakra;
        }
        if (c.infiniteStamina) {
            if (typeof f1.stamina !== 'undefined') f1.stamina = f1.maxStamina;
            if (hasP2 && typeof f2.stamina !== 'undefined') f2.stamina = f2.maxStamina;
        }
        if (c.resetPosition) {
            c.resetPosition = false;
            const w = this.currentStage.width || 800;
            f1.reset(w * 0.25, true);
            f1.y = this.currentStage.groundY;
            if (hasP2) {
                f2.reset(w * 0.75, false);
                f2.y = this.currentStage.groundY;
            }
            [f1, f2].filter(Boolean).forEach(f => { f.width = 55; f.height = 80; });
            this.combo = { p1: this._blankCombo(), p2: this._blankCombo() };
            this.projectiles = [];
            this.particles = [];
        }
        if (hasP2 && c.autoRecover && f2.state === 'KNOCKDOWN') {
            // Auto-recover dummy from knockdown
            if (typeof f2.recover === 'function') f2.recover();
        }
    }

    _recordInput(input, key) {
        const h = this.inputHistory[key];
        const pressed = [];
        if (input.up) pressed.push('↑');
        if (input.down) pressed.push('↓');
        if (input.left) pressed.push('←');
        if (input.right) pressed.push('→');
        if (input.block) pressed.push('Q');
        if (input.light) pressed.push('S');
        if (input.heavy) pressed.push('D');
        if (input.special) pressed.push('F');
        if (input.projectile) pressed.push('E');
        if (input.teleport) pressed.push('R');
        if (input.transform) pressed.push('G');
        if (input.dash) pressed.push('DASH');

        if (pressed.length) {
            h.push({
                keys: pressed.join('+'),
                frame: this.totalFrames,
                time: performance.now()
            });
            while (h.length > this.INPUT_HISTORY_MAX) h.shift();
        }
    }

    /* ═══════════════════════════════════════════
       EVENT HANDLERS
       ═══════════════════════════════════════════ */
    _onGlobalKeyDown(e) {
        if (e.repeat) return;
        const k = typeof e.key === 'string' ? e.key.toLowerCase() : '';

        // Combo guide toggle
        if (k === 'h' || e.key === 'F1') {
            e.preventDefault();
            this.toggleComboGuide();
            return;
        }

        // Training mode toggle
        if (k === 'v' || e.key === 'F2') {
            e.preventDefault();
            this.trainingMode = !this.trainingMode;
            this._announce(
                this.trainingMode ? 'ENTRAINEMENT: ON' : 'ENTRAINEMENT: OFF',
                '#f97316', 50
            );
            return;
        }

        // Controls overlay toggle
        if (e.key === 'F3') {
            e.preventDefault();
            this.showControlsOverlay = !this.showControlsOverlay;
            this._announce(
                this.showControlsOverlay ? 'COMMANDES: ON' : 'COMMANDES: OFF',
                '#64B5F6', 35
            );
            return;
        }

        // Training-specific shortcuts
        if (this.trainingMode) {
            if (k === 'b') {
                e.preventDefault();
                this.trainingConfig.showHitboxes = !this.trainingConfig.showHitboxes;
                this._announce(
                    this.trainingConfig.showHitboxes ? 'HITBOXES ON' : 'HITBOXES OFF',
                    '#4CAF50', 35
                );
                return;
            }
            if (k === 'n') {
                e.preventDefault();
                this.trainingConfig.showFrameData = !this.trainingConfig.showFrameData;
                this._announce(
                    this.trainingConfig.showFrameData ? 'FRAME DATA ON' : 'FRAME DATA OFF',
                    '#4CAF50', 35
                );
                return;
            }
            if (k === 'r' && this.state === 'FIGHTING') {
                e.preventDefault();
                this.trainingConfig.resetPosition = true;
                this._announce('RESET POSITION', '#4CAF50', 30);
                return;
            }
            if (k === 'i') {
                e.preventDefault();
                this.trainingConfig.showInputHistory = !this.trainingConfig.showInputHistory;
                return;
            }
            if (k === 'm') {
                e.preventDefault();
                this.trainingConfig.infiniteHealth = !this.trainingConfig.infiniteHealth;
                this._announce(
                    this.trainingConfig.infiniteHealth ? 'INF HP ON' : 'INF HP OFF',
                    '#4CAF50', 30
                );
                return;
            }
        }

        // AI difficulty cycle
        if (e.key === 'F4' && this.aiEnabled) {
            e.preventDefault();
            const lvls = ['easy', 'normal', 'hard', 'impossible'];
            this.aiDifficulty = lvls[(lvls.indexOf(this.aiDifficulty) + 1) % lvls.length];
            this._announce(`AI: ${this.aiDifficulty.toUpperCase()}`, '#AB47BC', 55);
            return;
        }

        // Escape handling
        if (e.key !== 'Escape') return;

        const galleryVisible = this.assetGallery?.overlay && !this.assetGallery.overlay.classList.contains('hidden');
        if (galleryVisible) {
            e.preventDefault();
            this.closeAssetGallery();
            return;
        }

        if (this.comboGuideOpen) {
            e.preventDefault();
            this.closeComboGuide();
            return;
        }
        if (this.state === 'FIGHTING') {
            e.preventDefault();
            this.openPauseMenu();
            return;
        }
        if (this.state === 'PAUSED' && this.pauseMenuActive) {
            e.preventDefault();
            this.resumePauseMenu();
        }
    }

    _onVisibilityChange() {
        if (document.hidden && this.state === 'FIGHTING') {
            this.openPauseMenu();
        }
    }

    /* ═══════════════════════════════════════════
       PAUSE / COMBO GUIDE
       ═══════════════════════════════════════════ */
    openComboGuide() {
        if (this.comboGuideOpen) return;
        this.comboGuideOpenedFromFight = false;
        if (this.state === 'FIGHTING') {
            this.openPauseMenu();
            this.comboGuideOpenedFromFight = true;
        }
        this.comboGuideOpen = true;
        this._setUIState({ pauseVisible: false, comboGuideVisible: true });
    }

    closeComboGuide({ resumeIfAutoPaused = true } = {}) {
        if (!this.comboGuideOpen) {
            this.comboGuideOpenedFromFight = false;
            return;
        }
        this.comboGuideOpen = false;
        this._setUIState({ comboGuideVisible: false });
        if (this.state === 'PAUSED' && this.pauseMenuActive) {
            if (resumeIfAutoPaused && this.comboGuideOpenedFromFight) {
                this.resumePauseMenu();
            } else {
                this._setUIState({ pauseVisible: true });
            }
        }
        this.comboGuideOpenedFromFight = false;
    }

    toggleComboGuide() {
        this.comboGuideOpen ? this.closeComboGuide() : this.openComboGuide();
    }

    openPauseMenu() {
        if (this.state !== 'FIGHTING') return;
        this.pauseMenuActive = true;
        this._transitionTo('PAUSED');
        this._setUIState({ pauseVisible: true });
    }

    resumePauseMenu() {
        if (!this.pauseMenuActive) return;
        this.pauseMenuActive = false;
        this._setUIState({ pauseVisible: false });
        if (this.state === 'PAUSED') this._transitionTo('FIGHTING');
    }

    _closePauseMenu() {
        this.pauseMenuActive = false;
        this._setUIState({ pauseVisible: false });
    }

    /* ═══════════════════════════════════════════
       MAPPING / COMBO CONFIG
       ═══════════════════════════════════════════ */
    async _loadMappingConfig(path) {
        if (!path) return null;
        if (this.mappingConfigCache.has(path)) {
            return this.mappingConfigCache.get(path);
        }
        const p = fetch(path)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .catch(err => {
                this.mappingConfigCache.delete(path);
                throw err;
            });
        this.mappingConfigCache.set(path, p);
        return p;
    }

    async _applyComboConfigFromRoster(fighter, data) {
        const mp = data?.spriteConfig?.mappingPath;
        if (!fighter || !mp || typeof fighter.applyComboConfig !== 'function') return;
        try {
            if (typeof fighter.loadComboConfigFromMapping === 'function') {
                const mapping = typeof fighter.loadMappingConfig === 'function'
                    ? await fighter.loadMappingConfig(mp)
                    : await this._loadMappingConfig(mp);
                if (mapping && typeof fighter.applyMappingRuntimeConfig === 'function') {
                    fighter.applyMappingRuntimeConfig(mapping);
                    return;
                }
                const c = mapping?.combo || await fighter.loadComboConfigFromMapping(mp);
                if (c) fighter.applyComboConfig(c);
                return;
            }
            const m = await this._loadMappingConfig(mp);
            if (m && typeof fighter.applyMappingRuntimeConfig === 'function') {
                fighter.applyMappingRuntimeConfig(m);
                return;
            }
            if (m?.combo) fighter.applyComboConfig(m.combo);
        } catch (e) {
            console.warn(`Combo config failed (${mp}):`, e);
        }
    }

    /* ═══════════════════════════════════════════
       RENDERING
       ═══════════════════════════════════════════ */
    render() {
        if (this.state === 'MENU' || this.state === 'CHARACTER_SELECT' || this.state === 'BOSS_SELECT') return;

        const ctx = this.renderer.ctx || this.canvas.getContext('2d');
        const gw = this.renderer.gameWidth;
        const gh = this.renderer.gameHeight;

        // Keep camera ground sync robust even if a transition/state step missed it.
        if (this.currentStage && Number.isFinite(this.currentStage.groundY) && typeof this.camera?.setGroundY === 'function') {
            if (!Number.isFinite(this.camera.groundY) || Math.abs(this.camera.groundY - this.currentStage.groundY) > 0.001) {
                this.camera.setGroundY(this.currentStage.groundY);
            }
        }

        this.renderer.clear();

        /* ─── Background ─── */
        if (this.currentStage) {
            this.renderer.drawBackground(this.currentStage, this.camera);
        }

        if (!this.fighter1) return;
        const showSecondFighter = !!this.fighter2 && !this.isSoloTrainingMode();

        /* ─── Screen darken ─── */
        if (this.screenDarken.active && this.screenDarken.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.screenDarken.alpha;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, gw, gh);
            ctx.restore();
        }

        /* ─── After images ─── */
        this._drawAfterImages(ctx);

        /* ─── Fighters (depth-sorted) ─── */
        const fighters = [this.fighter1, ...(showSecondFighter ? [this.fighter2] : [])].sort((a, b) => a.y - b.y);
        fighters.forEach(f => {
            // Rage glow
            if (f._rageActive) {
                ctx.save();
                const sx = f.x - (this.camera.x || 0);
                const sy = f.y - (this.camera.y || 0);
                ctx.shadowColor = '#FF1744';
                ctx.shadowBlur = 12 + Math.sin(this.totalFrames * 0.15) * 4;
                ctx.restore();
            }
            this.renderer.drawFighter(f, this.camera);
        });

        /* ─── Projectiles ─── */
        this.projectiles.forEach(p => {
            if (typeof this.renderer.drawProjectile === 'function') {
                this.renderer.drawProjectile(p, this.camera);
            }
        });

        /* ─── Particles ─── */
        this._drawParticles(ctx);

        /* ─── Text popups ─── */
        this._drawTextPopups(ctx);

        /* ─── Combo counters ─── */
        this._drawComboCounters(ctx);

        /* ─── Special attack names ─── */
        [this.fighter1, ...(showSecondFighter ? [this.fighter2] : [])].forEach(f => {
            if (f.currentAttackType === 'special' && f.stateTimer > 20) {
                const atkName = f.attacks?.special?.name || 'SPECIAL';
                if (typeof this.renderer.drawComboText === 'function') {
                    this.renderer.drawComboText(
                        atkName,
                        f.x, f.y - f.height - 22,
                        this.camera
                    );
                }
            }
        });

        /* ─── Announcer ─── */
        this._drawAnnouncer(ctx);

        /* ─── Training overlay ─── */
        if (this.trainingMode) {
            this._drawTraining(ctx);
        }
        if (this.showControlsOverlay && this.state === 'FIGHTING') {
            this._drawControlsOverlay(ctx);
        }

        /* ─── Screen flash ─── */
        if (this.screenFlash.active && this.screenFlash.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.screenFlash.alpha;
            ctx.fillStyle = this.screenFlash.color;
            ctx.fillRect(0, 0, gw, gh);
            ctx.restore();
        }

        /* ─── Cinematic bars ─── */
        if (this.cinematicBars.height > 0.5) {
            ctx.save();
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, gw, this.cinematicBars.height);
            ctx.fillRect(0, gh - this.cinematicBars.height, gw, this.cinematicBars.height);
            ctx.restore();
        }

        /* ─── Round win indicators ─── */
        this._drawRoundIndicators(ctx);

        /* ─── FPS counter (training only) ─── */
        if (this.trainingMode) {
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = this.currentFPS < 45 ? '#FF5252' :
                this.currentFPS < 55 ? '#FF9800' : '#4CAF50';
            ctx.textAlign = 'right';
            ctx.fillText(`${this.currentFPS} FPS`, gw - 10, 16);
            ctx.restore();
        }

        /* ─── Slow-motion indicator ─── */
        if (this.slowMotionTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(2, 2, gw - 4, gh - 4);
            ctx.restore();
        }
    }

    /* ─── Particle renderer ─── */
    _drawParticles(ctx) {
        if (!this.particles.length) return;
        ctx.save();
        const cx = this.camera.x || 0;
        const cy = this.camera.y || 0;

        for (const p of this.particles) {
            const sx = p.x - cx;
            const sy = p.y - cy;
            const a = Math.max(0, Math.min(1, p.alpha));
            if (a <= 0 || p.radius < 0.2) continue;

            ctx.globalAlpha = a;

            if (p.glow) {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = p.radius * 2.5;
            } else {
                ctx.shadowBlur = 0;
            }

            switch (p.shape) {
                case 'ring':
                    ctx.beginPath();
                    ctx.arc(sx, sy, Math.abs(p.radius), 0, Math.PI * 2);
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = Math.max(0.5, 1.5 * a);
                    ctx.stroke();
                    break;

                case 'spark': {
                    ctx.save();
                    ctx.translate(sx, sy);
                    ctx.rotate(p.rotation || Math.atan2(p.vy || 0, p.vx || 0));
                    const len = p.radius * 2.5;
                    ctx.beginPath();
                    ctx.moveTo(-len, 0);
                    ctx.lineTo(len, 0);
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = Math.max(0.5, p.radius * 0.5);
                    ctx.stroke();
                    ctx.restore();
                    break;
                }

                case 'square': {
                    ctx.save();
                    ctx.translate(sx, sy);
                    ctx.rotate(p.rotation);
                    ctx.fillStyle = p.color;
                    const s = p.radius;
                    ctx.fillRect(-s, -s, s * 2, s * 2);
                    ctx.restore();
                    break;
                }

                case 'star': {
                    ctx.save();
                    ctx.translate(sx, sy);
                    ctx.rotate(p.rotation);
                    ctx.fillStyle = p.color;
                    this._drawStar(ctx, 0, 0, 5, p.radius, p.radius * 0.5);
                    ctx.fill();
                    ctx.restore();
                    break;
                }

                case 'triangle': {
                    ctx.save();
                    ctx.translate(sx, sy);
                    ctx.rotate(p.rotation);
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.moveTo(0, -p.radius);
                    ctx.lineTo(-p.radius * 0.87, p.radius * 0.5);
                    ctx.lineTo(p.radius * 0.87, p.radius * 0.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                    break;
                }

                default: // circle
                    ctx.beginPath();
                    ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                    break;
            }
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    _drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }

    /* ─── After images renderer ─── */
    _drawAfterImages(ctx) {
        if (!this.afterImages.length) return;
        ctx.save();
        const cx = this.camera.x || 0;
        const cy = this.camera.y || 0;

        for (const img of this.afterImages) {
            const sx = img.x - cx;
            const sy = img.y - cy;
            ctx.globalAlpha = img.alpha * 0.4;
            ctx.fillStyle = img.color;

            // Simple silhouette rectangle
            const w = img.width || 40;
            const h = img.height || 80;
            ctx.fillRect(
                sx - w / 2,
                sy - h,
                w,
                h
            );
        }
        ctx.restore();
    }

    /* ─── Text popups renderer ─── */
    _drawTextPopups(ctx) {
        if (!this.textPopups.length) return;
        ctx.save();
        const cx = this.camera.x || 0;
        const cy = this.camera.y || 0;

        for (const p of this.textPopups) {
            const sx = p.x - cx;
            const sy = p.y - cy;
            const alpha = Math.max(0, Math.min(1, p.alpha));
            if (alpha <= 0) continue;

            ctx.globalAlpha = alpha;
            const scale = p.scale || 1;
            const size = Math.round(p.size * scale);

            ctx.font = `bold ${size}px 'Segoe UI', Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Shadow
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            // Outline
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(p.text, sx, sy);

            // Fill
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, sx, sy);

            // Subtext (for combo display)
            if (p.subtext) {
                ctx.font = `bold ${Math.round(size * 0.6)}px 'Segoe UI', Arial, sans-serif`;
                ctx.fillStyle = '#FFF';
                ctx.globalAlpha = alpha * 0.8;
                ctx.strokeText(p.subtext, sx, sy + size * 0.7);
                ctx.fillText(p.subtext, sx, sy + size * 0.7);
            }
        }

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.restore();
    }

    /* ─── Combo counters ─── */
    _drawComboCounters(ctx) {
        const gw = this.renderer.gameWidth;

        ['p1', 'p2'].forEach((key, idx) => {
            const c = this.combo[key];
            const count = c.isActive ? c.count : (c.displayTimer > 0 ? c.maxCount : 0);
            const dmg = c.isActive ? c.damage : (c.displayTimer > 0 ? c.maxDamage : 0);

            if (count < 2) return;

            ctx.save();
            const x = idx === 0 ? 30 : gw - 30;
            const y = 120;
            const alpha = c.isActive ? 1 : Math.min(1, c.displayTimer / 30);

            ctx.globalAlpha = alpha;
            ctx.textAlign = idx === 0 ? 'left' : 'right';

            // Combo count
            const fontSize = Math.min(28, 18 + count);
            ctx.font = `bold ${fontSize}px 'Impact', 'Segoe UI', sans-serif`;

            // Glow effect for big combos
            if (count >= 5) {
                ctx.shadowColor = count >= 10 ? '#FFD700' : '#FF9800';
                ctx.shadowBlur = 8;
            }

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(`${count}`, x, y);

            // Color based on combo length
            let comboColor = '#FFF';
            if (count >= 15) comboColor = '#FFD700';
            else if (count >= 10) comboColor = '#FF1744';
            else if (count >= 7) comboColor = '#FF9800';
            else if (count >= 5) comboColor = '#2196F3';
            else if (count >= 3) comboColor = '#4CAF50';

            ctx.fillStyle = comboColor;
            ctx.fillText(`${count}`, x, y);

            // "HITS" label
            ctx.shadowBlur = 0;
            ctx.font = `bold 10px 'Segoe UI', sans-serif`;
            ctx.fillStyle = '#AAA';
            ctx.strokeText('HITS', x, y + 16);
            ctx.fillText('HITS', x, y + 16);

            // Total damage
            ctx.font = `bold 11px 'Segoe UI', sans-serif`;
            ctx.fillStyle = '#FF8A80';
            ctx.strokeText(`${dmg} DMG`, x, y + 30);
            ctx.fillText(`${dmg} DMG`, x, y + 30);

            // Damage scaling indicator
            if (c.isActive && count >= 3) {
                const scale = Math.round(this._comboScale(count) * 100);
                ctx.font = `9px monospace`;
                ctx.fillStyle = scale <= 50 ? '#FF5252' : '#FFF';
                ctx.globalAlpha = alpha * 0.6;
                ctx.strokeText(`${scale}%`, x, y + 42);
                ctx.fillText(`${scale}%`, x, y + 42);
            }

            ctx.restore();
        });
    }

    /* ─── Announcer renderer ─── */
    _drawAnnouncer(ctx) {
        if (!this.announcer.text || this.announcer.timer <= 0) return;

        const gw = this.renderer.gameWidth;
        const gh = this.renderer.gameHeight;

        ctx.save();

        const progress = Math.min(1, this.announcer.scale);
        const scale = this._easeOutElastic(progress);
        const alpha = Math.min(1, this.announcer.timer / 15);

        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const x = gw / 2;
        const y = gh * 0.35;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Background glow
        ctx.shadowColor = this.announcer.color;
        ctx.shadowBlur = 20;

        // Text size based on importance
        const baseSize = this.announcer.text.length > 12 ? 22 : 28;
        ctx.font = `bold ${baseSize}px 'Impact', 'Segoe UI', sans-serif`;

        // Outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText(this.announcer.text, 0, 0);

        // Fill with gradient
        const grad = ctx.createLinearGradient(0, -baseSize / 2, 0, baseSize / 2);
        grad.addColorStop(0, '#FFF');
        grad.addColorStop(0.5, this.announcer.color);
        grad.addColorStop(1, this.announcer.color);
        ctx.fillStyle = grad;
        ctx.fillText(this.announcer.text, 0, 0);

        ctx.restore();
        ctx.restore();
    }

    /* ─── Round indicators ─── */
    _drawRoundIndicators(ctx) {
        const gw = this.renderer.gameWidth;
        const winsNeeded = Math.ceil(this.maxRounds / 2);

        ctx.save();
        ctx.globalAlpha = 0.8;

        // P1 wins (left side)
        for (let i = 0; i < winsNeeded; i++) {
            const x = gw * 0.35 - i * 14;
            const y = 16;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            if (i < this.p1Wins) {
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 6;
                ctx.fill();
            } else {
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        }

        // P2 wins (right side)
        for (let i = 0; i < winsNeeded; i++) {
            const x = gw * 0.65 + i * 14;
            const y = 16;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            if (i < this.p2Wins) {
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 6;
                ctx.fill();
            } else {
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    /* ─── Training overlay ─── */
    _drawTraining(ctx) {
        const gw = this.renderer.gameWidth;
        const gh = this.renderer.gameHeight;
        const f1 = this.fighter1, f2 = this.fighter2;
        const cx = this.camera.x || 0, cy = this.camera.y || 0;

        ctx.save();

        // Training mode banner
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#1B5E20';
        ctx.fillRect(gw / 2 - 55, 2, 110, 16);
        ctx.globalAlpha = 1;
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#76FF03';
        ctx.textAlign = 'center';
        ctx.fillText('TRAINING MODE', gw / 2, 13);

        // Config info
        ctx.textAlign = 'left';
        ctx.font = '8px monospace';
        ctx.globalAlpha = 0.6;
        let ty = 30;
        const info = [
            `[V] Training: ON`,
            `[B] Hitboxes: ${this.trainingConfig.showHitboxes ? 'ON' : 'OFF'}`,
            `[N] Frame Data: ${this.trainingConfig.showFrameData ? 'ON' : 'OFF'}`,
            `[I] Input Hist: ${this.trainingConfig.showInputHistory ? 'ON' : 'OFF'}`,
            `[R] Reset Position`,
            `[M] Inf HP: ${this.trainingConfig.infiniteHealth ? 'ON' : 'OFF'}`,
        ];
        if (this.aiEnabled) info.push(`[F4] AI: ${this.aiDifficulty.toUpperCase()}`);
        info.forEach(line => {
            ctx.fillStyle = '#B2FF59';
            ctx.fillText(line, 8, ty);
            ty += 11;
        });

        // Hitbox display
        if (this.trainingConfig.showHitboxes && f1 && f2) {
            [f1, f2].forEach(f => {
                const fx = f.x - cx, fy = f.y - cy;

                // Hurtbox (green)
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(fx - f.width / 2, fy - f.height, f.width, f.height);
                ctx.globalAlpha = 0.6;
                ctx.strokeStyle = '#4CAF50';
                ctx.lineWidth = 1;
                ctx.strokeRect(fx - f.width / 2, fy - f.height, f.width, f.height);

                // Hitbox (red, when attacking)
                if (f.isAttacking && f.isAttacking()) {
                    const atk = f.getCurrentAttack ? f.getCurrentAttack() : null;
                    const range = atk?.range || 50;
                    const dir = f.facingRight ? 1 : -1;
                    const hx = fx + dir * range * 0.5;
                    const hy = fy - f.height * 0.5;

                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = '#FF1744';
                    ctx.fillRect(hx - range / 2, hy - 15, range, 30);
                    ctx.globalAlpha = 0.7;
                    ctx.strokeStyle = '#FF1744';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(hx - range / 2, hy - 15, range, 30);
                }
            });
        }

        // Frame data
        if (this.trainingConfig.showFrameData && f1 && f2) {
            [f1, f2].forEach((f, idx) => {
                const fx = f.x - cx;
                const fy = f.y - cy - f.height - 35;
                ctx.globalAlpha = 0.7;
                ctx.font = '8px monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#FFF';
                const state = f.state || '?';
                const timer = f.stateTimer || 0;
                const grnd = f.grounded ? 'G' : 'A';
                ctx.fillText(`${state} [${Math.round(timer)}f] ${grnd}`, fx, fy);

                // Velocity
                const vx = typeof f.vx !== 'undefined' ? f.vx.toFixed(1) : '?';
                const vy = typeof f.vy !== 'undefined' ? f.vy.toFixed(1) : '?';
                ctx.fillText(`vx:${vx} vy:${vy}`, fx, fy + 10);
            });
        }

        // Input history
        if (this.trainingConfig.showInputHistory) {
            ctx.globalAlpha = 0.5;
            ctx.font = '8px monospace';
            ctx.textAlign = 'left';

            const hist = this.inputHistory.p1;
            const startY = gh - 10;
            const shown = Math.min(hist.length, 15);
            for (let i = 0; i < shown; i++) {
                const entry = hist[hist.length - 1 - i];
                ctx.fillStyle = '#FFF';
                ctx.fillText(entry.keys, 8, startY - i * 10);
            }

            // P2 input history on right side
            if (!this.aiEnabled) {
                ctx.textAlign = 'right';
                const hist2 = this.inputHistory.p2;
                const shown2 = Math.min(hist2.length, 15);
                for (let i = 0; i < shown2; i++) {
                    const entry = hist2[hist2.length - 1 - i];
                    ctx.fillStyle = '#FFF';
                    ctx.fillText(entry.keys, gw - 8, startY - i * 10);
                }
            }
        }

        // Damage data
        if (this.trainingConfig.showDamageData) {
            ctx.globalAlpha = 0.6;
            ctx.font = '8px monospace';
            ctx.textAlign = 'right';
            let dy = 30;

            ['p1', 'p2'].forEach((key, idx) => {
                const c = this.combo[key];
                if (c.isActive && c.count >= 1) {
                    const x = idx === 0 ? 140 : gw - 8;
                    ctx.fillStyle = '#FF8A80';
                    ctx.textAlign = idx === 0 ? 'left' : 'right';
                    ctx.fillText(`Combo: ${c.count} hits / ${c.damage} dmg`, x, gh - 30);
                    ctx.fillText(`Scale: ${Math.round(this._comboScale(c.count) * 100)}%`, x, gh - 20);
                }
            });
        }

        ctx.restore();
    }

    _drawControlsOverlay(ctx) {
        const gw = this.renderer.gameWidth;
        const lines = (this.isCpuVsCpuMode() && !this._bossId)
            ? [
                'Mode spectateur: CPU A contre CPU B',
                'Echap pause | H dojo | F4 difficulté IA',
                'Reviens au duel classique via le menu principal',
            ]
            : [
                'Ninja: Flèches déplacer | Q garde / charge | S rapide | D puissante | E technique | G éveil',
                'Routes de technique: E neutre | ↑+E | ↓+E | Arrière+E | Avant+E',
                'Dash: double tap ← ou →',
                'Chaque perso lit la meme grammaire de commandes, puis route vers ses propres animations',
                '[F3] Touches | [F4] Difficulte IA',
            ];

        ctx.save();
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const padX = 8;
        const padY = 6;
        const lineH = 11;
        const boxW = gw - 16;
        const boxH = padY * 2 + lineH * lines.length;
        const boxY = 6;

        ctx.globalAlpha = 0.62;
        ctx.fillStyle = '#061228';
        ctx.fillRect(8, boxY, boxW, boxH);
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = '#3FA9F5';
        ctx.lineWidth = 1;
        ctx.strokeRect(8.5, boxY + 0.5, boxW - 1, boxH - 1);

        ctx.globalAlpha = 0.96;
        lines.forEach((line, i) => {
            ctx.fillStyle = i === lines.length - 1 ? '#9FD3FF' : '#E8F2FF';
            ctx.fillText(line, 8 + padX, boxY + padY + i * lineH);
        });
        ctx.restore();
    }
}

if (typeof window !== 'undefined') {
    window.Game = Game;
}
