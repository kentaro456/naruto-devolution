import { useEffect, useState } from 'react';
import { CharacterSelectOverlay } from './components/overlays/CharacterSelectOverlay';
import { ComboGuideOverlay } from './components/overlays/ComboGuideOverlay';
import { ErrorOverlay } from './components/overlays/ErrorOverlay';
import { HudOverlay } from './components/overlays/HudOverlay';
import { LoadingOverlay } from './components/overlays/LoadingOverlay';
import { MenuOverlay } from './components/overlays/MenuOverlay';
import { PauseOverlay } from './components/overlays/PauseOverlay';
import { ResultOverlay } from './components/overlays/ResultOverlay';
import { SplashOverlay } from './components/overlays/SplashOverlay';
import { MapperPage } from './components/mapper/MapperPage';
import { useGameUI } from './context/GameUIContext';
import { FALLBACK_UI } from './lib/uiState';
import { bootLegacyGame, destroyLegacyGame } from './lib/runtimeBridge';
import { loadLegacyRuntime } from './legacyRuntime';

export default function App() {
  const ui = useGameUI();
  const pathname = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '/';
  const isMapperRoute = pathname === '/mapper';
  const [runtimeStatus, setRuntimeStatus] = useState('loading');
  const [runtimeError, setRuntimeError] = useState('');

  useEffect(() => {
    if (isMapperRoute) {
      return undefined;
    }

    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#020617';
    document.body.style.color = '#e2e8f0';

    let cancelled = false;
    setRuntimeStatus('loading');
    setRuntimeError('');

    loadLegacyRuntime()
      .then(() => {
        if (cancelled) return;
        bootLegacyGame();
        setRuntimeStatus('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Runtime boot failed:', error);
        setRuntimeError(error?.message || 'Unknown runtime loading error.');
        setRuntimeStatus('error');
      });

    return () => {
      cancelled = true;
      destroyLegacyGame();
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
  const showLoadingOverlay = runtimeStatus === 'loading' || ui.stageLoadingVisible;
  const loadingTitle = runtimeStatus === 'loading'
    ? 'Ouverture du jeu'
    : (ui.loadingTitle || 'Préparation du combat');
  const loadingMessage = runtimeStatus === 'loading'
    ? 'Le moteur, le canvas et l’interface se mettent en place.'
    : (ui.loadingMessage || 'L’arène et les combattants se mettent en place avant le round.');

  const inFight = showShell && ui.hudVisible && !ui.menuVisible && !ui.charSelectVisible;

  return (
    <div
      className={`relative flex h-screen w-screen items-center justify-center overflow-hidden text-slate-100 ${inFight ? 'bg-black' : 'bg-slate-950 bg-cover bg-center'}`}
      style={inFight ? undefined : { backgroundImage: `url('/assets/home-bg.png')` }}
    >
      {!inFight && <div className="pointer-events-none absolute inset-0 bg-black/60 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.15),transparent_32%),radial-gradient(circle_at_bottom,rgba(244,63,94,0.15),transparent_30%)]" />}
      <canvas id="game-canvas" className="relative z-0 block bg-transparent shadow-[0_0_50px_rgba(2,6,23,0.65)] [image-rendering:pixelated]" />

      {showLoadingOverlay && (
        <LoadingOverlay
          title={loadingTitle}
          message={loadingMessage}
          variant={runtimeStatus === 'loading' ? 'boot' : 'fight'}
        />
      )}
      {runtimeStatus === 'error' && <ErrorOverlay runtimeError={runtimeError} />}

      {showShell && ui.menuVisible && <MenuOverlay ui={ui} />}
      {showShell && ui.charSelectVisible && (
        <CharacterSelectOverlay
          ui={ui}
          selectedPlayer={selectedPlayer}
          selectedCpu={selectedCpu}
        />
      )}
      {showShell && ui.hudVisible && <HudOverlay ui={ui} />}
      {showShell && ui.splashVisible && <SplashOverlay text={ui.splashText} />}
      {showShell && ui.pauseVisible && <PauseOverlay />}
      {showShell && ui.comboGuideVisible && <ComboGuideOverlay />}
      {showShell && ui.resultVisible && <ResultOverlay ui={ui} />}
    </div>
  );
}
