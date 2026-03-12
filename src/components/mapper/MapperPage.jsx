import { useEffect, useMemo, useState } from 'react';
import { ROSTER } from '../../data/roster';
import { ErrorOverlay } from '../overlays/ErrorOverlay';
import { LoadingOverlay } from '../overlays/LoadingOverlay';
import { SurfacePanel } from '../ui/SurfacePanel';

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10';

const HOTKEY_OPTIONS = [
  { value: '', label: 'Aucune assignation' },
  { value: 'neutral', label: 'Special neutre' },
  { value: 'up', label: 'Special haut' },
  { value: 'down', label: 'Special bas' },
  { value: 'back', label: 'Special arriere' },
  { value: 'forward', label: 'Special avant' },
  { value: 'any', label: 'Special libre' },
  { value: 's1', label: 'Style s1' },
  { value: 's2', label: 'Style s2' },
  { value: 's3', label: 'Style s3' },
  { value: 's4', label: 'Style s4' },
];

function defaultMappingPath(characterId) {
  return `/assets/organized/characters/${characterId}/mapping.json`;
}

function defaultSavePath(characterId) {
  return `assets/organized/characters/${characterId}/mapping.json`;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getHotkeys(mapping) {
  const combo = mapping?.combo && typeof mapping.combo === 'object' ? mapping.combo : {};
  const hotkeys = combo.hotkeys && typeof combo.hotkeys === 'object' ? combo.hotkeys : {};
  return {
    '1': typeof hotkeys['1'] === 'string' ? hotkeys['1'] : '',
    '2': typeof hotkeys['2'] === 'string' ? hotkeys['2'] : '',
    '3': typeof hotkeys['3'] === 'string' ? hotkeys['3'] : '',
    '4': typeof hotkeys['4'] === 'string' ? hotkeys['4'] : '',
  };
}

function getSpecialPreview(mapping, value) {
  if (!value) return 'Aucune action';
  const specialRoutes = mapping?.combo?.rootRoutes?.special || {};
  const actionMap = mapping?.combo?.actionMap || {};

  if (/^s[1-4]$/.test(value)) {
    return `Style ${value.toUpperCase()} via la logique runtime`;
  }

  const routeNode = typeof specialRoutes[value] === 'string' ? specialRoutes[value] : null;
  const stateName = typeof actionMap.special === 'string' ? actionMap.special : 'SPECIAL';

  if (routeNode) {
    return `${stateName} -> ${routeNode}`;
  }

  return stateName;
}

function StatChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}

export function MapperPage({ runtimeStatus, runtimeError, onRuntimeStatusChange, onRuntimeError }) {
  const profiles = useMemo(
    () =>
      ROSTER.filter((character) => character.selectable !== false).map((character) => ({
        id: character.id,
        name: character.fullName || character.name,
        color: character.color || '#f97316',
        thumbnail: character.thumbnail || '',
      })),
    [],
  );

  const [selectedId, setSelectedId] = useState(profiles[0]?.id || '');
  const [mappingPath, setMappingPath] = useState(defaultMappingPath(profiles[0]?.id || 'naruto'));
  const [savePath, setSavePath] = useState(defaultSavePath(profiles[0]?.id || 'naruto'));
  const [mapping, setMapping] = useState(null);
  const [hotkeys, setHotkeys] = useState({ '1': '', '2': '', '3': '', '4': '' });
  const [statusMessage, setStatusMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const selectedProfile = profiles.find((profile) => profile.id === selectedId) || null;
  const stateNames = Array.isArray(mapping?.states) ? mapping.states : [];

  useEffect(() => {
    document.body.style.cssText = 'margin:0;overflow:hidden;background:#0a0c12;color:#e2e8f0';
    onRuntimeError('');
    onRuntimeStatusChange('ready');
  }, [onRuntimeError, onRuntimeStatusChange]);

  useEffect(() => {
    if (!selectedId) return;
    setMappingPath(defaultMappingPath(selectedId));
    setSavePath(defaultSavePath(selectedId));
    setStatusMessage('');
    setLocalError('');
  }, [selectedId]);

  useEffect(() => {
    if (!mappingPath) return;

    let cancelled = false;
    setIsBusy(true);
    setLocalError('');
    setStatusMessage('Chargement du mapping...');

    fetch(mappingPath, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Impossible de charger ${mappingPath}`);
        }
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setMapping(data);
        setHotkeys(getHotkeys(data));
        setStatusMessage(`Mapping charge pour ${selectedProfile?.name || selectedId}`);
      })
      .catch((error) => {
        if (cancelled) return;
        setMapping(null);
        setHotkeys({ '1': '', '2': '', '3': '', '4': '' });
        setLocalError(error instanceof Error ? error.message : 'Erreur de chargement du mapping.');
        setStatusMessage('');
      })
      .finally(() => {
        if (!cancelled) setIsBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mappingPath, selectedId, selectedProfile]);

  const handleHotkeyChange = (key, value) => {
    setHotkeys((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!mapping || !savePath) return;
    setIsBusy(true);
    setLocalError('');
    setStatusMessage('Sauvegarde en cours...');

    const nextMapping = deepClone(mapping);
    nextMapping.combo = nextMapping.combo && typeof nextMapping.combo === 'object' ? nextMapping.combo : {};
    nextMapping.combo.hotkeys = Object.fromEntries(
      Object.entries(hotkeys).filter(([, value]) => typeof value === 'string' && value.trim().length > 0),
    );
    nextMapping.meta = {
      ...(nextMapping.meta && typeof nextMapping.meta === 'object' ? nextMapping.meta : {}),
      editedByMapper: true,
      editedAt: new Date().toISOString(),
      mappingMode: 'react_mapper',
    };

    try {
      const response = await fetch('/api/save-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: savePath,
          payload: nextMapping,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Echec de sauvegarde.');
      }

      setMapping(nextMapping);
      setStatusMessage(`Sauvegarde terminee dans ${savePath}`);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Erreur de sauvegarde.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#0a0c12] text-slate-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_34%),radial-gradient(circle_at_bottom,rgba(251,146,60,0.10),transparent_30%)]" />

      {isBusy && <LoadingOverlay title="Mapper React" message={statusMessage || 'Preparation du mapper.'} variant="boot" />}
      {(runtimeStatus === 'error' && runtimeError) || localError ? (
        <ErrorOverlay runtimeError={localError || runtimeError} />
      ) : null}

      <header className="relative z-10 border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Mapper React</div>
            <h1 className="mt-2 text-2xl font-semibold text-white">Edition rapide des hotkeys et du mapping</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Cette version remplace le runtime DOM legacy. Elle charge les JSON de mapping directement, affiche les routes speciales et sauvegarde les hotkeys 1 a 4.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            {statusMessage || 'Pret'}
          </div>
        </div>
      </header>

      <main className="relative z-10 grid flex-1 gap-4 overflow-auto px-4 py-4 xl:grid-cols-[360px_minmax(0,1fr)] xl:px-6">
        <SurfacePanel className="p-4 sm:p-5">
          <div className="space-y-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Profil</div>
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                className={`${inputClass} mt-3`}
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Source JSON</div>
              <input
                value={mappingPath}
                onChange={(event) => setMappingPath(event.target.value)}
                className={`${inputClass} mt-3`}
                placeholder="/assets/organized/characters/naruto/mapping.json"
              />
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Chemin de sauvegarde</div>
              <input
                value={savePath}
                onChange={(event) => setSavePath(event.target.value)}
                className={`${inputClass} mt-3`}
                placeholder="assets/organized/characters/naruto/mapping.json"
              />
            </div>

            {selectedProfile ? (
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-slate-800/80"
                    style={{ boxShadow: `0 0 0 1px ${selectedProfile.color}33` }}
                  >
                    {selectedProfile.thumbnail ? (
                      <img src={`/${selectedProfile.thumbnail.replace(/^\/+/, '')}`} alt={selectedProfile.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-white">{selectedProfile.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{selectedProfile.id}</div>
                  </div>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={!mapping || isBusy}
              className="w-full rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sauvegarder le mapping
            </button>
          </div>
        </SurfacePanel>

        <div className="grid gap-4">
          <SurfacePanel className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Hotkeys 1-4</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Raccourcis speciaux</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Les touches numeriques ecrivent dans <code className="rounded bg-white/5 px-1.5 py-0.5 text-slate-200">combo.hotkeys</code>. Le runtime React les lira directement.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatChip label="Etats" value={stateNames.length || 0} />
                <StatChip label="Frames mappees" value={Object.keys(mapping?.stateMap || {}).length || 0} />
                <StatChip label="Special routes" value={Object.keys(mapping?.combo?.rootRoutes?.special || {}).length || 0} />
                <StatChip label="Version" value={mapping?.meta?.mappingMode || 'legacy'} />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {['1', '2', '3', '4'].map((key) => (
                <div key={key} className="rounded-[28px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-white">Touche {key}</div>
                    <div className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-orange-200">
                      Preview
                    </div>
                  </div>
                  <select
                    value={hotkeys[key]}
                    onChange={(event) => handleHotkeyChange(key, event.target.value)}
                    className={`${inputClass} mt-4`}
                  >
                    {HOTKEY_OPTIONS.map((option) => (
                      <option key={option.value || 'empty'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                    {getSpecialPreview(mapping, hotkeys[key])}
                  </div>
                </div>
              ))}
            </div>
          </SurfacePanel>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
            <SurfacePanel className="p-4 sm:p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Etats du mapping</div>
              <h2 className="mt-2 text-xl font-semibold text-white">Vue d ensemble</h2>
              <div className="mt-4 flex max-h-[28rem] flex-wrap gap-2 overflow-auto rounded-[28px] border border-white/8 bg-black/20 p-3">
                {stateNames.length ? (
                  stateNames.map((stateName) => (
                    <div
                      key={stateName}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300"
                    >
                      {stateName}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">Aucun etat charge.</div>
                )}
              </div>
            </SurfacePanel>

            <SurfacePanel className="p-4 sm:p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Routes speciales</div>
              <h2 className="mt-2 text-xl font-semibold text-white">Root routes</h2>
              <div className="mt-4 space-y-3">
                {Object.entries(mapping?.combo?.rootRoutes?.special || {}).length ? (
                  Object.entries(mapping.combo.rootRoutes.special).map(([route, node]) => (
                    <div key={route} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{route}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-100">{String(node)}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-500">
                    Aucune route speciale detectee dans ce mapping.
                  </div>
                )}
              </div>
            </SurfacePanel>
          </div>
        </div>
      </main>
    </div>
  );
}
