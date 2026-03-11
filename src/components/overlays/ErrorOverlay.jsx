import { ActionButton } from '../ui/ActionButton';

export function ErrorOverlay({ runtimeError }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950 px-4 py-6">
      <div className="w-full max-w-2xl rounded-[32px] border border-rose-300/20 bg-slate-900/84 p-8 shadow-[0_28px_80px_rgba(2,6,23,0.62)]">
        <div className="font-pixel text-xl uppercase tracking-[0.24em] text-rose-300">Erreur Runtime</div>
        <p className="mt-4 text-sm leading-7 text-slate-300">{runtimeError}</p>
        <div className="mt-6">
          <ActionButton onClick={() => window.location.reload()} accent="rose">RECHARGER</ActionButton>
        </div>
      </div>
    </div>
  );
}
