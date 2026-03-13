import { useState } from 'react';

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(15, 23, 42, ${alpha})`;
  const normalized = hex.replace('#', '');
  const size = normalized.length === 3 ? 1 : 2;
  const segments = normalized.match(size === 1 ? /.{1}/g : /.{2}/g);

  if (!segments || segments.length < 3) {
    return `rgba(15, 23, 42, ${alpha})`;
  }

  const [r, g, b] = segments.map((segment) =>
    size === 1 ? parseInt(segment + segment, 16) : parseInt(segment, 16),
  );
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function CharacterArt({ char, preview = false }) {
  const [failed, setFailed] = useState(false);
  const accent = char?.color || '#f97316';
  const shellStyle = {
    background: `radial-gradient(circle at top, ${hexToRgba(accent, 0.32)}, transparent 55%), linear-gradient(180deg, ${hexToRgba(accent, 0.14)} 0%, rgba(2, 6, 23, 0.92) 72%)`,
  };

  if (!char) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 text-slate-500">
        <span className="font-pixel text-[10px] uppercase tracking-[0.2em]">AUCUN</span>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden" style={shellStyle}>
      <div className="pointer-events-none absolute inset-x-[12%] top-3 h-16 rounded-full bg-white/10 blur-3xl" />
      {!failed && char.thumbnail ? (
        <img
          src={char.thumbnail}
          alt={char.name}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`relative z-10 h-full w-full object-contain transition-transform duration-300 ease-out ${preview ? 'p-4' : 'p-2'} [image-rendering:pixelated]`}
          onError={() => setFailed(true)}
        />
      ) : null}
      {(failed || !char.thumbnail) && (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: accent }}
        >
          <span className="font-pixel text-xl uppercase text-white">{char.name?.[0] || '?'}</span>
        </div>
      )}
    </div>
  );
}
