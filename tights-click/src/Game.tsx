import React from 'react';
import { StageIDType, splitStageID } from './constants';

interface GameProps {
  stage: StageIDType | null;
}

const Game: React.FC<GameProps> = ({ stage }) => {
  if (!stage) {
    return <div>No stage selected.</div>;
  }

  const { course, size } = splitStageID(stage);

  return (
    <div>
      <p>Course: {course}</p>
      <p>Size: {size}</p>
    </div>
  );
};

export default Game;
