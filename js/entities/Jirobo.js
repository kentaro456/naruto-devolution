/* ============================================
   JIROBO — Character Entity
   ============================================ */

class JiroboFighter extends Fighter {
  constructor(config) {
    super({
      name: 'JIROBO',
      color: '#EF6C00',
      speed: 2.8,
      jumpPower: -9.5,
      attackPower: 16,
      defense: 1.5,
      maxHealth: 130,
      maxChakra: 90,
      chakraRegen: 0.1,
      ...config,
    });

    this.attacks.special = {
      ...this.attacks.special,
      damage: 28,
      range: 80,
      hitHeight: 44,
      duration: 42,
      chakraCost: 34,
      knockback: 11,
      name: 'Earth Dome Prison',
    };
  }

  getRenderPose(camera, _renderer, spriteInfo) {
    const state = String(this.state || 'IDLE');
    const bob = Math.sin(this._getLoopPhase(34) * Math.PI * 2);
    const pulse = Math.sin(this._getLoopPhase(18) * Math.PI * 2);
    const attackProgress = this._getAttackProgress(20);
    const attackSwing = this._getWindowPulse(attackProgress, 0.14, 0.82);
    const attackImpact = this._getWindowPulse(attackProgress, 0.36, 0.68);
    const hitPulse = this._getStateProgress(10);
    const koPulse = this._getStateProgress(60);
    const specialState = state === 'SPECIAL' || state === 'SPECIAL_TRANSFORM';

    let offsetX = 0;
    let offsetY = 0;
    let rotation = 0;
    let scaleX = 1;
    let scaleY = 1;
    let earthPulse = 0;

    if (state === 'IDLE') {
      offsetY = -2.5 * Math.abs(bob);
      rotation = bob * 0.02;
      scaleX = 1 + Math.abs(bob) * 0.015;
      scaleY = 1 - Math.abs(bob) * 0.02;
    } else if (state === 'WALK' || state === 'RUN') {
      const stride = Math.sin(this._getLoopPhase(state === 'RUN' ? 14 : 20) * Math.PI * 2);
      offsetX = stride * 2.8;
      offsetY = -3.8 * Math.abs(stride);
      rotation = stride * 0.05;
      scaleX = 1 + Math.abs(stride) * 0.04;
      scaleY = 1 - Math.abs(stride) * 0.05;
    } else if (state === 'JUMP') {
      const rising = (this.vy || 0) < 0;
      offsetY = rising ? -7 : -1;
      rotation = rising ? -0.08 : 0.08;
      scaleX = rising ? 0.98 : 1.04;
      scaleY = rising ? 1.05 : 0.95;
    } else if (state === 'BLOCK') {
      offsetX = -2;
      offsetY = -1.5;
      rotation = -0.06;
      scaleX = 1.05;
      scaleY = 0.96;
    } else if (state === 'HIT') {
      offsetX = -8 * hitPulse;
      rotation = -0.18 * hitPulse;
      offsetY = -1.5 * hitPulse;
      scaleX = 1 + hitPulse * 0.03;
      scaleY = 1 - hitPulse * 0.05;
    } else if (state === 'KO') {
      offsetX = -12 * koPulse;
      offsetY = 2 * koPulse;
      rotation = -1.1 * koPulse;
      scaleX = 1 + koPulse * 0.08;
      scaleY = 1 - koPulse * 0.1;
    } else if (state.startsWith('ATTACK_LIGHT')) {
      offsetX = -4 * (1 - attackSwing) + attackImpact * 13;
      offsetY = -2.2 * attackSwing - 1.6 * attackImpact;
      rotation = -0.12 * attackSwing + 0.16 * attackImpact;
      scaleX = 1 - attackSwing * 0.03 + attackImpact * 0.11;
      scaleY = 1 + attackSwing * 0.05 - attackImpact * 0.08;
      earthPulse = attackImpact * 0.55;
    } else if (state.startsWith('ATTACK_HEAVY') || state === 'RUN_ATTACK' || state === 'THROW') {
      offsetX = -6 * (1 - attackSwing) + attackImpact * 18;
      offsetY = -3 * attackSwing - 2.2 * attackImpact;
      rotation = -0.2 * attackSwing + 0.2 * attackImpact;
      scaleX = 1 - attackSwing * 0.04 + attackImpact * 0.16;
      scaleY = 1 + attackSwing * 0.08 - attackImpact * 0.12;
      earthPulse = attackImpact * 0.9;
    } else if (specialState) {
      const charge = this._getWindowPulse(attackProgress, 0.05, 0.38);
      const burst = this._getWindowPulse(attackProgress, 0.34, 0.9);
      offsetX = -3 * charge + burst * 14;
      offsetY = -4.5 * charge - 2 * burst;
      rotation = -0.1 * charge + 0.1 * burst;
      scaleX = 1 - charge * 0.03 + burst * 0.14;
      scaleY = 1 + charge * 0.08 - burst * 0.12;
      earthPulse = 0.35 + burst * 0.95;
    }

    return {
      offsetX,
      offsetY,
      rotation,
      scaleX,
      scaleY,
      pixiEffects: {
        kind: 'jirobo',
        earthPulse,
        specialState,
        strideIntensity: Math.abs(pulse) * (state === 'RUN' ? 0.85 : 0.45),
      },
      underlay: (ctx, info) => {
        this._renderGroundShadow(ctx, info, 0.8 + earthPulse * 0.35);
      },
      overlay: (ctx, info) => {
        if (earthPulse > 0.02) {
          this._renderEarthBurst(ctx, info, earthPulse, specialState);
        } else if (state === 'WALK' || state === 'RUN') {
          this._renderStrideDust(ctx, info, Math.abs(pulse) * (state === 'RUN' ? 0.85 : 0.45));
        }
      },
    };
  }

  _renderGroundShadow(ctx, info, intensity = 1) {
    const radiusX = (22 + intensity * 10) * info.zoom;
    const radiusY = (6 + intensity * 2.5) * info.zoom;
    ctx.save();
    ctx.fillStyle = `rgba(36, 20, 8, ${0.18 + intensity * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(info.screenX, info.screenY - 4 * info.zoom, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _renderStrideDust(ctx, info, intensity = 0.4) {
    if (intensity <= 0.03) return;
    const dir = info.dir;
    const baseX = info.screenX - dir * 8 * info.zoom;
    const baseY = info.screenY - 12 * info.zoom;
    ctx.save();
    ctx.fillStyle = `rgba(138, 93, 58, ${0.08 + intensity * 0.16})`;
    for (let i = 0; i < 3; i++) {
      const spread = (i - 1) * 9 * info.zoom;
      ctx.beginPath();
      ctx.ellipse(baseX + spread, baseY - i * 2 * info.zoom, (8 + intensity * 8 - i) * info.zoom, (3 + intensity * 3) * info.zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _renderEarthBurst(ctx, info, intensity = 0.6, specialState = false) {
    const dir = info.dir;
    const handX = info.screenX + dir * (28 + intensity * 10) * info.zoom;
    const handY = info.screenY - (52 + intensity * 4) * info.zoom;
    const groundY = info.screenY - 10 * info.zoom;

    ctx.save();
    ctx.strokeStyle = `rgba(255, 202, 138, ${0.24 + intensity * 0.28})`;
    ctx.lineWidth = Math.max(1.5, 2.5 * info.zoom);
    for (let i = 0; i < 3; i++) {
      const len = (18 + i * 9 + intensity * 18) * info.zoom;
      ctx.beginPath();
      ctx.moveTo(handX, handY + i * 2 * info.zoom);
      ctx.lineTo(handX + dir * len, handY - (6 + i * 4) * info.zoom);
      ctx.stroke();
    }

    ctx.fillStyle = `rgba(126, 83, 44, ${0.12 + intensity * 0.18})`;
    for (let i = 0; i < (specialState ? 6 : 4); i++) {
      const x = info.screenX + dir * (10 + i * 10) * info.zoom;
      const h = (10 + intensity * 14 + i * 1.5) * info.zoom;
      const w = (4 + intensity * 4) * info.zoom;
      ctx.save();
      ctx.translate(x, groundY);
      ctx.rotate((dir * (0.16 + i * 0.05)));
      ctx.fillRect(-w / 2, -h, w, h);
      ctx.restore();
    }

    ctx.fillStyle = `rgba(214, 154, 92, ${0.12 + intensity * 0.22})`;
    for (let i = 0; i < (specialState ? 5 : 3); i++) {
      ctx.beginPath();
      ctx.ellipse(
        info.screenX + (i - 2) * 14 * info.zoom,
        groundY - i * 2 * info.zoom,
        (8 + intensity * 14 - i) * info.zoom,
        (3 + intensity * 4) * info.zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }
}
