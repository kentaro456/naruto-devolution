import { useState } from 'react';

export function CharacterArt({ char, preview = false }) {
  const [failed, setFailed] = useState(false);

  if (!char) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 text-slate-500">
        <span className="font-pixel text-[10px] uppercase tracking-[0.2em]">AUCUN</span>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {!failed && char.thumbnail ? (
        <img
          src={char.thumbnail}
          alt={char.name}
          className={`h-full w-full object-contain ${preview ? 'p-3' : 'p-2'} [image-rendering:pixelated]`}
          onError={() => setFailed(true)}
        />
      ) : null}
      {(failed || !char.thumbnail) && (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: char.color || '#111827' }}
        >
          <span className="font-pixel text-xl uppercase text-white">{char.name?.[0] || '?'}</span>
        </div>
      )}
    </div>
  );
}
