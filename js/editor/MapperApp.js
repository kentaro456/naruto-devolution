/* ============================================
   MAPPER APP — Drag/drop animation & combo editor
   ============================================ */

(function mapperAppScope() {
    class MapperApp {
        constructor() {
            this.project = null;
            this.profiles = [];
            this.profileById = new Map();
            this.currentProfile = null;
            this.store = null;
            this.jsonCache = new Map();
            this.stateFilter = 'all';
            this.selectedSourceFrames = new Set();
            this.assetMetaByFile = new Map();
            this.stateProjectileMap = {};
            this.stateEditor = null;
            this.canPersistToGame = this._detectLocalAuthoringMode();

            this.el = {
                profileSelect: document.getElementById('profile-select'),
                loadProfileBtn: document.getElementById('load-profile-btn'),
                resetProfileBtn: document.getElementById('reset-profile-btn'),
                validateBtn: document.getElementById('validate-btn'),
                exportProfileBtn: document.getElementById('export-profile-btn'),
                saveToGameBtn: document.getElementById('save-to-game-btn'),
                searchInput: document.getElementById('search-input'),
                unassignedOnly: document.getElementById('unassigned-only'),
                strictMappedOnly: document.getElementById('strict-mapped-only'),
                unknownAssignTools: document.getElementById('unknown-assign-tools'),
                assignProfileSelect: document.getElementById('assign-profile-select'),
                assignStateSelect: document.getElementById('assign-state-select'),
                assignSelectedFrameBtn: document.getElementById('assign-selected-frame-btn'),
                selectAllVisibleUnknownBtn: document.getElementById('select-all-visible-unknown-btn'),
                clearSelectionUnknownBtn: document.getElementById('clear-selection-unknown-btn'),
                unknownSelectionCount: document.getElementById('unknown-selection-count'),
                scopeHint: document.getElementById('scope-hint'),
                sourceGrid: document.getElementById('source-grid'),
                sourceStats: document.getElementById('source-stats'),
                boardStats: document.getElementById('board-stats'),
                stateBoard: document.getElementById('state-board'),
                stateEditorModal: document.getElementById('state-editor-modal'),
                stateEditorBackdrop: document.getElementById('state-editor-backdrop'),
                stateEditorTitle: document.getElementById('state-editor-title'),
                stateEditorSubtitle: document.getElementById('state-editor-subtitle'),
                stateEditorSearch: document.getElementById('state-editor-search'),
                stateEditorUnassignedOnly: document.getElementById('state-editor-unassigned-only'),
                stateEditorAvailableCount: document.getElementById('state-editor-available-count'),
                stateEditorAvailableGrid: document.getElementById('state-editor-available-grid'),
                stateEditorAssignedCount: document.getElementById('state-editor-assigned-count'),
                stateEditorAssignedList: document.getElementById('state-editor-assigned-list'),
                stateEditorAddSelectedBtn: document.getElementById('state-editor-add-selected-btn'),
                stateEditorRemoveSelectedBtn: document.getElementById('state-editor-remove-selected-btn'),
                stateEditorClearBtn: document.getElementById('state-editor-clear-btn'),
                stateEditorApplyBtn: document.getElementById('state-editor-apply-btn'),
                stateEditorCloseBtn: document.getElementById('state-editor-close-btn'),
                previewStateSelect: document.getElementById('preview-state-select'),
                previewSpeed: document.getElementById('preview-speed'),
                speedVal: document.getElementById('speed-val'),
                previewLoopMode: document.getElementById('preview-loop-mode'),
                previewZoom: document.getElementById('preview-zoom'),
                zoomVal: document.getElementById('zoom-val'),
                previewFlip: document.getElementById('preview-flip'),
                previewOnion: document.getElementById('preview-onion'),
                previewScrubber: document.getElementById('preview-scrubber'),
                previewTimelineLabel: document.getElementById('preview-timeline-label'),
                previewFrameStrip: document.getElementById('preview-frame-strip'),
                previewStateCommandList: document.getElementById('preview-state-command-list'),
                previewStateBadge: document.getElementById('preview-state-badge'),
                previewFrameCount: document.getElementById('preview-frame-count'),
                previewDuration: document.getElementById('preview-duration'),
                previewFrameName: document.getElementById('preview-frame-name'),
                previewFirst: document.getElementById('preview-first'),
                previewPrev: document.getElementById('preview-prev'),
                previewPlay: document.getElementById('preview-play'),
                previewPause: document.getElementById('preview-pause'),
                previewStop: document.getElementById('preview-stop'),
                previewNext: document.getElementById('preview-next'),
                previewLast: document.getElementById('preview-last'),
                routeAttackType: document.getElementById('route-attack-type'),
                routeDirection: document.getElementById('route-direction'),
                resolveRouteBtn: document.getElementById('resolve-route-btn'),
                routeResult: document.getElementById('route-result'),
                statusMessage: document.getElementById('status-message'),
                runtimeMode: document.getElementById('mapper-runtime-mode'),
                applyComboBtn: document.getElementById('apply-combo-btn'),
                quickFilters: Array.from(document.querySelectorAll('.quick-filter')),
                jumpEmptyStateBtn: document.getElementById('jump-empty-state-btn'),

                // Projectile editor elements
                projectilePoolGrid: document.getElementById('projectile-pool-grid'),
                projectileImagePath: document.getElementById('projectile-image-path'),
                projectilePreviewImg: document.getElementById('projectile-preview-img'),
                projectileKind: document.getElementById('projectile-kind'),
                projectileSpeed: document.getElementById('projectile-speed'),
                projectileWidth: document.getElementById('projectile-width'),
                projectileHeight: document.getElementById('projectile-height'),
                projectileLife: document.getElementById('projectile-life'),
                projectileSpin: document.getElementById('projectile-spin'),
                projectileClearBtn: document.getElementById('projectile-clear-btn'),
                projectileSelectedName: document.getElementById('projectile-selected-name'),
                projectileStateSelect: document.getElementById('projectile-state-select'),
                projectileAssignStateBtn: document.getElementById('projectile-assign-state-btn'),
                projectileUnassignStateBtn: document.getElementById('projectile-unassign-state-btn'),
                projectileStateList: document.getElementById('projectile-state-list'),

                comboCancelRatio: document.getElementById('combo-cancel-ratio'),
                comboHitReset: document.getElementById('combo-hit-reset'),
                attackDurationScale: document.getElementById('attack-duration-scale'),
                specialDurationScale: document.getElementById('special-duration-scale'),
                requireHitRoutes: document.getElementById('require-hit-routes'),
                commandBindingGrid: document.getElementById('command-binding-grid'),
                commandDerivedGrid: document.getElementById('command-derived-grid'),
                chainLight: document.getElementById('chain-light'),
                chainHeavy: document.getElementById('chain-heavy'),
                chainSpecial: document.getElementById('chain-special'),
                rootRoutesLight: document.getElementById('root-routes-light'),
                rootRoutesHeavy: document.getElementById('root-routes-heavy'),
                rootRoutesSpecial: document.getElementById('root-routes-special'),
                nodePatches: document.getElementById('node-patches'),
            };

            this.preview = new MapperPreview(document.getElementById('preview-canvas'));
            this.preview.setFrameDelay(this.el.previewSpeed.value);
            this.preview.setLoopMode(this.el.previewLoopMode?.value || 'loop');
            this.preview.setZoom((Number(this.el.previewZoom?.value) || 100) / 100);
            this.preview.setFlipX(!!this.el.previewFlip?.checked);
            this.preview.setOnionSkin(!!this.el.previewOnion?.checked);
            this.preview.setOnUpdate((snapshot) => this._syncPreviewUi(snapshot));

            this._bindEvents();
            this._syncPersistenceUi();
        }

        async init() {
            await this._loadProject();
            this._buildProfiles();
            this._renderProfileOptions();
            this._renderUnknownAssignOptions();
            this._renderPreviewStateOptions();

            if (this.profiles.length) {
                this.el.profileSelect.value = this.profiles[0].id;
                await this.loadSelectedProfile();
            } else {
                this._setStatus('Aucun profil detecte.', 'error');
            }
        }

        _bindEvents() {
            this.el.loadProfileBtn.addEventListener('click', () => this.loadSelectedProfile());
            this.el.resetProfileBtn.addEventListener('click', () => this.resetCurrentProfile());
            this.el.validateBtn.addEventListener('click', () => this.validateCurrentProfile());
            if (this.el.exportProfileBtn) {
                this.el.exportProfileBtn.addEventListener('click', () => this.exportCurrentProfile());
            }
            if (this.el.saveToGameBtn) {
                this.el.saveToGameBtn.addEventListener('click', () => this.saveToGame());
            }
            this.el.searchInput.addEventListener('input', () => this._renderSourceGrid());
            this.el.unassignedOnly.addEventListener('change', () => this._renderSourceGrid());
            if (this.el.strictMappedOnly) {
                this.el.strictMappedOnly.addEventListener('change', async () => {
                    await this.loadSelectedProfile();
                });
            }
            if (this.el.assignSelectedFrameBtn) {
                this.el.assignSelectedFrameBtn.addEventListener('click', () => this.assignSelectedUnknownFrame());
            }
            if (this.el.selectAllVisibleUnknownBtn) {
                this.el.selectAllVisibleUnknownBtn.addEventListener('click', () => this.selectAllVisibleUnknownFrames());
            }
            if (this.el.clearSelectionUnknownBtn) {
                this.el.clearSelectionUnknownBtn.addEventListener('click', () => this.clearUnknownSelection());
            }
            if (this.el.stateEditorBackdrop) {
                this.el.stateEditorBackdrop.addEventListener('click', () => this._closeStateEditor());
            }
            if (this.el.stateEditorCloseBtn) {
                this.el.stateEditorCloseBtn.addEventListener('click', () => this._closeStateEditor());
            }
            if (this.el.stateEditorApplyBtn) {
                this.el.stateEditorApplyBtn.addEventListener('click', () => this._applyStateEditorChanges());
            }
            if (this.el.stateEditorSearch) {
                this.el.stateEditorSearch.addEventListener('input', () => {
                    if (!this.stateEditor) return;
                    this.stateEditor.search = this.el.stateEditorSearch.value || '';
                    this._renderStateEditor();
                });
            }
            if (this.el.stateEditorUnassignedOnly) {
                this.el.stateEditorUnassignedOnly.addEventListener('change', () => {
                    if (!this.stateEditor) return;
                    this.stateEditor.unassignedOnly = !!this.el.stateEditorUnassignedOnly.checked;
                    this._renderStateEditor();
                });
            }
            if (this.el.stateEditorAddSelectedBtn) {
                this.el.stateEditorAddSelectedBtn.addEventListener('click', () => this._addStateEditorSelectedFrames());
            }
            if (this.el.stateEditorRemoveSelectedBtn) {
                this.el.stateEditorRemoveSelectedBtn.addEventListener('click', () => this._removeSelectedStateEditorFrames());
            }
            if (this.el.stateEditorClearBtn) {
                this.el.stateEditorClearBtn.addEventListener('click', () => this._clearStateEditorFrames());
            }

            this.el.previewStateSelect.addEventListener('change', async () => {
                if (this.el.projectileStateSelect) this.el.projectileStateSelect.value = this.el.previewStateSelect.value;
                await this._refreshPreview();
            });
            this.el.previewSpeed.addEventListener('input', () => {
                this.preview.setFrameDelay(this.el.previewSpeed.value);
            });
            if (this.el.previewLoopMode) {
                this.el.previewLoopMode.addEventListener('change', () => {
                    this.preview.setLoopMode(this.el.previewLoopMode.value);
                });
            }
            if (this.el.previewZoom) {
                this.el.previewZoom.addEventListener('input', () => {
                    this.preview.setZoom((Number(this.el.previewZoom.value) || 100) / 100);
                });
            }
            if (this.el.previewFlip) {
                this.el.previewFlip.addEventListener('change', () => {
                    this.preview.setFlipX(this.el.previewFlip.checked);
                });
            }
            if (this.el.previewOnion) {
                this.el.previewOnion.addEventListener('change', () => {
                    this.preview.setOnionSkin(this.el.previewOnion.checked);
                });
            }
            if (this.el.previewScrubber) {
                this.el.previewScrubber.addEventListener('input', () => {
                    this.preview.pause();
                    this.preview.setFrameIndex(Number(this.el.previewScrubber.value) || 0);
                });
            }
            if (this.el.previewFirst) {
                this.el.previewFirst.addEventListener('click', () => this.preview.goToStart());
            }
            if (this.el.previewPrev) {
                this.el.previewPrev.addEventListener('click', () => this.preview.step(-1));
            }
            this.el.previewPlay.addEventListener('click', () => this.preview.play());
            if (this.el.previewPause) {
                this.el.previewPause.addEventListener('click', () => this.preview.pause());
            }
            this.el.previewStop.addEventListener('click', () => this.preview.stop());
            if (this.el.previewNext) {
                this.el.previewNext.addEventListener('click', () => this.preview.step(1));
            }
            if (this.el.previewLast) {
                this.el.previewLast.addEventListener('click', () => this.preview.goToEnd());
            }

            this.el.resolveRouteBtn.addEventListener('click', () => this.resolveRouteTest());
            this.el.applyComboBtn.addEventListener('click', () => this.applyComboEditorChanges());

            this.el.quickFilters.forEach((btn) => {
                this._setQuickFilterButtonState(btn, btn.classList.contains('active'));
                btn.addEventListener('click', () => {
                    this.stateFilter = btn.dataset.filter || 'all';
                    this.el.quickFilters.forEach((b) => this._setQuickFilterButtonState(b, b === btn));
                    this._renderBoard();
                });
            });
            this.el.jumpEmptyStateBtn.addEventListener('click', () => this._jumpToNextEmptyState());

            // Projectile attribution events
            if (this.el.projectileClearBtn) {
                this.el.projectileClearBtn.addEventListener('click', () => this._clearProjectileConfig());
            }
            if (this.el.projectileAssignStateBtn) {
                this.el.projectileAssignStateBtn.addEventListener('click', () => this._assignProjectileToState());
            }
            if (this.el.projectileUnassignStateBtn) {
                this.el.projectileUnassignStateBtn.addEventListener('click', () => this._unassignProjectileFromState());
            }
            if (this.el.projectileStateSelect) {
                this.el.projectileStateSelect.addEventListener('change', () => this._loadSelectedStateProjectileConfig());
            }

            document.addEventListener('keydown', (e) => this._handlePreviewHotkeys(e));
        }

        _detectLocalAuthoringMode() {
            const host = window.location.hostname || '';
            return host === 'localhost' || host === '127.0.0.1' || host === '::1';
        }

        _toRootPath(path) {
            const raw = String(path || '').trim();
            if (!raw) return '';
            if (/^(?:[a-z]+:)?\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
                return raw;
            }
            return raw.startsWith('/') ? raw : `/${raw.replace(/^\/+/, '')}`;
        }

        _syncPersistenceUi() {
            if (this.el.runtimeMode) {
                this.el.runtimeMode.textContent = this.canPersistToGame
                    ? 'Local authoring mode'
                    : 'Public demo mode';
            }
            if (!this.el.saveToGameBtn) return;

            if (this.canPersistToGame) {
                this.el.saveToGameBtn.disabled = false;
                this.el.saveToGameBtn.textContent = 'Sauvegarder';
                this.el.saveToGameBtn.title = 'Sauvegarde directe dans le projet local';
                return;
            }

            this.el.saveToGameBtn.disabled = true;
            this.el.saveToGameBtn.textContent = 'Sauvegarde locale';
            this.el.saveToGameBtn.title = 'Disponible uniquement sur le serveur local avec /api/save-mapping';
        }

        _setStatus(message, level = 'normal') {
            const el = this.el.statusMessage;
            if (!el) return;
            el.textContent = message;
            el.classList.remove('text-emerald-300', 'text-rose-300', 'text-slate-400');
            if (level === 'ok') {
                el.classList.add('text-emerald-300');
                return;
            }
            if (level === 'error') {
                el.classList.add('text-rose-300');
                return;
            }
            el.classList.add('text-slate-400');
        }

        _setQuickFilterButtonState(btn, isActive) {
            if (!btn) return;
            btn.classList.toggle('active', !!isActive);
            btn.classList.toggle('border-cyan-300/60', !!isActive);
            btn.classList.toggle('bg-cyan-400/10', !!isActive);
            btn.classList.toggle('text-cyan-100', !!isActive);
            btn.classList.toggle('border-white/10', !isActive);
            btn.classList.toggle('bg-white/5', !isActive);
            btn.classList.toggle('text-slate-300', !isActive);
        }

        _formatPreviewDuration(totalFrames, frameDelayMs) {
            const totalMs = Math.max(0, Math.round((Number(totalFrames) || 0) * (Number(frameDelayMs) || 0)));
            if (totalMs >= 1000) {
                return `${(totalMs / 1000).toFixed(2)}s`;
            }
            return `${totalMs}ms`;
        }

        _getCommandBindingSpecs() {
            return [
                { action: 'run', label: 'Déplacement', input: '← / →', help: 'Schéma global fixe. Le runtime lit toujours RUN au maintien directionnel.' },
                { action: 'dash', label: 'Dash', input: '←← / →→', help: 'Double tap directionnel. Même logique pour tout le roster.' },
                { action: 'jump', label: 'Saut', input: '↑', help: 'Commande simple de saut.' },
                { action: 'crouch', label: 'Accroupi', input: '↓', help: 'Commande simple d’accroupi.' },
                { action: 'block', label: 'Garde / charge', input: 'Q', help: 'Garde au contact, charge chakra au neutre et à distance.' },
                { action: 'light', label: 'Attaque rapide', input: 'S', help: 'Starter light neutre. Les variantes viennent des routes combo.' },
                { action: 'heavy', label: 'Attaque forte', input: 'D', help: 'Starter heavy neutre. Les variantes viennent des routes combo.' },
                { action: 'special', label: 'Spécial / jutsu', input: 'F', help: 'Spécial neutre. Les variantes ↑ ↓ arrière avant viennent des routes spéciales.' },
                { action: 'transform', label: 'Transformation', input: 'G', help: 'Commande simple de transformation.' },
            ];
        }

        _getFixedCommandStateMap() {
            return {
                run: 'RUN',
                dash: 'DASH',
                jump: 'JUMP',
                crouch: 'CROUCH',
                block: 'BLOCK',
                light: 'ATTACK_LIGHT_1',
                heavy: 'ATTACK_HEAVY_1',
                special: 'SPECIAL',
                transform: 'SPECIAL_TRANSFORM',
            };
        }

        _resolveComboCommandState(combo, type, direction) {
            const routeMap = combo?.rootRoutes?.[type] || {};
            const fixedStates = this._getFixedCommandStateMap();
            const resolvedDirection = (type === 'special' && !['neutral', 'up', 'down', 'back', 'forward'].includes(direction))
                ? 'neutral'
                : direction;
            const nodeId = routeMap[resolvedDirection] || routeMap.any || routeMap.neutral || '';
            const patch = combo?.nodePatches?.[nodeId] || {};
            const chain = combo?.chains?.[type] || [];
            const stepMatch = typeof nodeId === 'string' ? nodeId.match(/_(\d+)$/) : null;
            const step = stepMatch ? Math.max(1, Number(stepMatch[1])) : 1;
            const chainState = chain[Math.min(chain.length - 1, step - 1)]?.state || '';
            const patchedState = patch?.profileOverrides?.state || '';
            return patchedState || chainState || fixedStates[type] || '';
        }

        _getCommandEntries(combo) {
            const fixedStates = this._getFixedCommandStateMap();
            const entries = [
                { key: 'move', label: 'Déplacement', input: '← / →', state: fixedStates.run, note: 'Maintien directionnel', category: 'movement' },
                { key: 'dash', label: 'Dash', input: '←← / →→', state: fixedStates.dash, note: 'Double tap', category: 'movement' },
                { key: 'jump', label: 'Saut', input: '↑', state: fixedStates.jump, note: 'Commande simple', category: 'movement' },
                { key: 'crouch', label: 'Accroupi', input: '↓', state: fixedStates.crouch, note: 'Commande simple', category: 'movement' },
                { key: 'block', label: 'Garde / charge', input: 'Q', state: fixedStates.block, note: 'Maintien / charge contextuelle', category: 'defense' },
                { key: 'light_neutral', label: 'Light neutre', input: 'S', state: this._resolveComboCommandState(combo, 'light', 'neutral'), note: 'Starter combo light', category: 'light' },
                { key: 'light_down', label: 'Light bas', input: '↓ + S', state: this._resolveComboCommandState(combo, 'light', 'down'), note: 'Low starter', category: 'light' },
                { key: 'light_forward', label: 'Light avant', input: '→ + S', state: this._resolveComboCommandState(combo, 'light', 'forward'), note: 'Starter avancé', category: 'light' },
                { key: 'light_air', label: 'Light air', input: '↑ + S', state: this._resolveComboCommandState(combo, 'light', 'air'), note: 'Starter aérien', category: 'light' },
                { key: 'light_back', label: 'Light arrière', input: '← + S', state: this._resolveComboCommandState(combo, 'light', 'back'), note: 'Starter recul', category: 'light' },
                { key: 'heavy_neutral', label: 'Heavy neutre', input: 'D', state: this._resolveComboCommandState(combo, 'heavy', 'neutral'), note: 'Starter combo heavy', category: 'heavy' },
                { key: 'heavy_down', label: 'Heavy bas', input: '↓ + D', state: this._resolveComboCommandState(combo, 'heavy', 'down'), note: 'Sweep / low heavy', category: 'heavy' },
                { key: 'heavy_forward', label: 'Heavy avant', input: '→ + D', state: this._resolveComboCommandState(combo, 'heavy', 'forward'), note: 'Heavy avancé', category: 'heavy' },
                { key: 'heavy_air', label: 'Heavy air', input: '↑ + D', state: this._resolveComboCommandState(combo, 'heavy', 'air'), note: 'Heavy aérien', category: 'heavy' },
                { key: 'heavy_back', label: 'Heavy arrière', input: '← + D', state: this._resolveComboCommandState(combo, 'heavy', 'back'), note: 'Heavy recul', category: 'heavy' },
                { key: 'special_neutral', label: 'Spécial neutre', input: 'F', state: this._resolveComboCommandState(combo, 'special', 'neutral') || fixedStates.special, note: 'Jutsu principal', category: 'special' },
                { key: 'special_up', label: 'Spécial haut', input: '↑ + F', state: this._resolveComboCommandState(combo, 'special', 'up') || fixedStates.special, note: 'Variante anti-air / verticale', category: 'special' },
                { key: 'special_down', label: 'Spécial bas', input: '↓ + F', state: this._resolveComboCommandState(combo, 'special', 'down') || fixedStates.special, note: 'Variante basse / proche', category: 'special' },
                { key: 'special_back', label: 'Spécial arrière', input: '← + F', state: this._resolveComboCommandState(combo, 'special', 'back') || fixedStates.special, note: 'Variante recul / punish', category: 'special' },
                { key: 'special_forward', label: 'Spécial avant', input: '→ + F', state: this._resolveComboCommandState(combo, 'special', 'forward') || fixedStates.special, note: 'Variante avance / zoning', category: 'special' },
                { key: 'transform', label: 'Transformation', input: 'G', state: fixedStates.transform, note: 'Commande simple', category: 'special' },
            ];

            return entries.map((entry) => ({
                ...entry,
                state: entry.state || '(non défini)',
            }));
        }

        _readActionMapEditor() {
            return { ...this._getFixedCommandStateMap() };
        }

        _getCommandPreviewCombo() {
            const combo = this.store ? this.store.getCombo() : { actionMap: {}, chains: {}, rootRoutes: {}, nodePatches: {} };
            combo.actionMap = this._readActionMapEditor();
            return combo;
        }

        _renderCommandBindingEditor(combo) {
            const root = this.el.commandBindingGrid;
            if (!root) return;

            const specs = this._getCommandBindingSpecs();
            const fixedStates = this._getFixedCommandStateMap();
            root.innerHTML = '';

            specs.forEach((spec) => {
                const resolvedState = ['light', 'heavy', 'special'].includes(spec.action)
                    ? (this._resolveComboCommandState(combo, spec.action, 'neutral') || fixedStates[spec.action])
                    : fixedStates[spec.action];
                const row = document.createElement('div');
                row.className = 'command-binding-row grid gap-3 rounded-[22px] border border-white/10 bg-slate-950/55 p-4 lg:grid-cols-[minmax(0,1.35fr)_120px_minmax(0,0.95fr)_92px] lg:items-center';

                const meta = document.createElement('div');
                meta.className = 'command-binding-meta min-w-0';

                const label = document.createElement('div');
                label.className = 'command-binding-label truncate font-pixel text-[10px] uppercase tracking-[0.16em] text-white';
                label.textContent = spec.label;

                const help = document.createElement('div');
                help.className = 'command-binding-help mt-2 text-xs leading-6 text-slate-400';
                help.textContent = spec.help;

                meta.appendChild(label);
                meta.appendChild(help);

                const input = document.createElement('div');
                input.className = 'command-input-badge inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-3 font-pixel text-[10px] uppercase tracking-[0.16em] text-slate-200';
                input.textContent = spec.input;

                const stateChip = document.createElement('div');
                stateChip.className = 'command-binding-select rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-3 text-sm font-semibold text-cyan-100';
                stateChip.textContent = resolvedState || '(runtime)';

                const previewBtn = document.createElement('button');
                previewBtn.type = 'button';
                previewBtn.className = 'mapper-btn command-preview-btn rounded-2xl border border-white/10 bg-white/5 px-3 py-3 font-pixel text-[10px] uppercase tracking-[0.16em] text-slate-100 transition hover:border-white/20 hover:bg-white/10';
                previewBtn.textContent = 'Voir';
                previewBtn.addEventListener('click', async () => {
                    if (!resolvedState) return;
                    if (this.el.previewStateSelect) this.el.previewStateSelect.value = resolvedState;
                    await this._refreshPreview();
                });

                row.appendChild(meta);
                row.appendChild(input);
                row.appendChild(stateChip);
                row.appendChild(previewBtn);
                root.appendChild(row);
            });
        }

        _renderCommandDerivedGrid(combo) {
            const root = this.el.commandDerivedGrid;
            if (!root) return;

            const entries = this._getCommandEntries(combo);
            root.innerHTML = '';

            entries.forEach((entry) => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'command-derived-card grid gap-3 rounded-[22px] border border-white/10 bg-slate-950/55 p-4 text-left transition hover:border-cyan-300/30 hover:bg-slate-900/80';
                card.title = `${entry.input} -> ${entry.state}`;
                card.addEventListener('click', async () => {
                    if (!entry.state || entry.state === '(non défini)') return;
                    if (this.el.previewStateSelect) this.el.previewStateSelect.value = entry.state;
                    await this._refreshPreview();
                });

                const top = document.createElement('div');
                top.className = 'command-derived-top flex items-start justify-between gap-3';

                const label = document.createElement('div');
                label.className = 'command-derived-label font-pixel text-[10px] uppercase tracking-[0.16em] text-white';
                label.textContent = entry.label;

                const input = document.createElement('div');
                input.className = 'command-input-badge inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.16em] text-slate-200';
                input.textContent = entry.input;

                const state = document.createElement('div');
                state.className = 'command-derived-state text-sm font-semibold text-cyan-100';
                state.textContent = entry.state;

                const note = document.createElement('div');
                note.className = 'command-derived-note text-xs leading-6 text-slate-400';
                note.textContent = entry.note || '';

                top.appendChild(label);
                top.appendChild(input);
                card.appendChild(top);
                card.appendChild(state);
                card.appendChild(note);
                root.appendChild(card);
            });
        }

        _renderPreviewStateCommands(combo) {
            const root = this.el.previewStateCommandList;
            if (!root) return;

            const state = this.el.previewStateSelect?.value || '';
            const entries = this._getCommandEntries(combo).filter((entry) => entry.state === state);
            root.innerHTML = '';

            if (!entries.length) {
                const empty = document.createElement('div');
                empty.className = 'command-derived-note text-sm leading-6 text-slate-400';
                empty.textContent = 'Aucune touche claire reliée à cet état pour le mapping actuel.';
                root.appendChild(empty);
                return;
            }

            entries.forEach((entry) => {
                const chip = document.createElement('div');
                chip.className = 'command-chip inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200';
                const key = document.createElement('kbd');
                key.className = 'inline-flex min-h-8 min-w-8 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 px-2 font-pixel text-[10px] uppercase tracking-[0.16em] text-white';
                key.textContent = entry.input;
                const label = document.createElement('span');
                label.className = 'text-sm text-slate-200';
                label.textContent = entry.label;
                chip.appendChild(key);
                chip.appendChild(label);
                root.appendChild(chip);
            });
        }

        _isInteractiveTarget(target) {
            if (!target || typeof target.closest !== 'function') return false;
            return !!target.closest('input, textarea, select, button, [contenteditable="true"]');
        }

        _handlePreviewHotkeys(e) {
            if (this.stateEditor && e.key === 'Escape') {
                e.preventDefault();
                this._closeStateEditor();
                return;
            }
            if (this._isInteractiveTarget(e.target)) return;
            if (!this.store) return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === ' ') {
                e.preventDefault();
                this.preview.togglePlayback();
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.preview.step(-1);
                return;
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.preview.step(1);
                return;
            }

            if (e.key === 'Home') {
                e.preventDefault();
                this.preview.goToStart();
                return;
            }

            if (e.key === 'End') {
                e.preventDefault();
                this.preview.goToEnd();
            }
        }

        _syncPreviewUi(snapshot = this.preview.getSnapshot()) {
            const totalFrames = snapshot.totalFrames || 0;
            const currentFrame = totalFrames ? snapshot.currentFrame + 1 : 0;
            const currentState = this.el.previewStateSelect?.value || '-';

            if (this.el.speedVal) this.el.speedVal.textContent = `${snapshot.frameDelayMs}ms`;
            if (this.el.zoomVal) this.el.zoomVal.textContent = `${snapshot.zoomPercent}%`;
            if (this.el.previewStateBadge) this.el.previewStateBadge.textContent = currentState;
            if (this.el.previewFrameCount) this.el.previewFrameCount.textContent = `${currentFrame} / ${totalFrames}`;
            if (this.el.previewTimelineLabel) this.el.previewTimelineLabel.textContent = `${currentFrame} / ${totalFrames}`;
            if (this.el.previewDuration) {
                this.el.previewDuration.textContent = this._formatPreviewDuration(totalFrames, snapshot.frameDelayMs);
            }
            if (this.el.previewFrameName) {
                this.el.previewFrameName.textContent = snapshot.currentFrameName || 'Aucune frame sélectionnée';
            }
            if (this.el.previewScrubber) {
                this.el.previewScrubber.disabled = totalFrames <= 1;
                this.el.previewScrubber.max = `${Math.max(0, totalFrames - 1)}`;
                this.el.previewScrubber.value = `${Math.max(0, snapshot.currentFrame || 0)}`;
            }
            if (this.el.previewPlay) {
                this.el.previewPlay.classList.toggle('is-active', !!snapshot.playing);
                this.el.previewPlay.classList.toggle('border-cyan-300/70', !!snapshot.playing);
                this.el.previewPlay.classList.toggle('bg-cyan-400/15', !!snapshot.playing);
                this.el.previewPlay.classList.toggle('text-cyan-100', !!snapshot.playing);
                this.el.previewPlay.classList.toggle('border-white/10', !snapshot.playing);
                this.el.previewPlay.classList.toggle('bg-white/5', !snapshot.playing);
                this.el.previewPlay.classList.toggle('text-slate-100', !snapshot.playing);
                this.el.previewPlay.textContent = snapshot.playing ? 'Lecture...' : 'Lecture';
            }
            if (this.el.previewPause) {
                this.el.previewPause.disabled = !snapshot.playing;
            }

            const strip = this.el.previewFrameStrip;
            if (strip) {
                Array.from(strip.querySelectorAll('.preview-thumb')).forEach((thumb) => {
                    const index = Number(thumb.dataset.frameIndex);
                    const isActive = index === snapshot.currentFrame;
                    thumb.classList.toggle('is-active', isActive);
                    thumb.classList.toggle('border-cyan-300/70', isActive);
                    thumb.classList.toggle('bg-cyan-400/10', isActive);
                    thumb.classList.toggle('shadow-[0_16px_36px_rgba(34,211,238,0.14)]', isActive);
                    thumb.classList.toggle('border-white/10', !isActive);
                    thumb.classList.toggle('bg-slate-950/55', !isActive);
                });
            }
        }

        _renderPreviewTimeline() {
            const strip = this.el.previewFrameStrip;
            if (!strip || !this.store) return;

            const stateName = this.el.previewStateSelect?.value || '';
            const frames = this.store.getStateFrames(stateName);
            strip.innerHTML = '';
            strip.classList.toggle('is-empty', !frames.length);

            if (!frames.length) {
                strip.textContent = 'Aucune frame dans cet état.';
                this._syncPreviewUi();
                return;
            }

            frames.forEach((frameName, frameIndex) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'preview-thumb flex min-w-[110px] flex-col gap-2 rounded-[20px] border border-white/10 bg-slate-950/55 p-3 text-left transition hover:border-white/20 hover:bg-slate-900/80';
                btn.dataset.frameIndex = `${frameIndex}`;
                btn.title = frameName;

                const img = document.createElement('img');
                img.alt = frameName;
                img.loading = 'lazy';
                img.className = 'h-16 w-full rounded-2xl bg-black/30 object-contain [image-rendering:pixelated]';
                this._setImageWithFallback(img, frameName);

                const idx = document.createElement('div');
                idx.className = 'preview-thumb-index font-pixel text-[10px] uppercase tracking-[0.16em] text-slate-500';
                idx.textContent = `#${frameIndex + 1}`;

                const name = document.createElement('div');
                name.className = 'preview-thumb-name truncate text-[11px] text-slate-200';
                name.textContent = frameName;

                btn.appendChild(img);
                btn.appendChild(idx);
                btn.appendChild(name);
                btn.addEventListener('click', () => {
                    this.preview.pause();
                    this.preview.setFrameIndex(frameIndex);
                });
                strip.appendChild(btn);
            });

            this._syncPreviewUi();
        }

        async _loadProject() {
            this.project = await this._fetchJson('assets/organized/shared/sb3/project.json');
            this._buildAssetMetaIndex();
        }

        _buildAssetMetaIndex() {
            this.assetMetaByFile = new Map();
            const targets = Array.isArray(this.project?.targets) ? this.project.targets : [];
            targets.forEach((target) => {
                const targetName = String(target?.name || '').trim();
                (target?.costumes || []).forEach((costume, idx) => {
                    const file = (typeof costume?.md5ext === 'string' && costume.md5ext.trim())
                        ? costume.md5ext.trim()
                        : (costume?.assetId && costume?.dataFormat ? `${costume.assetId}.${costume.dataFormat}` : '');
                    if (!file || !file.toLowerCase().endsWith('.png')) return;
                    const costumeName = String(costume?.name || '').trim() || `costume${idx + 1}`;
                    this.assetMetaByFile.set(file, { targetName, costumeName });
                });
            });
        }

        _buildProfiles() {
            const roster = Array.isArray(window.CHARACTER_ROSTER) ? window.CHARACTER_ROSTER : [];
            const profileCandidates = [];

            roster.forEach((charData) => {
                if (charData?.selectable === false) return;
                const mappingPath = charData?.spriteConfig?.mappingPath;
                const targetName = charData?.targetName || charData?.name;
                if (!mappingPath || !targetName) return;

                const id = charData.id || mappingPath;
                const mappingSlug = mappingPath.split('/').pop().replace(/\.json$/i, '');
                let label = `${charData.name || id} (${id})`;
                if (id === 'naruto') label = `${charData.name || id} [Kid -> Kyuubi] (${id})`;
                else if (id === 'naruto_shippuden') label = `${charData.name || id} [-> Kyuubi] (${id})`;
                else if (id === 'sasuke') label = `${charData.name || id} [-> CS2] (${id})`;
                else if (id === 'lee') label = `${charData.name || id} [Portes] (${id})`;
                profileCandidates.push({
                    id,
                    label,
                    targetName,
                    mappingPath,
                    mappingSlug,
                    assetsBasePath: this._inferAssetsBasePath(charData?.spriteConfig?.assetsBasePath, charData?.sprite),
                    projectPath: this._inferProjectPath(charData?.sprite, charData?.spriteConfig?.assetsBasePath),
                });
            });

            if (!profileCandidates.length) {
                // Fallback to project targets if roster is unavailable.
                const targets = (this.project?.targets || []).filter((t) => (t.name || '').trim() && (t.name || '').trim() !== 'Stage');
                targets.forEach((target) => {
                    const targetName = (target.name || '').trim();
                    const slug = targetName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                    profileCandidates.push({
                        id: slug,
                        label: targetName,
                        targetName,
                        mappingPath: `assets/organized/shared/sb3/mappings/${slug}.json`,
                        mappingSlug: slug,
                        assetsBasePath: 'assets/organized/shared/sb3',
                        projectPath: 'assets/organized/shared/sb3/project.json',
                    });
                });
            }

            // Keep first occurrence per profile id.
            const seen = new Set();
            this.profiles = profileCandidates.filter((p) => {
                if (seen.has(p.id)) return false;
                seen.add(p.id);
                return true;
            });
            this.profiles.sort((a, b) => a.label.localeCompare(b.label));
            this.profiles.unshift({
                id: 'root_mapping',
                label: 'Target Custom (mapping.json)',
                targetName: 'CustomTarget',
                mappingPath: 'mapping.json',
                mappingSlug: 'mapping',
                assetsBasePath: 'assets/organized/shared/sb3',
                projectPath: 'assets/organized/shared/sb3/project.json',
                isUnknownProfile: false,
            });
            this.profiles.unshift({
                id: '__unknown__',
                label: 'UNKNOWN (global)',
                targetName: '',
                mappingPath: '',
                mappingSlug: 'unknown_global',
                assetsBasePath: 'assets/organized/shared/sb3',
                projectPath: 'assets/organized/shared/sb3/project.json',
                isUnknownProfile: true,
            });
            this.profileById = new Map(this.profiles.map((p) => [p.id, p]));
        }

        _renderUnknownAssignOptions() {
            if (!this.el.assignProfileSelect || !this.el.assignStateSelect) return;
            this.el.assignProfileSelect.innerHTML = '';
            this.profiles.filter((p) => !p.isUnknownProfile).forEach((profile) => {
                const option = document.createElement('option');
                option.value = profile.id;
                option.textContent = profile.label;
                this.el.assignProfileSelect.appendChild(option);
            });

            this.el.assignStateSelect.innerHTML = '';
            (window.MAPPER_STATES || []).forEach((state) => {
                if (state === 'UNUSED_UNKNOWN') return;
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                this.el.assignStateSelect.appendChild(option);
            });
            this.el.assignStateSelect.value = 'IDLE';
        }

        _renderProfileOptions() {
            const select = this.el.profileSelect;
            select.innerHTML = '';
            this.profiles.forEach((profile) => {
                const option = document.createElement('option');
                option.value = profile.id;
                option.textContent = profile.label;
                select.appendChild(option);
            });
        }

        _renderPreviewStateOptions() {
            const select = this.el.previewStateSelect;
            select.innerHTML = '';
            (window.MAPPER_STATES || []).forEach((state) => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                select.appendChild(option);
            });
            if (select.options.length) select.value = 'IDLE';
            this._renderProjectileStateOptions();
        }

        _inferAssetsBasePath(spriteConfigBasePath, spritePath) {
            if (typeof spriteConfigBasePath === 'string' && spriteConfigBasePath.trim()) {
                return spriteConfigBasePath.trim().replace(/\/$/, '');
            }
            const sprite = String(spritePath || '');
            if (sprite.includes('assets/organized/shared/sb3_fullpack/project.json')) return 'assets/organized/shared/sb3_fullpack';
            if (sprite.includes('assets/organized/shared/sb3/project.json')) return 'assets/organized/shared/sb3';
            return 'assets/organized/shared/sb3';
        }

        _inferProjectPath(spritePath, spriteConfigBasePath) {
            const sprite = String(spritePath || '').trim();
            if (sprite && sprite.toLowerCase().endsWith('.json')) {
                return sprite;
            }
            const base = String(spriteConfigBasePath || '').trim().replace(/\/$/, '');
            if (base) {
                if (base.endsWith('/frames')) {
                    return `${base.slice(0, -'/frames'.length)}/source_project.json`;
                }
                return `${base}/project.json`;
            }
            return 'assets/organized/shared/sb3/project.json';
        }

        _getPreviewBasePaths() {
            const primary = this.currentProfile?.assetsBasePath || 'assets/organized/shared/sb3';
            const list = [
                primary,
                'assets/organized/shared/sb3',
                'assets/organized/shared/sb3_fullpack',
                'assets/organized/characters/projectile_pool/pool/sb3_fullpack',
            ];
            return Array.from(new Set(list.filter(Boolean)));
        }

        _resolveFramePath(frameName) {
            const bases = this._getPreviewBasePaths();
            return this._toRootPath(`${bases[0]}/${this._normalizeFrameName(frameName)}`);
        }

        _setImageWithFallback(imgEl, frameName) {
            const bases = this._getPreviewBasePaths();
            const normalizedFrameName = this._normalizeFrameName(frameName);
            let index = 0;
            const tryLoad = () => {
                if (index >= bases.length) return;
                const src = this._toRootPath(`${bases[index]}/${normalizedFrameName}`);
                index += 1;
                imgEl.src = src;
            };
            imgEl.onerror = () => tryLoad();
            tryLoad();
        }

        async loadSelectedProfile() {
            const profileId = this.el.profileSelect.value;
            const profile = this.profileById.get(profileId);
            if (!profile) return;

            this.currentProfile = profile;
            this.selectedSourceFrames.clear();
            this._updateUnknownToolsVisibility();

            // Fetch the specific project manifest for this profile
            try {
                const manifestPath = profile.isUnknownProfile
                    ? 'assets/organized/shared/sb3/project.json'
                    : (profile.projectPath || (profile.assetsBasePath + '/project.json'));
                const profileProject = await this._fetchJson(manifestPath);
                // Merge with default project targets so all character data is available
                const defaultProject = await this._fetchJson('assets/organized/shared/sb3/project.json').catch(() => null);
                if (defaultProject && profileProject !== defaultProject) {
                    const mergedTargets = Array.isArray(defaultProject.targets)
                        ? [...defaultProject.targets]
                        : [];
                    const profileTargets = Array.isArray(profileProject.targets)
                        ? profileProject.targets
                        : [];

                    // Keep default targets for UI context, but always let the selected
                    // profile manifest override same-name targets (ex: Sprite7 variants).
                    profileTargets.forEach((profileTarget) => {
                        const name = String(profileTarget?.name || '').trim();
                        if (!name) {
                            mergedTargets.push(profileTarget);
                            return;
                        }
                        const existingIndex = mergedTargets.findIndex(
                            (target) => String(target?.name || '').trim() === name
                        );
                        if (existingIndex >= 0) {
                            mergedTargets[existingIndex] = profileTarget;
                        } else {
                            mergedTargets.push(profileTarget);
                        }
                    });

                    this.project = { ...defaultProject, targets: mergedTargets };
                } else {
                    this.project = profileProject;
                }
                this._buildAssetMetaIndex();
            } catch (err) {
                console.warn('Could not load specific project manifest, falling back to default', err);
                try {
                    this.project = await this._fetchJson('assets/organized/shared/sb3/project.json');
                    this._buildAssetMetaIndex();
                } catch (fallbackErr) {
                    console.error('Could not load any project manifest', fallbackErr);
                }
            }

            if (profile.isUnknownProfile) {
                const unknownFrames = await this._computeGlobalUnknownFrames();
                const mappingJson = {
                    targetName: 'UNKNOWN_GLOBAL',
                    version: 1,
                    stateMap: { UNUSED_UNKNOWN: [] },
                    combo: null,
                    meta: { generatedBy: 'mapper_unknown_global' },
                };
                this.store = new MapperStore(profile, unknownFrames, mappingJson);
                this.stateProjectileMap = {};
                this._clearProjectileConfig();
                this._renderAll();
                this._updateUnknownSelectionCount();
                if (this.el.scopeHint) {
                    this.el.scopeHint.textContent = 'Scope: Frames du projet non mappees dans aucun profil.';
                }
                this._setStatus(`Profil charge: ${profile.label} | ${unknownFrames.length} frame(s)`, 'ok');
                return;
            }

            let mappingJson = null;
            try {
                mappingJson = await this._fetchJson(profile.mappingPath);
            } catch (err) {
                mappingJson = {
                    targetName: profile.targetName,
                    version: 1,
                    stateMap: {},
                    combo: null,
                    meta: { generatedBy: 'mapper_fallback' },
                };
            }

            const scopedMappingJson = this._scopeMappingForProfile(profile.id, mappingJson);
            const targetFrames = this._getTargetFramesForProfile(profile, scopedMappingJson);
            this.store = new MapperStore(profile, targetFrames, scopedMappingJson);
            this._loadProjectileConfig(scopedMappingJson);
            this._renderAll();
            const scopeLabel = this._getProfileScopeLabel(profile.id);
            const scopeGuide = this._getProfileScopeGuide(profile.id);
            if (this.el.scopeHint) {
                this.el.scopeHint.textContent = scopeGuide
                    ? `Scope: ${scopeLabel} | ${scopeGuide}`
                    : (scopeLabel ? `Scope: ${scopeLabel}` : 'Scope: Tout le target');
            }
            if (scopeLabel) {
                this._setStatus(`Profil charge: ${profile.label} | Scope: ${scopeLabel}`, 'ok');
            } else {
                this._setStatus(`Profil charge: ${profile.label}`, 'ok');
            }
        }

        _updateUnknownToolsVisibility() {
            if (!this.el.unknownAssignTools) return;
            const isUnknown = !!this.currentProfile?.isUnknownProfile;
            this.el.unknownAssignTools.classList.toggle('hidden', !isUnknown);
            if (!isUnknown) this._updateUnknownSelectionCount();
        }

        _updateUnknownSelectionCount() {
            if (!this.el.unknownSelectionCount) return;
            const n = this.selectedSourceFrames.size;
            this.el.unknownSelectionCount.textContent = `${n} frame${n > 1 ? 's' : ''} selectionnee${n > 1 ? 's' : ''}`;
        }

        selectAllVisibleUnknownFrames() {
            if (!this.currentProfile?.isUnknownProfile || !this.store) return;
            const search = this.el.searchInput.value;
            const unassignedOnly = this.el.unassignedOnly.checked;
            const frames = this.store.getFilteredSourceFrames(search, unassignedOnly);
            frames.forEach((f) => this.selectedSourceFrames.add(f));
            this._updateUnknownSelectionCount();
            this._renderSourceGrid();
        }

        clearUnknownSelection() {
            this.selectedSourceFrames.clear();
            this._updateUnknownSelectionCount();
            this._renderSourceGrid();
        }

        _extractMappedFrames(mappingJson) {
            const out = [];
            if (!mappingJson || typeof mappingJson !== 'object') return out;
            const stateMap = mappingJson.stateMap && typeof mappingJson.stateMap === 'object' ? mappingJson.stateMap : {};
            const categories = mappingJson.categories && typeof mappingJson.categories === 'object' ? mappingJson.categories : {};
            Object.values(stateMap).forEach((arr) => {
                if (Array.isArray(arr)) out.push(...arr);
            });
            Object.values(categories).forEach((arr) => {
                if (Array.isArray(arr)) out.push(...arr);
            });
            return out
                .map((frame) => this._normalizeFrameName(frame))
                .filter((f) => typeof f === 'string' && f.toLowerCase().endsWith('.png'));
        }

        async _computeGlobalUnknownFrames() {
            const targets = Array.isArray(this.project?.targets) ? this.project.targets : [];
            const allFrames = [];
            targets.forEach((target) => {
                const targetName = (target?.name || '').trim().toLowerCase();
                if (!targetName || targetName === 'stage') return;
                (target.costumes || []).forEach((costume) => {
                    const frame = (typeof costume?.md5ext === 'string' && costume.md5ext.trim())
                        ? costume.md5ext.trim()
                        : (costume?.assetId && costume?.dataFormat ? `${costume.assetId}.${costume.dataFormat}` : '');
                    if (frame && frame.toLowerCase().endsWith('.png')) allFrames.push(frame);
                });
            });
            const allSet = new Set(allFrames);
            const usedSet = new Set();
            const profiles = this.profiles.filter((p) => !p.isUnknownProfile && p.mappingPath);
            for (const p of profiles) {
                try {
                    const mapping = await this._fetchJson(p.mappingPath);
                    this._extractMappedFrames(mapping).forEach((frame) => {
                        if (allSet.has(frame)) usedSet.add(frame);
                    });
                } catch (err) {
                    // Keep going when a mapping file is missing.
                }
            }
            return Array.from(allSet).filter((f) => !usedSet.has(f)).sort();
        }

        async assignSelectedUnknownFrame() {
            if (!this.currentProfile?.isUnknownProfile) return;
            const frameNames = Array.from(this.selectedSourceFrames);
            if (!frameNames.length) {
                this._setStatus('Selectionne au moins une frame UNKNOWN avant assignation.', 'error');
                return;
            }

            const targetProfileId = this.el.assignProfileSelect?.value;
            const targetState = this.el.assignStateSelect?.value || 'IDLE';
            const targetProfile = this.profileById.get(targetProfileId);
            if (!targetProfile || targetProfile.isUnknownProfile || !targetProfile.mappingPath) {
                this._setStatus('Profil destination invalide.', 'error');
                return;
            }

            let mapping = null;
            try {
                mapping = await this._fetchJson(targetProfile.mappingPath);
            } catch (err) {
                mapping = {
                    targetName: targetProfile.targetName,
                    version: 1,
                    stateMap: {},
                    combo: null,
                    meta: { generatedBy: 'mapper_unknown_assign' },
                };
            }

            if (!mapping.stateMap || typeof mapping.stateMap !== 'object') mapping.stateMap = {};
            if (!Array.isArray(mapping.stateMap[targetState])) mapping.stateMap[targetState] = [];
            const existing = new Set(mapping.stateMap[targetState]);
            frameNames.forEach((frameName) => {
                if (!existing.has(frameName)) {
                    mapping.stateMap[targetState].push(frameName);
                    existing.add(frameName);
                }
            });
            this.jsonCache.set(targetProfile.mappingPath, Promise.resolve(mapping));

            const selectedSet = new Set(frameNames);
            this.store.sourceFrames = this.store.sourceFrames.filter((f) => !selectedSet.has(f));
            this.selectedSourceFrames.clear();
            this._updateUnknownSelectionCount();
            this._renderSourceGrid();
            this.saveToGame();
            this._setStatus(`Assigne: ${frameNames.length} frame(s) -> ${targetProfile.label} / ${targetState}`, 'ok');
        }

        async resetCurrentProfile() {
            if (!this.currentProfile) return;
            await this.loadSelectedProfile();
            this._setStatus(`Reset effectue: ${this.currentProfile.label}`, 'ok');
        }

        _renderAll() {
            this._renderBoard();
            this._renderSourceGrid();
            this._renderComboEditor();
            this._refreshPreview();
            this._renderProjectilePool();
            this._renderProjectileStateOptions();
            this._renderStateProjectileAssignments();
        }

        _normalizeFrameName(frameName) {
            const raw = typeof frameName === 'string' ? frameName.trim() : '';
            if (!raw) return '';
            if (raw.startsWith('source:')) return raw.slice('source:'.length).trim();
            return raw;
        }

        _openStateEditor(stateName) {
            if (!this.store || !stateName) return;
            this.stateEditor = {
                stateName,
                draftFrames: this.store.getStateFrames(stateName).map((frame) => this._normalizeFrameName(frame)),
                selectedAvailable: new Set(),
                selectedAssigned: new Set(),
                search: '',
                unassignedOnly: false,
            };

            if (this.el.stateEditorSearch) this.el.stateEditorSearch.value = '';
            if (this.el.stateEditorUnassignedOnly) this.el.stateEditorUnassignedOnly.checked = false;
            if (this.el.previewStateSelect) this.el.previewStateSelect.value = stateName;
            if (this.el.projectileStateSelect) this.el.projectileStateSelect.value = stateName;
            this._refreshPreview();
            this._renderStateEditor();
            this.el.stateEditorModal?.classList.remove('hidden');
        }

        _closeStateEditor() {
            this.stateEditor = null;
            this.el.stateEditorModal?.classList.add('hidden');
        }

        _getStateEditorAssignmentCounts() {
            const counts = new Map();
            if (!this.store) return counts;

            const currentState = this.stateEditor?.stateName || '';
            Object.entries(this.store.stateMap || {}).forEach(([state, frames]) => {
                const sourceFrames = state === currentState
                    ? (this.stateEditor?.draftFrames || [])
                    : (Array.isArray(frames) ? frames : []);
                sourceFrames.forEach((frame) => {
                    const normalized = this._normalizeFrameName(frame);
                    if (!normalized) return;
                    counts.set(normalized, (counts.get(normalized) || 0) + 1);
                });
            });
            Object.values(this.store.extraStateMap || {}).forEach((frames) => {
                (Array.isArray(frames) ? frames : []).forEach((frame) => {
                    const normalized = this._normalizeFrameName(frame);
                    if (!normalized) return;
                    counts.set(normalized, (counts.get(normalized) || 0) + 1);
                });
            });
            return counts;
        }

        _getStateEditorAvailableFrames() {
            if (!this.store || !this.stateEditor) return [];
            const search = (this.stateEditor.search || '').trim().toLowerCase();
            const counts = this._getStateEditorAssignmentCounts();
            return this.store.sourceFrames.filter((frame) => {
                const normalized = this._normalizeFrameName(frame);
                if (!normalized) return false;
                if (search && !normalized.toLowerCase().includes(search)) return false;
                if (this.stateEditor.unassignedOnly && (counts.get(normalized) || 0) > 0) return false;
                return true;
            });
        }

        _renderStateEditor() {
            if (!this.stateEditor || !this.store) return;

            const { stateName, draftFrames, selectedAvailable, selectedAssigned } = this.stateEditor;
            const availableFrames = this._getStateEditorAvailableFrames();
            const counts = this._getStateEditorAssignmentCounts();

            if (this.el.stateEditorTitle) this.el.stateEditorTitle.textContent = stateName;
            if (this.el.stateEditorSubtitle) this.el.stateEditorSubtitle.textContent = `${draftFrames.length} frame(s) actuellement dans cet état`;
            if (this.el.stateEditorAvailableCount) this.el.stateEditorAvailableCount.textContent = `${availableFrames.length} résultat(s)`;
            if (this.el.stateEditorAssignedCount) this.el.stateEditorAssignedCount.textContent = `${draftFrames.length} frame(s)`;

            const availableRoot = this.el.stateEditorAvailableGrid;
            if (availableRoot) {
                availableRoot.innerHTML = '';
                if (!availableFrames.length) {
                    const empty = document.createElement('div');
                    empty.className = 'state-editor-empty flex min-h-[160px] items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 text-center text-sm text-slate-500';
                    empty.textContent = 'Aucune animation ne correspond au filtre actuel.';
                    availableRoot.appendChild(empty);
                } else {
                    availableFrames.forEach((frameName) => {
                        const normalized = this._normalizeFrameName(frameName);
                        const card = this._createFrameCard(normalized, counts.get(normalized) || 0);
                        card.classList.add('state-editor-card', 'cursor-pointer');
                        card.draggable = false;
                        card.classList.toggle('is-selected', selectedAvailable.has(normalized));
                        card.classList.toggle('border-cyan-300/70', selectedAvailable.has(normalized));
                        card.classList.toggle('bg-cyan-400/10', selectedAvailable.has(normalized));
                        card.addEventListener('click', () => {
                            if (selectedAvailable.has(normalized)) {
                                selectedAvailable.delete(normalized);
                            } else {
                                selectedAvailable.add(normalized);
                            }
                            this._renderStateEditor();
                        });
                        card.addEventListener('dblclick', () => {
                            draftFrames.push(normalized);
                            selectedAvailable.delete(normalized);
                            this._renderStateEditor();
                            this._refreshPreview();
                        });
                        availableRoot.appendChild(card);
                    });
                }
            }

            const assignedRoot = this.el.stateEditorAssignedList;
            if (assignedRoot) {
                assignedRoot.innerHTML = '';
                if (!draftFrames.length) {
                    const empty = document.createElement('div');
                    empty.className = 'state-editor-empty flex min-h-[160px] items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 text-center text-sm text-slate-500';
                    empty.textContent = 'Aucune frame dans cet état. Clique une animation à gauche puis ajoute-la.';
                    assignedRoot.appendChild(empty);
                } else {
                    draftFrames.forEach((frameName, frameIndex) => {
                        const item = document.createElement('div');
                        item.className = 'state-editor-assigned-item grid grid-cols-[48px_72px_minmax(0,1fr)_auto] items-center gap-3 rounded-[22px] border border-white/10 bg-slate-950/55 p-3 transition hover:border-white/20 hover:bg-slate-900/80';
                        item.classList.toggle('is-selected', selectedAssigned.has(frameIndex));
                        item.classList.toggle('border-cyan-300/70', selectedAssigned.has(frameIndex));
                        item.classList.toggle('bg-cyan-400/10', selectedAssigned.has(frameIndex));
                        item.addEventListener('click', () => {
                            if (selectedAssigned.has(frameIndex)) {
                                selectedAssigned.delete(frameIndex);
                            } else {
                                selectedAssigned.add(frameIndex);
                            }
                            this._renderStateEditor();
                        });

                        const idx = document.createElement('div');
                        idx.className = 'state-editor-index flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-pixel text-[10px] uppercase tracking-[0.16em] text-slate-200';
                        idx.textContent = `${frameIndex + 1}`;

                        const img = document.createElement('img');
                        img.className = 'state-editor-assigned-thumb h-[72px] w-[72px] rounded-2xl bg-black/30 object-contain [image-rendering:pixelated]';
                        img.alt = frameName;
                        this._setImageWithFallback(img, frameName);

                        const meta = document.createElement('div');
                        meta.className = 'state-editor-assigned-meta min-w-0';
                        const name = document.createElement('div');
                        name.className = 'state-editor-assigned-name truncate text-sm font-semibold text-white';
                        name.textContent = frameName;
                        const hint = document.createElement('div');
                        hint.className = 'state-editor-assigned-hint mt-2 text-xs text-slate-500';
                        hint.textContent = 'Clique pour sélectionner, ↑↓ pour réordonner.';
                        meta.appendChild(name);
                        meta.appendChild(hint);

                        const actions = document.createElement('div');
                        actions.className = 'state-editor-assigned-actions flex flex-wrap items-center justify-end gap-2';

                        const previewBtn = document.createElement('button');
                        previewBtn.type = 'button';
                        previewBtn.className = 'state-editor-mini-btn rounded-2xl border border-white/10 bg-white/5 px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.16em] text-slate-100 transition hover:border-white/20 hover:bg-white/10';
                        previewBtn.textContent = 'Voir';
                        previewBtn.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            if (this.el.previewStateSelect) this.el.previewStateSelect.value = stateName;
                            await this._refreshPreview({ frameIndex });
                        });

                        const upBtn = document.createElement('button');
                        upBtn.type = 'button';
                        upBtn.className = 'state-editor-mini-btn rounded-2xl border border-white/10 bg-white/5 px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.16em] text-slate-100 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35';
                        upBtn.textContent = '↑';
                        upBtn.disabled = frameIndex === 0;
                        upBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this._moveStateEditorFrame(frameIndex, frameIndex - 1);
                        });

                        const downBtn = document.createElement('button');
                        downBtn.type = 'button';
                        downBtn.className = 'state-editor-mini-btn rounded-2xl border border-white/10 bg-white/5 px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.16em] text-slate-100 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35';
                        downBtn.textContent = '↓';
                        downBtn.disabled = frameIndex === draftFrames.length - 1;
                        downBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this._moveStateEditorFrame(frameIndex, frameIndex + 1);
                        });

                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'state-editor-mini-btn rounded-2xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.16em] text-rose-100 transition hover:border-rose-300/60 hover:bg-rose-400/15';
                        removeBtn.textContent = '✕';
                        removeBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            draftFrames.splice(frameIndex, 1);
                            this.stateEditor.selectedAssigned = new Set();
                            this._renderStateEditor();
                            this._refreshPreview();
                        });

                        actions.appendChild(previewBtn);
                        actions.appendChild(upBtn);
                        actions.appendChild(downBtn);
                        actions.appendChild(removeBtn);

                        item.appendChild(idx);
                        item.appendChild(img);
                        item.appendChild(meta);
                        item.appendChild(actions);
                        assignedRoot.appendChild(item);
                    });
                }
            }
        }

        _addStateEditorSelectedFrames() {
            if (!this.stateEditor) return;
            const frames = Array.from(this.stateEditor.selectedAvailable);
            if (!frames.length) {
                this._setStatus('Sélectionne au moins une animation dans la modale.', 'error');
                return;
            }
            frames.forEach((frame) => {
                const normalized = this._normalizeFrameName(frame);
                if (normalized) this.stateEditor.draftFrames.push(normalized);
            });
            this.stateEditor.selectedAvailable.clear();
            this._renderStateEditor();
            this._refreshPreview();
        }

        _removeSelectedStateEditorFrames() {
            if (!this.stateEditor) return;
            const selectedIndexes = Array.from(this.stateEditor.selectedAssigned).sort((a, b) => b - a);
            if (!selectedIndexes.length) {
                this._setStatus('Sélectionne une ou plusieurs frames dans la colonne de droite.', 'error');
                return;
            }
            selectedIndexes.forEach((index) => {
                if (index >= 0 && index < this.stateEditor.draftFrames.length) {
                    this.stateEditor.draftFrames.splice(index, 1);
                }
            });
            this.stateEditor.selectedAssigned.clear();
            this._renderStateEditor();
            this._refreshPreview();
        }

        _clearStateEditorFrames() {
            if (!this.stateEditor) return;
            this.stateEditor.draftFrames = [];
            this.stateEditor.selectedAssigned.clear();
            this._renderStateEditor();
            this._refreshPreview();
        }

        _moveStateEditorFrame(fromIndex, toIndex) {
            if (!this.stateEditor) return;
            const draft = this.stateEditor.draftFrames;
            if (fromIndex < 0 || fromIndex >= draft.length) return;
            const nextIndex = Math.max(0, Math.min(draft.length - 1, toIndex));
            if (fromIndex === nextIndex) return;
            const [frame] = draft.splice(fromIndex, 1);
            draft.splice(nextIndex, 0, frame);
            this.stateEditor.selectedAssigned = new Set([nextIndex]);
            this._renderStateEditor();
            this._refreshPreview({ frameIndex: nextIndex });
        }

        async _applyStateEditorChanges() {
            if (!this.stateEditor || !this.store) return;
            const { stateName, draftFrames } = this.stateEditor;
            this.store.stateMap[stateName] = draftFrames.map((frame) => this._normalizeFrameName(frame)).filter(Boolean);
            if (this.el.previewStateSelect) this.el.previewStateSelect.value = stateName;
            if (this.el.projectileStateSelect) this.el.projectileStateSelect.value = stateName;
            this._closeStateEditor();
            this._renderBoard();
            this._renderSourceGrid();
            await this._refreshPreview();
            this.saveToGame();
            this._setStatus(`État mis à jour: ${stateName}`, 'ok');
        }

        _extractFrameToken(frameName) {
            const base = this._normalizeFrameName(frameName).split('/').pop().toLowerCase();
            const noExt = base.replace(/\.png$/i, '');
            const parts = noExt.split('__');
            return parts[parts.length - 1] || noExt;
        }

        _getProfileFrameScope(profileId) {
            const id = String(profileId || '').toLowerCase();
            if (!id) return null;

            if (id === 'naruto_kid') {
                return (token) => /^(narutostd|narutojmp\d*|narutoatk\d+|narutorenden\d+|narutorasengan\d*|narutoappear\d*|narutoblood|naruto_fall\d+|naruto_run_\d+|naruto_damage_\d+|transformation_?\d+)$/.test(token);
            }
            if (id === 'naruto_kid_kyuubi') {
                return (token) => /^(kyubistd|kyubiwlk\d*|kyubiatk\d*|kyubirasengan\d*|kyuubi_run_\d+|kyuubi_jump_\d+|kyuubi_damage_\d+|narutoappear\d*|transformation_?\d+)$/.test(token);
            }
            if (id === 'naruto_shippuden') {
                return (token) => /^(naruto\d+|narutoappear\d*|transformation_?\d+)$/.test(token);
            }
            if (id === 'naruto_shippuden_kyuubi') {
                return (token) => /^(\d+|narutoappear\d*|transformation_?\d+)$/.test(token);
            }
            if (id === 'sasuke') {
                return (token) => !token.includes('cs2');
            }
            if (id === 'sasuke_cs2') {
                return (token) => /cs2/.test(token)
                    || /^sasuke_(apear|appear)\d+$/.test(token)
                    || /^sasuke_transform\d*$/.test(token)
                    || /^sasuke_chidori\d+$/.test(token);
            }

            return null;
        }

        _getProfileScopeLabel(profileId) {
            const id = String(profileId || '').toLowerCase();
            const labels = {
                naruto_kid: 'Naruto Kid (normal)',
                naruto_kid_kyuubi: 'Naruto Kid (Kyuubi)',
                naruto_shippuden: 'Naruto Shippuden (normal)',
                naruto_shippuden_kyuubi: 'Naruto Shippuden (Kyuubi)',
                sasuke: 'Sasuke (base)',
                sasuke_cs2: 'Sasuke (CS2)',
            };
            return labels[id] || '';
        }

        _getProfileScopeGuide(profileId) {
            const id = String(profileId || '').toLowerCase();
            const guides = {
                naruto_kid: 'IDLE/WALK/JUMP = naruto* | SPECIAL = narutorasengan* | TRANSFORM = narutoappear* + transformation_*',
                naruto_kid_kyuubi: 'IDLE/WALK/JUMP = kyubi* | SPECIAL = kyubirasengan* | TRANSFORM = narutoappear* + transformation_*',
                naruto_shippuden: 'IDLE/WALK/JUMP = naruto1..naruto31 | SPECIAL = naruto* numeriques | TRANSFORM = narutoappear* + transformation_*',
                naruto_shippuden_kyuubi: 'IDLE/WALK/JUMP/SPECIAL = numeriques (31,32,...) | TRANSFORM = narutoappear* + transformation_*',
                sasuke: 'Base sans cs2 | SPECIAL = sasuke_chidori* | TRANSFORM = sasuke_appear/apear* + sasuke_transform*',
                sasuke_cs2: 'Frames cs2 + chidori/transform | WALK/JUMP preferez sasuke_cs2_run* / sasuke_cs2_jump*',
            };
            return guides[id] || '';
        }

        _filterFramesForProfile(profileId, frames) {
            const scope = this._getProfileFrameScope(profileId);
            const list = Array.isArray(frames) ? frames : [];
            if (!scope) return list.slice();
            return list.filter((frame) => scope(this._extractFrameToken(frame), frame));
        }

        _scopeMappingForProfile(profileId, mappingJson) {
            if (!mappingJson || typeof mappingJson !== 'object') return mappingJson;
            const scope = this._getProfileFrameScope(profileId);
            if (!scope) return mappingJson;

            const scoped = JSON.parse(JSON.stringify(mappingJson));
            const filterArray = (arr) => (Array.isArray(arr)
                ? arr.filter((frame) => scope(this._extractFrameToken(frame), frame))
                : arr);

            if (scoped.stateMap && typeof scoped.stateMap === 'object') {
                Object.keys(scoped.stateMap).forEach((key) => {
                    scoped.stateMap[key] = filterArray(scoped.stateMap[key]);
                });
            }
            if (scoped.categories && typeof scoped.categories === 'object') {
                Object.keys(scoped.categories).forEach((key) => {
                    scoped.categories[key] = filterArray(scoped.categories[key]);
                });
            }

            return scoped;
        }

        _getTargetFramesForProfile(profile, mappingJson = null) {
            const targetName = profile?.targetName;
            const targets = Array.isArray(this.project?.targets) ? this.project.targets : [];
            const target = targets.find((t) => (t.name || '').trim() === targetName);
            if (!target || !Array.isArray(target.costumes)) return [];

            const list = target.costumes
                .map((costume) => {
                    if (typeof costume?.md5ext === 'string' && costume.md5ext.trim()) return costume.md5ext.trim();
                    if (costume?.assetId && costume?.dataFormat) return `${costume.assetId}.${costume.dataFormat}`;
                    return '';
                })
                .filter((file) => file.toLowerCase().endsWith('.png'));

            const profileId = (profile?.id || '').toLowerCase();
            const filteredTargetFrames = this._filterFramesForProfile(profileId, list);
            const uniqueTargetFrames = Array.from(new Set(
                filteredTargetFrames.length ? filteredTargetFrames : list
            ));
            const strictMappedOnly = !!this.el?.strictMappedOnly?.checked;

            const mappedFramesRaw = [];
            const mappedStateMap = mappingJson?.stateMap && typeof mappingJson.stateMap === 'object'
                ? mappingJson.stateMap
                : {};
            const mappedCategories = mappingJson?.categories && typeof mappingJson.categories === 'object'
                ? mappingJson.categories
                : {};
            Object.values(mappedStateMap).forEach((arr) => {
                if (Array.isArray(arr)) mappedFramesRaw.push(...arr);
            });
            Object.values(mappedCategories).forEach((arr) => {
                if (Array.isArray(arr)) mappedFramesRaw.push(...arr);
            });

            const targetSet = new Set(uniqueTargetFrames);
            const seenMapped = new Set();
            const mappedFrames = [];
            mappedFramesRaw.forEach((frame) => {
                if (typeof frame !== 'string') return;
                const normalized = this._normalizeFrameName(frame);
                if (!normalized.toLowerCase().endsWith('.png')) return;
                if (seenMapped.has(normalized)) return;
                seenMapped.add(normalized);
                if (targetSet.has(normalized)) mappedFrames.push(normalized);
            });

            const mappedScopedFrames = this._filterFramesForProfile(profileId, mappedFrames);
            if (strictMappedOnly && mappedScopedFrames.length) {
                return mappedScopedFrames;
            }

            const useVariantScopedFrames = /^(naruto_|sasuke(?:_|$))/.test(profileId);
            if (!useVariantScopedFrames || !mappingJson || typeof mappingJson !== 'object') {
                return uniqueTargetFrames;
            }

            if (!mappedScopedFrames.length) return uniqueTargetFrames;

            // For variants (Naruto/Sasuke forms), keep source panel focused on frames
            // actually referenced by this mapping to make form editing clearer.
            const inTarget = mappedScopedFrames.filter((frame) => targetSet.has(frame));
            const extra = mappedScopedFrames.filter((frame) => !targetSet.has(frame));
            const scoped = [...inTarget, ...extra];
            return scoped.length ? scoped : uniqueTargetFrames;
        }

        _renderSourceGrid() {
            if (!this.store) return;
            const search = this.el.searchInput.value;
            const unassignedOnly = this.el.unassignedOnly.checked;
            const frames = this.store.getFilteredSourceFrames(search, unassignedOnly);
            const assignedCount = this.store.getAssignedCountByFrame();

            const root = this.el.sourceGrid;
            root.innerHTML = '';

            frames.forEach((frameName) => {
                const card = this._createFrameCard(frameName, assignedCount.get(frameName) || 0);
                root.appendChild(card);
            });

            this.el.sourceStats.textContent = `${frames.length} / ${this.store.sourceFrames.length} frame`;
        }

        _createFrameCard(frameName, assignedCount) {
            const card = document.createElement('div');
            card.className = 'frame-card flex flex-col gap-2 rounded-[22px] border border-white/10 bg-slate-950/55 p-3 transition hover:border-white/20 hover:bg-slate-900/80';
            if (assignedCount > 0) {
                card.classList.add('frame-assigned', 'border-amber-300/30', 'bg-amber-300/5');
            }
            if (this.currentProfile?.isUnknownProfile && this.selectedSourceFrames.has(frameName)) {
                card.classList.add('frame-selected', 'border-cyan-300/70', 'bg-cyan-400/10');
            }
            card.draggable = false;
            if (this.currentProfile?.isUnknownProfile) {
                card.addEventListener('click', () => {
                    if (this.selectedSourceFrames.has(frameName)) {
                        this.selectedSourceFrames.delete(frameName);
                    } else {
                        this.selectedSourceFrames.add(frameName);
                    }
                    this._updateUnknownSelectionCount();
                    this._renderSourceGrid();
                });
            }

            const img = document.createElement('img');
            img.className = 'h-20 w-full rounded-2xl bg-black/30 object-contain [image-rendering:pixelated]';
            img.alt = frameName;
            img.loading = 'lazy';
            this._setImageWithFallback(img, frameName);
            card.appendChild(img);

            const name = document.createElement('div');
            name.className = 'frame-name truncate text-xs font-medium text-slate-100';
            name.textContent = assignedCount > 0 ? `${frameName} (${assignedCount})` : frameName;
            card.appendChild(name);

            const meta = this.assetMetaByFile.get(frameName);
            if (meta) {
                const hint = document.createElement('div');
                hint.className = 'frame-meta text-[11px] leading-5 text-slate-500';
                hint.textContent = `${meta.targetName || 'Unknown'} / ${meta.costumeName || 'costume'}`;
                card.appendChild(hint);
            }
            return card;
        }

        _renderBoard() {
            if (!this.store) return;
            const board = this.el.stateBoard;
            board.innerHTML = '';
            const activePreviewState = this.el.previewStateSelect?.value || '';

            const states = this._getVisibleStates();
            states.forEach((stateName) => {
                const column = document.createElement('div');
                column.className = 'state-column flex flex-col rounded-[24px] border border-white/10 bg-slate-950/45';
                if (stateName === activePreviewState) {
                    column.classList.add('state-preview-active', 'border-cyan-300/50', 'shadow-[0_24px_50px_rgba(34,211,238,0.08)]');
                }

                const head = document.createElement('div');
                head.className = 'state-head flex items-center gap-3 border-b border-white/10 px-4 py-4';
                const stateLabel = document.createElement('div');
                stateLabel.className = 'state-name min-w-0 flex-1 truncate font-pixel text-[10px] uppercase tracking-[0.16em] text-white';
                stateLabel.textContent = stateName;
                const hasProjectile = !!this.stateProjectileMap?.[stateName];
                const projBtn = document.createElement('button');
                projBtn.type = 'button';
                projBtn.innerHTML = hasProjectile ? '🎯' : '⊕';
                projBtn.title = hasProjectile ? 'Projectile assigné (cliquer pour changer/voir)' : 'Assigner le projectile sélectionné';
                projBtn.className = `flex h-7 w-7 items-center justify-center rounded-xl border transition-all duration-200 ${hasProjectile
                    ? 'border-cyan-400/50 bg-cyan-400/20 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-200'
                    }`;

                projBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const currentProj = this._readProjectileConfig();
                    if (!currentProj) {
                        this._setStatus('Sélectionne d\'abord un projectile dans le pool (en bas).', 'error');
                        if (this.el.projectilePoolGrid) {
                            this.el.projectilePoolGrid.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-900');
                            setTimeout(() => this.el.projectilePoolGrid.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-900'), 1500);
                        }
                        return;
                    }

                    this.stateProjectileMap[stateName] = this._normalizeProjectileConfig(currentProj);
                    this._renderBoard();
                    this._renderStateProjectileAssignments();
                    this._setStatus(`Projectile assigné à ${stateName}`, 'ok');
                });
                const count = document.createElement('div');
                count.className = 'state-count inline-flex min-w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200';
                const frames = this.store.getStateFrames(stateName);
                count.textContent = `${frames.length}`;
                if ((window.MAPPER_REQUIRED_STATES || []).includes(stateName) && frames.length === 0) {
                    column.classList.add('state-required-empty', 'border-rose-300/35');
                }

                // Clear All button
                const clearBtn = document.createElement('button');
                clearBtn.textContent = '🗑';
                clearBtn.title = 'Vider cet état';
                clearBtn.className = 'inline-flex h-7 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-400/5 px-2 text-xs text-rose-300/70 transition hover:border-rose-300/50 hover:bg-rose-400/10 hover:text-rose-200';
                clearBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log(`[DEBUG] Clearing state: ${stateName}`);
                    if (confirm(`Action irréversible : vider l'état ${stateName} ?`)) {
                        const currentFrames = this.store.getStateFrames(stateName);
                        for (let i = currentFrames.length - 1; i >= 0; i--) {
                            this.store.removeFrameFromState(stateName, i);
                        }
                        this._renderBoard();
                        this._renderSourceGrid();
                        this._refreshPreview();
                    }
                });

                head.appendChild(stateLabel);
                head.appendChild(projBtn);
                head.appendChild(count);
                head.appendChild(clearBtn);
                head.title = 'Cliquer pour éditer cet état';
                head.addEventListener('click', async (e) => {
                    // Don't trigger preview change when clicking clear button
                    if (e.target === clearBtn) return;
                    this._openStateEditor(stateName);
                });

                const dropZone = document.createElement('div');
                dropZone.className = 'state-drop flex min-h-[96px] flex-col gap-2 p-3';
                dropZone.dataset.state = stateName;
                dropZone.addEventListener('click', (e) => {
                    if (e.target === dropZone) this._openStateEditor(stateName);
                });
                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropZone.classList.add('drag-over', 'ring-2', 'ring-cyan-300/40');

                    // Visual indicator for reorder position
                    const items = Array.from(dropZone.querySelectorAll('.state-item'));
                    items.forEach(el => el.classList.remove('drag-insert-above', 'drag-insert-below'));
                    const target = e.target.closest('.state-item');
                    if (target) {
                        const rect = target.getBoundingClientRect();
                        const midY = rect.top + rect.height / 2;
                        if (e.clientY < midY) {
                            target.classList.add('drag-insert-above');
                        } else {
                            target.classList.add('drag-insert-below');
                        }
                    }
                });
                dropZone.addEventListener('dragleave', (e) => {
                    // Only remove if leaving the drop zone entirely
                    if (!dropZone.contains(e.relatedTarget)) {
                        dropZone.classList.remove('drag-over', 'ring-2', 'ring-cyan-300/40');
                        const items = Array.from(dropZone.querySelectorAll('.state-item'));
                        items.forEach(el => el.classList.remove('drag-insert-above', 'drag-insert-below'));
                    }
                });
                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropZone.classList.remove('drag-over', 'ring-2', 'ring-cyan-300/40');
                    const items = Array.from(dropZone.querySelectorAll('.state-item'));
                    items.forEach(el => el.classList.remove('drag-insert-above', 'drag-insert-below'));

                    const payload = e.dataTransfer.getData('text/plain');

                    // Determine drop target index for reordering
                    const targetItem = e.target.closest('.state-item');
                    let targetIndex = -1;
                    if (targetItem) {
                        targetIndex = Number(targetItem.dataset.frameIndex);
                        const rect = targetItem.getBoundingClientRect();
                        const midY = rect.top + rect.height / 2;
                        if (e.clientY > midY) targetIndex++;
                    }

                    if (payload.startsWith('state:')) {
                        const parts = payload.split(':');
                        if (parts.length >= 3) {
                            const fromState = parts[1];
                            const fromIndex = Number(parts[2]);

                            if (fromState === stateName && targetIndex >= 0) {
                                // Reorder within the same state via drag
                                let adjustedTarget = targetIndex;
                                if (fromIndex < adjustedTarget) adjustedTarget--;
                                this.store.moveFrameWithinState(stateName, fromIndex, adjustedTarget);
                            } else if (fromState === stateName) {
                                // Dropped on empty area of same state, do nothing
                            } else {
                                this.store.moveFrameAcrossStates(fromState, fromIndex, stateName);
                            }
                        }
                    } else {
                        // Dropped from source grid – strip the 'source:' prefix
                        const frameName = payload.startsWith('source:') ? payload.slice('source:'.length) : payload;
                        this.store.addFrameToState(stateName, frameName);
                    }

                    if (this.el.previewStateSelect) this.el.previewStateSelect.value = stateName;
                    if (this.el.projectileStateSelect) this.el.projectileStateSelect.value = stateName;
                    this._renderBoard();
                    this._renderSourceGrid();
                    this._refreshPreview();
                });

                if (!frames.length) {
                    const empty = document.createElement('div');
                    empty.className = 'empty-drop flex min-h-[96px] items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-black/20 px-4 text-center text-sm text-slate-500';
                    empty.textContent = 'Clique sur l’état pour éditer';
                    empty.addEventListener('click', () => this._openStateEditor(stateName));
                    dropZone.appendChild(empty);
                } else {
                    frames.forEach((frameName, frameIndex) => {
                        const item = document.createElement('div');
                        item.className = 'state-item flex items-center gap-3 rounded-[20px] border border-white/10 bg-slate-950/55 p-3 transition hover:border-white/20 hover:bg-slate-900/80';
                        item.draggable = false;
                        item.dataset.frameIndex = frameIndex;

                        const img = document.createElement('img');
                        img.className = 'h-14 w-14 rounded-2xl bg-black/30 object-contain [image-rendering:pixelated]';
                        img.alt = frameName;
                        img.loading = 'lazy';
                        this._setImageWithFallback(img, frameName);
                        img.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            if (this.el.previewStateSelect) this.el.previewStateSelect.value = stateName;
                            if (this.el.projectileStateSelect) this.el.projectileStateSelect.value = stateName;
                            await this._refreshPreview({ frameIndex });
                        });

                        const text = document.createElement('div');
                        text.className = 'frame-name min-w-0 flex-1 truncate text-sm text-slate-200';
                        text.textContent = frameName;
                        text.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            if (this.el.previewStateSelect) this.el.previewStateSelect.value = stateName;
                            if (this.el.projectileStateSelect) this.el.projectileStateSelect.value = stateName;
                            await this._refreshPreview({ frameIndex });
                        });

                        const actions = document.createElement('div');
                        actions.className = 'state-item-actions flex items-center gap-2';

                        const delBtn = document.createElement('button');
                        delBtn.textContent = '✕';
                        delBtn.title = 'Retirer';
                        delBtn.className = 'rounded-xl border border-rose-300/30 bg-rose-400/10 px-2 py-1 text-xs text-rose-100 transition hover:border-rose-300/60 hover:bg-rose-400/15';
                        delBtn.addEventListener('click', () => {
                            this.store.removeFrameFromState(stateName, frameIndex);
                            this._renderBoard();
                            this._renderSourceGrid();
                            this._refreshPreview();
                        });

                        actions.appendChild(delBtn);

                        item.appendChild(img);
                        item.appendChild(text);
                        item.appendChild(actions);
                        dropZone.appendChild(item);
                    });
                }

                column.appendChild(head);
                column.appendChild(dropZone);
                board.appendChild(column);
            });

            this.el.boardStats.textContent = `${states.length} etats`;
        }

        _getVisibleStates() {
            const all = window.MAPPER_STATES || [];
            if (this.stateFilter === 'all') return all;
            const groups = {
                movement: new Set(['IDLE', 'WALK', 'RUN', 'JUMP', 'CROUCH', 'CROUCH_WALK', 'DASH']),
                combat: new Set(['ATTACK_LIGHT_1', 'ATTACK_LIGHT_2', 'ATTACK_LIGHT_3', 'ATTACK_HEAVY_1', 'ATTACK_HEAVY_2', 'ATTACK_LIGHT', 'ATTACK_HEAVY', 'RUN_ATTACK', 'THROW', 'CROUCH_ATTACK', 'CROUCH_THROW']),
                special: new Set(['SPECIAL_TRANSFORM', 'SPECIAL', 'TELEPORT', 'KOMA_SUPPORT', 'CHARGE']),
                defense: new Set(['BLOCK', 'HIT', 'KO']),
            };
            const wanted = groups[this.stateFilter] || null;
            if (!wanted) return all;
            return all.filter((s) => wanted.has(s));
        }

        async _jumpToNextEmptyState() {
            if (!this.store) return;
            const states = window.MAPPER_STATES || [];
            const current = this.el.previewStateSelect.value;
            const startIdx = Math.max(0, states.indexOf(current));
            for (let i = 1; i <= states.length; i++) {
                const idx = (startIdx + i) % states.length;
                const state = states[idx];
                const frames = this.store.getStateFrames(state);
                if (!frames || !frames.length) {
                    this.el.previewStateSelect.value = state;
                    await this._refreshPreview();
                    this._setStatus(`Etat vide trouve: ${state}`, 'normal');
                    return;
                }
            }
            this._setStatus('Aucun etat vide dans ce profil.', 'ok');
        }

        _handleDropOnState(targetState, payload) {
            if (!this.store || !payload) return;

            if (payload.startsWith('source:')) {
                const frameName = payload.slice('source:'.length);
                this.store.addFrameToState(targetState, frameName);
            } else if (payload.startsWith('state:')) {
                const parts = payload.split(':');
                if (parts.length >= 3) {
                    const fromState = parts[1];
                    const fromIndex = Number(parts[2]);
                    if (fromState === targetState) {
                        const currentLen = this.store.getStateFrames(targetState).length;
                        this.store.moveFrameWithinState(targetState, fromIndex, currentLen - 1);
                    } else {
                        this.store.moveFrameAcrossStates(fromState, fromIndex, targetState);
                    }
                }
            }

            if (this.el.previewStateSelect) this.el.previewStateSelect.value = targetState;
            if (this.el.projectileStateSelect) this.el.projectileStateSelect.value = targetState;
            this._renderBoard();
            this._renderSourceGrid();
            this._refreshPreview();
        }

        _renderComboEditor() {
            if (!this.store) return;
            const combo = this.store.getCombo();

            this.el.comboCancelRatio.value = combo.settings.comboCancelRatio;
            this.el.comboHitReset.value = combo.settings.comboHitResetFrames;
            this.el.attackDurationScale.value = combo.settings.attackDurationScale;
            this.el.specialDurationScale.value = combo.settings.specialTransformDurationScale;
            this.el.requireHitRoutes.checked = !!combo.settings.requireHitForComboRoutes;

            if (this.el.chainLight) this.el.chainLight.value = JSON.stringify(combo.chains?.light || [], null, 2);
            if (this.el.chainHeavy) this.el.chainHeavy.value = JSON.stringify(combo.chains?.heavy || [], null, 2);
            if (this.el.chainSpecial) this.el.chainSpecial.value = JSON.stringify(combo.chains?.special || [], null, 2);
            if (this.el.rootRoutesLight) this.el.rootRoutesLight.value = JSON.stringify(combo.rootRoutes?.light || {}, null, 2);
            if (this.el.rootRoutesHeavy) this.el.rootRoutesHeavy.value = JSON.stringify(combo.rootRoutes?.heavy || {}, null, 2);
            if (this.el.rootRoutesSpecial) this.el.rootRoutesSpecial.value = JSON.stringify(combo.rootRoutes?.special || {}, null, 2);
            if (this.el.nodePatches) this.el.nodePatches.value = JSON.stringify(combo.nodePatches || {}, null, 2);
            this._renderCommandBindingEditor(combo);
            this._renderCommandDerivedGrid(this._getCommandPreviewCombo());
            this._renderPreviewStateCommands(this._getCommandPreviewCombo());
        }

        _readComboEditor() {
            const existingCombo = this.store ? this.store.getCombo() : { rootRoutes: {} };
            const combo = {
                settings: {
                    comboCancelRatio: Number(this.el.comboCancelRatio.value),
                    comboHitResetFrames: Number(this.el.comboHitReset.value),
                    requireHitForComboRoutes: !!this.el.requireHitRoutes.checked,
                    attackDurationScale: Number(this.el.attackDurationScale.value),
                    specialTransformDurationScale: Number(this.el.specialDurationScale.value),
                },
                chains: {
                    light: JSON.parse(this.el.chainLight ? (this.el.chainLight.value || '[]') : '[]'),
                    heavy: JSON.parse(this.el.chainHeavy ? (this.el.chainHeavy.value || '[]') : '[]'),
                    special: JSON.parse(this.el.chainSpecial ? (this.el.chainSpecial.value || '[]') : '[]'),
                },
                rootRoutes: {
                    ...(existingCombo.rootRoutes || {}),
                    light: JSON.parse(this.el.rootRoutesLight ? (this.el.rootRoutesLight.value || '{}') : '{}'),
                    heavy: JSON.parse(this.el.rootRoutesHeavy ? (this.el.rootRoutesHeavy.value || '{}') : '{}'),
                    special: JSON.parse(this.el.rootRoutesSpecial ? (this.el.rootRoutesSpecial.value || '{}') : '{}'),
                },
                actionMap: this._readActionMapEditor(),
                nodePatches: JSON.parse(this.el.nodePatches ? (this.el.nodePatches.value || '{}') : '{}'),
            };

            ['light', 'heavy', 'special'].forEach((type) => {
                if (!Array.isArray(combo.chains[type])) {
                    throw new Error(`chains.${type} doit etre un tableau JSON.`);
                }
                if (combo.rootRoutes[type] === null || typeof combo.rootRoutes[type] !== 'object' || Array.isArray(combo.rootRoutes[type])) {
                    throw new Error(`rootRoutes.${type} doit etre un objet JSON.`);
                }
            });
            if (combo.nodePatches === null || typeof combo.nodePatches !== 'object' || Array.isArray(combo.nodePatches)) {
                throw new Error('nodePatches doit etre un objet JSON.');
            }
            return combo;
        }

        applyComboEditorChanges() {
            if (!this.store) return;
            try {
                const combo = this._readComboEditor();
                this.store.setCombo(combo);
                this._renderCommandBindingEditor(this.store.getCombo());
                this._renderCommandDerivedGrid(this.store.getCombo());
                this._renderPreviewStateCommands(this.store.getCombo());
                this._setStatus('Edition combo appliquee.', 'ok');
                this.saveToGame();
                this.resolveRouteTest();
            } catch (err) {
                this._setStatus(`Erreur combo: ${err.message}`, 'error');
            }
        }

        async _refreshPreview(options = {}) {
            if (!this.store) return;
            const state = this.el.previewStateSelect.value;
            const frames = (this.stateEditor && this.stateEditor.stateName === state)
                ? this.stateEditor.draftFrames
                : this.store.getStateFrames(state);
            this._renderBoard();
            try {
                await this.preview.setFrames(frames, this._getPreviewBasePaths());
                if (Number.isInteger(options.frameIndex)) {
                    this.preview.setFrameIndex(options.frameIndex);
                }
                this._renderPreviewTimeline();
                this._renderPreviewStateCommands(this._getCommandPreviewCombo());
            } catch (err) {
                this._renderPreviewTimeline();
                this._renderPreviewStateCommands(this._getCommandPreviewCombo());
                this._setStatus(`Preview image error: ${err.message}`, 'error');
            }
        }

        resolveRouteTest() {
            if (!this.store) return;

            const combo = this.store.getCombo();
            const type = this.el.routeAttackType.value;
            const direction = this.el.routeDirection.value;

            const routeMap = combo.rootRoutes?.[type] || {};
            const nodeId = routeMap[direction] || routeMap.any || routeMap.neutral || '';
            const patch = combo.nodePatches?.[nodeId] || {};
            const chain = combo.chains?.[type] || [];
            const stepMatch = typeof nodeId === 'string' ? nodeId.match(/_(\d+)$/) : null;
            const step = stepMatch ? Math.max(1, Number(stepMatch[1])) : 1;
            const chainState = chain[Math.min(chain.length - 1, step - 1)]?.state || '';
            const patchedState = patch?.profileOverrides?.state || '';
            const resolvedState = patchedState || chainState || '(none)';

            this.el.routeResult.textContent = `root=${nodeId || '(none)'} | step=${step} | state=${resolvedState}`;
        }

        validateCurrentProfile() {
            if (!this.store) return;
            try {
                const combo = this._readComboEditor();
                this.store.setCombo(combo);
            } catch (err) {
                this._setStatus(`Erreur combo: ${err.message}`, 'error');
                return;
            }

            const payload = this.store.buildExportPayload();
            const projConfig = this._normalizeProjectileConfig(this._readProjectileConfig());
            if (projConfig) payload.projectile = projConfig;
            const projectileByState = this._getSanitizedStateProjectileMap();
            if (Object.keys(projectileByState).length) payload.projectileByState = projectileByState;
            const errors = this.store.validateExport(payload);
            const warnings = Array.isArray(payload.__validationWarnings) ? payload.__validationWarnings : [];
            if (errors.length) {
                this._setStatus(`Validation KO: ${errors.join(' | ')}`, 'error');
                return;
            }
            if (warnings.length) {
                this._setStatus(`Validation OK (warnings): ${warnings.join(' | ')}`, 'normal');
                return;
            }
            this._setStatus('Validation OK: mapping exportable.', 'ok');
        }

        exportCurrentProfile() {
            if (!this.store) return;
            try {
                const combo = this._readComboEditor();
                this.store.setCombo(combo);
            } catch (err) {
                this._setStatus(`Erreur combo: ${err.message}`, 'error');
                return;
            }

            const payload = this.store.buildExportPayload();
            const projConfig = this._normalizeProjectileConfig(this._readProjectileConfig());
            if (projConfig) payload.projectile = projConfig;
            const projectileByState = this._getSanitizedStateProjectileMap();
            if (Object.keys(projectileByState).length) payload.projectileByState = projectileByState;
            const errors = this.store.validateExport(payload);
            const warnings = Array.isArray(payload.__validationWarnings) ? payload.__validationWarnings : [];
            if (errors.length) {
                this._setStatus(`Export bloque: ${errors.join(' | ')}`, 'error');
                return;
            }

            const fileName = this.store.getDefaultDownloadName();
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            if (warnings.length) {
                this._setStatus(`Export OK (warnings): ${warnings.join(' | ')}`, 'normal');
                return;
            }
            this._setStatus(`Export OK: ${fileName}`, 'ok');
        }

        async saveToGame() {
            if (!this.store || !this.currentProfile) {
                this._setStatus('Aucun profil à sauvegarder.', 'error');
                return;
            }
            if (!this.canPersistToGame) {
                this._setStatus('Mode public: sauvegarde directe indisponible. Utilise Exporter JSON.', 'error');
                return;
            }
            try {
                const combo = this._readComboEditor();
                this.store.setCombo(combo);
            } catch (err) {
                this._setStatus(`Erreur combo: ${err.message}`, 'error');
                return;
            }

            const payload = this.store.buildExportPayload();
            const projConfig = this._normalizeProjectileConfig(this._readProjectileConfig());
            if (projConfig) payload.projectile = projConfig;
            const projectileByState = this._getSanitizedStateProjectileMap();
            if (Object.keys(projectileByState).length) payload.projectileByState = projectileByState;
            const errors = this.store.validateExport(payload);

            if (errors.length) {
                this._setStatus(`Sauvegarde bloquée: ${errors.join(' | ')}`, 'error');
                return;
            }

            const mappingPath = this.currentProfile.mappingPath;
            if (!mappingPath) {
                this._setStatus('Chemin du fichier mapping inconnu.', 'error');
                return;
            }

            this._setStatus('Sauvegarde en cours...', 'normal');

            try {
                const response = await fetch('/api/save-mapping', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filePath: mappingPath,
                        payload: payload
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erreur serveur inconnue');
                }

                this._setStatus(`Sauvegardé avec succès dans le jeu ! (${mappingPath})`, 'ok');
            } catch (err) {
                this._setStatus(`Erreur lors de la sauvegarde locale: ${err.message}`, 'error');
                console.error('Erreur sauvegarde:', err);
            }
        }

        async _fetchJson(path) {
            const resolvedPath = this._toRootPath(path);
            if (this.jsonCache.has(resolvedPath)) return this.jsonCache.get(resolvedPath);
            const promise = fetch(resolvedPath)
                .then((response) => {
                    if (!response.ok) throw new Error(`Unable to load JSON (${response.status}): ${resolvedPath}`);
                    return response.json();
                })
                .catch((err) => {
                    this.jsonCache.delete(resolvedPath);
                    throw err;
                });
            this.jsonCache.set(resolvedPath, promise);
            return promise;
        }

        _renderProjectileStateOptions() {
            const select = this.el.projectileStateSelect;
            if (!select) return;
            const previous = select.value;
            const states = (window.MAPPER_STATES || []).filter((state) => state !== 'UNUSED_UNKNOWN');
            select.innerHTML = '';
            states.forEach((state) => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                select.appendChild(option);
            });
            if (!states.length) return;
            if (previous && states.includes(previous)) {
                select.value = previous;
                return;
            }
            const previewState = this.el.previewStateSelect?.value;
            if (previewState && states.includes(previewState)) {
                select.value = previewState;
                return;
            }
            select.value = 'SPECIAL';
            if (!states.includes(select.value)) select.value = states[0];
        }

        _extractProjectileDisplayName(imagePath) {
            const file = String(imagePath || '').split('/').pop() || '';
            const token = file.replace(/\.png$/i, '').replace(/^projectile__/, '');
            if (!token) return 'Aucun';
            return token.replace(/_/g, ' ').trim() || token;
        }

        _normalizeProjectileConfig(config) {
            if (!config || typeof config !== 'object') return null;
            const imagePath = this._toRootPath(String(config.imagePath || '').trim());
            if (!imagePath) return null;
            return {
                imagePath,
                kind: String(config.kind || 'custom').trim() || 'custom',
                speed: Number.isFinite(Number(config.speed)) ? Number(config.speed) : 10,
                width: Number.isFinite(Number(config.width)) ? Math.max(1, Math.round(Number(config.width))) : 24,
                height: Number.isFinite(Number(config.height)) ? Math.max(1, Math.round(Number(config.height))) : 24,
                life: Number.isFinite(Number(config.life)) ? Math.max(1, Math.round(Number(config.life))) : 60,
                spinSpeed: Number.isFinite(Number(config.spinSpeed)) ? Number(config.spinSpeed) : 0,
            };
        }

        _getSanitizedStateProjectileMap() {
            const out = {};
            Object.entries(this.stateProjectileMap || {}).forEach(([state, config]) => {
                if (typeof state !== 'string' || !state.trim()) return;
                const normalized = this._normalizeProjectileConfig(config);
                if (!normalized) return;
                out[state] = normalized;
            });
            return out;
        }

        _applyProjectileConfigToEditor(config) {
            const normalized = this._normalizeProjectileConfig(config);
            if (!normalized) {
                this._clearProjectileConfig();
                return;
            }
            if (this.el.projectileImagePath) this.el.projectileImagePath.value = normalized.imagePath;
            if (this.el.projectilePreviewImg) this.el.projectilePreviewImg.src = normalized.imagePath;
            if (this.el.projectileKind) this.el.projectileKind.value = normalized.kind || '';
            if (this.el.projectileSpeed) this.el.projectileSpeed.value = normalized.speed;
            if (this.el.projectileWidth) this.el.projectileWidth.value = normalized.width;
            if (this.el.projectileHeight) this.el.projectileHeight.value = normalized.height;
            if (this.el.projectileLife) this.el.projectileLife.value = normalized.life;
            if (this.el.projectileSpin) this.el.projectileSpin.value = normalized.spinSpeed;
            if (this.el.projectileSelectedName) {
                const display = this._extractProjectileDisplayName(normalized.imagePath);
                this.el.projectileSelectedName.textContent = display.charAt(0).toUpperCase() + display.slice(1);
            }
            if (this.el.projectilePoolGrid) {
                this.el.projectilePoolGrid.querySelectorAll('.proj-card').forEach((card) => {
                    const isActive = card.dataset.fullPath === normalized.imagePath;
                    card.style.borderColor = isActive ? 'var(--primary)' : 'var(--border)';
                });
            }
        }

        _assignProjectileToState() {
            const state = this.el.projectileStateSelect?.value;
            if (!state) {
                this._setStatus('Choisis un etat avant attribution projectile.', 'error');
                return;
            }
            const config = this._normalizeProjectileConfig(this._readProjectileConfig());
            if (!config) {
                this._setStatus('Choisis un projectile dans le pool avant attribution.', 'error');
                return;
            }
            this.stateProjectileMap[state] = config;
            this._renderStateProjectileAssignments();
            this._renderBoard();
            this.saveToGame();
            this._setStatus(`Projectile attribue a ${state}.`, 'ok');
        }

        _unassignProjectileFromState() {
            const state = this.el.projectileStateSelect?.value;
            if (!state) return;
            if (this.stateProjectileMap[state]) {
                delete this.stateProjectileMap[state];
                this._renderStateProjectileAssignments();
                this._renderBoard();
                this.saveToGame();
                this._setStatus(`Projectile retire de ${state}.`, 'ok');
                return;
            }
            this._setStatus(`Aucun projectile assigne a ${state}.`, 'normal');
        }

        _loadSelectedStateProjectileConfig() {
            const state = this.el.projectileStateSelect?.value;
            if (!state) return;
            const config = this.stateProjectileMap?.[state];
            if (!config) return;
            this._applyProjectileConfigToEditor(config);
            this._setStatus(`Config projectile chargee depuis ${state}.`, 'normal');
        }

        _renderStateProjectileAssignments() {
            const root = this.el.projectileStateList;
            if (!root) return;
            const byState = this._getSanitizedStateProjectileMap();
            const entries = Object.entries(byState).sort((a, b) => a[0].localeCompare(b[0]));
            root.innerHTML = '';
            if (!entries.length) {
                root.innerHTML = '<span style="color:var(--text-muted); font-size:11px;">Aucune attribution de projectile.</span>';
                return;
            }
            entries.forEach(([state, config]) => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'state-proj-chip rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/15';
                chip.textContent = `${state} -> ${this._extractProjectileDisplayName(config.imagePath)}`;
                chip.title = config.imagePath;
                chip.addEventListener('click', () => {
                    if (this.el.projectileStateSelect) this.el.projectileStateSelect.value = state;
                    this._applyProjectileConfigToEditor(config);
                });
                root.appendChild(chip);
            });
        }

        // ─── Projectile Pool Methods ─────────────────────────────────
        _getProjectilePoolPaths() {
            return [
                { base: 'assets/organized/characters/projectile_pool/pool/sb3_fullpack', prefix: 'projectile__' },
                { base: 'assets/organized/characters/projectile_pool/pool/master_naruto_sprites_sb3', prefix: '' },
            ];
        }

        async _scanProjectilePool() {
            const allImages = [];
            const seen = new Set();
            const fpBase = this._toRootPath('assets/organized/characters/projectile_pool/pool/sb3_fullpack');
            const nsBase = this._toRootPath('assets/organized/characters/projectile_pool/pool/master_naruto_sprites_sb3');

            // 1. Load sb3_fullpack projectiles from the mapping file
            try {
                const res = await fetch(`${fpBase}/mappings/projectile_fp.json`);
                if (res.ok) {
                    const fpMapping = await res.json();
                    if (fpMapping && fpMapping.stateMap) {
                        Object.values(fpMapping.stateMap).forEach(arr => {
                            if (!Array.isArray(arr)) return;
                            arr.forEach(f => {
                                if (typeof f === 'string' && f.endsWith('.png') && !seen.has(f)) {
                                    seen.add(f);
                                    allImages.push({ file: f, base: fpBase, fullPath: fpBase + '/' + f });
                                }
                            });
                        });
                    }
                }
            } catch (err) {
                console.warn('Could not load projectile_fp.json:', err);
            }

            // 2. Add naruto_sprites_sb3 projectile effects
            const nsFiles = [
                ...Array.from({ length: 9 }, (_, i) => 'rasenganeffect__naruto' + (i === 0 ? '' : (i + 1)) + '.png'),
                ...Array.from({ length: 6 }, (_, i) => 'rasenshuriken__rasenshuriken' + (i === 0 ? '' : (i + 1)) + '.png'),
                ...Array.from({ length: 8 }, (_, i) => 'rasenshuriken__sagenarutofullsheet_2_' + (i === 0 ? '' : (i + 1)) + '.png'),
                ...Array.from({ length: 6 }, (_, i) => 'image_15_at_frame_0__image_' + (15 + i) + '_at_frame_0.png'),
            ];
            nsFiles.forEach(f => {
                if (!seen.has(f)) {
                    seen.add(f);
                    allImages.push({ file: f, base: nsBase, fullPath: nsBase + '/' + f });
                }
            });

            return allImages;
        }

        _getNsProjectileFiles(slug) {
            const known = {
                rasenganeffect: Array.from({ length: 9 }, (_, i) => `rasenganeffect__naruto${i === 0 ? '' : (i + 1)}.png`),
                rasenshuriken: [
                    ...Array.from({ length: 6 }, (_, i) => `rasenshuriken__rasenshuriken${i === 0 ? '' : (i + 1)}.png`),
                    ...Array.from({ length: 8 }, (_, i) => `rasenshuriken__sagenarutofullsheet_2_${i === 0 ? '' : (i + 1)}.png`),
                ],
                image_15_at_frame_0: Array.from({ length: 6 }, (_, i) => `image_15_at_frame_0__image_${15 + i}_at_frame_0.png`),
            };
            return known[slug] || [];
        }

        async _renderProjectilePool() {
            const grid = this.el.projectilePoolGrid;
            if (!grid) return;
            grid.innerHTML = '<span style="color:var(--text-muted); font-size:12px;">Chargement...</span>';

            const images = await this._scanProjectilePool();
            grid.innerHTML = '';

            if (!images.length) {
                grid.innerHTML = '<span style="color:var(--text-muted); font-size:12px;">Aucun projectile trouvé.</span>';
                return;
            }

            const currentPath = this.el.projectileImagePath?.value || '';

            images.forEach(({ file, fullPath }) => {
                const cat = this._detectProjectileCategory(file);
                const isActive = fullPath === currentPath;
                const card = document.createElement('div');
                card.className = `proj-card group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 transition-all duration-200 ${isActive
                    ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-110 z-10'
                    : 'border-white/10 bg-slate-950/80 hover:border-white/30 hover:bg-slate-900 hover:scale-105'
                    }`;
                card.dataset.fullPath = fullPath;
                card.title = file.replace(/\.png$/, '').replace('projectile__', '');

                const img = document.createElement('img');
                img.src = fullPath;
                img.className = 'max-h-11 max-w-11 object-contain [image-rendering:pixelated] transition-transform duration-200 group-hover:rotate-12';
                img.onerror = () => { card.style.display = 'none'; };

                if (isActive) {
                    const glow = document.createElement('div');
                    glow.className = 'absolute inset-0 bg-cyan-400/10 animate-pulse';
                    card.appendChild(glow);
                }

                card.appendChild(img);

                card.addEventListener('click', () => {
                    this._selectProjectile(file, fullPath);
                    // Single pass update for all cards
                    grid.querySelectorAll('.proj-card').forEach(c => {
                        const isThis = c.dataset.fullPath === fullPath;
                        c.className = `proj-card group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 transition-all duration-200 ${isThis
                            ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-110 z-10'
                            : 'border-white/10 bg-slate-950/80 hover:border-white/30 hover:bg-slate-900 hover:scale-105'
                            }`;
                        // Remove pulses from others
                        const p = c.querySelector('.animate-pulse');
                        if (p && !isThis) p.remove();
                        // Add pulse if not present and isActive
                        if (isThis && !c.querySelector('.animate-pulse')) {
                            const glow = document.createElement('div');
                            glow.className = 'absolute inset-0 bg-cyan-400/10 animate-pulse';
                            c.insertBefore(glow, c.firstChild);
                        }
                    });
                });

                grid.appendChild(card);
            });
        }

        _detectProjectileCategory(file) {
            const f = file.toLowerCase();
            if (f.includes('kunai')) return 'kunai';
            if (f.includes('windattack') || f.includes('wind')) return 'wind';
            if (f.includes('earthjutsu') || f.includes('earth')) return 'earth';
            if (f.includes('phoenixflame') || f.includes('fire') || f.includes('flame')) return 'fire';
            if (f.includes('sandburial') || f.includes('sand')) return 'sand';
            if (f.includes('rasengan') || f.includes('naruto')) return 'rasengan';
            if (f.includes('rasenshuriken') || f.includes('shuriken')) return 'shuriken';
            if (f.includes('shadowclones') || f.includes('clone')) return 'clones';
            return 'other';
        }

        _selectProjectile(file, fullPath) {
            if (this.el.projectileImagePath) this.el.projectileImagePath.value = fullPath;
            if (this.el.projectilePreviewImg) this.el.projectilePreviewImg.src = fullPath;
            // Auto-detect kind from filename
            const token = file.replace(/\.png$/i, '').split('__').pop() || '';
            const kindMatch = token.replace(/\d+$/, '').replace(/_$/, '');
            if (this.el.projectileKind) {
                this.el.projectileKind.value = kindMatch || 'custom';
            }
            // Update the name label
            const displayName = token.replace(/\d+$/, '').replace(/_/g, ' ').trim() || file;
            if (this.el.projectileSelectedName) {
                this.el.projectileSelectedName.textContent = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            }
        }

        _clearProjectileConfig() {
            if (this.el.projectileImagePath) this.el.projectileImagePath.value = '';
            if (this.el.projectilePreviewImg) this.el.projectilePreviewImg.src = '';
            if (this.el.projectileKind) this.el.projectileKind.value = '';
            if (this.el.projectileSpeed) this.el.projectileSpeed.value = '10';
            if (this.el.projectileWidth) this.el.projectileWidth.value = '24';
            if (this.el.projectileHeight) this.el.projectileHeight.value = '24';
            if (this.el.projectileLife) this.el.projectileLife.value = '60';
            if (this.el.projectileSpin) this.el.projectileSpin.value = '0';
            if (this.el.projectileSelectedName) this.el.projectileSelectedName.textContent = 'Aucun';
            // Clear highlight in pool grid
            if (this.el.projectilePoolGrid) {
                this.el.projectilePoolGrid.querySelectorAll('.proj-card').forEach(d => d.style.borderColor = 'var(--border)');
            }
        }

        _readProjectileConfig() {
            const imagePath = this.el.projectileImagePath?.value?.trim() || '';
            if (!imagePath) return null;
            return {
                imagePath,
                kind: this.el.projectileKind?.value?.trim() || 'custom',
                speed: parseFloat(this.el.projectileSpeed?.value) || 10,
                width: parseInt(this.el.projectileWidth?.value, 10) || 24,
                height: parseInt(this.el.projectileHeight?.value, 10) || 24,
                life: parseInt(this.el.projectileLife?.value, 10) || 60,
                spinSpeed: parseFloat(this.el.projectileSpin?.value) || 0,
            };
        }

        _loadProjectileConfig(mappingJson) {
            const byStateRaw = (mappingJson?.projectileByState && typeof mappingJson.projectileByState === 'object')
                ? mappingJson.projectileByState
                : {};
            this.stateProjectileMap = {};
            Object.entries(byStateRaw).forEach(([state, config]) => {
                const normalized = this._normalizeProjectileConfig(config);
                if (normalized) this.stateProjectileMap[state] = normalized;
            });

            const globalProjectile = this._normalizeProjectileConfig(mappingJson?.projectile || null);
            if (globalProjectile) {
                this._applyProjectileConfigToEditor(globalProjectile);
            } else {
                const firstState = Object.keys(this.stateProjectileMap)[0];
                if (firstState) {
                    this._applyProjectileConfigToEditor(this.stateProjectileMap[firstState]);
                } else {
                    this._clearProjectileConfig();
                }
            }
            this._renderProjectileStateOptions();
            this._renderStateProjectileAssignments();
        }
    }

    function reportMapperInitError(err) {
        // eslint-disable-next-line no-console
        console.error('Mapper init failed:', err);
        const status = document.getElementById('status-message');
        if (status) {
            status.textContent = `Erreur initialisation: ${err.message}`;
            status.classList.remove('text-slate-400', 'text-emerald-300');
            status.classList.add('text-rose-300');
        }
    }

    window.MapperApp = MapperApp;
    window.initMapperApp = () => {
        if (window.__mapperAppInitPromise) return window.__mapperAppInitPromise;
        if (!document.getElementById('profile-select')) {
            return Promise.reject(new Error('Mapper mount point not found.'));
        }

        const app = new MapperApp();
        window.__mapperAppInstance = app;
        window.__mapperAppInitPromise = app.init()
            .then(() => app)
            .catch((err) => {
                window.__mapperAppInitPromise = null;
                window.__mapperAppInstance = null;
                reportMapperInitError(err);
                throw err;
            });
        return window.__mapperAppInitPromise;
    };

    const autoBoot = () => {
        if (!document.getElementById('profile-select')) return;
        if (window.__mapperAppInitPromise) return;
        window.initMapperApp().catch(() => { });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoBoot, { once: true });
    } else {
        autoBoot();
    }
})();
