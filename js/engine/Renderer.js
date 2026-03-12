/* ============================================
   RENDERER — Canvas 2D Rendering Engine
   ============================================ */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.backgroundCache = new Map();
        this.projectileImageCache = new Map();
        this.pixiCharacterLayer = window.LegacyPixiCharacters || null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Internal game resolution
        this.gameWidth = 800;
        this.gameHeight = 450;

        // Scale canvas to fill window while preserving aspect ratio
        const aspect = this.gameWidth / this.gameHeight;
        let w = window.innerWidth;
        let h = window.innerHeight;

        if (w / h > aspect) {
            w = h * aspect;
        } else {
            h = w / aspect;
        }

        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';

        // Pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
    }

    _getLegacyVisualScaleOverride(fighter) {
        const key = String(fighter?.charId || fighter?.id || fighter?.name || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        const overrides = {
            gaara: 1.12,
            gaara_grand_alt: 2.35,
            madara: 1.75,
            kisame: 1.14,
            itachi: 1.08,
            minato: 1.06,
            kakashi: 1.05,
            teen_kakashi: 1.05,
        };
        if (overrides[key]) return overrides[key];

        const displayScale = Number(fighter?.displayScale);
        if (!Number.isFinite(displayScale)) return 1;
        if (displayScale <= 0.35) return 1.7;
        if (displayScale <= 0.45) return 1.32;
        if (displayScale <= 0.68) return 1.12;
        return 1;
    }

    beginFrame(scenePayload = null) {
        this.pixiCharacterLayer = window.LegacyPixiCharacters || null;
        if (this.pixiCharacterLayer && typeof this.pixiCharacterLayer.updateScene === 'function') {
            this.pixiCharacterLayer.updateScene(scenePayload || {});
        }
        if (this.pixiCharacterLayer && typeof this.pixiCharacterLayer.beginFrame === 'function') {
            this.pixiCharacterLayer.beginFrame(this.canvas);
        }
    }

    handlesPixiSceneFx() {
        return !!(this.pixiCharacterLayer && typeof this.pixiCharacterLayer.updateScene === 'function');
    }

    endFrame() {
        if (this.pixiCharacterLayer && typeof this.pixiCharacterLayer.endFrame === 'function') {
            this.pixiCharacterLayer.endFrame();
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    }

    // Draw a stage background
    drawBackground(stage, camera) {
        if (this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawBackground === 'function') {
            const handledByPixi = this.pixiCharacterLayer.drawBackground({
                stage,
                camera,
                gameWidth: this.gameWidth,
                gameHeight: this.gameHeight,
            });
            if (handledByPixi) return;
        }

        const ctx = this.ctx;
        let hasBackgroundImage = false;

        if (stage.backgroundImage) {
            const bgEntry = this._getBackgroundEntry(stage.backgroundImage);
            if (bgEntry.loaded && bgEntry.image.width > 0 && bgEntry.image.height > 0) {
                this._drawCoverBackground(bgEntry.image, camera, stage);
                hasBackgroundImage = true;

                // Small dark layer to keep HUD/readability consistent
                ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
                ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            }
        }

        if (!hasBackgroundImage) {
            // Sky gradient fallback
            const grad = ctx.createLinearGradient(0, 0, 0, this.gameHeight);
            grad.addColorStop(0, stage.skyTop || '#1a1a2e');
            grad.addColorStop(1, stage.skyBottom || '#0d0d15');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        }

        // Ground — use camera.groundScreenY (fixed pixel row on screen)
        const groundScreenY = camera.groundScreenY;
        ctx.fillStyle = stage.groundColor || '#2a1a0a';
        ctx.fillRect(0, groundScreenY, this.gameWidth, this.gameHeight - groundScreenY);

        // Ground line
        ctx.strokeStyle = stage.groundLineColor || '#4a3520';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundScreenY);
        ctx.lineTo(this.gameWidth, groundScreenY);
        ctx.stroke();
    }

    _getBackgroundEntry(path) {
        if (!path) return null;
        if (this.backgroundCache.has(path)) return this.backgroundCache.get(path);

        const entry = {
            image: new Image(),
            loaded: false,
            failed: false,
        };

        entry.image.onload = () => { entry.loaded = true; };
        entry.image.onerror = () => { entry.failed = true; };
        entry.image.src = path;

        this.backgroundCache.set(path, entry);
        return entry;
    }

    _drawCoverBackground(image, camera, stage) {
        const ctx = this.ctx;
        const baseScale = Math.max(this.gameWidth / image.width, this.gameHeight / image.height);
        const drawW = image.width * baseScale;
        const drawH = image.height * baseScale;

        // Subtle horizontal parallax based on camera position.
        const overflowX = Math.max(0, drawW - this.gameWidth);
        const stageWidth = Math.max(1, stage.width || this.gameWidth);
        const maxCameraX = Math.max(0, stageWidth - this.gameWidth / Math.max(0.001, camera.zoom || 1));
        const cameraRatio = maxCameraX > 0
            ? Math.min(1, Math.max(0, camera.x / maxCameraX))
            : 0;
        const dx = -overflowX * cameraRatio;

        let dy = (this.gameHeight - drawH) / 2;
        if (stage.bgAlignY === 'bottom') {
            dy = this.gameHeight - drawH;
        } else if (stage.bgAlignY === 'top') {
            dy = 0;
        }
        if (typeof stage.bgOffsetY === 'number') {
            dy += stage.bgOffsetY;
        }

        ctx.drawImage(image, dx, dy, drawW, drawH);
    }

    _getProjectileImage(path) {
        if (!path) return null;
        if (this.projectileImageCache.has(path)) {
            return this.projectileImageCache.get(path);
        }

        const entry = {
            image: new Image(),
            loaded: false,
            failed: false,
        };
        entry.image.onload = () => { entry.loaded = true; };
        entry.image.onerror = () => { entry.failed = true; };
        entry.image.src = path;
        this.projectileImageCache.set(path, entry);
        return entry;
    }

    _getProjectileWithResolvedVisual(projectile, allowDefault = false) {
        if (!projectile || typeof projectile !== 'object') return projectile;
        if (typeof resolveProjectileVisualProfile !== 'function') return projectile;

        const visual = resolveProjectileVisualProfile(projectile, { allowDefault });
        if (!visual) return projectile;

        const resolved = { ...projectile };
        const hasFrames = Array.isArray(resolved.imageFrames) && resolved.imageFrames.length > 0;
        const hasSpriteConfig = !!resolved.spriteConfig;

        if (!resolved.imagePath && !hasFrames && (!hasSpriteConfig || !visual._isDefaultProjectileVisual)) {
            if (visual.imagePath) resolved.imagePath = visual.imagePath;
            if (Array.isArray(visual.imageFrames) && visual.imageFrames.length) {
                resolved.imageFrames = [...visual.imageFrames];
            }
        }
        if (!resolved.spriteConfig && visual.spriteConfig) {
            resolved.spriteConfig = { ...visual.spriteConfig };
        }
        if (!Number.isFinite(resolved.imageScale) && Number.isFinite(visual.imageScale)) {
            resolved.imageScale = visual.imageScale;
        }
        if (!Number.isFinite(resolved.imageOffsetY) && Number.isFinite(visual.imageOffsetY)) {
            resolved.imageOffsetY = visual.imageOffsetY;
        }
        if (typeof resolved.rotateWithVelocity === 'undefined' && typeof visual.rotateWithVelocity !== 'undefined') {
            resolved.rotateWithVelocity = visual.rotateWithVelocity;
        }
        if ((!Array.isArray(resolved.explosionFrames) || !resolved.explosionFrames.length)
            && Array.isArray(visual.explosionFrames) && visual.explosionFrames.length) {
            resolved.explosionFrames = [...visual.explosionFrames];
        }

        return resolved;
    }

    // Convert world x to screen x
    _worldToScreenX(worldX, camera) {
        const cx = Number.isFinite(camera?.x) ? camera.x : 0;
        const z = Number.isFinite(camera?.zoom) ? camera.zoom : 1;
        return (worldX - cx) * z;
    }

    // Convert world y (feet position) to screen y using fixed ground line
    _worldToScreenY(worldY, camera) {
        const gs = Number.isFinite(camera?.groundScreenY) ? camera.groundScreenY : this.gameHeight * 0.72;
        const gy = Number.isFinite(camera?.groundY) ? camera.groundY : 350;
        const z = Number.isFinite(camera?.zoom) ? camera.zoom : 1;
        return gs + (worldY - gy) * z;
    }

    _getFighterSpriteInfo(fighter, camera) {
        const zoom = Number.isFinite(camera?.zoom) ? camera.zoom : 1;
        const placeholder = {
            kind: 'placeholder',
            zoom,
            drawW: fighter.width * zoom * 1.5,
            drawH: fighter.height * zoom * 1.5,
        };

        if (fighter.directSpritePath) {
            const entry = this._getProjectileImage(fighter.directSpritePath);
            if (entry && entry.loaded && entry.image.width > 0 && entry.image.height > 0) {
                const dScale = fighter.displayScale * zoom * this._getLegacyVisualScaleOverride(fighter);
                return {
                    kind: 'direct',
                    zoom,
                    dScale,
                    drawW: entry.image.width * dScale,
                    drawH: entry.image.height * dScale,
                    entry,
                };
            }
        }

        const spriteReady = fighter.spriteSheet
            && fighter.spriteSheet.width > 0
            && fighter.spriteSheet.height > 0
            && fighter.spriteSheet.complete !== false;
        if (!spriteReady) return placeholder;

        const dScale = fighter.displayScale * zoom * this._getLegacyVisualScaleOverride(fighter);
        if (fighter.useFullSprite) {
            return {
                kind: 'full',
                zoom,
                dScale,
                drawW: fighter.spriteSheet.width * dScale,
                drawH: fighter.spriteSheet.height * dScale,
            };
        }

        return {
            kind: 'atlas',
            zoom,
            dScale,
            drawW: fighter.frameWidth * dScale,
            drawH: fighter.frameHeight * dScale,
            frame: fighter.getCurrentFrame(),
        };
    }

    // Draw a fighter (sprite or placeholder)
    drawFighter(fighter, camera, _ignoreCustomHook = false) {
        if (typeof fighter.render === 'function' && !_ignoreCustomHook) {
            try {
                fighter.render(this.ctx, camera, this);
                return;
            } catch (err) {
                console.warn(`Custom render failed for ${fighter?.name || 'fighter'}, fallback to default renderer.`, err);
            }
        }

        const ctx = this.ctx;
        const shake = camera.getShakeOffset();
        const drawX = Number.isFinite(fighter.renderX) ? fighter.renderX : fighter.x;
        const drawY = Number.isFinite(fighter.renderY) ? fighter.renderY : fighter.y;
        if (!Number.isFinite(drawX) || !Number.isFinite(drawY)) return;

        // Screen position of fighter's feet
        const screenX = this._worldToScreenX(drawX, camera) + shake.x;
        const screenY = this._worldToScreenY(drawY, camera) + shake.y;
        const spriteInfo = this._getFighterSpriteInfo(fighter, camera);
        const pose = typeof fighter.getRenderPose === 'function'
            ? (fighter.getRenderPose(camera, this, spriteInfo) || null)
            : null;
        const poseInfo = {
            fighter,
            camera,
            renderer: this,
            screenX,
            screenY,
            spriteInfo,
            zoom: spriteInfo.zoom || (Number.isFinite(camera?.zoom) ? camera.zoom : 1),
            dir: fighter.facingRight ? 1 : -1,
        };
        const pixiCanHandlePoseFx = !!(
            pose &&
            pose.pixiEffects &&
            this.pixiCharacterLayer &&
            typeof this.pixiCharacterLayer.drawFighter === 'function'
        );

        if (pose && typeof pose.underlay === 'function' && !pixiCanHandlePoseFx) {
            pose.underlay(ctx, poseInfo);
        }

        if (this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawFighter === 'function') {
            const handledByPixi = this.pixiCharacterLayer.drawFighter({
                fighter: {
                    id: fighter.id || fighter.charId,
                    charId: fighter.charId,
                    name: fighter.name,
                    spriteSheet: fighter.spriteSheet,
                    animations: fighter.animations,
                    frameWidth: fighter.frameWidth,
                    frameHeight: fighter.frameHeight,
                    animFrame: fighter.animFrame,
                    animationKey: typeof fighter._resolveAnimationStateKey === 'function'
                        ? fighter._resolveAnimationStateKey(fighter.state)
                        : fighter.state,
                    facingRight: fighter.facingRight,
                    hitFlash: fighter.hitFlash,
                    state: fighter.state,
                    dashTimer: fighter.dashTimer,
                    stateTimer: fighter.stateTimer,
                    currentAttackType: fighter.currentAttackType,
                    vx: fighter.vx,
                    vy: fighter.vy,
                    grounded: fighter.grounded
                },
                spriteInfo,
                pose,
                screenX,
                screenY,
            });
            if (handledByPixi) {
                if (pose && typeof pose.overlay === 'function' && !pixiCanHandlePoseFx) {
                    pose.overlay(ctx, poseInfo);
                }
                return;
            }
        }

        if (pose && typeof pose.underlay === 'function' && pixiCanHandlePoseFx) {
            pose.underlay(ctx, poseInfo);
        }

        ctx.save();
        ctx.translate(screenX, screenY);

        // Flip if facing left
        if (!fighter.facingRight) {
            ctx.scale(-1, 1);
        }

        if (pose) {
            const offsetX = Number.isFinite(pose.offsetX) ? pose.offsetX : 0;
            const offsetY = Number.isFinite(pose.offsetY) ? pose.offsetY : 0;
            const rotation = Number.isFinite(pose.rotation) ? pose.rotation : 0;
            const scaleX = Number.isFinite(pose.scaleX) ? pose.scaleX : 1;
            const scaleY = Number.isFinite(pose.scaleY) ? pose.scaleY : 1;
            const alpha = Number.isFinite(pose.alpha) ? pose.alpha : 1;

            if (offsetX || offsetY) {
                ctx.translate(offsetX * poseInfo.zoom, offsetY * poseInfo.zoom);
            }
            if (rotation) ctx.rotate(rotation);
            if (scaleX !== 1 || scaleY !== 1) ctx.scale(scaleX, scaleY);
            if (alpha !== 1) ctx.globalAlpha *= alpha;
        }

        // Draw sprite if loaded
        if (spriteInfo.kind === 'direct') {
            ctx.drawImage(
                spriteInfo.entry.image,
                -spriteInfo.drawW / 2,
                -spriteInfo.drawH,
                spriteInfo.drawW,
                spriteInfo.drawH,
            );
        } else {
            const spriteReady = fighter.spriteSheet
                && fighter.spriteSheet.width > 0
                && fighter.spriteSheet.height > 0
                && fighter.spriteSheet.complete !== false;

            if (spriteReady) {
                if (fighter.useFullSprite) {
                    ctx.drawImage(
                        fighter.spriteSheet,
                        -spriteInfo.drawW / 2,
                        -spriteInfo.drawH,
                        spriteInfo.drawW,
                        spriteInfo.drawH,
                    );
                } else {
                    ctx.drawImage(
                        fighter.spriteSheet,
                        spriteInfo.frame.x,
                        spriteInfo.frame.y,
                        fighter.frameWidth,
                        fighter.frameHeight,
                        -spriteInfo.drawW / 2,
                        -spriteInfo.drawH,
                        spriteInfo.drawW,
                        spriteInfo.drawH,
                    );
                }

                // Hit flash white overlay
                if (fighter.hitFlash > 0) {
                    ctx.save();
                    ctx.globalAlpha = 0.55;
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-spriteInfo.drawW / 2, -spriteInfo.drawH, spriteInfo.drawW, spriteInfo.drawH);
                    ctx.restore();
                }
            } else {
                // Placeholder character
                this._drawPlaceholderFighter(ctx, fighter, camera.zoom);
            }
        }

        ctx.restore();

        if (pose && typeof pose.overlay === 'function') {
            pose.overlay(ctx, poseInfo);
        }
    }

    _drawPlaceholderFighter(ctx, fighter, zoom) {
        const w = fighter.width * zoom * 1.5;
        const h = fighter.height * zoom * 1.5;
        const color = fighter.color || '#FF6B00';

        ctx.fillStyle = color;
        ctx.fillRect(-w / 2, -h, w, h);

        const headR = w * 0.35;
        ctx.beginPath();
        ctx.arc(0, -h - headR * 0.6, headR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.fillRect(-headR * 0.4, -h - headR * 0.8, headR * 0.25, headR * 0.2);
        ctx.fillRect(headR * 0.15, -h - headR * 0.8, headR * 0.25, headR * 0.2);

        if (fighter.hitFlash > 0) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = '#fff';
            ctx.fillRect(-w / 2, -h, w, h);
            ctx.beginPath();
            ctx.arc(0, -h - headR * 0.6, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(6, 9 * zoom)}px "Press Start 2P"`;
        ctx.textAlign = 'center';
        ctx.fillText(fighter.name, 0, -h - headR * 1.4);
    }

    drawProjectile(projectile, camera) {
        projectile = this._getProjectileWithResolvedVisual(projectile, true);
        const ctx = this.ctx;
        const shake = camera.getShakeOffset();
        const drawX = Number.isFinite(projectile.renderX) ? projectile.renderX : projectile.x;
        const drawY = Number.isFinite(projectile.renderY) ? projectile.renderY : projectile.y;
        if (!Number.isFinite(drawX) || !Number.isFinite(drawY)) return;
        const screenX = this._worldToScreenX(drawX, camera) + shake.x;
        const screenY = this._worldToScreenY(drawY, camera) + shake.y;
        if (this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawProjectile === 'function') {
            const handledByPixi = this.pixiCharacterLayer.drawProjectile({
                projectile,
                screenX,
                screenY,
                zoom: camera.zoom,
            });
            if (handledByPixi) {
                return;
            }
        }
        // No rotation — projectiles fly straight; flip for direction
        const facingLeft = (projectile.vx || 0) < 0;

        if (projectile.imagePath) {
            const entry = this._getProjectileImage(projectile.imagePath);
            if (entry && entry.loaded && entry.image.width > 0 && entry.image.height > 0) {
                const img = entry.image;
                const baseScale = projectile.imageScale || 1;
                const dw = img.width * baseScale * camera.zoom;
                const dh = img.height * baseScale * camera.zoom;
                const offsetY = projectile.imageOffsetY || 0;

                ctx.save();
                ctx.translate(screenX, screenY);
                if (facingLeft) ctx.scale(-1, 1);
                ctx.drawImage(img, -dw / 2, -dh / 2 - offsetY, dw, dh);
                ctx.restore();
                return;
            }
        }

        if (Array.isArray(projectile.imageFrames) && projectile.imageFrames.length) {
            const frames = projectile.imageFrames;
            const maxLife = Math.max(1, projectile.maxLife || projectile.life || 1);
            const progress = 1 - Math.max(0, Math.min(1, (projectile.life || 0) / maxLife));
            const idx = Math.min(frames.length - 1, Math.floor(progress * frames.length));
            const framePath = frames[idx];
            const entry = this._getProjectileImage(framePath);
            if (entry && entry.loaded && entry.image.width > 0 && entry.image.height > 0) {
                const img = entry.image;
                const baseScale = projectile.imageScale || 1;
                const dw = img.width * baseScale * camera.zoom;
                const dh = img.height * baseScale * camera.zoom;
                const offsetY = projectile.imageOffsetY || 0;

                ctx.save();
                ctx.translate(screenX, screenY);
                if (facingLeft) ctx.scale(-1, 1);
                ctx.drawImage(img, -dw / 2, -dh / 2 - offsetY, dw, dh);
                ctx.restore();
                return;
            }
        }

        if (projectile.spriteConfig && projectile.owner && projectile.owner.spriteSheet) {
            console.log('PROJECTILE RENDER BUG:', projectile);
            window.buggyP = projectile;
            const anim = projectile.owner.animations[projectile.spriteConfig.state];
            if (anim) {
                const fCount = anim.frames || 1;
                const d = projectile.maxLife || projectile.life || 1;
                const progress = projectile.life / d;

                let frameIdx = 0;
                if (projectile.spriteConfig.animateByLife) {
                    frameIdx = Math.min(fCount - 1, Math.max(0, Math.floor((1 - progress) * fCount)));
                } else {
                    const t = d - projectile.life;
                    frameIdx = Math.floor(t / (anim.speed || 8)) % fCount;
                }

                const sx = frameIdx * projectile.owner.frameWidth;
                const sy = anim.row * projectile.owner.frameHeight;
                const scale = projectile.spriteConfig.scale || 1.0;
                const dScale = projectile.owner.displayScale * camera.zoom * scale;
                const sw = projectile.owner.frameWidth;
                const sh = projectile.owner.frameHeight;
                const dw = sw * dScale;
                const dh = sh * dScale;

                ctx.save();
                ctx.translate(screenX, screenY);
                if (projectile.vx < 0 && projectile.spriteConfig.flipOnReverse !== false) {
                    ctx.scale(-1, 1);
                }

                ctx.globalAlpha = projectile.spriteConfig.alpha || 1.0;
                ctx.drawImage(
                    projectile.owner.spriteSheet,
                    sx, sy, sw, sh,
                    -dw / 2, -dh / 2 - (projectile.spriteConfig.offsetY || 0), dw, dh
                );
                ctx.restore();
                return;
            }
        }
    }

    // Draw hit effects / particles
    drawParticle(particle, camera) {
        const shake = camera?.getShakeOffset ? camera.getShakeOffset() : { x: 0, y: 0 };
        const screenX = this._worldToScreenX(particle.x, camera) + shake.x;
        const screenY = this._worldToScreenY(particle.y, camera) + shake.y;
        if (this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawParticle === 'function') {
            const handledByPixi = this.pixiCharacterLayer.drawParticle({
                particle,
                screenX,
                screenY,
                zoom: camera.zoom,
            });
            if (handledByPixi) {
                return true;
            }
        }

        const ctx = this.ctx;

        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, particle.radius * camera.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
    }

    // Draw combo / special text
    drawComboText(text, x, y, camera) {
        const screenX = this._worldToScreenX(x, camera);
        const screenY = this._worldToScreenY(y, camera);
        if (this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawCombatText === 'function') {
            const handledByPixi = this.pixiCharacterLayer.drawCombatText({
                id: `special-label:${text}:${Math.round(screenX)}:${Math.round(screenY)}`,
                text,
                screenX,
                screenY,
                alpha: 1,
                size: Math.max(8, 12 * camera.zoom),
                scale: 1,
                color: '#FFD93D',
                align: 'center',
                style: 'special',
                screenSpace: true,
                zIndex: 10950,
            });
            if (handledByPixi) {
                return true;
            }
        }

        const ctx = this.ctx;
        const fontSize = Math.max(8, 12 * camera.zoom);
        ctx.font = `${fontSize}px "Press Start 2P"`;
        ctx.fillStyle = '#FFD93D';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(text, screenX, screenY);
        ctx.fillText(text, screenX, screenY);
        return true;
    }

    drawComboCounter(side, comboState) {
        if (!(this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawCombatText === 'function')) {
            return false;
        }

        const count = comboState?.isActive ? comboState.count : (comboState?.displayTimer > 0 ? comboState.maxCount : 0);
        const damage = comboState?.isActive ? comboState.damage : (comboState?.displayTimer > 0 ? comboState.maxDamage : 0);
        if (count < 2) return false;

        const isLeft = side === 'p1';
        const alpha = comboState?.isActive ? 1 : Math.min(1, comboState.displayTimer / 30);
        const x = isLeft ? 30 : this.gameWidth - 30;
        const y = 120;
        const align = isLeft ? 'left' : 'right';
        const fontSize = Math.min(28, 18 + count);
        let comboColor = '#FFF';
        if (count >= 15) comboColor = '#FFD700';
        else if (count >= 10) comboColor = '#FF1744';
        else if (count >= 7) comboColor = '#FF9800';
        else if (count >= 5) comboColor = '#2196F3';
        else if (count >= 3) comboColor = '#4CAF50';

        const baseId = `combo-counter:${side}`;
        const countHandled = this.pixiCharacterLayer.drawCombatText({
            id: `${baseId}:count`,
            text: `${count}`,
            screenX: x,
            screenY: y,
            alpha,
            size: fontSize,
            scale: 1,
            color: comboColor,
            align,
            style: 'combo',
            screenSpace: true,
            zIndex: 11800,
        });
        this.pixiCharacterLayer.drawCombatText({
            id: `${baseId}:hits`,
            text: 'HITS',
            screenX: x,
            screenY: y + 16,
            alpha,
            size: 10,
            scale: 1,
            color: '#AAAAAA',
            align,
            style: 'popup',
            screenSpace: true,
            zIndex: 11800,
        });
        this.pixiCharacterLayer.drawCombatText({
            id: `${baseId}:dmg`,
            text: `${damage} DMG`,
            screenX: x,
            screenY: y + 30,
            alpha,
            size: 11,
            scale: 1,
            color: '#FF8A80',
            align,
            style: 'popup',
            screenSpace: true,
            zIndex: 11800,
        });
        if (comboState?.isActive && Number.isFinite(comboState.scalePercent) && count >= 3) {
            this.pixiCharacterLayer.drawCombatText({
                id: `${baseId}:scale`,
                text: `${comboState.scalePercent}%`,
                screenX: x,
                screenY: y + 42,
                alpha: alpha * 0.6,
                size: 9,
                scale: 1,
                color: comboState.scalePercent <= 50 ? '#FF5252' : '#FFFFFF',
                align,
                style: 'popup',
                screenSpace: true,
                zIndex: 11800,
            });
        }
        return !!countHandled;
    }

    drawFloatingText(popup, camera) {
        if (!(this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawCombatText === 'function')) {
            return false;
        }

        const screenX = this._worldToScreenX(popup.x, camera);
        const screenY = this._worldToScreenY(popup.y, camera);
        return !!this.pixiCharacterLayer.drawCombatText({
            source: popup,
            text: popup.text,
            subtext: popup.subtext,
            screenX,
            screenY,
            alpha: popup.alpha,
            size: popup.size,
            scale: popup.scale,
            color: popup.color,
            align: 'center',
            style: popup.type === 'combo' ? 'combo' : 'popup',
            screenSpace: true,
            zIndex: 10800,
        });
    }

    drawAnnouncerText(announcer) {
        if (!(this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawCombatText === 'function')) {
            return false;
        }
        const progress = Math.min(1, Number(announcer.scale) || 1);
        const eased = progress === 0
            ? 0.2
            : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
        return !!this.pixiCharacterLayer.drawCombatText({
            id: 'announcer',
            text: announcer.text,
            screenX: this.gameWidth / 2,
            screenY: this.gameHeight * 0.35,
            alpha: Math.min(1, announcer.timer / 15),
            size: announcer.text.length > 12 ? 22 : 28,
            scale: Math.max(0.2, eased),
            color: announcer.color,
            align: 'center',
            style: 'announcer',
            screenSpace: true,
            zIndex: 11950,
        });
    }

    drawRoundIndicators(p1Wins, p2Wins, maxRounds) {
        if (!(this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawRoundIndicators === 'function')) {
            return false;
        }
        return !!this.pixiCharacterLayer.drawRoundIndicators({
            p1Wins,
            p2Wins,
            maxRounds,
            gameWidth: this.gameWidth,
        });
    }

    drawTrainingHud(payload) {
        if (!(this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawTrainingHud === 'function')) {
            return false;
        }
        return !!this.pixiCharacterLayer.drawTrainingHud({
            gameWidth: this.gameWidth,
            gameHeight: this.gameHeight,
            ...payload,
        });
    }

    drawControlsOverlay(lines) {
        if (!(this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawControlsOverlay === 'function')) {
            return false;
        }
        return !!this.pixiCharacterLayer.drawControlsOverlay({
            gameWidth: this.gameWidth,
            lines: Array.isArray(lines) ? lines : [],
        });
    }

    drawFpsCounter(fps) {
        if (!(this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawFpsCounter === 'function')) {
            return false;
        }
        return !!this.pixiCharacterLayer.drawFpsCounter({
            gameWidth: this.gameWidth,
            fps,
        });
    }

    drawSlowMotionFrame() {
        if (!(this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawSlowMotionFrame === 'function')) {
            return false;
        }
        return !!this.pixiCharacterLayer.drawSlowMotionFrame({
            gameWidth: this.gameWidth,
            gameHeight: this.gameHeight,
        });
    }

    drawCinematicBars(height) {
        if (!(this.pixiCharacterLayer && typeof this.pixiCharacterLayer.drawCinematicBars === 'function')) {
            return false;
        }
        return !!this.pixiCharacterLayer.drawCinematicBars({
            gameWidth: this.gameWidth,
            gameHeight: this.gameHeight,
            height,
        });
    }

    _drawWorldRect(rect, camera, strokeStyle, fillStyle = null, lineWidth = 1) {
        if (!rect) return;
        const ctx = this.ctx;
        const x = this._worldToScreenX(rect.x, camera);
        const y = this._worldToScreenY(rect.y, camera);
        const w = rect.w * camera.zoom;
        const h = rect.h * camera.zoom;

        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fillRect(x, y, w, h);
        }
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x, y, w, h);
    }

    _collectBufferedActions(fighter) {
        if (!fighter?.inputBuffer) return '-';
        const active = Object.entries(fighter.inputBuffer)
            .filter(([, value]) => Number(value) > 0)
            .map(([name]) => name);
        return active.length ? active.join(',') : '-';
    }

    drawTrainingOverlay({
        fighter1,
        fighter2,
        projectiles = [],
        camera,
        gameState = 'FIGHTING',
        hitstopTimer = 0,
    }) {
        if (!fighter1 || !fighter2 || !camera || typeof CollisionSystem === 'undefined') return;
        const ctx = this.ctx;

        const drawFighterDebug = (fighter, label, palette) => {
            const hurtbox = CollisionSystem.getHurtbox(fighter);
            const hitbox = CollisionSystem.getAttackHitbox(fighter);
            this._drawWorldRect(hurtbox, camera, palette.hurtStroke, palette.hurtFill, 1);
            if (hitbox) this._drawWorldRect(hitbox, camera, palette.hitStroke, palette.hitFill, 2);

            const anim = fighter.animations?.[fighter.state] || fighter.animations?.IDLE || { frames: 1 };
            const textX = label === 'P1' ? 8 : this.gameWidth - 324;
            const textY = label === 'P1' ? 52 : 106;
            const stateLine = `${label} ${fighter.state} F:${fighter.animFrame + 1}/${Math.max(1, anim.frames || 1)} T:${Math.max(0, fighter.stateTimer).toFixed(1)}`;
            const stunLine = `HS:${Math.max(0, fighter.hitstunTimer || 0).toFixed(1)} BS:${Math.max(0, fighter.blockstunTimer || 0).toFixed(1)} BUF:${this._collectBufferedActions(fighter)}`;

            ctx.fillStyle = palette.text;
            ctx.fillText(stateLine, textX, textY);
            ctx.fillText(stunLine, textX, textY + 10);
        };

        ctx.save();
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Header panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
        ctx.fillRect(6, 6, 358, 40);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(6, 6, 358, 40);
        ctx.fillStyle = '#FFD93D';
        ctx.fillText('TRAINING ON (V / F2)', 14, 14);
        ctx.fillStyle = '#ECEFF1';
        ctx.fillText(`STATE:${gameState}  HITSTOP:${Math.max(0, hitstopTimer).toFixed(1)}  PROJ:${projectiles.length}`, 14, 25);

        drawFighterDebug(fighter1, 'P1', {
            hurtStroke: '#1DE9B6',
            hurtFill: 'rgba(29, 233, 182, 0.08)',
            hitStroke: '#FFAB40',
            hitFill: 'rgba(255, 171, 64, 0.12)',
            text: '#80D8FF',
        });
        drawFighterDebug(fighter2, 'P2', {
            hurtStroke: '#82B1FF',
            hurtFill: 'rgba(130, 177, 255, 0.08)',
            hitStroke: '#FF5252',
            hitFill: 'rgba(255, 82, 82, 0.12)',
            text: '#FF8A80',
        });

        // Projectile hitboxes
        projectiles.forEach((projectile) => {
            const box = CollisionSystem.getProjectileHitbox(projectile);
            this._drawWorldRect(box, camera, '#ECEFF1', 'rgba(236, 239, 241, 0.08)', 1);
        });

        ctx.restore();
    }
}
