/* ============================================
   SPRITE FACTORY — Build fighter sheets from atlas images
   ============================================ */

class SpriteFactory {
    static _cache = new Map();
    static _jsonCache = new Map();
    static _imageCache = new Map();

    static async build(path, options = {}) {
        const mode = options.mode || 'raw';
        const cacheKey = `${path}::${JSON.stringify(options)}`;
        if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

        const promise = (async () => {
            if (mode === 'sb3-target-mapped') {
                try {
                    return await this._buildFromSb3TargetMapped(path, options);
                } catch (err) {
                    console.warn('SB3 mapped sprite build failed, fallback to sb3-target:', err);
                    if (options.targetName) {
                        try {
                            return await this._buildFromSb3Target(path, options);
                        } catch (fallbackErr) {
                            console.warn('SB3 fallback (sb3-target) failed:', fallbackErr);
                        }
                    }
                }
            }

            if (mode === 'sb3-target') {
                try {
                    return await this._buildFromSb3Target(path, options);
                } catch (err) {
                    console.warn('SB3 sprite build failed, fallback to raw image:', err);
                }
            }

            if (mode === 'auto-magenta-atlas') {
                try {
                    return await this._buildFromMagentaAtlas(path, options);
                } catch (err) {
                    // Fallback: keep gameplay running even if canvas read is blocked (e.g. file://).
                    console.warn('SpriteFactory fallback to raw image:', err);
                    const image = await this._loadImage(path);
                    const fallbackSize = options.cellSize || 32;
                    return {
                        image,
                        frameWidth: fallbackSize,
                        frameHeight: fallbackSize,
                    };
                }
            }
            const image = await this._loadImage(path);
            return { image };
        })();

        this._cache.set(cacheKey, promise);
        return promise;
    }

    static _loadImage(path) {
        if (this._imageCache.has(path)) return this._imageCache.get(path);

        const promise = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => {
                // Evict from cache so fallback paths can retry
                this._imageCache.delete(path);
                reject(new Error(`Unable to load sprite: ${path}`));
            };
            image.src = path;
        });

        this._imageCache.set(path, promise);
        return promise;
    }

    static _loadJson(path) {
        if (this._jsonCache.has(path)) return this._jsonCache.get(path);

        const promise = fetch(path).then((response) => {
            if (!response.ok) {
                throw new Error(`Unable to load JSON (${response.status}): ${path}`);
            }
            return response.json();
        });

        this._jsonCache.set(path, promise);
        return promise;
    }

    static async _mapWithConcurrency(items, limit, iteratee) {
        const maxConcurrency = Math.max(1, Number(limit) || 1);
        const results = new Array(items.length);
        let cursor = 0;

        const worker = async () => {
            while (cursor < items.length) {
                const index = cursor++;
                results[index] = await iteratee(items[index], index);
            }
        };

        const workers = Array.from(
            { length: Math.min(maxConcurrency, Math.max(1, items.length)) },
            () => worker()
        );
        await Promise.all(workers);
        return results;
    }

    static _dirOf(path) {
        const idx = path.lastIndexOf('/');
        return idx >= 0 ? path.slice(0, idx) : '.';
    }

    static _defaultSb3Plan() {
        return [
            ['IDLE', 4, 14],
            ['WALK', 4, 10],
            ['JUMP', 2, 12],
            ['ATTACK_LIGHT', 3, 7],
            ['ATTACK_HEAVY', 4, 8],
            ['SPECIAL', 5, 9],
            ['BLOCK', 1, 14],
            ['HIT', 2, 8],
            ['KO', 3, 12],
        ];
    }

    static _normalizeTimingMap(timingMap) {
        const out = {};
        if (!timingMap || typeof timingMap !== 'object') return out;
        Object.entries(timingMap).forEach(([state, values]) => {
            if (!Array.isArray(values)) return;
            const clean = values
                .map((v) => Number(v))
                .filter((v) => Number.isFinite(v) && v > 0);
            if (clean.length) out[state] = clean;
        });
        return out;
    }

    static _defaultFrameDurations(stateName, count, speed) {
        const n = Math.max(1, count | 0);
        const base = Math.max(1, Number(speed) || 8);
        const out = Array.from({ length: n }, () => base);
        const state = String(stateName || '').toUpperCase();
        if (n >= 3 && (state === 'IDLE' || state === 'BLOCK' || state === 'CHARGE')) {
            out[0] = Math.max(1, Math.round(base * 1.4));
            out[n - 1] = Math.max(1, Math.round(base * 1.4));
            for (let i = 1; i < n - 1; i++) out[i] = Math.max(1, Math.round(base * 0.9));
        }
        return out;
    }

    static _resolveFrameDurations(stateName, count, speed, timingMap = null) {
        const fallback = this._defaultFrameDurations(stateName, count, speed);
        if (!timingMap || typeof timingMap !== 'object') return fallback;
        const raw = timingMap[stateName];
        if (!Array.isArray(raw) || !raw.length) return fallback;
        const out = [];
        for (let i = 0; i < count; i++) {
            const val = Number(raw[i % raw.length]);
            out.push(Number.isFinite(val) && val > 0 ? Math.max(1, Math.round(val)) : fallback[i]);
        }
        return out;
    }

    static _normalizeSb3FileName(value) {
        if (!value || typeof value !== 'string') return '';
        const clean = value.replace(/\\/g, '/').trim();
        if (!clean) return '';
        const chunks = clean.split('/');
        return chunks[chunks.length - 1];
    }

    static _normalizeStateMap(stateMap) {
        const out = {};
        if (!stateMap || typeof stateMap !== 'object') return out;

        Object.entries(stateMap).forEach(([key, value]) => {
            if (!Array.isArray(value)) return;
            out[key] = value
                .map((file) => this._normalizeSb3FileName(file))
                .filter(Boolean);
        });

        return out;
    }

    static async _buildFromSb3TargetMapped(manifestPath, options) {
        const mappingPath = options.mappingPath;
        if (!mappingPath) {
            throw new Error('Missing mappingPath for sb3-target-mapped mode.');
        }

        const mapping = await this._loadJson(mappingPath);
        const plan = options.plan || this._defaultSb3Plan();
        const assetsBasePath = (options.assetsBasePath || this._dirOf(manifestPath)).replace(/\/$/, '');
        const timingMap = this._normalizeTimingMap(mapping.animationTimings || mapping.frameDurations || mapping.timingMap);

        const stateFileMap = this._normalizeStateMap(mapping.stateMap || {});
        const hasAnyMappedState = Object.values(stateFileMap).some(files => Array.isArray(files) && files.length > 0);
        if (!hasAnyMappedState) {
            throw new Error(`Invalid or empty stateMap in mapping: ${mappingPath}`);
        }

        return this._buildSb3SheetFromStateFiles(stateFileMap, assetsBasePath, plan, options.cellSize, timingMap);
    }

    static async _buildSb3SheetFromStateFiles(stateFileMap, assetsBasePath, plan, cellSizeOption, timingMap = null) {
        const planStates = plan.map(([state]) => state);
        const uniqueFiles = [];
        const seen = new Set();

        planStates.forEach((state) => {
            const files = stateFileMap[state] || [];
            files.forEach((file) => {
                const fileName = this._normalizeSb3FileName(file);
                if (!fileName || seen.has(fileName)) return;
                seen.add(fileName);
                uniqueFiles.push(fileName);
            });
        });

        if (!uniqueFiles.length) {
            throw new Error('No sprite files found for mapped SB3 state map.');
        }

        const tryBases = [
            assetsBasePath, // Prefer whichever is passed in config
            'assets/organized/shared/sb3',
            'assets/organized/shared/sb3_fullpack',
            'assets/organized/characters/projectile_pool/pool/sb3_fullpack'
        ];

        const imageMap = new Map();
        const resolvedImages = await this._mapWithConcurrency(
            uniqueFiles,
            12,
            async (fileName) => {
                let loadedImage = null;
                for (const base of tryBases) {
                    const imagePath = `${base}/${fileName}`;
                    try {
                        loadedImage = await this._loadImage(imagePath);
                        if (loadedImage) break;
                    } catch (err) {
                        // Try next base.
                    }
                }
                return { fileName, loadedImage };
            }
        );

        resolvedImages.forEach(({ fileName, loadedImage }) => {
            if (loadedImage) {
                imageMap.set(fileName, loadedImage);
            } else {
                console.warn(`Could not resolve image ${fileName} across all asset bases`);
            }
        });

        let maxW = 0;
        let maxH = 0;
        uniqueFiles.forEach((fileName) => {
            const image = imageMap.get(fileName);
            if (!image) return;
            if (image.width > maxW) maxW = image.width;
            if (image.height > maxH) maxH = image.height;
        });

        // Only keep states that actually resolve to frames. Missing states should
        // fall back at runtime instead of producing blank rows in the atlas.
        const dynamicPlan = plan
            .map(([stateName, count, speed]) => {
                const files = (stateFileMap[stateName] || [])
                    .map(file => this._normalizeSb3FileName(file))
                    .filter(Boolean);
                return [stateName, files.length > 0 ? files.length : count, speed, files];
            })
            .filter(([, , , files]) => files.length > 0);

        if (!dynamicPlan.length) {
            throw new Error('No mapped SB3 states contain drawable frames.');
        }

        const maxCols = Math.max(...dynamicPlan.map(([, count]) => count));
        const frameWidth = cellSizeOption || Math.max(48, Math.min(480, maxW + 8));
        const frameHeight = cellSizeOption || Math.max(48, Math.min(480, maxH + 8));

        const sheet = document.createElement('canvas');
        sheet.width = frameWidth * maxCols;
        sheet.height = frameHeight * dynamicPlan.length;

        const ctx = sheet.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        let drawnFrameCount = 0;

        const animations = {};
        for (let row = 0; row < dynamicPlan.length; row++) {
            const [stateName, count, speed, files] = dynamicPlan[row];
            const resolvedSpeed = Math.max(1, speed);
            animations[stateName] = {
                row,
                frames: count,
                speed: resolvedSpeed,
                frameDurations: this._resolveFrameDurations(stateName, count, resolvedSpeed, timingMap),
            };

            for (let col = 0; col < count; col++) {
                const fileName = files[col % files.length];
                const image = imageMap.get(fileName);
                if (!image) continue;

                const fitScale = Math.min(
                    1,
                    (frameWidth * 0.9) / image.width,
                    (frameHeight * 0.9) / image.height
                );
                const drawW = Math.max(1, Math.round(image.width * fitScale));
                const drawH = Math.max(1, Math.round(image.height * fitScale));

                const x = col * frameWidth + Math.floor((frameWidth - drawW) / 2);
                const y = (row + 1) * frameHeight - drawH;
                ctx.drawImage(image, x, y, drawW, drawH);
                drawnFrameCount += 1;
            }
        }

        if (drawnFrameCount <= 0) {
            throw new Error('SpriteFactory: no drawable frames resolved from mapping/state files.');
        }

        return {
            image: sheet,
            frameWidth,
            frameHeight,
            animations,
        };
    }

    static async _buildFromSb3Target(manifestPath, options) {
        const targetName = (options.targetName || '').trim();
        if (!targetName) {
            throw new Error('Missing sb3 target name.');
        }

        const project = await this._loadJson(manifestPath);
        const target = (project.targets || []).find(t => (t.name || '').trim() === targetName);
        if (!target || !Array.isArray(target.costumes) || target.costumes.length === 0) {
            throw new Error(`SB3 target not found or empty: ${targetName}`);
        }

        const plan = options.plan || this._defaultSb3Plan();
        const counts = Object.fromEntries(plan.map(([name, count]) => [name, count]));

        const selectedByState = this._selectSb3Frames(target.costumes, counts, targetName);
        const assetsBasePath = (options.assetsBasePath || this._dirOf(manifestPath)).replace(/\/$/, '');
        const stateFileMap = {};
        Object.entries(selectedByState).forEach(([stateName, frames]) => {
            stateFileMap[stateName] = (frames || []).map((costume) =>
                this._normalizeSb3FileName(costume.md5ext || `${costume.assetId}.${costume.dataFormat || 'png'}`)
            ).filter(Boolean);
        });

        return this._buildSb3SheetFromStateFiles(stateFileMap, assetsBasePath, plan, options.cellSize, null);
    }

    static _selectSb3Frames(costumes, counts, targetName) {
        const frames = costumes.map((costume, index) => ({
            costume,
            index,
            raw: (costume.name || '').toLowerCase(),
            norm: (costume.name || '').toLowerCase().replace(/[^a-z0-9]+/g, ''),
        }));

        const has = (frame, token) => frame.raw.includes(token) || frame.norm.includes(token);

        // Collect frames matching any of the given tokens
        const collect = (tokens) => frames.filter(frame => tokens.some(token => has(frame, token)));

        // Pick 'count' frames from pool cyclically, starting at 'start'
        const pick = (pool, count, start = 0) => {
            const source = pool.length ? pool : frames;
            if (!source.length) return [];
            const out = [];
            for (let i = 0; i < count; i++) {
                out.push(source[(start + i) % source.length].costume);
            }
            return out;
        };

        // ── IDLE ──────────────────────────────────────────────────────────────
        // Naruto: "Narutostd", Kisame: "Kis Stance", Kimimaro: "stan", Lee: "S1-S6", generic: "stance/idle/std"
        const idlePool = collect([
            'idle', 'stance', 'std', 'stan',
            // S1-S6 for Lee (starts with just one letter + digit)
        ]).concat(
            frames.filter(f => /^[a-z]{1,2}\d+$/.test(f.norm) && !has(f, 'run') && !has(f, 'atk') && !has(f, 'jmp'))
        );

        // ── WALK / RUN ───────────────────────────────────────────────────────
        // Naruto: "Naruto run 1-6", Kisame: "Kis Run/Walk", Lee: "lee run", Kimimaro: "run"
        const walkPool = collect(['run', 'walk', 'wlk']);

        // ── JUMP ─────────────────────────────────────────────────────────────
        // Naruto: "Narutojmp", Kimimaro: "jump", Kisame: "Kis Jump", Lee: "inair"
        const jumpPool = collect(['jump', 'jmp', 'inair', 'air']);

        // ── LIGHT ATTACK ─────────────────────────────────────────────────────
        // Naruto: "Narutoatk3-33", Sasuke: "S Attack/sasuke combo", Lee: "A1-A8", Kisame: "Kis X"
        // Kimimaro: "combo 1-9"
        const lightAttackPool = collect([
            'atk', 'attack', 'combo',
            'cmb',    // Orochimaru: "o cmb"
            'apr',    // Orochimaru: "o apr" (approach attack)
        ]).concat(
            // Lee: A1-A8 frames
            frames.filter(f => /^[a-z]?\d+$/.test(f.norm) && has(f, 'a'))
        );

        // ── HEAVY ATTACK ─────────────────────────────────────────────────────
        // Naruto: "Narutorenden", Lee: "K1-K5" (kick chain)
        const heavyAttackPool = collect([
            'renden', 'heavy', 'kick',
            // Lee kick frames: K1-K5, behind kick, up kick
        ]).concat(frames.filter(f => /^k\d+/.test(f.norm)));

        // If no heavy pool, fall back to light attack
        const effectiveHeavyPool = heavyAttackPool.length ? heavyAttackPool : lightAttackPool;

        // ── SPECIAL ───────────────────────────────────────────────────────────
        // Naruto: "Narutorasengan", Sasuke: "sasuke chidori", Kimimaro: "special", Kisame: "Goshokuzame/Suikoudan"
        // Orochimaru: "o snake/wind", Lee: "awaken/lotus/primary"
        const specialPool = collect([
            'rasengan', 'chidori', 'special', 'snake',
            'jutsu', 'renden', 'wind', 'goshokuzame', 'suikoudan',
            'shinra', 'awaken', 'lotus', 'primary', 'kyubi', 'kyuubi',
            'transform',
        ]);

        // ── BLOCK ────────────────────────────────────────────────────────────
        // Kisame: "Kis Guard", Lee: "B1-B4", Kimimaro: no block → idle fallback
        const blockPool = collect(['block', 'guard', 'def', 'shield'])
            .concat(frames.filter(f => /^b\d+/.test(f.norm)));

        // ── HIT / DAMAGE ────────────────────────────────────────────────────
        // Naruto: "Narutoblood/Naruto damage", Kimimaro: "damage", Kisame: "Kis Damage", Lee: "D1-D7/lee hurt"
        const hitPool = collect(['damage', 'hit', 'hurt', 'blood', 'dama'])
            .concat(frames.filter(f => /^d\d+/.test(f.norm)));

        // ── KO / FALL ───────────────────────────────────────────────────────
        // Naruto: "naruto fall", Sasuke: "sasuke fall", Kimimaro: "ko/fall", Kisame: "Kis Fall"
        const koPool = collect(['fall', 'ko', 'dead', 'down', 'defeat', 'death', 'faint', 'getup', 'gup']);

        // ── Seeded distribution ──────────────────────────────────────────────
        const seed = this._hashString(targetName) % Math.max(frames.length, 1);
        const midAttack = Math.floor((lightAttackPool.length || frames.length) / 2);

        // Deduplicate pool (preserve order, keep unique indices)
        const dedup = (pool) => {
            const seen = new Set();
            return pool.filter(c => {
                const k = c.assetId || c.md5ext || c.name;
                if (seen.has(k)) return false;
                seen.add(k);
                return true;
            });
        };

        return {
            IDLE: pick(dedup(idlePool), counts.IDLE || 4, seed),
            WALK: pick(dedup(walkPool), counts.WALK || 4, seed),
            JUMP: pick(dedup(jumpPool), counts.JUMP || 2, seed),
            ATTACK_LIGHT: pick(dedup(lightAttackPool), counts.ATTACK_LIGHT || 3, seed),
            ATTACK_HEAVY: pick(dedup(effectiveHeavyPool), counts.ATTACK_HEAVY || 4, midAttack),
            SPECIAL: pick(dedup(specialPool.length ? specialPool : lightAttackPool), counts.SPECIAL || 5, seed),
            BLOCK: pick(dedup(blockPool.length ? blockPool : idlePool), counts.BLOCK || 1, seed),
            HIT: pick(dedup(hitPool.length ? hitPool : lightAttackPool), counts.HIT || 2, seed),
            KO: pick(dedup(koPool.length ? koPool : hitPool), counts.KO || 3, seed),
        };
    }


    static _hashString(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = ((hash << 5) - hash) + text.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    static async _buildFromMagentaAtlas(path, options) {
        const source = await this._loadImage(path);
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = source.width;
        srcCanvas.height = source.height;
        const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
        srcCtx.imageSmoothingEnabled = false;
        srcCtx.drawImage(source, 0, 0);

        const imageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
        const boxes = this._findMagentaTiles(imageData, srcCanvas.width, srcCanvas.height)
            .filter(box => box.w >= 24 && box.h >= 24 && box.w <= 96 && box.h <= 96)
            .sort((a, b) => (a.y - b.y) || (a.x - b.x));

        if (!boxes.length) {
            return { image: source };
        }

        const defaultPlan = [
            ['IDLE', 4, 14],
            ['WALK', 4, 10],
            ['JUMP', 2, 12],
            ['ATTACK_LIGHT', 3, 7],
            ['ATTACK_HEAVY', 4, 8],
            ['SPECIAL', 5, 9],
            ['BLOCK', 1, 14],
            ['HIT', 2, 8],
            ['KO', 3, 12],
        ];
        const plan = options.plan || defaultPlan;

        const maxCols = 5;
        const rows = plan.length;

        const maxW = boxes.reduce((acc, b) => Math.max(acc, b.w), 0);
        const maxH = boxes.reduce((acc, b) => Math.max(acc, b.h), 0);
        const cellSize = options.cellSize || Math.max(48, Math.min(72, Math.max(maxW, maxH) + 4));
        const frameWidth = cellSize;
        const frameHeight = cellSize;

        const sheet = document.createElement('canvas');
        sheet.width = frameWidth * maxCols;
        sheet.height = frameHeight * rows;
        const sheetCtx = sheet.getContext('2d', { willReadFrequently: true });
        sheetCtx.imageSmoothingEnabled = false;

        const startIndex = Math.max(0, options.startIndex || 0);
        let cursor = startIndex;
        const frameMap = options.frameMap || null;
        const animations = {};
        for (let row = 0; row < plan.length; row++) {
            const [name, count, speed] = plan[row];
            const resolvedSpeed = Math.max(1, speed || 8);
            animations[name] = {
                row,
                frames: count,
                speed: resolvedSpeed,
                frameDurations: this._defaultFrameDurations(name, count, resolvedSpeed),
            };

            const mappedFrames = frameMap && Array.isArray(frameMap[name]) && frameMap[name].length
                ? frameMap[name]
                : null;

            for (let col = 0; col < count; col++) {
                const pickedIndex = mappedFrames
                    ? mappedFrames[col % mappedFrames.length]
                    : cursor++;
                const box = boxes[((pickedIndex % boxes.length) + boxes.length) % boxes.length];

                const dx = Math.floor((frameWidth - box.w) / 2) + col * frameWidth;
                const dy = (row + 1) * frameHeight - box.h;

                sheetCtx.drawImage(
                    srcCanvas,
                    box.x, box.y, box.w, box.h,
                    dx, dy, box.w, box.h
                );
            }
        }

        this._removeMagenta(sheetCtx, sheet.width, sheet.height);

        return {
            image: sheet,
            frameWidth,
            frameHeight,
            animations,
        };
    }

    static _findMagentaTiles(imageData, width, height) {
        const data = imageData.data;
        const visited = new Uint8Array(width * height);
        const boxes = [];

        const isMagenta = (index) => {
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];
            return a > 0 && r >= 200 && g <= 120 && b >= 180;
        };

        const stack = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const id = y * width + x;
                if (visited[id]) continue;
                visited[id] = 1;

                const pIndex = id * 4;
                if (!isMagenta(pIndex)) continue;

                let minX = x;
                let maxX = x;
                let minY = y;
                let maxY = y;
                let count = 0;

                stack.length = 0;
                stack.push(id);

                while (stack.length) {
                    const current = stack.pop();
                    const cx = current % width;
                    const cy = (current / width) | 0;
                    const cIndex = current * 4;

                    if (!isMagenta(cIndex)) continue;

                    count++;
                    if (cx < minX) minX = cx;
                    if (cx > maxX) maxX = cx;
                    if (cy < minY) minY = cy;
                    if (cy > maxY) maxY = cy;

                    if (cx > 0) {
                        const left = current - 1;
                        if (!visited[left]) {
                            visited[left] = 1;
                            stack.push(left);
                        }
                    }
                    if (cx < width - 1) {
                        const right = current + 1;
                        if (!visited[right]) {
                            visited[right] = 1;
                            stack.push(right);
                        }
                    }
                    if (cy > 0) {
                        const up = current - width;
                        if (!visited[up]) {
                            visited[up] = 1;
                            stack.push(up);
                        }
                    }
                    if (cy < height - 1) {
                        const down = current + width;
                        if (!visited[down]) {
                            visited[down] = 1;
                            stack.push(down);
                        }
                    }
                }

                if (count >= 300) {
                    boxes.push({
                        x: minX,
                        y: minY,
                        w: (maxX - minX) + 1,
                        h: (maxY - minY) + 1,
                        area: count,
                    });
                }
            }
        }

        return boxes;
    }

    static _removeMagenta(ctx, width, height) {
        const image = ctx.getImageData(0, 0, width, height);
        const data = image.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (r >= 200 && g <= 120 && b >= 180) {
                data[i + 3] = 0;
            }
        }
        ctx.putImageData(image, 0, 0);
    }
}
