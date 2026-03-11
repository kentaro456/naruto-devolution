export function SplashOverlay({ text }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40">
      <div
        className="font-pixel text-5xl uppercase tracking-[0.3em] text-white sm:text-8xl"
        style={{
          textShadow: '0 0 30px rgba(251,146,60,0.7), 0 4px 12px rgba(0,0,0,0.8)',
          animation: 'splashPop 0.3s ease-out forwards',
        }}
      >
        {text}
      </div>
      <style>{`
        @keyframes splashPop {
          0% { transform: scale(2.5); opacity: 0; }
          60% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
