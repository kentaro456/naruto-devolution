/* ============================================
   MAPPER STORE — In-memory mapper state
   ============================================ */

(function mapperStoreScope() {
    const EDITOR_STATES = [
        'IDLE',
        'WALK',
        'RUN',
        'JUMP',
        'CROUCH',
        'CROUCH_WALK',
        'CROUCH_ATTACK',
        'CROUCH_THROW',
        'ATTACK_LIGHT_1',
        'ATTACK_LIGHT_2',
        'ATTACK_LIGHT_3',
        'ATTACK_HEAVY_1',
        'ATTACK_HEAVY_2',
        'RUN_ATTACK',
        'THROW',
        'KOMA_SUPPORT',
        'TELEPORT',
        'SPECIAL_TRANSFORM',
        'SPECIAL',
        'CHARGE',
        'DASH',
        'BLOCK',
        'HIT',
        'KO',
        // Legacy compatibility rows
        'ATTACK_LIGHT',
        'ATTACK_HEAVY',
        // Manual parking slot for unknown/unclassified frames
        'UNUSED_UNKNOWN',
    ];

    const REQUIRED_STATES = ['IDLE', 'WALK', 'JUMP', 'SPECIAL'];

    const ROOT_ROUTE_KEYS = {
        light: ['neutral', 'forward', 'down', 'air', 'back'],
        heavy: ['neutral', 'forward', 'down', 'air', 'back'],
        special: ['neutral', 'up', 'down', 'back', 'forward'],
    };

    function uniq(input) {
        return Array.from(new Set((input || []).filter(Boolean)));
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeFrameRef(frame) {
        if (typeof frame !== 'string') return '';
        const trimmed = frame.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('source:')) return trimmed.slice('source:'.length).trim();
        return trimmed;
    }

    function sanitizeFrameArray(frames) {
        if (!Array.isArray(frames)) return [];
        return frames
            .map((frame) => normalizeFrameRef(frame))
            .filter((frame) => typeof frame === 'string' && frame.length > 0);
    }

    function defaultComboConfig() {
        return {
            settings: {
                comboCancelRatio: 0.45,
                comboHitResetFrames: 45,
                requireHitForComboRoutes: false,
                attackDurationScale: 1.0,
                specialTransformDurationScale: 1.0,
            },
            chains: {
                light: [
                    { state: 'ATTACK_LIGHT_1', duration: 11, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 0.9 },
                    { state: 'ATTACK_LIGHT_2', duration: 11, damageMultiplier: 1.15, rangeMultiplier: 1.06, knockbackMultiplier: 1.05 },
                    { state: 'ATTACK_LIGHT_3', duration: 14, damageMultiplier: 1.35, rangeMultiplier: 1.12, knockbackMultiplier: 1.35 },
                ],
                heavy: [
                    { state: 'ATTACK_HEAVY_1', duration: 16, damageMultiplier: 1.2, rangeMultiplier: 1.08, knockbackMultiplier: 1.15 },
                    { state: 'ATTACK_HEAVY_2', duration: 20, damageMultiplier: 1.45, rangeMultiplier: 1.15, knockbackMultiplier: 1.5 },
                ],
                special: [
                    { state: 'SPECIAL', duration: 35, damageMultiplier: 1.0, rangeMultiplier: 1.0, knockbackMultiplier: 1.0 },
                ],
            },
            rootRoutes: {
                light: { neutral: 'L_N_1', forward: 'L_F_1', down: 'L_D_1', air: 'L_A_1', back: 'L_N_1' },
                heavy: { neutral: 'H_N_1', forward: 'H_F_1', down: 'H_D_1', air: 'H_A_1', back: 'H_N_1' },
                special: {
                    neutral: 'S_N_1',
                    up: 'S_U_1',
                    down: 'S_D_1',
                    back: 'S_B_1',
                    forward: 'S_F_1',
                    any: 'S_N_1',
                },
            },
            actionMap: {
                light: 'ATTACK_LIGHT_1',
                heavy: 'ATTACK_HEAVY_1',
                special: 'SPECIAL',
                transform: 'SPECIAL_TRANSFORM',
                block: 'BLOCK',
                jump: 'JUMP',
                run: 'RUN',
                crouch: 'CROUCH',
                dash: 'DASH',
            },
            nodePatches: {},
        };
    }

    function mergeCombo(baseCombo, incomingCombo) {
        const merged = clone(baseCombo);
        if (!incomingCombo || typeof incomingCombo !== 'object') return merged;

        if (incomingCombo.settings && typeof incomingCombo.settings === 'object') {
            merged.settings = { ...merged.settings, ...incomingCombo.settings };
        }

        if (incomingCombo.chains && typeof incomingCombo.chains === 'object') {
            ['light', 'heavy', 'special'].forEach((type) => {
                if (Array.isArray(incomingCombo.chains[type]) && incomingCombo.chains[type].length) {
                    merged.chains[type] = clone(incomingCombo.chains[type]);
                }
            });
        }

        if (incomingCombo.rootRoutes && typeof incomingCombo.rootRoutes === 'object') {
            ['light', 'heavy', 'special'].forEach((type) => {
                const routeMap = incomingCombo.rootRoutes[type];
                if (!routeMap || typeof routeMap !== 'object') return;
                merged.rootRoutes[type] = { ...(merged.rootRoutes[type] || {}), ...routeMap };
            });
        }

        if (incomingCombo.actionMap && typeof incomingCombo.actionMap === 'object') {
            merged.actionMap = { ...(merged.actionMap || {}), ...incomingCombo.actionMap };
        }

        if (incomingCombo.nodePatches && typeof incomingCombo.nodePatches === 'object') {
            merged.nodePatches = clone(incomingCombo.nodePatches);
        }

        return merged;
    }

    class MapperStore {
        constructor(profile, targetFrames, mappingJson) {
            this.profile = profile || {};
            this.targetName = this.profile.targetName || mappingJson?.targetName || '';
            this.mappingPath = this.profile.mappingPath || '';
            this.mappingSlug = this.profile.mappingSlug || '';
            this.originalMapping = mappingJson ? clone(mappingJson) : {};

            this.stateMap = {};
            this.extraStateMap = {};
            this.sourceFrames = [];
            this.combo = defaultComboConfig();

            this.load(targetFrames, mappingJson);
        }

        static get STATES() {
            return EDITOR_STATES.slice();
        }

        static get REQUIRED_STATES() {
            return REQUIRED_STATES.slice();
        }

        load(targetFrames, mappingJson = {}) {
            const incomingStateMap = (mappingJson && typeof mappingJson.stateMap === 'object')
                ? mappingJson.stateMap
                : {};

            EDITOR_STATES.forEach((state) => {
                const arr = Array.isArray(incomingStateMap[state]) ? incomingStateMap[state] : [];
                this.stateMap[state] = sanitizeFrameArray(arr);
            });

            Object.keys(incomingStateMap).forEach((state) => {
                if (EDITOR_STATES.includes(state)) return;
                const arr = Array.isArray(incomingStateMap[state]) ? incomingStateMap[state] : [];
                this.extraStateMap[state] = sanitizeFrameArray(arr);
            });

            const mappingFrames = uniq(Object.values(incomingStateMap).flat().map((frame) => normalizeFrameRef(frame)));
            this.sourceFrames = uniq([...(targetFrames || []), ...mappingFrames]);
            this.combo = mergeCombo(defaultComboConfig(), mappingJson?.combo || null);
        }

        getStateFrames(state) {
            return Array.isArray(this.stateMap[state]) ? this.stateMap[state] : [];
        }

        getAssignedCountByFrame() {
            const counts = new Map();
            Object.values(this.stateMap).forEach((arr) => {
                (arr || []).forEach((frame) => {
                    counts.set(frame, (counts.get(frame) || 0) + 1);
                });
            });
            Object.values(this.extraStateMap).forEach((arr) => {
                (arr || []).forEach((frame) => {
                    counts.set(frame, (counts.get(frame) || 0) + 1);
                });
            });
            return counts;
        }

        getFilteredSourceFrames(searchValue = '', unassignedOnly = false) {
            const q = (searchValue || '').trim().toLowerCase();
            const counts = this.getAssignedCountByFrame();
            return this.sourceFrames.filter((frame) => {
                if (q && !frame.toLowerCase().includes(q)) return false;
                if (unassignedOnly && (counts.get(frame) || 0) > 0) return false;
                return true;
            });
        }

        addFrameToState(state, frame) {
            if (!this.stateMap[state]) return;
            const normalized = normalizeFrameRef(frame);
            if (!normalized) return;
            this.stateMap[state].push(normalized);
        }

        removeFrameFromState(state, index) {
            if (!this.stateMap[state]) return;
            if (index < 0 || index >= this.stateMap[state].length) return;
            this.stateMap[state].splice(index, 1);
        }

        moveFrameWithinState(state, fromIndex, toIndex) {
            const arr = this.stateMap[state];
            if (!arr) return;
            if (fromIndex < 0 || fromIndex >= arr.length) return;
            const normalizedTo = Math.max(0, Math.min(arr.length - 1, toIndex));
            const [item] = arr.splice(fromIndex, 1);
            arr.splice(normalizedTo, 0, item);
        }

        moveFrameAcrossStates(fromState, fromIndex, toState) {
            const source = this.stateMap[fromState];
            const dest = this.stateMap[toState];
            if (!source || !dest) return;
            if (fromIndex < 0 || fromIndex >= source.length) return;
            const [item] = source.splice(fromIndex, 1);
            dest.push(item);
        }

        setCombo(comboConfig) {
            this.combo = mergeCombo(defaultComboConfig(), comboConfig || {});
        }

        getCombo() {
            return clone(this.combo);
        }

        getDefaultDownloadName() {
            const fileName = (this.mappingPath || '').split('/').pop();
            if (fileName && fileName.endsWith('.json')) return fileName;
            if (this.mappingSlug) return `${this.mappingSlug}.json`;
            const slug = (this.targetName || 'mapping').toLowerCase().replace(/[^a-z0-9]+/g, '_');
            return `${slug}.json`;
        }

        buildExportPayload() {
            const version = Number(this.originalMapping?.version) || 1;
            const outputStateMap = {};
            EDITOR_STATES.forEach((state) => {
                outputStateMap[state] = sanitizeFrameArray(clone(this.stateMap[state] || []));
            });
            Object.entries(this.extraStateMap).forEach(([state, arr]) => {
                outputStateMap[state] = sanitizeFrameArray(clone(arr || []));
            });

            if (!outputStateMap.ATTACK_LIGHT.length && outputStateMap.ATTACK_LIGHT_1.length) {
                outputStateMap.ATTACK_LIGHT = outputStateMap.ATTACK_LIGHT_1.slice(0, 3);
            }
            if (!outputStateMap.ATTACK_HEAVY.length && outputStateMap.ATTACK_HEAVY_1.length) {
                outputStateMap.ATTACK_HEAVY = outputStateMap.ATTACK_HEAVY_1.slice(0, 4);
            }

            const categories = {};
            Object.entries(outputStateMap).forEach(([state, frames]) => {
                if (!Array.isArray(frames)) return;
                categories[state.toLowerCase()] = clone(frames);
            });

            const meta = {
                ...(this.originalMapping?.meta || {}),
                editedByMapper: true,
                editedAt: new Date().toISOString(),
                mappingMode: 'manual_editor_modal',
            };

            return {
                targetName: this.targetName || this.originalMapping?.targetName || '',
                version: version + 1,
                categories,
                stateMap: outputStateMap,
                combo: this.getCombo(),
                meta,
            };
        }

        validateExport(payload) {
            const errors = [];
            const warnings = [];
            if (!payload || typeof payload !== 'object') {
                errors.push('Payload invalide.');
                payload.__validationWarnings = warnings;
                return errors;
            }

            // Convert required state checks to warnings instead of errors to allow saving
            REQUIRED_STATES.forEach((state) => {
                const frames = payload.stateMap?.[state];
                if (!Array.isArray(frames) || !frames.length) {
                    warnings.push(`Etat requis vide: ${state}`);
                }
            });

            const hasAnyLight = (payload.stateMap?.ATTACK_LIGHT_1?.length || 0) > 0
                || (payload.stateMap?.ATTACK_LIGHT?.length || 0) > 0;
            const hasAnyHeavy = (payload.stateMap?.ATTACK_HEAVY_1?.length || 0) > 0
                || (payload.stateMap?.ATTACK_HEAVY?.length || 0) > 0;

            if (!hasAnyLight) warnings.push('Aucune animation light configuree.');
            if (!hasAnyHeavy) warnings.push('Aucune animation heavy configuree.');

            const walkSet = new Set(payload.stateMap?.WALK || []);
            const jumpSet = new Set(payload.stateMap?.JUMP || []);
            const walkJumpOverlap = [...jumpSet].filter((frame) => walkSet.has(frame));
            if (walkJumpOverlap.length) {
                warnings.push(`WALK/JUMP partagent ${walkJumpOverlap.length} frame(s): ${walkJumpOverlap.slice(0, 5).join(', ')}`);
            }

            const combo = payload.combo || {};
            const lightLen = Math.max(1, (combo.chains?.light || []).length);
            const heavyLen = Math.max(1, (combo.chains?.heavy || []).length);
            const validNodeIds = new Set(['S_1', 'S_N_1', 'S_U_1', 'S_D_1', 'S_B_1', 'S_F_1']);
            for (let i = 1; i <= lightLen; i++) {
                validNodeIds.add(`L_N_${i}`);
                validNodeIds.add(`L_F_${i}`);
                validNodeIds.add(`L_D_${i}`);
                validNodeIds.add(`L_A_${i}`);
            }
            for (let i = 1; i <= heavyLen; i++) {
                validNodeIds.add(`H_N_${i}`);
                validNodeIds.add(`H_F_${i}`);
                validNodeIds.add(`H_D_${i}`);
                validNodeIds.add(`H_A_${i}`);
            }

            ['light', 'heavy', 'special'].forEach((type) => {
                const chain = combo.chains?.[type];
                if (!Array.isArray(chain) || !chain.length) {
                    warnings.push(`combo.chains.${type} doit contenir au moins 1 etape.`);
                }
            });

            Object.entries(ROOT_ROUTE_KEYS).forEach(([type, keys]) => {
                const routeMap = combo.rootRoutes?.[type];
                if (!routeMap || typeof routeMap !== 'object') {
                    warnings.push(`combo.rootRoutes.${type} manquant.`);
                    return;
                }
                keys.forEach((k) => {
                    if (!routeMap[k] || typeof routeMap[k] !== 'string') {
                        warnings.push(`combo.rootRoutes.${type}.${k} manquant.`);
                        return;
                    }
                    if (!validNodeIds.has(routeMap[k])) {
                        warnings.push(`combo.rootRoutes.${type}.${k} pointe vers node invalide: ${routeMap[k]}`);
                    }
                });
            });

            const nodePatches = combo.nodePatches || {};
            if (nodePatches && typeof nodePatches === 'object') {
                Object.keys(nodePatches).forEach((nodeId) => {
                    if (!validNodeIds.has(nodeId)) {
                        warnings.push(`combo.nodePatches reference un node invalide: ${nodeId}`);
                    }
                });
            }

            const sourceSet = new Set(this.sourceFrames);
            Object.entries(payload.stateMap || {}).forEach(([state, frames]) => {
                (frames || []).forEach((frame) => {
                    if (!sourceSet.has(frame)) {
                        warnings.push(`Frame inconnue dans ${state}: ${frame}`);
                    }
                });
            });

            payload.__validationWarnings = uniq(warnings);
            return uniq(errors);
        }
    }

    window.MAPPER_STATES = EDITOR_STATES.slice();
    window.MAPPER_REQUIRED_STATES = REQUIRED_STATES.slice();
    window.MapperStore = MapperStore;
})();
