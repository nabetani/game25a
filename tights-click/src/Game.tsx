import React, { useEffect, useRef } from 'react';
import { StageIDType, splitStageID } from './constants';
import { useCurrentGameStore } from './current_game_store';
import useWorldStore from './worldStore';
import { CellState, CellType, progressWorld, WorldType } from './world';

const pieceColor = (dir: number): string => {
  return `oklch(0.8 0.4 ${dir * 90 + 10}`
}

const animationDur = "1.25s"
function CellSVG({ cell, x, y }: { cell: CellType, x: number, y: number }) {
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
  const col = pieceColor(cell.dir & 3);
  const handleClick = () => {
    const p = progressWorld(cell, x, y, world);
    if (p == null) { return }
    updateCurrentGame({ score: currentGame.score + p.score })
    setWorld(p.world);
  };
  const dirTo = cell.dir & 3 + 4
  const dirPrev = cell.dirPrev ?? cell.dir - ((x * 29 + y * 31 + cell.dir * 37 + 41) >> 2) % 3 - 1
  const dirFrom = dirPrev - (cell.dir - dirTo)
  const opacity = CellState.vanishing <= cell.state ? 0 : 1
  return (
    <g opacity={opacity}>
      <AnimateOpacity state={cell.state} />
      <g>
        <AnimateTransfromShake state={cell.state} />
        <g transform={`rotate(${dirTo * 90})`}>
          <AnimateTransfromRotate dirFrom={dirFrom} dirTo={dirTo} />
          <g>
            <path
              key={[dirFrom, dirTo].join(" ")}
              d={c}
              fill={col}
              strokeWidth={cell.kind == world.nextKind ? 0.1 : 0}
              stroke='black'
              onPointerDown={(event) => {
                event.preventDefault()
                handleClick()
              }}
            >
              <AnimateStrokeWidth cell={cell.kind} started={world.started} world={world.nextKind} />
              <AnimateColor dirFrom={dirFrom} dirTo={dirTo} cell={cell} />
            </path>
          </g>
          <text y={0.2} style={{ pointerEvents: "none" }}>
            {["タ", "イ", "ツ"][cell.kind] ?? "?"}
          </text>
        </g>
      </g>
    </g >
  );
}

function AnimateStrokeWidth({ cell, world, started }: { started: boolean, cell: number, world: number }): React.JSX.Element {
  const aniRef = useRef<SVGAnimateElement>(null);
  const cur = cell == world
  const vani = 0 == ((cell - world + 1) % 3 + 3) % 3
  useEffect(() => {
    if (aniRef.current != null) {
      aniRef.current.beginElement(); // アニメーション開始
    }
  }, [cur, vani]);
  if (!cur && !vani) { return <></> }
  const values = (cur ? [0, 0.1] : [started ? 0.1 : 0, 0]).join(";")
  return <animate
    ref={aniRef}
    attributeName='stroke-width'
    values={values}
    dur={animationDur}
    repeatCount={1} />
}

function AnimateTransfromRotate({ dirFrom, dirTo }: { dirFrom: number, dirTo: number }): React.JSX.Element {
  const aniTransRef = useRef<SVGAnimateTransformElement>(null);
  useEffect(() => {
    if (aniTransRef.current != null) {
      aniTransRef.current.beginElement(); // アニメーション開始
    }
  }, [dirFrom, dirTo]);
  return <>
    <animateTransform
      ref={aniTransRef}
      key={[dirFrom, dirTo].join(" ")}
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      from={dirFrom * 90}
      to={dirTo * 90}
      dur={animationDur}
      repeatCount="1" />
  </>
}

function AnimateOpacity({ state }: { state: CellState }): React.JSX.Element {
  const aniRef = useRef<SVGAnimateElement>(null);
  const aniTRef = useRef<SVGAnimateTransformElement>(null);
  useEffect(() => {
    if (aniRef.current != null) {
      aniRef.current.beginElement(); // アニメーション開始
    }
    if (aniTRef.current != null) {
      aniTRef.current.beginElement(); // アニメーション開始
    }
  }, [state]);
  if (state != CellState.vanishing) { return <></> }
  return <>
    <animate
      ref={aniRef}
      attributeName='opacity'
      values="1;0"
      dur={animationDur}
      repeatCount={1} />
    <animateTransform
      ref={aniTRef}
      key={state}
      dur={animationDur}
      values="1;10"
      repeatCount={1}
      type="scale"

      attributeName="transform"
      attributeType="XML" />
  </>
}

function AnimateTransfromShake(
  { state }:
    { state: CellState }): React.JSX.Element {
  const aniTransRef = useRef<SVGAnimateTransformElement>(null);
  useEffect(() => {
    if (aniTransRef.current != null) {
      aniTransRef.current.beginElement(); // アニメーション開始
    }
  }, [state]);

  if (state != CellState.fixed) { return <></> }

  const shake = (): string => {
    const n = 100
    const r = 0.05
    return Array.from({ length: n }).map((_, ix): string => {
      const t0 = ix * Math.PI * 10 / n
      const t1 = ix * Math.PI * 12 / n
      return [
        r * Math.sin(t0),
        r * Math.sin(t1),
      ].join(" ")
    }).join(";")
  }
  return <animateTransform
    ref={aniTransRef}
    key={state}
    dur="1s"
    values={shake()}
    repeatCount="indefinite"
    attributeName="transform"
    attributeType="XML" />

}

function AnimateColor({ dirFrom, dirTo, cell }:
  { cell: CellType, dirFrom: number, dirTo: number }): React.JSX.Element {
  const aniColRef = useRef<SVGAnimateElement>(null);
  useEffect(() => {
    if (aniColRef.current != null) {
      aniColRef.current.beginElement(); // アニメーション開始
    }
  }, [dirFrom, dirTo]);
  const n = 10
  const colors = Array.from({ length: n + 1 }).map(
    (_, ix) => pieceColor(dirFrom + (dirTo - dirFrom) / n * ix)).join(";")
  return <>
    <animate
      ref={aniColRef}
      attributeName='fill'
      values={colors}
      dur={animationDur}
      repeatCount={1} />
  </>
}

function mapXY<T>(w: { width: number, height: number }, proc: (x: number, y: number) => T | null): T[] {
  const { width, height } = w
  const r: T[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = proc(x, y)
      if (v != null) { r.push(v) }
    }
  }
  return r
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
  const placeCell = (cell: CellType, x: number, y: number): React.JSX.Element => {
    const tx = pad + (x + 0.5) * cellStep
    const ty = pad + (y + 0.5) * cellStep
    return (
      <g key={[x, y].join(" ")} transform={`translate(${tx} ${ty})`}>
        {cell != null && <CellSVG x={x} y={y} cell={cell} />}
      </g>
    );
  }
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
        {mapXY(world, (x, y) => {
          const cell = world.cells[x + y * world.width];
          if (CellState.vanishing <= cell.state) { return null }
          return placeCell(cell, x, y)
        })}
        {mapXY(world, (x, y) => {
          const cell = world.cells[x + y * world.width];
          if (!(CellState.vanishing <= cell.state)) { return null }
          return placeCell(cell, x, y)
        })}
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
