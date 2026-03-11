const LEGACY_RUNTIME_SCRIPTS = [
  '/js/data/fxBank.js',
  '/js/data/characters.js',
  '/js/data/bosses.js',
  '/js/data/stages.js',
  '/js/engine/Input.js',
  '/js/engine/Physics.js',
  '/js/engine/Collision.js',
  '/js/engine/Camera.js',
  '/js/engine/Renderer.js',
  '/js/engine/SpriteFactory.js',
  '/js/entities/Fighter.js',
  '/js/entities/Naruto.js',
  '/js/entities/Sasuke.js',
  '/js/entities/Lee.js',
  '/js/entities/Sakura.js',
  '/js/entities/Kakashi.js',
  '/js/entities/Minato.js',
  '/js/entities/Itachi.js',
  '/js/entities/Madara.js',
  '/js/entities/Kisame.js',
  '/js/entities/Sasori.js',
  '/js/entities/Gaara.js',
  '/js/entities/Gai.js',
  '/js/entities/Kimimaro.js',
  '/js/entities/Orochimaru.js',
  '/js/entities/Deidara.js',
  '/js/entities/Hinata.js',
  '/js/entities/Shikamaru.js',
  '/js/entities/Neji.js',
  '/js/entities/Kankuro.js',
  '/js/entities/Temari.js',
  '/js/entities/Kabuto.js',
  '/js/entities/Jirobo.js',
  '/js/entities/Sakon.js',
  '/js/entities/JiraiyaFighter.js',
  '/js/entities/SasukeEMSFighter.js',
  '/js/entities/BorutoFighter.js',
  '/js/entities/TeenKakashiFighter.js',
  '/js/entities/TentenFighter.js',
  '/js/engine/SoundManager.js',
  '/js/engine/Game.js',
];

const scriptPromises = new Map();

function ensureRuntimeScript(src) {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Runtime scripts require a browser environment.'));
  }

  const existing = document.querySelector(`script[data-shinobi-runtime="${src}"]`);
  if (existing?.dataset.loaded === 'true') {
    return Promise.resolve();
  }
  if (scriptPromises.has(src)) {
    return scriptPromises.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const script = existing || document.createElement('script');

    const cleanup = () => {
      script.onload = null;
      script.onerror = null;
    };

    script.dataset.shinobiRuntime = src;
    script.async = false;
    script.src = src;

    script.onload = () => {
      script.dataset.loaded = 'true';
      cleanup();
      resolve();
    };

    script.onerror = () => {
      cleanup();
      scriptPromises.delete(src);
      reject(new Error(`Unable to load runtime script: ${src}`));
    };

    if (!existing) {
      document.body.appendChild(script);
    }
  });

  scriptPromises.set(src, promise);
  return promise;
}

let runtimePromise = null;

export function loadLegacyRuntime() {
  if (typeof window !== 'undefined' && typeof window.Game === 'function') {
    return Promise.resolve(window.Game);
  }

  if (runtimePromise) {
    return runtimePromise;
  }

  runtimePromise = LEGACY_RUNTIME_SCRIPTS.reduce(
    (chain, src) => chain.then(() => ensureRuntimeScript(src)),
    Promise.resolve(),
  )
    .then(() => {
      if (typeof window.Game !== 'function') {
        throw new Error('Game runtime did not expose window.Game.');
      }
      return window.Game;
    })
    .catch((error) => {
      runtimePromise = null;
      throw error;
    });

  return runtimePromise;
}
