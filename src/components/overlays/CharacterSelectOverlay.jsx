import { useGameActions } from '../../context/GameUIContext';
import { ActionButton } from '../ui/ActionButton';
import { CharacterArt } from '../ui/CharacterArt';
import { InfoPill } from '../ui/InfoPill';
import { SurfacePanel } from '../ui/SurfacePanel';

export function CharacterSelectOverlay({ ui, selectedPlayer, selectedCpu }) {
  const actions = useGameActions();
  const soloTraining = ui.fightMode === 'training-solo';
  const selectableRoster = (ui.roster || []).filter((char) => char?.selectable !== false);
  const stages = ui.stages || [];
  const currentStep = ui.stageSelectVisible
    ? 'stage'
    : soloTraining
      ? 'player'
      : ui.selectedPlayerId && !ui.selectedCpuId
        ? 'cpu'
        : 'player';
  const selectedStage = stages.find((stage) => stage.id === ui.selectedStageId) || null;
  const stepCopy = ui.stageSelectVisible
    ? "Verrouille l arene pour donner le ton de la prochaine manche."
    : currentStep === 'player'
      ? `Choisis d abord ${ui.p1Label.toLowerCase()} pour ouvrir le duel.`
      : `Designe maintenant ${ui.p2Label.toLowerCase()} et prepare l affrontement.`;

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-slate-950/30 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.1),transparent_24%)]" />
      <div className="relative mx-auto flex min-h-full max-w-[1500px] flex-col gap-6">
        <div className="ui-stage-enter grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <SurfacePanel className="p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="font-pixel text-[10px] uppercase tracking-[0.28em] text-white/45">Avant-match</div>
                <h2 className="mt-3 font-pixel text-xl uppercase tracking-[0.16em] text-white drop-shadow-[0_10px_28px_rgba(251,146,60,0.22)] sm:text-2xl lg:text-3xl">
                  {ui.selectTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]">
                  {stepCopy}
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <InfoPill tone={currentStep === 'player' ? 'orange' : 'slate'}>1. {ui.p1Label}</InfoPill>
                {!soloTraining && <InfoPill tone={currentStep === 'cpu' ? 'rose' : 'slate'}>2. {ui.p2Label}</InfoPill>}
                <InfoPill tone={currentStep === 'stage' ? 'emerald' : 'slate'}>{soloTraining ? '2. Stage' : '3. Stage'}</InfoPill>
              </div>
            </div>
          </SurfacePanel>
          <ActionButton onClick={actions.backToMenu} accent="slate" className="h-full min-h-[88px] lg:px-8">
            RETOUR AU HALL
          </ActionButton>
        </div>

        <div
          className={`ui-stage-enter grid gap-6 ${
            soloTraining
              ? 'xl:grid-cols-[300px_minmax(0,1fr)]'
              : 'xl:grid-cols-[300px_minmax(0,1fr)_300px]'
          }`}
        >
          <FighterShowcase
            label={ui.p1Label}
            title={ui.p1Name}
            tone="orange"
            character={selectedPlayer}
            emptyText={`Choisis ${ui.p1Label.toLowerCase()}`}
          />

          <SurfacePanel className="min-w-0 p-5 sm:p-6">
            {!ui.stageSelectVisible ? (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="font-pixel text-[10px] uppercase tracking-[0.28em] text-white/40">Roster shinobi</div>
                    <h3 className="mt-3 font-pixel text-base uppercase tracking-[0.16em] text-white sm:text-lg">
                      Mur des combattants
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                      Parcours le roster, lis les styles et verrouille les deux shinobi avant
                      d annoncer l arene.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <InfoPill tone="slate">{selectableRoster.length} disponibles</InfoPill>
                    <InfoPill tone={currentStep === 'cpu' ? 'rose' : 'orange'}>
                      {currentStep === 'cpu' ? ui.p2Label : ui.p1Label}
                    </InfoPill>
                  </div>
                </div>

                <div className="hide-scrollbar mt-6 grid max-h-[68vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {selectableRoster.map((char) => {
                    const isPlayer = ui.selectedPlayerId === char.id;
                    const isCpu = ui.selectedCpuId === char.id;
                    return (
                      <RosterCard
                        key={char.id}
                        character={char}
                        isPlayer={isPlayer}
                        isCpu={isCpu}
                        onClick={() => actions.selectCharacter(char.id)}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="font-pixel text-[10px] uppercase tracking-[0.28em] text-white/40">Arene</div>
                    <h3 className="mt-3 font-pixel text-base uppercase tracking-[0.16em] text-emerald-200 sm:text-lg">
                      Choix de l arene
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                      Choisis le decor du prochain affrontement, puis lance la manche.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <InfoPill tone="emerald">{stages.length} arenes</InfoPill>
                    {selectedStage ? <InfoPill tone="slate">{selectedStage.name}</InfoPill> : null}
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {stages.map((stage, index) => (
                    <StageCard
                      key={stage.id}
                      stage={stage}
                      selected={ui.selectedStageId === stage.id}
                      index={index + 1}
                      onClick={() => actions.selectStage(stage.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </SurfacePanel>

          {!soloTraining && (
            <FighterShowcase
              label={ui.p2Label}
              title={ui.p2Name}
              tone="rose"
              character={selectedCpu}
              emptyText={`Choisis ${ui.p2Label.toLowerCase()}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FighterShowcase({ label, title, tone, character, emptyText }) {
  const toneClass = tone === 'rose'
    ? 'text-rose-200 border-rose-300/20 bg-rose-400/10'
    : 'text-orange-200 border-orange-300/20 bg-orange-400/10';
  const statAccent = tone === 'rose' ? 'bg-rose-300' : 'bg-orange-300';
  const stats = character?.stats || {};

  return (
    <SurfacePanel className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="font-pixel text-[10px] uppercase tracking-[0.26em] text-white/45">{label}</div>
        <span className={`rounded-full border px-3 py-1 font-pixel text-[9px] uppercase tracking-[0.18em] ${toneClass}`}>
          {character ? 'Verrouille' : 'A choisir'}
        </span>
      </div>

      {character ? (
        <>
          <div className="relative mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.82))]" />
            <div className="h-[240px] sm:h-[280px] lg:h-[360px]">
              <CharacterArt char={character} preview />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="font-pixel text-sm uppercase tracking-[0.16em] text-white sm:text-base">{title}</div>
              <div className={`mt-2 text-[11px] uppercase tracking-[0.28em] ${tone === 'rose' ? 'text-rose-200' : 'text-orange-200'}`}>
                {character.fullName || character.name}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">Style de combat</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {character.description || 'Style encore voile pour ce shinobi.'}
              </p>
            </div>

            <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">Technique signature</div>
              <div className="mt-2 font-medium text-white">{character.special || 'Technique encore scellee'}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Vitesse', stats.speed || 0],
                ['Puissance', stats.power || 0],
                ['Defense', stats.defense || 0],
                ['Chakra', stats.chakra || 0],
              ].map(([labelText, value]) => (
                <div key={labelText} className="rounded-[20px] border border-white/8 bg-black/20 px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">{labelText}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                      <div
                        className={`h-full rounded-full ${statAccent}`}
                        style={{ width: `${Math.min(100, Number(value) * 10)}%` }}
                      />
                    </div>
                    <span className="font-pixel text-[10px] uppercase tracking-[0.18em] text-white">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 flex min-h-[420px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/15 bg-black/20 px-6 text-center">
          <div className="font-pixel text-sm uppercase tracking-[0.18em] text-white/70">{emptyText}</div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
            Choisis ce combattant pour l inscrire sur la carte du duel.
          </p>
        </div>
      )}
    </SurfacePanel>
  );
}

function RosterCard({ character, isPlayer, isCpu, onClick }) {
  const selectionTone = isPlayer
    ? 'border-orange-300/70 shadow-[0_0_0_1px_rgba(251,146,60,0.32),0_18px_34px_rgba(249,115,22,0.18)]'
    : isCpu
      ? 'border-rose-300/70 shadow-[0_0_0_1px_rgba(244,63,94,0.3),0_18px_34px_rgba(244,63,94,0.18)]'
      : 'border-white/10 hover:border-white/20 hover:shadow-[0_18px_30px_rgba(2,6,23,0.28)]';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Choisir ${character.fullName || character.name}`}
      className={`group relative flex aspect-[0.84] w-full overflow-hidden rounded-[24px] border bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.9))] text-left transition duration-300 ease-out hover:-translate-y-1 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090c13] ${selectionTone}`}
    >
      <CharacterArt char={character} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_34%,rgba(2,6,23,0.9))]" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="font-pixel text-[10px] uppercase tracking-[0.16em] text-white">{character.name}</div>
        <div className="mt-2 min-h-[2.5rem] text-xs leading-5 text-slate-300 opacity-80 transition-opacity group-hover:opacity-100">
          {character.description || 'Shinobi du roster'}
        </div>
      </div>
      {(isPlayer || isCpu) && (
        <div
          className={`absolute left-3 top-3 rounded-full px-3 py-1 font-pixel text-[9px] uppercase tracking-[0.2em] text-black ${
            isPlayer ? 'bg-orange-300' : 'bg-rose-300'
          }`}
        >
          {isPlayer ? 'P1' : 'P2'}
        </div>
      )}
    </button>
  );
}

function StageCard({ stage, selected, index, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Choisir l'arene ${stage.name}`}
      className={`group relative h-44 overflow-hidden rounded-[26px] border text-left transition duration-300 ease-out hover:-translate-y-1 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090c13] ${
        selected
          ? 'border-emerald-300/70 shadow-[0_0_0_1px_rgba(52,211,153,0.32),0_22px_42px_rgba(16,185,129,0.16)]'
          : 'border-white/10 hover:border-emerald-200/40 hover:shadow-[0_18px_34px_rgba(2,6,23,0.24)]'
      }`}
      style={{
        backgroundImage: stage.thumbnail
          ? `url("${stage.thumbnail}")`
          : `linear-gradient(135deg, ${stage.skyTop}, ${stage.groundColor})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className={`absolute inset-0 ${selected ? 'bg-black/20' : 'bg-black/40 group-hover:bg-black/24'} transition-colors`} />
      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/30 px-3 py-1 font-pixel text-[9px] uppercase tracking-[0.2em] text-white/80">
        {String(index).padStart(2, '0')}
      </div>
      {selected ? (
        <div className="absolute right-4 top-4 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 font-pixel text-[9px] uppercase tracking-[0.2em] text-emerald-100">
          Selectionne
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="font-pixel text-[10px] uppercase tracking-[0.18em] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          {stage.name}
        </div>
        <div className="mt-2 text-xs uppercase tracking-[0.24em] text-white/70">Terrain de duel</div>
      </div>
    </button>
  );
}
