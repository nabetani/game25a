import React from 'react';
import { makeStageID, Phase, PhaseProps, PlayingStageProps } from './constants';

const StageSel: React.FC<PhaseProps & PlayingStageProps> = ({ phase, setPhase, stage, setStage }) => {
  const startGame = (ix: number, size: number) => {
    setStage(makeStageID(ix, size))
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
