import { ActionButton } from '../ui/ActionButton';
import { SurfacePanel } from '../ui/SurfacePanel';

export function ErrorOverlay({ runtimeError }) {
  return (
    <div
      className="absolute inset-0 z-40 overflow-y-auto bg-slate-950 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.16),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.52),rgba(2,6,23,0.9))]" />
      <div className="relative flex min-h-full items-start justify-center sm:items-center">
        <SurfacePanel className="ui-stage-enter my-auto w-full max-w-3xl border-rose-300/20 p-5 sm:p-6 lg:p-8">
          <div className="font-pixel text-base uppercase tracking-[0.18em] text-rose-200 sm:text-xl">Portail rompu</div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Le duel n&apos;a pas pu s&apos;ouvrir. Recharge pour rappeler l&apos;arene et les combattants.
          </p>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-200">
            {runtimeError}
          </div>
          <div className="mt-6">
            <ActionButton onClick={() => window.location.reload()} accent="rose">RELANCER LE JEU</ActionButton>
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
}
