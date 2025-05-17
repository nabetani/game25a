import React from 'react';
import { StageIDType, splitStageID } from './constants';
import { useCurrentGameStore } from './current_game_store';
import useWorldStore from './worldStore';
import { CellType } from './world';


function CellSVG({ cell }: { cell: CellType }) {
  const c = `
    M-0.5,0
    A0.5,0.5 0 0,1 0.5,0
    L0.5,0.4
    Q0.5,0.5 0.4,0.5
    L-0.4,0.5
    Q-0.5,0.5 -0.5,0.4
    Z
    `
  const col = ["red", "green", "blue", "yellow"][cell.dir & 3]
  return <path d={c} fill={col} />
}

function WorldSVG(): React.JSX.Element {
  const { world } = useWorldStore()
  const { width, height } = world
  const pad = 0.5
  const svgVW = width + pad * 2
  const svgVH = height + pad * 2
  const viewBox = [-pad, -pad, svgVW, svgVH].join(" ")
  const vw = 90
  const styleW = `${vw}vw`
  const styleH = `${vw / svgVW * svgVH}vw`
  return <svg className='world-svg' style={{ width: styleW, height: styleH }} viewBox={viewBox}>
    {Array.from({ length: world.height }).map((_, y) =>
      Array.from({ length: world.width }).map((_, x) => {
        const cell = world.cells[x + y * world.width];
        return <g key={[x, y].join(" ")}
          transform={`translate(${x} ${y})`}>
          {cell != null && <CellSVG cell={cell} />}
        </g>
      }))}
  </svg>
}

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
      <div>
        <p>Course: {course}</p>
        <p>Size: {size}</p>
        <p>Score: {currentGame.score}</p>
        <p>Combo: {currentGame.combo}</p>
      </div>
      <WorldSVG />
    </div>
  );
};

export default Game;

