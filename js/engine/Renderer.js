/* ============================================
   RENDERER — Canvas 2D Rendering Engine
   ============================================ */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.backgroundCache = new Map();
        this.projectileImageCache = new Map();
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

    clear() {
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    }

    // Draw a stage background
    drawBackground(stage, camera) {
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
                const dScale = fighter.displayScale * zoom;
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

        const dScale = fighter.displayScale * zoom;
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

        if (pose && typeof pose.underlay === 'function') {
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
        const ctx = this.ctx;
        const screenX = this._worldToScreenX(particle.x, camera);
        const screenY = this._worldToScreenY(particle.y, camera);

        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, particle.radius * camera.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Draw combo / special text
    drawComboText(text, x, y, camera) {
        const ctx = this.ctx;
        const screenX = this._worldToScreenX(x, camera);
        const screenY = this._worldToScreenY(y, camera);

        const fontSize = Math.max(8, 12 * camera.zoom);
        ctx.font = `${fontSize}px "Press Start 2P"`;
        ctx.fillStyle = '#FFD93D';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(text, screenX, screenY);
        ctx.fillText(text, screenX, screenY);
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
