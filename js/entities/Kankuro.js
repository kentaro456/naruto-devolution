/* ============================================
   KANKURO — Character Entity
   ============================================ */

class KankuroFighter extends Fighter {
  constructor(config) {
    super({
      name: 'KANKURO',
      color: '#795548',
      speed: 3.3,
      jumpPower: -10.8,
      attackPower: 12,
      defense: 1.15,
      maxHealth: 100,
      maxChakra: 105,
      chakraRegen: 0.12,
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
      name: 'Puppet Attack',
    };
  }

  getRenderPose(camera, _renderer, spriteInfo) {
    const state = String(this.state || 'IDLE');
    const bob = Math.sin(this._getLoopPhase(32) * Math.PI * 2);
    const sway = Math.sin(this._getLoopPhase(20) * Math.PI * 2);
    const attackProgress = this._getAttackProgress(20);
    const jab = this._getWindowPulse(attackProgress, 0.16, 0.74);
    const snap = this._getWindowPulse(attackProgress, 0.32, 0.64);
    const hitPulse = this._getStateProgress(10);
    const koPulse = this._getStateProgress(60);
    const puppetState = state.startsWith('ATTACK') || state === 'RUN_ATTACK' || state === 'THROW' || state === 'SPECIAL' || state === 'SPECIAL_TRANSFORM';

    let offsetX = 0;
    let offsetY = 0;
    let rotation = 0;
    let scaleX = 1;
    let scaleY = 1;
    let stringReach = 0;
    let puppetScale = 0;

    if (state === 'IDLE') {
      offsetY = -1.8 * Math.abs(bob);
      rotation = sway * 0.018;
      scaleX = 1 + Math.abs(bob) * 0.01;
      scaleY = 1 - Math.abs(bob) * 0.014;
      stringReach = 0.15;
    } else if (state === 'WALK' || state === 'RUN') {
      const stride = Math.sin(this._getLoopPhase(state === 'RUN' ? 14 : 20) * Math.PI * 2);
      offsetX = stride * 2.4;
      offsetY = -2.4 * Math.abs(stride);
      rotation = stride * 0.055;
      scaleX = 1 + Math.abs(stride) * 0.025;
      scaleY = 1 - Math.abs(stride) * 0.03;
      stringReach = 0.22 + Math.abs(stride) * 0.1;
    } else if (state === 'JUMP') {
      const rising = (this.vy || 0) < 0;
      offsetY = rising ? -6 : -1;
      rotation = rising ? -0.06 : 0.07;
      scaleX = rising ? 0.99 : 1.03;
      scaleY = rising ? 1.04 : 0.95;
      stringReach = 0.18;
    } else if (state === 'BLOCK') {
      offsetX = -2;
      offsetY = -1;
      rotation = -0.08;
      scaleX = 1.02;
      scaleY = 0.97;
      stringReach = 0.28;
    } else if (state === 'HIT') {
      offsetX = -7 * hitPulse;
      rotation = -0.16 * hitPulse;
      offsetY = -1.2 * hitPulse;
    } else if (state === 'KO') {
      offsetX = -10 * koPulse;
      offsetY = 1.5 * koPulse;
      rotation = -1.05 * koPulse;
      scaleX = 1 + koPulse * 0.05;
      scaleY = 1 - koPulse * 0.08;
    } else if (state.startsWith('ATTACK_LIGHT')) {
      offsetX = -2.5 * (1 - jab) + snap * 10;
      offsetY = -2 * jab;
      rotation = -0.1 * jab + 0.14 * snap;
      scaleX = 1 - jab * 0.02 + snap * 0.08;
      scaleY = 1 + jab * 0.03 - snap * 0.06;
      stringReach = 0.38 + snap * 0.22;
      puppetScale = 0.26 + snap * 0.16;
    } else if (state.startsWith('ATTACK_HEAVY') || state === 'RUN_ATTACK' || state === 'THROW') {
      offsetX = -4.5 * (1 - jab) + snap * 14;
      offsetY = -2.8 * jab - 1.5 * snap;
      rotation = -0.16 * jab + 0.18 * snap;
      scaleX = 1 - jab * 0.02 + snap * 0.1;
      scaleY = 1 + jab * 0.04 - snap * 0.08;
      stringReach = 0.5 + snap * 0.28;
      puppetScale = 0.34 + snap * 0.22;
    } else if (state === 'SPECIAL' || state === 'SPECIAL_TRANSFORM') {
      const charge = this._getWindowPulse(attackProgress, 0.05, 0.4);
      const command = this._getWindowPulse(attackProgress, 0.3, 0.88);
      offsetX = -3 * charge + command * 8;
      offsetY = -3.5 * charge - 1.5 * command;
      rotation = -0.08 * charge + 0.1 * command;
      scaleX = 1 - charge * 0.02 + command * 0.06;
      scaleY = 1 + charge * 0.04 - command * 0.05;
      stringReach = 0.62 + command * 0.4;
      puppetScale = 0.52 + command * 0.34;
    }

    return {
      offsetX,
      offsetY,
      rotation,
      scaleX,
      scaleY,
      underlay: (ctx, info) => {
        this._renderPuppetShadow(ctx, info, 0.74 + stringReach * 0.12);
        if (stringReach > 0.08) this._renderChakraStrings(ctx, info, stringReach, puppetScale, puppetState);
      },
      overlay: (ctx, info) => {
        if (puppetScale > 0.04) this._renderPuppetProxy(ctx, info, stringReach, puppetScale, state === 'SPECIAL' || state === 'SPECIAL_TRANSFORM');
      },
    };
  }

  _renderPuppetShadow(ctx, info, intensity = 0.8) {
    ctx.save();
    ctx.fillStyle = `rgba(24, 18, 16, ${0.16 + intensity * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(info.screenX, info.screenY - 4 * info.zoom, (18 + intensity * 8) * info.zoom, (5 + intensity * 2) * info.zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _renderChakraStrings(ctx, info, reach = 0.4, puppetScale = 0.2, puppetState = false) {
    const dir = info.dir;
    const handX = info.screenX + dir * 18 * info.zoom;
    const handY = info.screenY - 52 * info.zoom;
    const puppetX = info.screenX + dir * (36 + reach * 38) * info.zoom;
    const puppetY = info.screenY - (44 + Math.sin(this._getLoopPhase(18) * Math.PI * 2) * 5) * info.zoom;

    ctx.save();
    ctx.strokeStyle = `rgba(147, 207, 255, ${0.18 + reach * 0.18})`;
    ctx.lineWidth = Math.max(1, 1.2 * info.zoom);
    for (let i = -1; i <= 1; i++) {
      const controlX = handX + dir * (10 + reach * 14) * info.zoom;
      const controlY = handY - (6 + Math.abs(i) * 6) * info.zoom;
      ctx.beginPath();
      ctx.moveTo(handX, handY + i * 5 * info.zoom);
      ctx.quadraticCurveTo(controlX, controlY, puppetX, puppetY + i * 7 * info.zoom);
      ctx.stroke();
    }
    if (puppetState) {
      ctx.fillStyle = `rgba(147, 207, 255, ${0.08 + puppetScale * 0.08})`;
      ctx.beginPath();
      ctx.arc(handX, handY, (3 + reach * 2) * info.zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _renderPuppetProxy(ctx, info, reach = 0.5, puppetScale = 0.35, specialState = false) {
    const dir = info.dir;
    const bob = Math.sin(this._getLoopPhase(22) * Math.PI * 2);
    const puppetX = info.screenX + dir * (38 + reach * 40) * info.zoom;
    const puppetY = info.screenY - (44 + bob * 5) * info.zoom;
    const scale = Math.max(0.18, puppetScale) * info.zoom;

    ctx.save();
    ctx.translate(puppetX, puppetY);
    ctx.rotate(dir * (0.08 + bob * 0.04));

    ctx.fillStyle = `rgba(40, 30, 22, ${specialState ? 0.42 : 0.28})`;
    ctx.fillRect(-10 * scale, -18 * scale, 20 * scale, 28 * scale);
    ctx.fillRect(-3 * scale, 10 * scale, 6 * scale, 10 * scale);
    ctx.fillRect(-16 * scale, -8 * scale, 32 * scale, 4 * scale);

    ctx.fillStyle = `rgba(196, 80, 80, ${specialState ? 0.7 : 0.52})`;
    ctx.beginPath();
    ctx.arc(0, -6 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();

    if (specialState) {
      ctx.strokeStyle = 'rgba(255, 212, 170, 0.42)';
      ctx.lineWidth = Math.max(1, 1.3 * info.zoom);
      ctx.beginPath();
      ctx.moveTo(-10 * scale, -18 * scale);
      ctx.lineTo(10 * scale, 10 * scale);
      ctx.moveTo(10 * scale, -18 * scale);
      ctx.lineTo(-10 * scale, 10 * scale);
      ctx.stroke();
    }
    ctx.restore();
  }
}
