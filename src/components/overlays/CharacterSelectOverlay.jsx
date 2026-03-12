import { useGameActions } from '../../context/GameUIContext';
import { ActionButton } from '../ui/ActionButton';
import { CharacterArt } from '../ui/CharacterArt';
import { InfoPill } from '../ui/InfoPill';

export function CharacterSelectOverlay({ ui, selectedPlayer, selectedCpu }) {
  const actions = useGameActions();
  const soloTraining = ui.fightMode === 'training-solo';
  const selectableRoster = (ui.roster || []).filter((char) => char?.selectable !== false);
  const currentStep = ui.stageSelectVisible
    ? 'stage'
    : soloTraining
      ? 'player'
      : ui.selectedPlayerId && !ui.selectedCpuId
        ? 'cpu'
        : 'player';

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-slate-950/40 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* Top Header */}
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-pixel text-xl uppercase tracking-[0.16em] text-white drop-shadow-[0_2px_10px_rgba(251,146,60,0.5)] sm:text-2xl lg:text-3xl">
            {ui.selectTitle}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
            <InfoPill tone={currentStep === 'player' ? 'orange' : 'slate'}>1. {ui.p1Label}</InfoPill>
            {!soloTraining && <InfoPill tone={currentStep === 'cpu' ? 'rose' : 'slate'}>2. {ui.p2Label}</InfoPill>}
            <InfoPill tone={currentStep === 'stage' ? 'emerald' : 'slate'}>{soloTraining ? '2. Stage' : '3. Stage'}</InfoPill>
          </div>
        </div>
        <ActionButton onClick={actions.backToMenu} accent="slate" className="bg-black/50 backdrop-blur-md lg:w-auto lg:px-8">
          RETOUR MENU
        </ActionButton>
      </div>

      {/* Main Content Area */}
      <div className="mt-6 flex w-full flex-col gap-6 lg:mt-8 lg:flex-1 lg:flex-row lg:gap-8">

        {/* Left: Player 1 */}
        <div className="flex w-full flex-col items-center justify-end pb-0 lg:w-80 lg:pb-8">
          {selectedPlayer ? (
            <div className="relative flex h-[240px] w-full items-end justify-center sm:h-[320px] lg:h-[480px]">
              <CharacterArt char={selectedPlayer} preview />
              <div className="absolute bottom-2 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-center sm:bottom-4 sm:p-6">
                <div className="font-pixel text-lg uppercase tracking-widest text-white drop-shadow-lg sm:text-2xl">{ui.p1Name}</div>
                <div className="mt-2 text-sm uppercase tracking-wider text-orange-400">{ui.p1Label}</div>
              </div>
            </div>
          ) : (
            <div className="flex h-[180px] w-full flex-col items-center justify-center border border-dashed border-white/20 bg-black/20 text-slate-500 backdrop-blur-sm sm:h-[240px] lg:h-[480px]">
              <span className="font-pixel text-sm uppercase tracking-widest">Choix {ui.p1Label}</span>
            </div>
          )}
        </div>

        {/* Center: Roster & Stage */}
        <div className="flex flex-1 flex-col items-center pt-0 lg:pt-8">
          {!ui.stageSelectVisible ? (
            <div className="grid w-full grid-cols-3 gap-3 overflow-y-auto pb-4 sm:grid-cols-4 sm:gap-4 lg:pb-8 lg:pr-4 xl:grid-cols-6" style={{ scrollbarWidth: 'none' }}>
              {selectableRoster.map((char) => {
                const isPlayer = ui.selectedPlayerId === char.id;
                const isCpu = ui.selectedCpuId === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => actions.selectCharacter(char.id)}
                    className={`group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-2 transition-transform duration-200 hover:z-10 sm:h-28 sm:w-28 ${isPlayer
                        ? 'border-orange-400 bg-orange-950/60 shadow-[0_0_25px_rgba(251,146,60,0.6)]'
                        : isCpu
                          ? 'border-rose-400 bg-rose-950/60 shadow-[0_0_25px_rgba(244,63,94,0.6)]'
                          : 'border-white/10 bg-black/60 hover:border-orange-400/50 hover:bg-black/80 hover:shadow-[0_0_15px_rgba(251,146,60,0.3)]'
                      }`}
                  >
                    <CharacterArt char={char} />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="font-pixel text-[9px] uppercase tracking-widest text-white">
                        {char.name}
                      </span>
                    </div>
                    {(isPlayer || isCpu) && (
                      <div className={`absolute left-0 top-0 rounded-br-lg px-2 py-1 font-pixel text-[9px] uppercase tracking-widest text-black shadow-md ${isPlayer ? 'bg-orange-400' : 'bg-rose-400'}`}>
                        {isPlayer ? 'P1' : 'P2'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="w-full max-w-4xl pt-2 sm:pt-4">
              <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-pixel text-lg uppercase tracking-[0.16em] text-emerald-400 sm:text-2xl">Choix du Terrain</h3>
                  <p className="mt-2 text-sm text-emerald-100/60">Sélectionne l'arène du duel</p>
                </div>
                <InfoPill tone="emerald">{ui.stages.length} ARÈNES</InfoPill>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {ui.stages.map((stage) => {
                  const selected = ui.selectedStageId === stage.id;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => actions.selectStage(stage.id)}
                      className={`relative h-32 overflow-hidden rounded-xl border-2 transition-all duration-200 hover:scale-[1.05] ${selected ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]' : 'border-white/10 hover:border-emerald-400/50'
                        }`}
                      style={{
                        backgroundImage: stage.thumbnail ? `url("${stage.thumbnail}")` : `linear-gradient(135deg, ${stage.skyTop}, ${stage.groundColor})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className={`absolute inset-0 transition-colors ${selected ? 'bg-black/10' : 'bg-black/40 hover:bg-black/20'}`} />
                      <div className="absolute bottom-3 left-3 right-3 text-left font-pixel text-[10px] uppercase tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {stage.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Player 2 (CPU) */}
        {!soloTraining && (
          <div className="flex w-full flex-col items-center justify-end pb-0 lg:w-80 lg:pb-8">
          {selectedCpu ? (
            <div className="relative flex h-[240px] w-full items-end justify-center sm:h-[320px] lg:h-[480px]">
              <CharacterArt char={selectedCpu} preview />
              <div className="absolute bottom-2 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-center sm:bottom-4 sm:p-6">
                <div className="font-pixel text-lg uppercase tracking-widest text-white drop-shadow-lg sm:text-2xl">{ui.p2Name}</div>
                <div className="mt-2 text-sm uppercase tracking-wider text-rose-400">{ui.p2Label}</div>
              </div>
            </div>
          ) : (
            <div className="flex h-[180px] w-full flex-col items-center justify-center border border-dashed border-white/20 bg-black/20 text-slate-500 backdrop-blur-sm sm:h-[240px] lg:h-[480px]">
              <span className="font-pixel text-sm uppercase tracking-widest">Choix {ui.p2Label}</span>
            </div>
          )}
          </div>
        )}

      </div>
    </div>
  );
}
