/* ============================================
   CAMERA SYSTEM
   ============================================ */

class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // World horizontal scroll
        this.x = 0;
        this.zoom = 1;
        this.targetZoom = 1;

        // Ground is always drawn at this fixed screen pixel row (70% down by default)
        this.groundScreenY = canvasHeight * 0.72;

        // World groundY — set before first use
        this.groundY = 340;

        this.minZoom = 0.45;
        this.maxZoom = 1.1;
        this.smoothing = 0.18;

        // Frame-based shake system
        this._shakeIntensity = 0;
        this._shakeFrames = 0;
        this._shakeMaxFrames = 0;
    }

    setGroundY(worldGroundY) {
        this.groundY = worldGroundY;
    }

    setGroundScreenY(percent) {
        this.groundScreenY = this.canvasHeight * (percent || 0.72);
    }

    update(fighter1, fighter2, stageWidth, dtScale = 1) {
        // Midpoint X between fighters (for horizontal centering)
        const midX = (fighter1.x + fighter2.x) / 2;

        // Horizontal distance between fighters
        const dx = Math.abs(fighter1.x - fighter2.x);

        // Desired zoom: keep both fighters + padding in view horizontally
        const padding = 220;
        const desiredZoom = Math.min(
            this.maxZoom,
            Math.max(this.minZoom, this.canvasWidth / (dx + padding))
        );

        // Smooth zoom
        this.targetZoom = desiredZoom;
        const lerpFactor = 1 - Math.pow(1 - this.smoothing, dtScale);
        this.zoom += (this.targetZoom - this.zoom) * lerpFactor;

        // Target camera X: center of screen on midpoint
        const targetX = midX - (this.canvasWidth / 2) / this.zoom;

        // Smooth camera X
        this.x += (targetX - this.x) * lerpFactor;

        // Clamp horizontal to stage bounds
        const minX = 0;
        const maxX = Math.max(0, stageWidth - this.canvasWidth / this.zoom);
        if (this.x < minX) this.x = minX;
        if (this.x > maxX) this.x = maxX;

        // Decay shake timer (frame-based, respects dtScale)
        if (this._shakeFrames > 0) {
            this._shakeFrames = Math.max(0, this._shakeFrames - dtScale);
        }
    }

    shake(intensity = 5, durationFrames = 12) {
        // Only override if new shake is stronger
        if (intensity >= this._shakeIntensity || this._shakeFrames <= 0) {
            this._shakeIntensity = intensity;
            this._shakeFrames = durationFrames;
            this._shakeMaxFrames = durationFrames;
        }
    }

    getShakeOffset() {
        if (this._shakeFrames > 0 && this._shakeMaxFrames > 0) {
            // Ease out: shake decreases as frames run out
            const t = this._shakeFrames / this._shakeMaxFrames;
            const currentIntensity = this._shakeIntensity * t;
            return {
                x: (Math.random() - 0.5) * currentIntensity * 2,
                y: (Math.random() - 0.5) * currentIntensity * 2,
            };
        }
        return { x: 0, y: 0 };
    }
}
