import React from 'react';
import { StageIDType, splitStageID } from './constants';
import { useCurrentGameStore } from './current_game_store';

interface GameProps {
  stage: StageIDType | null;
}

const Game: React.FC<GameProps> = ({ stage }) => {
  const { currentGame } = useCurrentGameStore();
  if (!stage) {
    return <div>No stage selected.</div>;
  }

  const { course, size } = splitStageID(stage);

  return (
    <div>
      <p>Course: {course}</p>
      <p>Size: {size}</p>
      <p>Score: {currentGame.score}</p>
      <p>Combo: {currentGame.combo}</p>
    </div>
  );
};

export default Game;
