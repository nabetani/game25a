import React, { useEffect, useRef } from 'react';
import { StageIDType, splitStageID } from './constants';
import { useCurrentGameStore } from './current_game_store';
import useWorldStore from './worldStore';
import { CellType, WorldType } from './world';

function CellSVG({ cell }: { cell: CellType }) {
  const { setWorld, world } = useWorldStore();
  const { currentGame, updateCurrentGame } = useCurrentGameStore();
  const c = `
    M-0.5,0
    A0.5,0.5 0 0,1 0.5,0
    L0.5,0.4
    Q0.5,0.5 0.4,0.5
    L-0.4,0.5
    Q-0.5,0.5 -0.5,0.4
    Z
    `;
  const col = ["red", "green", "blue", "Darkgoldenrod"][cell.dir & 3];
  const handleClick = () => {
    updateCurrentGame({ score: currentGame.score + 1 })
    const newDir = cell.dir + 1 + Math.floor(Math.random() * 2);
    const newCell = { ...cell, dir: newDir, dirPrev: cell.dir };
    const newCells = world.cells.map((c) => (c === cell ? newCell : c));
    const newWorld: WorldType = { ...world, cells: newCells };
    setWorld(newWorld);
  };
  const dirTo = cell.dir & 3
  const dirPrev = cell.dirPrev ?? cell.dir
  const dirFrom = dirPrev - (cell.dir - dirTo)
  return (
    <g
      transform={`rotate(${dirTo * 90})`}
    >
      {cell.dirPrev != null &&
        <AnimateTransfromRotate dirFrom={dirFrom} dirTo={dirTo} />}
      <path
        key={[dirFrom, dirTo].join(" ")}
        d={c}
        fill={col}
        onPointerDown={(event) => {
          event.preventDefault()
          handleClick()
        }}
      >
      </path>
      <text style={{ pointerEvents: "none" }}>
        {["タ", "イ", "ツ"][cell.kind] ?? "?"}
      </text>
    </g>
  );
}

function AnimateTransfromRotate({ dirFrom, dirTo }: { dirFrom: number, dirTo: number }): React.JSX.Element {
  const animateRef = useRef<SVGAnimateTransformElement>(null);
  useEffect(() => {
    if (animateRef.current != null) {
      animateRef.current.beginElement(); // アニメーション開始
    }
  }, [dirFrom, dirTo]);
  return <animateTransform
    ref={animateRef}
    key={[dirFrom, dirTo].join(" ")}
    attributeName="transform"
    attributeType="XML"
    type="rotate"
    from={dirFrom * 90}
    to={dirTo * 90}
    dur="0.2s"
    repeatCount="1" />;
}

function WorldSVG(): React.JSX.Element {
  const { world } = useWorldStore();
  const { width, height } = world;
  const pad = 0.25;
  const cellStep = 1.25
  const svgVW = width * cellStep + pad * 2;
  const svgVH = height * cellStep + pad * 2;
  const viewBox = [0, 0, svgVW, svgVH].join(" ");
  const vw = 90;
  const styleW = `${vw}vw`;
  const styleH = `${vw / svgVW * svgVH}vw`;
  return (
    <svg
      className="world-svg"
      style={{ width: styleW, height: styleH }}
      viewBox={viewBox}
    >
      <g
        fontFamily='Cherry Bomb One'
        dominantBaseline="middle" textAnchor="middle"
        fontSize={1}
      >

        {Array.from({ length: world.height }).map((_, y) =>
          Array.from({ length: world.width }).map((_, x) => {
            const cell = world.cells[x + y * world.width];
            const tx = pad + (x + 0.5) * cellStep
            const ty = pad + (y + 0.5) * cellStep
            return (
              <g key={[x, y].join(" ")} transform={`translate(${tx} ${ty})`}>
                {cell != null && <CellSVG cell={cell} />}
              </g>
            );
          })
        )}
      </g>
    </svg>
  );
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
