import { useEffect, useRef, useState } from 'react';
import { CharacterSelectOverlay } from './components/overlays/CharacterSelectOverlay';
import { ComboGuideOverlay } from './components/overlays/ComboGuideOverlay';
import { ErrorOverlay } from './components/overlays/ErrorOverlay';
import { HudOverlay } from './components/overlays/HudOverlay';
import { LoadingOverlay } from './components/overlays/LoadingOverlay';
import { MenuOverlay } from './components/overlays/MenuOverlay';
import { PauseOverlay } from './components/overlays/PauseOverlay';
import { ResultOverlay } from './components/overlays/ResultOverlay';
import { SplashOverlay } from './components/overlays/SplashOverlay';
import { MapperPage } from './components/mapper/MapperPage.jsx';
import { useGameUI } from './context/GameUIContext';
import { attachLegacyPixiCharacters, destroyLegacyPixiCharacters } from './engine/legacyPixiCharacters';
import { loadLegacyRuntime } from './legacyRuntime';
import { bootLegacyGame, destroyLegacyGame } from './lib/runtimeBridge';
import { ensureUIBridge } from './lib/uiBridge';
import { FALLBACK_UI } from './lib/uiState';

type RuntimeStatus = 'loading' | 'ready' | 'error';

export default function App() {
  const ui = useGameUI();
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '/';
  const isMapperRoute = pathname === '/mapper';
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>('loading');
  const [runtimeError, setRuntimeError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isMapperRoute) {
      return undefined;
    }

    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    ensureUIBridge();
    let cancelled = false;
    setRuntimeStatus('loading');
    setRuntimeError('');

    const canvas = canvasRef.current;
    if (!canvas) {
      setRuntimeError("Zone d'affichage introuvable.");
      setRuntimeStatus('error');
      return undefined;
    }

    loadLegacyRuntime()
      .then(() => {
        if (cancelled) return;
        return attachLegacyPixiCharacters(canvas).then(() => {
          if (cancelled) return;
          bootLegacyGame();
          setRuntimeStatus('ready');
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error('Runtime boot failed:', error);
        setRuntimeError(error instanceof Error ? error.message : "Le duel n'a pas pu s'ouvrir.");
        setRuntimeStatus('error');
      });

    return () => {
      cancelled = true;
      destroyLegacyGame();
      destroyLegacyPixiCharacters();
    };
  }, [isMapperRoute]);

  if (isMapperRoute) {
    return (
      <MapperPage
        runtimeStatus={runtimeStatus}
        runtimeError={runtimeError}
        onRuntimeStatusChange={setRuntimeStatus}
        onRuntimeError={setRuntimeError}
      />
    );
  }

  const showShell = runtimeStatus === 'ready';
  const roster = ui.roster || FALLBACK_UI.roster;
  const selectedPlayer = roster.find((char) => char.id === ui.selectedPlayerId) || null;
  const selectedCpu = roster.find((char) => char.id === ui.selectedCpuId) || null;
  const loadingTitle =
    runtimeStatus === 'loading' ? "Ouverture de l'arene" : ui.loadingTitle || 'Annonce de la manche';
  const loadingMessage =
    runtimeStatus === 'loading'
      ? "Les portes du duel s'ouvrent. Encore un instant avant l'appel des combattants."
      : ui.loadingMessage || 'Les combattants prennent position avant le signal.';

  const inFight = showShell && ui.hudVisible && !ui.menuVisible && !ui.charSelectVisible;
  const showMenuOverlay = runtimeStatus === 'loading' || (showShell && ui.menuVisible);
  const showBootOverlay = runtimeStatus === 'loading' && !showMenuOverlay;
  const showStageLoadingOverlay = runtimeStatus !== 'loading' && ui.stageLoadingVisible;

  return (
    <div
      className={`relative flex h-screen w-screen items-center justify-center overflow-hidden font-ui text-slate-100 ${inFight ? 'bg-[#05070c]' : 'bg-[#090c13]'}`}
    >
      {!inFight ? (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 saturate-[0.88]"
          style={{ backgroundImage: `url('/assets/home-bg.png')` }}
        />
      ) : null}
      <div
        className={`pointer-events-none absolute inset-0 ${
          inFight
            ? 'bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_28%),radial-gradient(circle_at_bottom,rgba(251,146,60,0.08),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.45),rgba(2,6,23,0.72))]'
            : 'bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(244,63,94,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.56),rgba(2,6,23,0.84))]'
        }`}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.08]" />
      {!inFight ? (
        <>
          <div className="pointer-events-none absolute inset-[clamp(10px,2vw,22px)] rounded-[30px] border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]" />
          <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-black/30 px-3 py-2 font-pixel text-[9px] uppercase tracking-[0.24em] text-white/65 sm:left-6 sm:top-6 sm:px-4">
            Hall de combat
          </div>
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_80px_120px_rgba(2,6,23,0.55),inset_0_-120px_120px_rgba(2,6,23,0.65)]" />
      )}
      <canvas
        id="game-canvas"
        ref={canvasRef}
        className={`relative z-0 block max-h-full max-w-full bg-transparent [image-rendering:pixelated] ${
          inFight
            ? 'shadow-[0_0_60px_rgba(2,6,23,0.72)]'
            : 'shadow-[0_24px_72px_rgba(2,6,23,0.56)]'
        }`}
      />

      {showBootOverlay && (
        <LoadingOverlay
          title={loadingTitle}
          message={loadingMessage}
          variant="boot"
        />
      )}
      {showStageLoadingOverlay && (
        <LoadingOverlay
          title={loadingTitle}
          message={loadingMessage}
          variant="fight"
        />
      )}
      {runtimeStatus === 'error' && <ErrorOverlay runtimeError={runtimeError} />}

      {showMenuOverlay && <MenuOverlay ui={ui} runtimeReady={runtimeStatus === 'ready'} />}
      {showShell && ui.charSelectVisible && (
        <CharacterSelectOverlay ui={ui} selectedPlayer={selectedPlayer} selectedCpu={selectedCpu} />
      )}
      {showShell && ui.hudVisible && <HudOverlay ui={ui} />}
      {showShell && ui.splashVisible && <SplashOverlay text={ui.splashText} />}
      {showShell && ui.pauseVisible && <PauseOverlay />}
      {showShell && ui.comboGuideVisible && <ComboGuideOverlay />}
      {showShell && ui.resultVisible && <ResultOverlay ui={ui} />}
    </div>
  );
}
