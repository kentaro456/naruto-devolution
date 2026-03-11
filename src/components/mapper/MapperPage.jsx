import { useEffect } from 'react';
import { ErrorOverlay } from '../overlays/ErrorOverlay';
import { LoadingOverlay } from '../overlays/LoadingOverlay';
import { SurfacePanel } from '../ui/SurfacePanel';
import { loadMapperRuntime } from '../../mapperRuntime';

/* ── Filters ── */
const QUICK_FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'movement', label: 'Mouv.' },
  { key: 'combat', label: 'Combat' },
  { key: 'special', label: 'Spécial' },
  { key: 'defense', label: 'Défense' },
];

const PROJECTILE_FILTERS = [
  ['all', 'Tous'],
  ['kunai', 'Kunai'],
  ['wind', 'Vent'],
  ['earth', 'Terre'],
  ['fire', 'Feu'],
  ['sand', 'Sable'],
  ['rasengan', 'Rasengan'],
  ['shuriken', 'Shuriken'],
  ['clones', 'Clones'],
  ['other', 'Autres'],
];

/* ── Helpers ── */
const input =
  'w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20';

function Lbl({ text, id, children, className = '' }) {
  return (
    <label htmlFor={id} className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{text}</span>
      {children}
    </label>
  );
}

function Pill({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${active
        ? 'bg-indigo-500/20 text-indigo-300'
        : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
        }`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Tab / filter toggles (imperative for the legacy runtime) ── */
function setActiveMapperTab(tabId, button) {
  document.querySelectorAll('[data-mapper-tab-panel]').forEach((p) => {
    const on = p.id === tabId;
    p.classList.toggle('hidden', !on);
    p.classList.toggle('grid', on);
  });
  document.querySelectorAll('[data-mapper-tab-button]').forEach((b) => {
    const on = b === button;
    b.classList.toggle('bg-indigo-500/20', on);
    b.classList.toggle('text-indigo-300', on);
    b.classList.toggle('text-slate-500', !on);
  });
}

function applyProjectileFilter(cat, button) {
  document.querySelectorAll('.projectile-filter').forEach((b) => {
    const on = b === button;
    b.classList.toggle('bg-indigo-500/20', on);
    b.classList.toggle('text-indigo-300', on);
    b.classList.toggle('text-slate-500', !on);
  });
  const grid = document.getElementById('projectile-pool-grid');
  if (!grid) return;
  grid.querySelectorAll('.proj-card').forEach((c) => {
    c.style.display = cat === 'all' || c.dataset.cat === cat ? 'flex' : 'none';
  });
}

/* ════════════════════════════════════════════════════════════════
    MapperPage
    ════════════════════════════════════════════════════════════════ */
export function MapperPage({ runtimeStatus, runtimeError, onRuntimeStatusChange, onRuntimeError }) {
  useEffect(() => {
    document.body.style.cssText = 'margin:0;overflow:hidden;background:#0a0c12;color:#e2e8f0';

    let cancelled = false;
    onRuntimeStatusChange('loading');
    onRuntimeError('');

    loadMapperRuntime()
      .then(() => window.initMapperApp())
      .then(() => {
        if (cancelled) return;
        onRuntimeStatusChange('ready');
        const tb = document.querySelector('[data-mapper-tab-button][data-tab-target="tab-globals"]');
        if (tb) setActiveMapperTab('tab-globals', tb);
        const pf = document.querySelector('.projectile-filter[data-cat="all"]');
        if (pf) applyProjectileFilter('all', pf);
        const pg = document.getElementById('projectile-pool-grid');
        if (pg) {
          const obs = new MutationObserver(() => {
            const a = document.querySelector('.projectile-filter.active');
            if (a) applyProjectileFilter(a.dataset.cat || 'all', a);
          });
          obs.observe(pg, { childList: true });
          window.__mapperProjectileObserver = obs;
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Mapper runtime boot failed:', err);
        onRuntimeError(err?.message || 'Unknown error');
        onRuntimeStatusChange('error');
      });

    return () => {
      cancelled = true;
      window.__mapperProjectileObserver?.disconnect?.();
      window.__mapperProjectileObserver = null;
    };
  }, [onRuntimeError, onRuntimeStatusChange]);

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#0a0c12] text-slate-200">
      {/* ── ambient glow ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(6,182,212,0.04),transparent_40%)]" />

      {/* ═══ TOP BAR ═══ */}
      <header className="relative z-20 flex items-center gap-3 border-b border-white/[0.08] bg-[#0d1117]/90 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-orange-500 shadow-lg shadow-indigo-500/20">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <h1 className="shrink-0 text-base font-bold tracking-wide text-white">
            <span className="text-indigo-400">Map</span>per
          </h1>
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* profile */}
        <div className="flex items-center gap-2">
          <select id="profile-select" className={`${input} w-40`} />
          <button
            id="load-profile-btn"
            type="button"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Charger
          </button>
          <button
            id="save-to-game-btn"
            type="button"
            className="rounded-lg border border-indigo-500/30 bg-indigo-500/15 px-3 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/25"
          >
            Sauvegarder
          </button>
        </div>

        <div className="flex-1" />

        {/* search + filters */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="search-input"
            type="text"
            className={`${input} w-56 pl-9`}
            placeholder="Rechercher..."
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input id="unassigned-only" type="checkbox" defaultChecked className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/20" />
            <span className="font-medium">Libre</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input id="strict-mapped-only" type="checkbox" className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/20" />
            <span className="font-medium">Strict</span>
          </label>
        </div>

        <div className="flex gap-0.5 rounded-lg bg-white/5 p-0.5">
          {QUICK_FILTERS.map((f, i) => (
            <button
              key={f.key}
              type="button"
              data-filter={f.key}
              className={`quick-filter rounded-md px-3 py-1.5 text-[11px] font-medium transition ${i === 0
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          id="jump-empty-state-btn"
          type="button"
          className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
        >
          ▸ Vide
        </button>

        <a
          href="/"
          className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
        >
          Quitter
        </a>
      </header>

      {/* ═══ MAIN 3-COL ═══ */}
      <main className="relative z-10 grid min-h-0 flex-1 grid-cols-[260px_340px_minmax(0,1fr)] gap-px bg-white/[0.04]">
        {/* ── Col 1: Frames source ── */}
        <section className="flex flex-col overflow-hidden bg-[#0d1117]">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-semibold text-slate-300">Frames</span>
            <span id="source-stats" className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-slate-400">0</span>
          </div>
          <div
            id="source-grid"
            className="grid flex-1 auto-rows-max grid-cols-2 gap-2 overflow-auto px-3 pb-3"
            style={{ scrollbarWidth: 'thin' }}
          />
          {/* assign tools (shown by runtime) */}
          <div id="unknown-assign-tools" className="hidden border-t border-white/[0.08] bg-[#11141c] p-4">
            <div className="mb-3 flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-medium uppercase tracking-wider">Inconnues</span>
              <span id="unknown-selection-count" className="font-semibold text-indigo-400">0</span>
            </div>
            <select id="assign-profile-select" className={`${input} mb-2 py-2 text-xs`} />
            <select id="assign-state-select" className={`${input} mb-3 py-2 text-xs`} />
            <div className="flex gap-2">
              <button id="assign-selected-frame-btn" type="button" className="flex-1 rounded-lg bg-indigo-500/15 py-2.5 text-[11px] font-semibold text-indigo-300 transition hover:bg-indigo-500/25">
                Assigner
              </button>
              <button id="select-all-visible-unknown-btn" type="button" className="rounded-lg bg-white/5 px-3 py-2.5 text-[11px] text-slate-400 transition hover:bg-white/10">
                Tout
              </button>
              <button id="clear-selection-unknown-btn" type="button" className="rounded-lg bg-rose-500/10 px-3 py-2.5 text-[11px] text-rose-400 transition hover:bg-rose-500/20">
                ✕
              </button>
            </div>
          </div>
        </section>

        {/* ── Col 2: State board ── */}
        <section className="flex flex-col overflow-hidden bg-[#0d1117]">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-semibold text-slate-300">États</span>
            <span id="board-stats" className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-slate-400">0</span>
          </div>
          <div id="scope-hint" className="border-y border-indigo-500/10 bg-indigo-500/[0.04] px-4 py-2 text-[10px] font-medium text-indigo-400/70">
            Scope: en attente…
          </div>
          <div
            id="state-board"
            className="flex flex-1 flex-col gap-1.5 overflow-auto px-3 py-3"
            style={{ scrollbarWidth: 'thin' }}
          />
        </section>

        {/* ── Col 3: Preview + Projectiles ── */}
        <section className="flex flex-col overflow-hidden bg-[#0d1117]">
          <div className="min-h-0 flex-1 overflow-auto p-5" style={{ scrollbarWidth: 'thin' }}>
            <div className="mx-auto grid max-w-5xl gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              {/* preview canvas area */}
              <div className="flex flex-col gap-5">
                <div className="relative mx-auto flex aspect-square w-full max-w-[320px] items-center justify-center rounded-2xl border border-white/[0.08] bg-black/50 shadow-2xl shadow-black/20">
                  <canvas
                    id="preview-canvas"
                    width="240"
                    height="240"
                    className="h-[260px] w-[260px] [image-rendering:pixelated]"
                  />
                  <div className="absolute bottom-3 left-4 flex gap-4 rounded-lg bg-black/60 backdrop-blur-sm px-3 py-1.5 text-[10px] font-mono text-indigo-300/80">
                    <span id="preview-state-badge">-</span>
                    <span className="text-white/30">|</span>
                    <span id="preview-frame-count">0/0</span>
                    <span className="text-white/30">|</span>
                    <span id="preview-duration">0ms</span>
                  </div>
                </div>

                {/* transport */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span id="preview-frame-name" className="truncate pr-4 font-medium text-slate-400">Aucune frame</span>
                    <span id="preview-timeline-label" className="tabular-nums">0/0</span>
                  </div>
                  <input id="preview-scrubber" type="range" min="0" max="0" defaultValue="0" step="1" className="mb-4 w-full accent-indigo-500" />
                  <div className="flex justify-center gap-1.5">
                    {[
                      ['preview-first', '⏮'],
                      ['preview-prev', '◂'],
                      ['preview-play', '▶'],
                      ['preview-pause', '⏸'],
                      ['preview-stop', '■'],
                      ['preview-next', '▸'],
                      ['preview-last', '⏭'],
                    ].map(([id, icon]) => (
                      <button
                        key={id}
                        id={id}
                        type="button"
                        className="flex h-8 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-500/10 hover:text-indigo-300"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <div
                    id="preview-frame-strip"
                    className="mt-4 flex min-h-[60px] gap-2 overflow-x-auto rounded-lg border border-white/[0.04] bg-black/40 p-2"
                    style={{ scrollbarWidth: 'thin' }}
                  />
                </div>

                {/* state commands */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Touches liées</div>
                  <div id="preview-state-command-list" className="flex flex-wrap gap-2" />
                </div>
              </div>

              {/* right sidebar: controls + projectiles */}
              <div className="flex flex-col gap-5">
                {/* play controls */}
                <div className="grid gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <Lbl text="État" id="preview-state-select">
                    <select id="preview-state-select" className={input} />
                  </Lbl>
                  <Lbl text="Lecture" id="preview-loop-mode">
                    <select id="preview-loop-mode" className={input}>
                      <option value="loop">Boucle</option>
                      <option value="once">Une fois</option>
                      <option value="pingpong">Aller-retour</option>
                    </select>
                  </Lbl>
                  <Lbl text="Vitesse" id="preview-speed">
                    <div className="flex items-center gap-3">
                      <input id="preview-speed" type="range" min="10" max="250" defaultValue="70" className="flex-1 accent-indigo-500" />
                      <span id="speed-val" className="w-10 text-right text-xs tabular-nums text-indigo-400">70</span>
                    </div>
                  </Lbl>
                  <Lbl text="Zoom" id="preview-zoom">
                    <div className="flex items-center gap-3">
                      <input id="preview-zoom" type="range" min="50" max="250" defaultValue="100" className="flex-1 accent-indigo-500" />
                      <span id="zoom-val" className="w-10 text-right text-xs tabular-nums text-indigo-400">100</span>
                    </div>
                  </Lbl>
                  <div className="flex gap-6 pt-2 text-xs text-slate-400">
                    <label className="flex items-center gap-2">
                      <input id="preview-flip" type="checkbox" className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/20" />
                      <span className="font-medium">Flip</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input id="preview-onion" type="checkbox" className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/20" />
                      <span className="font-medium">Onion</span>
                    </label>
                  </div>
                </div>

                <div className="grid gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Hotkeys 1-4</div>
                    <div className="mt-2 text-xs leading-6 text-slate-400">
                      Assigne un style spécial aux touches <span className="font-semibold text-slate-200">1</span>, <span className="font-semibold text-slate-200">2</span>, <span className="font-semibold text-slate-200">3</span> et <span className="font-semibold text-slate-200">4</span>.
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Lbl text="Touche 1" id="hotkey-slot-1">
                      <div className="grid gap-2">
                        <select id="hotkey-slot-1" className={input} />
                        <div id="hotkey-summary-1" className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5" />
                      </div>
                    </Lbl>
                    <Lbl text="Touche 2" id="hotkey-slot-2">
                      <div className="grid gap-2">
                        <select id="hotkey-slot-2" className={input} />
                        <div id="hotkey-summary-2" className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5" />
                      </div>
                    </Lbl>
                    <Lbl text="Touche 3" id="hotkey-slot-3">
                      <div className="grid gap-2">
                        <select id="hotkey-slot-3" className={input} />
                        <div id="hotkey-summary-3" className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5" />
                      </div>
                    </Lbl>
                    <Lbl text="Touche 4" id="hotkey-slot-4">
                      <div className="grid gap-2">
                        <select id="hotkey-slot-4" className={input} />
                        <div id="hotkey-summary-4" className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5" />
                      </div>
                    </Lbl>
                  </div>
                  <div id="command-binding-grid" className="grid gap-3" />
                  <div>
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Commandes dérivées</div>
                    <div id="command-derived-grid" className="grid gap-3" />
                  </div>
                </div>

                {/* projectiles */}
                <details className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4" open>
                  <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Projectiles
                  </summary>
                  <div className="mt-4 grid gap-4">
                    <div className="flex gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/40">
                        <img id="projectile-preview-img" alt="" className="max-h-12 max-w-12 [image-rendering:pixelated]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div id="projectile-selected-name" className="truncate text-sm font-medium text-slate-300">Aucun</div>
                        <div className="mt-2 flex gap-2">
                          <div className="hidden">
                            <button id="projectile-assign-state-btn" type="button">Assigner</button>
                            <button id="projectile-unassign-state-btn" type="button">Retirer</button>
                            <select id="projectile-state-select" />
                          </div>
                          <button id="projectile-clear-btn" type="button" className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20">Réinitialiser</button>
                        </div>
                      </div>
                    </div>
                    <Lbl text="Type" id="projectile-kind">
                      <input id="projectile-kind" type="text" className={input} placeholder="custom" />
                    </Lbl>
                    <input id="projectile-image-path" type="text" readOnly className="hidden" />
                    <div className="hidden">
                      <input id="projectile-speed" type="number" defaultValue="10" step="0.5" />
                      <input id="projectile-width" type="number" defaultValue="24" />
                      <input id="projectile-height" type="number" defaultValue="24" />
                      <input id="projectile-life" type="number" defaultValue="60" />
                      <input id="projectile-spin" type="number" defaultValue="0" step="0.05" />
                    </div>
                    <div id="projectile-state-list" className="flex min-h-[36px] flex-wrap gap-2 rounded-lg border border-white/[0.04] bg-black/30 p-2.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {PROJECTILE_FILTERS.map(([cat, label], i) => (
                        <button
                          key={cat}
                          type="button"
                          data-cat={cat}
                          className={`projectile-filter rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition ${i === 0
                            ? 'active bg-indigo-500/20 text-indigo-300'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                          onClick={(e) => applyProjectileFilter(cat, e.currentTarget)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div id="projectile-pool-grid" className="flex max-h-[160px] flex-wrap gap-2 overflow-auto rounded-lg border border-white/[0.04] bg-black/30 p-2.5" style={{ scrollbarWidth: 'thin' }} />
                  </div>
                </details>

                {/* Route simulator - hidden from UI, IDs kept for runtime */}
                <div className="hidden">
                  <select id="route-attack-type">
                    <option value="light">Light</option>
                    <option value="heavy">Heavy</option>
                    <option value="special">Special</option>
                  </select>
                  <select id="route-direction">
                    <option value="neutral">Neutral</option>
                    <option value="forward">Forward</option>
                    <option value="down">Down</option>
                    <option value="up">Up</option>
                    <option value="air">Air</option>
                    <option value="back">Back</option>
                    <option value="any">Any</option>
                  </select>
                  <button id="resolve-route-btn" type="button">test</button>
                  <div id="route-result" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* combo drawer: hidden, IDs preserved for runtime */}
      <div id="combo-drawer" className="hidden">
        <div id="tab-globals" data-mapper-tab-panel="">
          <input id="combo-cancel-ratio" type="number" step="0.05" defaultValue="0.75" />
          <input id="combo-hit-reset" type="number" defaultValue="60" />
          <input id="attack-duration-scale" type="number" step="0.1" defaultValue="1.0" />
          <input id="special-duration-scale" type="number" step="0.1" defaultValue="1.0" />
          <input id="require-hit-routes" type="checkbox" defaultChecked />
        </div>
        <div id="tab-chains" data-mapper-tab-panel="">
          <textarea id="root-routes-light" />
          <textarea id="root-routes-heavy" />
          <textarea id="root-routes-special" />
          <textarea id="chain-light" />
          <textarea id="chain-heavy" />
          <textarea id="chain-special" />
          <textarea id="node-patches" />
        </div>
        <button id="apply-combo-btn" type="button" />
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-30 flex items-center justify-between border-t border-white/[0.06] bg-[#0d1117] px-5 py-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
          <span id="status-message" className="font-medium">Prêt</span>
        </div>
        <span id="mapper-runtime-mode" className="font-mono text-slate-600">demo</span>
      </footer>

      {/* ── State editor modal ── */}
      <div id="state-editor-modal" className="hidden absolute inset-0 z-50">
        <div id="state-editor-backdrop" className="absolute inset-0 bg-[#0a0c12]/95 backdrop-blur-md" />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <div>
                <h2 id="state-editor-title" className="text-xl font-bold text-white">IDLE</h2>
                <div id="state-editor-subtitle" className="text-sm text-slate-500">0 frame(s)</div>
              </div>
              <div className="flex gap-3">
                <button id="state-editor-close-btn" type="button" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
                  Annuler
                </button>
                <button id="state-editor-apply-btn" type="button" className="rounded-lg border border-indigo-500/30 bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/25">
                  Appliquer
                </button>
              </div>
            </div>

            <div className="grid min-h-[450px] flex-1 grid-cols-2 gap-px bg-white/[0.04]">
              {/* available */}
              <div className="flex flex-col overflow-hidden bg-[#0d1117]">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-semibold text-slate-300">Disponibles</span>
                  <span id="state-editor-available-count" className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">0</span>
                </div>
                <div className="grid gap-3 border-y border-white/[0.06] px-4 py-3">
                  <input id="state-editor-search" type="text" className={`${input} py-2.5 text-sm`} placeholder="Rechercher…" />
                  <label className="flex items-center gap-2.5 text-xs text-slate-400">
                    <input id="state-editor-unassigned-only" type="checkbox" className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/20" />
                    <span className="font-medium">Libres uniquement</span>
                  </label>
                </div>
                <div id="state-editor-available-grid" className="grid flex-1 grid-cols-4 gap-2 overflow-auto p-4" style={{ scrollbarWidth: 'thin' }} />
                <div className="border-t border-white/[0.06] p-4">
                  <button id="state-editor-add-selected-btn" type="button" className="w-full rounded-lg bg-indigo-500/15 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/25">
                    + Ajouter sélection
                  </button>
                </div>
              </div>
              {/* assigned */}
              <div className="flex flex-col overflow-hidden bg-[#0d1117]">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-semibold text-slate-300">Séquence</span>
                  <span id="state-editor-assigned-count" className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">0</span>
                </div>
                <div id="state-editor-assigned-list" className="flex flex-1 flex-col gap-2 overflow-auto p-4" style={{ scrollbarWidth: 'thin' }} />
                <div className="flex gap-3 border-t border-white/[0.06] p-4">
                  <button id="state-editor-remove-selected-btn" type="button" className="flex-1 rounded-lg bg-white/5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-slate-200">
                    Retirer
                  </button>
                  <button id="state-editor-clear-btn" type="button" className="flex-1 rounded-lg bg-rose-500/10 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/20">
                    Vider tout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* hidden runtime-only elements */}
      <div className="hidden">
        <button id="reset-profile-btn" type="button" />
        <button id="validate-btn" type="button" />
        <button id="export-profile-btn" type="button" />
      </div>

      {runtimeStatus === 'loading' && <LoadingOverlay />}
      {runtimeStatus === 'error' && <ErrorOverlay runtimeError={runtimeError} />}
    </div>
  );
}
