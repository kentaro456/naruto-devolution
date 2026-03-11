/* ============================================
   MAPPER PREVIEW — Canvas animation preview
   ============================================ */

(function mapperPreviewScope() {
    function normalizeRuntimePath(path) {
        const raw = String(path || '').trim();
        if (!raw) return '';
        if (/^(?:[a-z]+:)?\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
            return raw;
        }
        return raw.startsWith('/') ? raw : `/${raw.replace(/^\/+/, '')}`;
    }

    class MapperPreview {
        constructor(canvasEl) {
            this.canvas = canvasEl;
            this.ctx = this.canvas.getContext('2d');
            this.ctx.imageSmoothingEnabled = false;

            this.imageCache = new Map();
            this.frames = [];
            this.images = [];
            this.currentFrame = 0;
            this.playing = false;
            this.frameDelayMs = 110;
            this.lastTick = 0;
            this.loopMode = 'loop';
            this.playDirection = 1;
            this.zoom = 1;
            this.flipX = false;
            this.onionSkin = false;
            this.onUpdate = null;

            this._loop = this._loop.bind(this);
            requestAnimationFrame(this._loop);
        }

        setOnUpdate(listener) {
            this.onUpdate = typeof listener === 'function' ? listener : null;
            this._emitUpdate();
        }

        getSnapshot() {
            return {
                totalFrames: this.frames.length,
                currentFrame: this.currentFrame,
                currentFrameName: this.frames[this.currentFrame] || '',
                playing: this.playing,
                frameDelayMs: this.frameDelayMs,
                loopMode: this.loopMode,
                zoom: this.zoom,
                zoomPercent: Math.round(this.zoom * 100),
                flipX: this.flipX,
                onionSkin: this.onionSkin,
            };
        }

        setFrameDelay(ms) {
            const parsed = Number(ms);
            if (!Number.isFinite(parsed)) return;
            this.frameDelayMs = Math.max(40, Math.min(600, parsed));
            this._emitUpdate();
        }

        setLoopMode(mode) {
            const nextMode = ['loop', 'once', 'pingpong'].includes(mode) ? mode : 'loop';
            this.loopMode = nextMode;
            if (nextMode !== 'pingpong') this.playDirection = 1;
            this._emitUpdate();
        }

        setZoom(value) {
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return;
            this.zoom = Math.max(0.5, Math.min(3.5, parsed));
            this._draw();
            this._emitUpdate();
        }

        setFlipX(enabled) {
            this.flipX = !!enabled;
            this._draw();
            this._emitUpdate();
        }

        setOnionSkin(enabled) {
            this.onionSkin = !!enabled;
            this._draw();
            this._emitUpdate();
        }

        async setFrames(frameFiles, basePath = 'assets/organized/shared/sb3') {
            this.frames = Array.isArray(frameFiles)
                ? frameFiles
                    .map((frame) => (typeof frame === 'string' && frame.startsWith('source:') ? frame.slice('source:'.length) : frame))
                    .filter((frame) => typeof frame === 'string' && frame.trim())
                : [];
            this.currentFrame = 0;
            this.playDirection = 1;

            if (!this.frames.length) {
                this.images = [];
                this._draw();
                this._emitUpdate();
                return;
            }

            const nextImages = [];
            const bases = Array.isArray(basePath) ? basePath : [basePath];
            for (const frame of this.frames) {
                let loaded = null;
                for (const base of bases) {
                    const fullPath = normalizeRuntimePath(`${base}/${frame}`);
                    try {
                        loaded = await this._loadImage(fullPath);
                        if (loaded) break;
                    } catch (err) {
                        // Try the next candidate base path.
                    }
                }
                if (!loaded) {
                    throw new Error(`Unable to load image: ${bases[0]}/${frame}`);
                }
                nextImages.push(loaded);
            }

            this.images = nextImages;
            this.lastTick = 0;
            this._draw();
            this._emitUpdate();
        }

        play() {
            if (!this.images.length) return;
            this.playing = true;
            this._emitUpdate();
        }

        pause() {
            this.playing = false;
            this.lastTick = 0;
            this._emitUpdate();
        }

        togglePlayback() {
            if (this.playing) {
                this.pause();
            } else {
                this.play();
            }
        }

        stop() {
            this.playing = false;
            this.currentFrame = 0;
            this.playDirection = 1;
            this.lastTick = 0;
            this._draw();
            this._emitUpdate();
        }

        setFrameIndex(index, options = {}) {
            const total = this.images.length;
            if (!total) {
                this.currentFrame = 0;
                this._draw();
                this._emitUpdate();
                return;
            }

            const raw = Number(index);
            const normalized = Math.max(0, Math.min(total - 1, Number.isFinite(raw) ? raw : 0));
            this.currentFrame = normalized;
            if (options.resetTick !== false) this.lastTick = 0;
            this._draw();
            this._emitUpdate();
        }

        step(offset) {
            this.pause();
            this.setFrameIndex(this.currentFrame + Number(offset || 0));
        }

        goToStart() {
            this.pause();
            this.playDirection = 1;
            this.setFrameIndex(0);
        }

        goToEnd() {
            const lastIndex = Math.max(0, this.images.length - 1);
            this.pause();
            this.setFrameIndex(lastIndex);
        }

        _loadImage(path) {
            if (this.imageCache.has(path)) return this.imageCache.get(path);

            const promise = new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = () => reject(new Error(`Unable to load image: ${path}`));
                image.src = normalizeRuntimePath(path);
            });
            this.imageCache.set(path, promise);
            return promise;
        }

        _loop(ts) {
            if (this.playing && this.images.length > 0) {
                if (this.lastTick === 0) this.lastTick = ts;
                const elapsed = ts - this.lastTick;
                if (elapsed >= this.frameDelayMs) {
                    this.lastTick = ts;
                    this._advanceFrame();
                }
            } else {
                this.lastTick = 0;
            }
            requestAnimationFrame(this._loop);
        }

        _advanceFrame() {
            const total = this.images.length;
            if (!total) return;

            if (this.loopMode === 'once') {
                if (this.currentFrame >= total - 1) {
                    this.playing = false;
                    this.currentFrame = total - 1;
                } else {
                    this.currentFrame += 1;
                }
            } else if (this.loopMode === 'pingpong') {
                if (total === 1) {
                    this.currentFrame = 0;
                } else {
                    let next = this.currentFrame + this.playDirection;
                    if (next >= total) {
                        this.playDirection = -1;
                        next = total - 2;
                    } else if (next < 0) {
                        this.playDirection = 1;
                        next = 1;
                    }
                    this.currentFrame = next;
                }
            } else {
                this.currentFrame = (this.currentFrame + 1) % total;
            }

            this._draw();
            this._emitUpdate();
        }

        _drawSprite(image, drawX, drawY, drawW, drawH, alpha = 1) {
            if (!image) return;
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
            if (this.flipX) ctx.scale(-1, 1);
            ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();
        }

        _draw() {
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;
            ctx.clearRect(0, 0, w, h);

            ctx.fillStyle = '#070d16';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(90, 118, 158, 0.2)';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 32) {
                ctx.beginPath();
                ctx.moveTo(x + 0.5, 0);
                ctx.lineTo(x + 0.5, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += 32) {
                ctx.beginPath();
                ctx.moveTo(0, y + 0.5);
                ctx.lineTo(w, y + 0.5);
                ctx.stroke();
            }

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.beginPath();
            ctx.moveTo(w / 2 + 0.5, 0);
            ctx.lineTo(w / 2 + 0.5, h);
            ctx.stroke();

            if (!this.images.length) {
                ctx.fillStyle = '#8ba0c4';
                ctx.font = '12px Outfit, sans-serif';
                ctx.fillText('No frame', 96, 130);
                return;
            }

            const image = this.images[this.currentFrame] || this.images[0];
            if (!image) return;

            const fittedScale = Math.min((w * 0.76) / image.width, (h * 0.76) / image.height, 8);
            const scale = Math.max(0.4, fittedScale * this.zoom);
            const drawW = Math.max(1, Math.round(image.width * scale));
            const drawH = Math.max(1, Math.round(image.height * scale));
            const x = Math.floor((w - drawW) / 2);
            const y = Math.floor((h - drawH) / 2);

            if (this.onionSkin && this.images.length > 1) {
                const prevIndex = this.currentFrame > 0 ? this.currentFrame - 1 : this.images.length - 1;
                const prevImage = this.images[prevIndex];
                this._drawSprite(prevImage, x, y, drawW, drawH, 0.2);
            }

            this._drawSprite(image, x, y, drawW, drawH, 1);

            ctx.fillStyle = 'rgba(12, 18, 28, 0.78)';
            ctx.fillRect(6, h - 24, 66, 16);
            ctx.fillStyle = '#cfe1ff';
            ctx.font = '11px Outfit, sans-serif';
            ctx.fillText(`${this.currentFrame + 1}/${this.images.length}`, 10, h - 12);
        }

        _emitUpdate() {
            if (typeof this.onUpdate === 'function') {
                this.onUpdate(this.getSnapshot());
            }
        }
    }

    window.MapperPreview = MapperPreview;
})();
