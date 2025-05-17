import React from 'react';
import { GameSize, gameSizeNumbers, makeStageID, Phase, PhaseProps, PlayingStageProps } from './constants';
import { useStageStore } from './stage_store';
import { useCurrentGameStore } from './current_game_store';
import { useStageSelStore } from './stage_sel_store';

const StageSel: React.FC<PhaseProps & PlayingStageProps> = ({ phase, setPhase, stage, setStage }) => {
  const { stageStates, updateStageUnit } = useStageStore()
  const { updateCurrentGame } = useCurrentGameStore();
  const { sizeID, setSizeID, soundOn, setSoundOn } = useStageSelStore();

  function startGame(ix: number, size: number) {
    const stageID = makeStageID(ix, size);
    const selected = stageStates.m[stageID];
    updateStageUnit(stageID, { ...selected, trialCount: (selected?.trialCount ?? 0) + 1 });
    updateCurrentGame({ score: 0, combo: 0 });
    setStage(stageID);
    setPhase(Phase.Playing);
  }
  return (
    <div>
      <h1>Stage Selection</h1>
      <div>
        <button
          className={soundOn ? "sound-selected" : "sound-not-selected"}
          onClick={() => setSoundOn(true)}>Sound ON</button>
        <button
          className={soundOn ? "sound-not-selected" : "sound-selected"}
          onClick={() => setSoundOn(false)}>Sound OFF</button>
      </div>
      <div>
        {
          gameSizeNumbers().map(e => {
            if (e == sizeID) {
              return <span key={e} >[{GameSize[e]}]</span>
            } else {
              return <button key={e}
                onClick={() => setSizeID(e)}
              >[{GameSize[e]}]</button>
            }
          }
          )}
      </div>
      <div>
        {Array.from({ length: 20 }).map((_, ix) => <button
          key={ix}
          onClick={() => startGame(ix, sizeID)}>play {ix}
        </button>)}
      </div>
    </div>
  );
};

export default StageSel;
