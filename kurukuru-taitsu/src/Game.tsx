import React, { useEffect, useRef, useState } from 'react';
import { gameSizeKey, Phase, splitStageID } from './constants';
import type { GameSizeValues, StageIDType } from "./constants"
import type { CurrentGame, Specials } from './current_game_store';
import { useCurrentGameStore } from './current_game_store';
import useWorldStore from './worldStore';
import type { CellType, WorldType, CellStateValues } from './world';
import { CellState, progressWorld } from './world';
import { usePhaseStore } from './phaseStore';
import mitt from 'mitt';
import { useStageStore } from './stage_store';
import { BGTights } from './BGTights';

type MittEvents = {
  addScore: string | null;
};

const emitter = mitt<MittEvents>();

const pieceColor = (dir: number): string => {
  return `oklch(0.8 0.4 ${dir * 90 + 10}`
}

const animationDur = "1.25s"
const animationDurShort = "1s"
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
    updateCurrentGame({
      score: currentGame.score + p.score,
      combo: p.world.combo,
      specials: p.specials,
    })
    setWorld(p.world);
    if (0 < (p.score ?? 0)) {
      console.log("addScore", `+${p.score}`)
      emitter.emit("addScore", `+${p.score}`)
    }
  };
  const { dirTo, dirFrom, opacity } = ((): { dirTo: number, dirFrom: number, opacity: number } => {
    const cellDir = cell.dir & 3 + 4
    if (CellState.vanishing <= cell.state) {
      return { opacity: 0, dirFrom: cellDir, dirTo: cellDir + cell.kind + 1 }
    }
    const dirPrev = cell.dirPrev ?? cell.dir - hashVal(x, y, cell)
    return { opacity: 1, dirFrom: dirPrev - (cell.dir - cellDir), dirTo: cellDir }
  })()
  return (
    <g opacity={opacity}>
      <AnimateOpacity state={cell.state} specials={currentGame.specials} />
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

function hashVal(x: number, y: number, cell: CellType): number {
  return ((x * 29 + y * 31 + cell.dir * 37 + 41) >> 2) % 3 + 1;
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

function AnimateOpacity({ state, specials }: { specials: Specials, state: CellStateValues }): React.JSX.Element {
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
  const scaleValues = specials.unicolor ? "1;10" : "1;2"
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
      values={scaleValues}
      repeatCount={1}
      type="scale"

      attributeName="transform"
      attributeType="XML" />
  </>
}

function AnimateTransfromShake(
  { state }:
    { state: CellStateValues }): React.JSX.Element {
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

function AnimateColor({ dirFrom, dirTo }:
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

function AnimateSameLineEffect(
  { x, y, scaleValues }: { x: number | null | undefined, y: number | null | undefined, scaleValues: string }
): React.JSX.Element {
  // interface B { beginElement(): void }
  const aniTransRef = useRef<SVGAnimateTransformElement>(null);
  const aniOpacityRef = useRef<SVGAnimateElement>(null);
  const aniColorRef = useRef<SVGAnimateElement>(null);
  useEffect(() => {
    [aniTransRef,
      aniOpacityRef,
      aniColorRef
    ].forEach(e => (e.current != null) && e.current.beginElement()); // アニメーション開始
  }, [x, y]);
  const colCount = 36
  const colors = Array.from({ length: colCount }).map((_, ix) => (
    `oklch(0.8 0.4 ${ix * 360 * 2 / colCount})`
  )).join(";")
  return <>
    <animate
      ref={aniOpacityRef}
      attributeName='opacity'
      values="1;0"
      dur={animationDurShort}
      repeatCount={1} />
    <animate
      ref={aniColorRef}
      attributeName='fill'
      values={colors}
      dur={animationDurShort}
      repeatCount={1} />
    <animateTransform
      ref={aniTransRef}
      attributeName="transform"
      attributeType="XML"
      type="scale"
      values={scaleValues}
      dur={animationDur}
      repeatCount="1" />
  </>
}

function SameLineEffect(
  { centerXY }: { centerXY: (x: number, y: number) => [number, number] }
): React.JSX.Element {
  const { currentGame } = useCurrentGameStore();
  const { world } = useWorldStore();
  const x = currentGame.specials.x
  const y = currentGame.specials.y
  if (x == null && y == null) {
    return <></>
  }
  if (x != null) {
    const [x0, y0] = centerXY(x - 0.5, -0.5)
    const [x1, y1] = centerXY(x + 0.5, world.height - 0.5)
    const w = x1 - x0
    const h = y1 - y0
    return <g transform={`translate(${x0 + w / 2} ${y0 + h / 2})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} opacity={0}>
        <AnimateSameLineEffect x={x} y={y} scaleValues='0 1;3 1' />
      </rect>
    </g>
  }
  const [x0, y0] = centerXY(-0.5, y! - 0.5)
  const [x1, y1] = centerXY(world.width - 0.5, y! + 0.5)
  const w = x1 - x0
  const h = y1 - y0
  return <g transform={`translate(${x0 + w / 2} ${y0 + h / 2})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} opacity={0}>
      <AnimateSameLineEffect x={x} y={y} scaleValues='1 0;1 3' />
    </rect>
  </g>

}

function AnimateScaleScore(): React.JSX.Element {
  const aniTransRef = useRef<SVGAnimateTransformElement>(null);
  useEffect(() => {
    const o = aniTransRef.current
    if (o == null) { return }
    o.beginElement(); // アニメーション開始
    const onEndEvent = () => { emitter.emit("addScore", null) }
    o.addEventListener("endEvent", onEndEvent)
    return () => { o.removeEventListener("endEvent", onEndEvent) }
  }, []);
  return <>
    <animateTransform
      ref={aniTransRef}
      attributeName="transform"
      attributeType="XML"
      type="scale"
      values="1;10"
      dur={animationDur}
      repeatCount="1" />
  </>
}

function AnimateOpacityScore(): React.JSX.Element {
  const aniRef = useRef<SVGAnimateElement>(null);
  useEffect(() => {
    if (aniRef.current != null) {
      aniRef.current.beginElement(); // アニメーション開始
    }
  }, []);
  const values = "0;" + Array.from({ length: 10 }).map((_, ix) => (9 - ix) * 0.1).join(";")
  return <>
    <animate
      ref={aniRef}
      attributeName='opacity'
      values={values}
      dur={animationDur}
      repeatCount={1} />
  </>
}

function AnimateFillScore(): React.JSX.Element {
  const aniRef = useRef<SVGAnimateElement>(null);
  useEffect(() => {
    if (aniRef.current != null) {
      aniRef.current.beginElement(); // アニメーション開始
    }
  }, []);
  const n = 36
  const values = Array.from({ length: n }).map(
    (_, ix) => `oklch(0.9 0.4 ${ix * 10})`
  ).join(";")
  return <>
    <animate
      ref={aniRef}
      attributeName='fill'
      values={values}
      dur="0.3s"
      repeatCount="indefinite" />
  </>
}

function ScoreDiff(): React.JSX.Element {
  const [text, setText] = useState<string | null>(null)
  useEffect(() => {
    function onAddScore(t: string | null) {
      console.log("onAddScore", t)
      setText(t)
    }
    emitter.on("addScore", onAddScore)
    return () => { emitter.off("addScore", onAddScore) }
  }, [])
  if (text == null) { return <g id="empty?"></g> }
  return <g key={text} opacity={0}>
    <AnimateScaleScore />
    <AnimateOpacityScore />
    <AnimateFillScore />
    <text x={0} y={0} >{text}</text>
  </g>

}


function WorldSVG(): React.JSX.Element {
  const { world } = useWorldStore();
  const { width, height } = world;
  const pad = 0.25;
  const cellStep = 1.25
  const svgVW = width * cellStep + pad * 2;
  const svgVH = height * cellStep + pad * 2;
  const viewBox = [0, 0, svgVW, svgVH].join(" ");
  // const vw = 90;
  const styleW = "var(--w)";
  const styleH = `calc(var(--w) * ${svgVH / svgVW}`
  const centerXY = (x: number, y: number): [number, number] => {
    return [pad + (x + 0.5) * cellStep, pad + (y + 0.5) * cellStep]
  }
  const placeCell = (cell: CellType, x: number, y: number): React.JSX.Element => {
    const [tx, ty] = centerXY(x, y)
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
        <g pointerEvents="none" >
          <SameLineEffect centerXY={centerXY} />
        </g>
        {mapXY(world, (x, y) => {
          const cell = world.cells[x + y * world.width];
          if (!(CellState.vanishing <= cell.state)) { return null }
          return placeCell(cell, x, y)
        })}
      </g>
      <g
        fontFamily='Cherry Bomb One'
        dominantBaseline="middle" textAnchor="middle"
        fontSize={svgVW / 20}
        transform={`translate(${svgVW / 2} ${svgVH / 2})`}
        style={{ pointerEvents: "none" }}
        strokeWidth={svgVW / 400} stroke="black"
      >
        <ScoreDiff />
      </g>
    </svg>
  );
}


const rankText = (score: number, count: number): string => {
  const low = count * 100
  const s0 = 200
  const sL = count * 100 + 100
  const hi = (s0 + sL) * count / 2
  if (8 < count && hi <= score) { return "Incredible!" }
  const r = 100 * (score - low) / (hi - low)
  if (6 < count && 50 <= r) { return "Awesome!" }
  if (4 < count && 15 <= r) { return "Well Done!" }
  if (5 <= r) { return "Good Job!" }
  return "You Made It!"
}

function CompletedUI(): React.JSX.Element {
  const { currentGame } = useCurrentGameStore();
  const { world } = useWorldStore();
  const { setPhase } = usePhaseStore();
  const text = `I scored ${currentGame.score} in Tights Click!`;
  const url = `https://taittsuu.com/share?text=${encodeURIComponent(text)}`;
  return (
    <div id="completed-wrapper">
      <div id="completed">
        {currentGame.newBest == true ? <>
          <p id="new-record">New Record!</p>
        </> : <>
          <p id="completed-head">Completed</p>
        </>}
        <p id="rank-text">{rankText(currentGame.score, world.count)}</p>
        <div id="completed-buttons">
          <button className="back-to-title" onClick={() => setPhase(Phase.StageSel)}>Back to Title</button>
          <button className="taiitsu" onClick={() => window.open(url, '_blank')}>タイーツ</button>
        </div>
      </div>
    </div>
  );
}

const comboAnimationFrame = (combo: number): PropertyIndexedKeyframes => {
  const color = Array.from({ length: 36 }).map((_, ix) => `oklch( 0.4 0.4 ${ix * 10}`)
  const s = 0.05 * Math.max(0, combo - 1)
  const x = Math.max(0, combo - 3) * 0.3
  const r = Math.max(0, combo - 5) * 0.005
  const N = 50;
  const transform = Array.from({ length: N }).map((_, ix) => {
    const th = ix * (Math.PI * 2 / N);
    const scale = `scale( ${2 ** (s * Math.sin(th))} )`
    const translate = `translate(${x * Math.sin(th * 4)}%,${x * Math.cos(th * 3)}%)`
    const rotate = `rotate(${r * Math.sin(th * 3)}turn)`
    return [translate, rotate, scale].join(" ")
  })

  return { color, transform }
}

function GameStatePanel({
  title, currentGame
}: {
  title: string,
  currentGame: CurrentGame
}): React.JSX.Element {
  const comboRef = useRef<HTMLParagraphElement>(null)
  const [animation, setAnimation] = useState<Animation | null>(null)
  useEffect(() => {
    if (comboRef.current != null) {
      const combo = currentGame.combo ?? 0
      if (0 < combo) {
        setAnimation(
          comboRef.current.animate(
            comboAnimationFrame(combo),
            { duration: 300, iterations: Infinity, }
          ))
      } else {
        if (animation != null) {
          animation.cancel()
        }
      }
    }
    return () => { animation != null && animation.cancel() }
  }, [comboRef.current, currentGame.combo])
  return <div id="game-state-panel">
    <p id="title">{title}</p>
    <p id="score-text">
      <span id="score-num">{currentGame.score}</span>
      <span id="score-unit">pts.</span>
    </p>
    <p id="combo" ref={comboRef}>{currentGame.combo} Combo</p>
  </div>

}

interface GameProps {
  stage: StageIDType | null;
}

const countRest = (world: WorldType): number => (
  world.cells.reduce((acc, x) => acc + (x.state == CellState.placed ? 1 : 0), 0)
)
const Game: React.FC<GameProps> = ({ stage }) => {
  const { currentGame, updateCurrentGame } = useCurrentGameStore();
  const { world } = useWorldStore();
  const { phase, setPhase } = usePhaseStore();
  const { stageStates, updateStageUnit } = useStageStore();
  if (!stage) {
    return <div>No stage selected.</div>;
  }
  const rest = countRest(world)
  React.useEffect(() => {
    switch (phase) {
      case Phase.Started:
        updateCurrentGame({
          specials: {},
        })
        setPhase(Phase.Playing)
        break
      case Phase.Playing:
        if (rest === 0) {
          const old = stageStates.m[stage]
          const newBest = (old.best ?? 0) < currentGame.score
          if (newBest) {
            updateStageUnit(stage, { best: currentGame.score })
          }
          updateCurrentGame({ newBest })
          setPhase(Phase.Completed)
        }
        break
    }
  }, [phase, rest])

  const { course, size } = splitStageID(stage);

  const title = `${gameSizeKey(size as GameSizeValues)} #${course}`

  return <>
    <BGTights />
    <div id="game-body">
      <GameStatePanel title={title} currentGame={currentGame} />
      <WorldSVG />
      {phase == Phase.Completed && <CompletedUI />}
    </div>
  </>;
};

export default Game;
