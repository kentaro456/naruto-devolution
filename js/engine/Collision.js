/* ============================================
   COLLISION DETECTION
   ============================================ */

class CollisionSystem {
    constructor() { }

    // Check AABB overlap between two rectangles
    static aabbOverlap(a, b) {
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        );
    }

    // Get the hitbox for a fighter's current attack
    static getAttackHitbox(fighter) {
        if (!fighter.isAttacking()) return null;

        const attackData = fighter.getCurrentAttackData();
        if (!attackData) return null;
        if (attackData.noHit) return null;
        if ((attackData.range || 0) <= 0 || (attackData.hitHeight || 0) <= 0) return null;
        if (typeof fighter.isAttackActiveFrame === 'function' && !fighter.isAttackActiveFrame(attackData)) return null;

        return {
            x: fighter.x + (fighter.facingRight ? fighter.width * 0.5 : -attackData.range),
            y: fighter.y - fighter.height * 0.5 + (attackData.offsetY || 0),
            w: attackData.range,
            h: attackData.hitHeight || fighter.height * 0.6,
        };
    }

    // Get the hurtbox (body) for a fighter
    static getHurtbox(fighter) {
        return {
            x: fighter.x - fighter.width * 0.3,
            y: fighter.y - fighter.height,
            w: fighter.width * 0.6,
            h: fighter.height,
        };
    }

    // Check if attacker's hitbox overlaps defender's hurtbox
    static checkAttackHit(attacker, defender) {
        const hitbox = CollisionSystem.getAttackHitbox(attacker);
        if (!hitbox) return null;

        const hurtbox = CollisionSystem.getHurtbox(defender);

        if (CollisionSystem.aabbOverlap(hitbox, hurtbox)) {
            return attacker.getCurrentAttackData();
        }
        return null;
    }

    static getProjectileHitbox(projectile) {
        const w = projectile.width || 14;
        const h = projectile.height || 10;
        return {
            x: projectile.x - w * 0.5,
            y: projectile.y - h * 0.5,
            w,
            h,
        };
    }

    static checkProjectileHit(projectile, defender) {
        if (!projectile || !defender) return null;
        if (projectile.owner === defender) return null;

        const hitbox = CollisionSystem.getProjectileHitbox(projectile);
        const hurtbox = CollisionSystem.getHurtbox(defender);
        if (!CollisionSystem.aabbOverlap(hitbox, hurtbox)) return null;
        return projectile.attackData || null;
    }

    // Keep fighters within stage boundaries
    static clampToStage(fighter, stageWidth) {
        const halfW = fighter.width * 0.3;
        if (fighter.x - halfW < 0) fighter.x = halfW;
        if (fighter.x + halfW > stageWidth) fighter.x = stageWidth - halfW;
    }
}
