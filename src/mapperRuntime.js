const MAPPER_RUNTIME_SCRIPTS = [
  '/js/data/fxBank.js',
  '/js/data/characters.js',
  '/js/data/bosses.js',
  '/js/data/stages.js',
  '/js/editor/MapperStore.js',
  '/js/editor/MapperPreview.js',
  '/js/editor/MapperApp.js',
];

const scriptPromises = new Map();
let mapperRuntimePromise = null;

function ensureRuntimeScript(src) {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Mapper runtime requires a browser environment.'));
  }

  const existing = document.querySelector(`script[data-shinobi-mapper="${src}"]`);
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

    script.dataset.shinobiMapper = src;
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
      reject(new Error(`Unable to load mapper runtime script: ${src}`));
    };

    if (!existing) {
      document.body.appendChild(script);
    }
  });

  scriptPromises.set(src, promise);
  return promise;
}

export function loadMapperRuntime() {
  if (typeof window !== 'undefined' && typeof window.MapperApp === 'function') {
    return Promise.resolve(window.MapperApp);
  }

  if (mapperRuntimePromise) {
    return mapperRuntimePromise;
  }

  mapperRuntimePromise = MAPPER_RUNTIME_SCRIPTS.reduce(
    (chain, src) => chain.then(() => ensureRuntimeScript(src)),
    Promise.resolve(),
  )
    .then(() => {
      if (typeof window.MapperApp !== 'function' || typeof window.initMapperApp !== 'function') {
        throw new Error('Mapper runtime did not expose window.MapperApp/initMapperApp.');
      }
      return window.MapperApp;
    })
    .catch((error) => {
      mapperRuntimePromise = null;
      throw error;
    });

  return mapperRuntimePromise;
}
