/* ============================================
   KIMIMARO — Character Entity
   ============================================ */

class KimimaroFighter extends Fighter {
  constructor(config) {
    super({
      name: 'KIMIMARO',
      color: '#B0BEC5',
      speed: 3.8,
      jumpPower: -11.5,
      attackPower: 15,
      defense: 1.1,
      maxHealth: 110,
      maxChakra: 100,
      chakraRegen: 0.12,
      ...config,
    });

    this.isCS2 = false;
    this.transformPending = false;
    this.transformCost = config?.transformCost || 35;
    this.transformDuration = config?.transformDuration || 44;

    this.attacks = {
      light: {
        damage: 10,
        range: 42,
        hitHeight: 32,
        duration: 13,
        chakraCost: 0,
        knockback: 3.3,
        offsetY: -10,
      },
      heavy: {
        damage: 18,
        range: 52,
        hitHeight: 36,
        duration: 23,
        chakraCost: 0,
        knockback: 6.6,
        offsetY: -8,
      },
      special: {
        damage: 28,
        range: 80,
        hitHeight: 44,
        duration: 42,
        chakraCost: 34,
        knockback: 11,
        offsetY: -12,
        moveSpeed: 1.2,
        name: 'BRACKEN DANCE',
      },
    };

    this.baseStats = {
      speed: this.speed,
      defense: this.defense,
      lightDamage: this.attacks.light.damage,
      heavyDamage: this.attacks.heavy.damage,
      specialDamage: this.attacks.special.damage,
      specialRange: this.attacks.special.range,
    };

    this.specialStyles = {
      ...this.specialStyles,
      a: {
        name: 'BRACKEN DANCE',
        state: 'SPECIAL',
        profileOverrides: {
          duration: 44,
          damageMultiplier: 1.2,
          rangeMultiplier: 1.15,
          knockbackMultiplier: 1.2,
          moveSpeed: 1.3,
        },
      },
      s1: {
        name: 'LARCH DANCE',
        state: 'ATTACK_HEAVY_2',
        profileOverrides: {
          duration: 34,
          damageMultiplier: 1.2,
          rangeMultiplier: 1.12,
          knockbackMultiplier: 1.2,
          moveSpeed: 1.8,
        },
      },
      s2: {
        name: 'BONE RUSH',
        state: 'RUN_ATTACK',
        profileOverrides: {
          duration: 24,
          damageMultiplier: 1.0,
          rangeMultiplier: 1.0,
          knockbackMultiplier: 0.95,
          moveSpeed: 4.3,
        },
      },
      s3: {
        name: 'SPINE SPEAR',
        state: 'ATTACK_HEAVY_1',
        profileOverrides: {
          duration: 30,
          damageMultiplier: 1.25,
          rangeMultiplier: 1.2,
          knockbackMultiplier: 1.3,
          moveSpeed: 0.9,
        },
      },
      s4: {
        name: 'CS2 BURST',
        state: 'SPECIAL',
        profileOverrides: {
          duration: 52,
          damageMultiplier: 1.45,
          rangeMultiplier: 1.25,
          knockbackMultiplier: 1.5,
          moveSpeed: 0.8,
        },
      },
    };
  }

  _stateForCurrentForm(state) {
    if (!this.isCS2) return state;
    const map = {
      IDLE: 'CS2_IDLE',
      WALK: 'CS2_RUN',
      RUN: 'CS2_RUN',
      JUMP: 'CS2_JUMP',
      HIT: 'CS2_HIT',
      KO: 'CS2_KO',
      ATTACK_LIGHT_1: 'CS2_ATTACK_LIGHT_1',
      ATTACK_LIGHT_2: 'CS2_ATTACK_LIGHT_2',
      ATTACK_LIGHT_3: 'CS2_ATTACK_HEAVY_1',
      ATTACK_HEAVY_1: 'CS2_ATTACK_HEAVY_1',
      ATTACK_HEAVY_2: 'CS2_ATTACK_HEAVY_1',
      RUN_ATTACK: 'CS2_ATTACK_HEAVY_1',
      THROW: 'CS2_ATTACK_LIGHT_2',
      ATTACK_LIGHT: 'CS2_ATTACK_LIGHT_1',
      ATTACK_HEAVY: 'CS2_ATTACK_HEAVY_1',
      SPECIAL: 'CS2_SPECIAL',
    };
    const mapped = map[state] || state;
    if (this.animations && this.animations[mapped]) return mapped;
    return state;
  }

  _setState(nextState) {
    super._setState(this._stateForCurrentForm(nextState));
  }

  _applyKimimaroForm(cs2, { force = false } = {}) {
    const next = !!cs2;
    if (!force && this.isCS2 === next) return;
    this.isCS2 = next;

    if (this.isCS2) {
      this.color = '#D0D8E5';
      this.speed = this.baseStats.speed * 1.22;
      this.defense = this.baseStats.defense * 1.15;
      this.attacks.light.damage = Math.round(this.baseStats.lightDamage * 1.25);
      this.attacks.heavy.damage = Math.round(this.baseStats.heavyDamage * 1.25);
      this.attacks.special.damage = Math.round(this.baseStats.specialDamage * 1.3);
      this.attacks.special.range = Math.round(this.baseStats.specialRange * 1.12);
    } else {
      this.color = '#B0BEC5';
      this.speed = this.baseStats.speed;
      this.defense = this.baseStats.defense;
      this.attacks.light.damage = this.baseStats.lightDamage;
      this.attacks.heavy.damage = this.baseStats.heavyDamage;
      this.attacks.special.damage = this.baseStats.specialDamage;
      this.attacks.special.range = this.baseStats.specialRange;
    }
  }

  _canStartTransform() {
    if (this.isCS2) return false;
    if (this.transformPending) return false;
    if (!this.grounded) return false;
    if (this.chakra < this.transformCost) return false;
    if (this.state === 'KO' || this.state === 'HIT' || this.state === 'BLOCK' || this.state === 'DASH') return false;
    if (this.isAttacking()) return false;
    return true;
  }

  _startTransform() {
    if (!this._canStartTransform()) return false;

    this.chakra = Math.max(0, this.chakra - this.transformCost);
    this.transformPending = true;
    this._setState('SPECIAL_TRANSFORM');
    this.currentAttackData = {
      damage: 0,
      range: 0,
      hitHeight: 0,
      duration: this.transformDuration,
      knockback: 0,
      offsetY: 0,
      noHit: true,
    };
    this.currentAttackType = 'special';
    this.currentAttackStep = 1;
    this.currentAttackTotalSteps = 1;
    this.currentAttackDuration = this.transformDuration;
    this.stateTimer = this.transformDuration;
    this.vx = 0;
    this.dashTimer = 0;
    this.attackHasHit = false;
    this.attackBuffer = null;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.currentComboNodeId = null;
    this.currentComboNode = null;
    this.lastAttackConnected = false;
    return true;
  }

  update(input, opponent, dtScale = 1) {
    if (this._hasBufferedAction('transform')) {
      if (this._startTransform()) this._consumeBufferedAction('transform');
    }

    super.update(input, opponent, dtScale);

    if (this.transformPending && (this.state === 'HIT' || this.state === 'KO')) {
      this.transformPending = false;
      return;
    }

    // Persist in CS2 form after the transform animation ends.
    if (this.transformPending && !this.isAttacking() && this.state !== 'HIT' && this.state !== 'KO') {
      this.transformPending = false;
      this._applyKimimaroForm(true);
      this._setState('IDLE');
      this.emitSound('kakashi_sharingan', 0.8);
    }
  }

  reset(x, facingRight) {
    super.reset(x, facingRight);
    this.transformPending = false;
    this._applyKimimaroForm(false, { force: true });
  }
}
