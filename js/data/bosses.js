/* ============================================
   BOSS ROSTER — disabled in the public build
   ============================================ */

const BOSS_ROSTER = [];

function createBossFighter() {
  return null;
}

if (typeof window !== 'undefined') {
  window.BOSS_ROSTER = BOSS_ROSTER;
  window.createBossFighter = createBossFighter;
}
