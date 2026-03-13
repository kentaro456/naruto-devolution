export function SplashOverlay({ text }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.16),transparent_42%),rgba(0,0,0,0.42)]">
      <div className="relative flex items-center justify-center px-6 text-center">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-orange-300/40 to-transparent" />
        <div
          className="splash-burst relative font-pixel text-4xl uppercase text-white sm:text-7xl lg:text-8xl"
          style={{
            textShadow: '0 0 34px rgba(251,146,60,0.62), 0 10px 24px rgba(0,0,0,0.86)',
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
