import React from 'react';
import { makeStageID, Phase, PhaseProps, PlayingStageProps } from './constants';
import { useStageStore } from './stage_store';

const StageSel: React.FC<PhaseProps & PlayingStageProps> = ({ phase, setPhase, stage, setStage }) => {
  const { stageStates, updateStageUnit } = useStageStore()

  const startGame = (ix: number, size: number) => {
    const stageID = makeStageID(ix, size)
    const selected = stageStates.m[stageID]
    updateStageUnit(stageID, { ...selected, trialCount: (selected?.trialCount ?? 0) + 1 })
    setStage(stageID)
    setPhase(Phase.Playing)
  }
  return (
    <div>
      <h1>Stage Selection</h1>
      <div>
        {Array.from({ length: 20 }).map((_, ix) => <button
          key={ix}
          onClick={() => startGame(ix, 0)}>play {ix}
        </button>)}
      </div>
    </div>
  );
};

export default StageSel;
