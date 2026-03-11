/* ============================================
   NEJI — Character Entity
   ============================================ */

class NejiFighter extends Fighter {
  constructor(config) {
    super({
      name: 'NEJI',
      color: '#B39DDB',
      speed: 3.7,
      jumpPower: -11.8,
      attackPower: 14,
      defense: 1.25,
      maxHealth: 105,
      maxChakra: 115,
      chakraRegen: 0.13,
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
      name: '8 Trigrams 64 Palms',
    };
  }

  getRenderPose(camera, _renderer, spriteInfo) {
    const state = String(this.state || 'IDLE');
    const bob = Math.sin(this._getLoopPhase(30) * Math.PI * 2);
    const glide = Math.sin(this._getLoopPhase(18) * Math.PI * 2);
    const attackProgress = this._getAttackProgress(18);
    const thrust = this._getWindowPulse(attackProgress, 0.12, 0.72);
    const palmBurst = this._getWindowPulse(attackProgress, 0.32, 0.62);
    const hitPulse = this._getStateProgress(10);
    const koPulse = this._getStateProgress(60);
    const specialState = state === 'SPECIAL' || state === 'SPECIAL_TRANSFORM';

    let offsetX = 0;
    let offsetY = 0;
    let rotation = 0;
    let scaleX = 1;
    let scaleY = 1;
    let auraPulse = 0;
    let ringPulse = 0;

    if (state === 'IDLE') {
      offsetY = -2 * Math.abs(bob);
      rotation = bob * 0.015;
      scaleX = 1 + Math.abs(bob) * 0.01;
      scaleY = 1 - Math.abs(bob) * 0.014;
      auraPulse = 0.12;
    } else if (state === 'WALK' || state === 'RUN') {
      offsetX = glide * 2.6;
      offsetY = -2.2 * Math.abs(glide);
      rotation = glide * 0.04;
      scaleX = 1 + Math.abs(glide) * 0.02;
      scaleY = 1 - Math.abs(glide) * 0.028;
      auraPulse = 0.18 + Math.abs(glide) * 0.12;
    } else if (state === 'JUMP') {
      const rising = (this.vy || 0) < 0;
      offsetY = rising ? -5.5 : -1;
      rotation = rising ? -0.05 : 0.06;
      scaleX = rising ? 0.99 : 1.03;
      scaleY = rising ? 1.03 : 0.95;
      auraPulse = 0.18;
    } else if (state === 'BLOCK') {
      offsetX = -1.2;
      offsetY = -1;
      rotation = -0.05;
      scaleX = 1.02;
      scaleY = 0.97;
      auraPulse = 0.28;
    } else if (state === 'HIT') {
      offsetX = -7 * hitPulse;
      rotation = -0.14 * hitPulse;
      offsetY = -1.4 * hitPulse;
    } else if (state === 'KO') {
      offsetX = -10 * koPulse;
      offsetY = 1.5 * koPulse;
      rotation = -1.05 * koPulse;
      scaleX = 1 + koPulse * 0.04;
      scaleY = 1 - koPulse * 0.08;
    } else if (state.startsWith('ATTACK_LIGHT')) {
      offsetX = -2.8 * (1 - thrust) + palmBurst * 10;
      offsetY = -1.4 * thrust - 1.2 * palmBurst;
      rotation = -0.08 * thrust + 0.12 * palmBurst;
      scaleX = 1 - thrust * 0.01 + palmBurst * 0.05;
      scaleY = 1 + thrust * 0.02 - palmBurst * 0.05;
      auraPulse = 0.35 + palmBurst * 0.28;
    } else if (state.startsWith('ATTACK_HEAVY') || state === 'RUN_ATTACK' || state === 'THROW') {
      offsetX = -4 * (1 - thrust) + palmBurst * 12;
      offsetY = -2.2 * thrust - 1.5 * palmBurst;
      rotation = -0.12 * thrust + 0.16 * palmBurst;
      scaleX = 1 - thrust * 0.01 + palmBurst * 0.06;
      scaleY = 1 + thrust * 0.03 - palmBurst * 0.06;
      auraPulse = 0.45 + palmBurst * 0.32;
      ringPulse = 0.18 + palmBurst * 0.24;
    } else if (specialState) {
      const charge = this._getWindowPulse(attackProgress, 0.05, 0.38);
      const bloom = this._getWindowPulse(attackProgress, 0.24, 0.88);
      offsetX = -2 * charge + bloom * 5;
      offsetY = -3.5 * charge - 1.5 * bloom;
      rotation = -0.04 * charge + 0.08 * bloom;
      scaleX = 1 - charge * 0.01 + bloom * 0.03;
      scaleY = 1 + charge * 0.03 - bloom * 0.04;
      auraPulse = 0.5 + bloom * 0.35;
      ringPulse = 0.32 + bloom * 0.5;
    }

    return {
      offsetX,
      offsetY,
      rotation,
      scaleX,
      scaleY,
      underlay: (ctx, info) => {
        this._renderTrigramBase(ctx, info, 0.18 + ringPulse * 0.32, specialState);
      },
      overlay: (ctx, info) => {
        if (auraPulse > 0.08) this._renderGentleFistAura(ctx, info, auraPulse, specialState || state.startsWith('ATTACK_HEAVY'));
      },
    };
  }

  _renderTrigramBase(ctx, info, intensity = 0.2, specialState = false) {
    if (intensity <= 0.02) return;
    const radius = (20 + intensity * 18) * info.zoom;
    const centerY = info.screenY - 34 * info.zoom;

    ctx.save();
    ctx.strokeStyle = `rgba(189, 210, 255, ${0.12 + intensity * 0.18})`;
    ctx.lineWidth = Math.max(1, 1.2 * info.zoom);
    ctx.beginPath();
    ctx.arc(info.screenX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(info.screenX, centerY, radius * 0.58, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + this._getLoopPhase(32) * 0.12;
      const x = info.screenX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(x, y, (1.4 + intensity * 1.4) * info.zoom, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(218, 228, 255, ${0.18 + intensity * 0.26})`;
      ctx.fill();
    }

    if (specialState) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + intensity * 0.16})`;
      ctx.beginPath();
      ctx.moveTo(info.screenX - radius, centerY);
      ctx.lineTo(info.screenX + radius, centerY);
      ctx.moveTo(info.screenX, centerY - radius);
      ctx.lineTo(info.screenX, centerY + radius);
      ctx.stroke();
    }
    ctx.restore();
  }

  _renderGentleFistAura(ctx, info, intensity = 0.3, heavyState = false) {
    const dir = info.dir;
    const handX = info.screenX + dir * 18 * info.zoom;
    const handY = info.screenY - 50 * info.zoom;
    const radius = (8 + intensity * 12) * info.zoom;

    ctx.save();
    const grad = ctx.createRadialGradient(handX, handY, radius * 0.2, handX, handY, radius * 1.8);
    grad.addColorStop(0, `rgba(250, 252, 255, ${0.2 + intensity * 0.34})`);
    grad.addColorStop(0.45, `rgba(170, 195, 255, ${0.12 + intensity * 0.2})`);
    grad.addColorStop(1, 'rgba(170, 195, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(handX, handY, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(226, 236, 255, ${0.18 + intensity * 0.26})`;
    ctx.lineWidth = Math.max(1, 1.3 * info.zoom);
    for (let i = 0; i < (heavyState ? 4 : 2); i++) {
      const sweep = 0.6 + i * 0.25;
      ctx.beginPath();
      ctx.arc(handX, handY, radius * (0.7 + i * 0.22), -dir * sweep, dir * sweep, dir < 0);
      ctx.stroke();
    }
    ctx.restore();
  }
}
