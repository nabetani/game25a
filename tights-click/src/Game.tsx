import React from 'react';
import { StageIDType, splitStageID } from './constants';
import { useStageStore } from './stage_store';

interface GameProps {
  stage: StageIDType | null;
}

const Game: React.FC<GameProps> = ({ stage }) => {
  const stageStore = useStageStore()
  if (!stage) {
    return <div>No stage selected.</div>;
  }
  const stageProp = stageStore.stageStates.m[stage]

  const { course, size } = splitStageID(stage);

  return (
    <div>
      <p>Course: {course}</p>
      <p>Size: {size}</p>
      <p>Prop: {JSON.stringify(stageProp)} </p>
    </div>
  );
};

export default Game;
