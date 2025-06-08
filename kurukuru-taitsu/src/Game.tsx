import React, { useEffect, useRef, useState, type SVGProps } from 'react';
import { gameSizeKey, makeStageID, Phase, splitStageID } from './constants';
import type { GameSizeValues } from "./constants"
import type { CurrentGame } from './current_game_store';
import { useCurrentGameStore } from './current_game_store';
import useWorldStore from './worldStore';
import type { CellType, WorldType } from './world';
import { CellState, progressWorld } from './world';
import { usePhaseStore } from './phaseStore';
import mitt from 'mitt';
import { useStageStore } from './stage_store';
import { BGTights } from './BGTights';
import { play, stopAll } from './sound';
import { useStageSelStore } from './stage_sel_store';

type MittEvents = {
  addScore: string | null;
};

const emitter = mitt<MittEvents>();

const pieceColor = (dir: number): string => {
  return `oklch(0.8 0.4 ${dir * 90 + 10}`
}

function CellRotate({ children, dirFrom, dirTo }: { children: React.ReactNode, dirFrom: number, dirTo: number }): React.JSX.Element {
  const ref = useRef<SVGGElement>(null)
  const dirToA = (dirFrom & 3) == (dirTo & 3) ? dirFrom : dirTo

  useEffect(() => {
    const c = ref.current
    if (c == null) {
      return
    }
    const a = c.animate(
      {
        transform: [
          `rotate(${dirFrom * 90}deg)`,
          `rotate(${dirToA * 90}deg)`,
        ]
      },
      {
        duration: 1000,
        easing: "ease-out",
        iterations: 1,
        fill: "forwards" // 終了後も最後の状態を維持

      }
    )
    return () => a.cancel()

  }, [ref.current])
  return <g
    ref={ref}
    transform={`rotate(${dirFrom * 90})`}
  >{children}</g>
}

function CellColor({ children, dirFrom, dirTo }: { children: React.ReactNode, dirFrom: number, dirTo: number }): React.JSX.Element {
  const ref = useRef<SVGGElement>(null)
  const dirToA = (dirFrom & 3) == (dirTo & 3) ? dirFrom : dirTo
  useEffect(() => {
    const c = ref.current
    if (c == null) {
      return
    }
    const a = c.animate(
      {
        fill: [
          pieceColor(dirFrom),
          pieceColor(dirToA),
        ]
      },
      {
        duration: 1000,
        easing: "ease-out",
        iterations: 1,
        fill: "forwards" // 終了後も最後の状態を維持
      }
    )
    return () => a.cancel()
  }, [ref.current])
  return <g
    ref={ref}
    fill={pieceColor(dirFrom)}
  >{children}</g>
}

function CellVanish({ children, opFrom, opTo }:
  { children: React.ReactNode, opFrom: number, opTo: number }): React.JSX.Element {
  const ref = useRef<SVGGElement>(null)
  useEffect(() => {
    const c = ref.current
    if (c == null) {
      return
    }
    const a = c.animate(
      {
        opacity: [
          opFrom, opTo
        ]
      },
      {
        duration: 1000,
        iterations: 1,
        fill: "forwards" // 終了後も最後の状態を維持
      }
    )
    return () => a.cancel()
  }, [ref.current])
  return <g
    ref={ref}
    opacity={opFrom}
  >{children}</g>
}
const animationDur = "1.25s"
const animationDurShort = "1s"
function CellSVG({ cell, x, y }: { cell: CellType, x: number, y: number }) {
  const { soundOn } = useStageSelStore()
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
  const handleClick = () => {
    const p = progressWorld(cell, x, y, world);
    if (p == null) { return }
    updateCurrentGame({
      score: currentGame.score + p.score,
      combo: p.world.combo,
      specials: p.specials,
    })
    if (world.combo < p.world.combo) {
      if (p.world.combo < 3) {
        play("fx.combo0", soundOn)
      } else if (p.world.combo < 6) {
        play("fx.combo1", soundOn)
      } else {
        play("fx.combo2", soundOn)
      }
    } else if (0 < p.score) {
      play("fx.three", soundOn)
    } else {
      play("fx.touch", soundOn)
    }
    if (p.specials.x != null || p.specials.y != null) {
      play("fx.straight", soundOn)
    }
    setWorld(p.world);
    if (0 < (p.score ?? 0)) {
      // console.log("addScore", `+${p.score}`)
      emitter.emit("addScore", `+${p.score}`)
    }
  };
  const { dirTo, dirFrom, opFrom, opTo } = (
    (): { dirTo: number, dirFrom: number, opFrom: number, opTo: number } => {
      const cellDir = cell.dir & 3 + 4
      const opFrom = CellState.vanishing < cell.state ? 0 : 1
      const opTo = CellState.vanishing <= cell.state ? 0 : 1

      if (CellState.vanishing <= cell.state) {
        return { opFrom, opTo, dirFrom: cellDir, dirTo: cellDir + cell.kind + 1 }
      }
      const dirPrev = cell.dirPrev ?? cell.dir - hashVal(x, y, cell)
      return { opFrom, opTo, dirFrom: dirPrev - (cell.dir - cellDir), dirTo: cellDir }
    })()
  const clickOpt: SVGProps<SVGPathElement> = (cell.state == CellState.placed
    ? {
      onPointerDown: (event: React.PointerEvent<SVGPathElement>) => {
        event.preventDefault()
        handleClick()
      }
    }
    : {
      style: { pointerEvents: "none" }
    })
  const key = [dirFrom, dirTo].join("")
  const stroke =
    CellState.fixed <= cell.state ? {
      strokeWidth: 0.1,
      stroke: 'black',
    } : {
      strokeWidth: 0,
      stroke: 'none',
    }
  return (
    <CellVanish {...{ key, opFrom, opTo }}>
      <CellRotate {...{ key, dirFrom, dirTo }}>
        <CellColor {...{ key, dirFrom, dirTo }}>
          <path
            key={[dirFrom, dirTo].join(" ")}
            d={c}
            {...stroke}
            {...clickOpt}
          >
          </path>
        </CellColor>
        <text y={0.4} style={{ pointerEvents: "none" }}>
          {["タ", "イ", "ツ"][cell.kind] ?? "?"}
        </text>
      </CellRotate>
    </CellVanish>);
}

function hashVal(x: number, y: number, cell: CellType): number {
  return ((x * 29 + y * 31 + cell.dir * 37 + 41) >> 2) % 3 + 1;
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
      // console.log("onAddScore", t)
      setText(t)
    }
    emitter.on("addScore", onAddScore)
    return () => { emitter.off("addScore", onAddScore) }
  }, [])
  if (text == null) { return <g id="empty?"></g> }
  return <g key={text} opacity={0}
    style={{ pointerEvents: "none" }}>
    <AnimateScaleScore />
    <AnimateOpacityScore />
    <AnimateFillScore />
    <text x={0} y={0} style={{ pointerEvents: "none" }}>{text}</text>
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
        alignmentBaseline="middle" textAnchor="middle"
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
        <g pointerEvents="none" >
          <SameLineEffect centerXY={centerXY} />
        </g>
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

function CompletedUI({ title, stageID }: { title: string, stageID: string }): React.JSX.Element {
  const { currentGame } = useCurrentGameStore();
  const { world } = useWorldStore();
  const { stageStates } = useStageStore()
  const { setPhase } = usePhaseStore();
  const stage = stageStates.m[stageID]

  const count = stage.trialCount

  const text = [
    `#くるくるタイツ ${title.replace("#", "№")}`,
    `${currentGame.score}点 (${count} 回目)`,
    window.location
  ].join("\n");
  const url = `https://taittsuu.com/share?text=${encodeURIComponent(text)}`;
  const ref = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState<boolean>(false)
  useEffect(() => {
    const c = ref.current
    if (c == null || enabled) {
      return
    }
    const a = c.animate(
      {
        transform: [
          `translate( 0%, 60svh)`,
          `translate( 0%, 00%)`,
        ]
      },
      {
        duration: 800,
        easing: "ease-out",
        iterations: 1,
      }
    )
    a.addEventListener("finish", () => {
      setEnabled(true)
    })
  }, [ref.current])
  return (
    <div ref={ref} id="completed-wrapper">
      <div id="completed">
        {currentGame.newBest == true ? <>
          <p id="new-record">New Record!</p>
        </> : <>
          <p id="completed-head">Completed</p>
        </>}
        <p id="rank-text">{rankText(currentGame.score, world.count)}</p>
        <div id="completed-buttons">
          <button className="phase-control"
            disabled={!enabled}
            onClick={() => {
              stopAll();
              setPhase(Phase.Selected)
            }}>Try Again</button>
          <button className="phase-control"
            disabled={!enabled}
            onClick={() => {
              stopAll();
              setPhase(Phase.StageSel)
            }}>Back to Title</button>
          <button className="taiitsu"
            disabled={!enabled}
            onClick={() => window.open(url, '_blank')}>タイーツ</button>
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
  const { setPhase } = usePhaseStore();
  const [showRetry, setShowRetry] = useState<boolean>(false)
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
    {showRetry && <div id="retry-dialog-wrapper">
      <div id="retry-dialog">
        <button
          className="phase-control"
          onClick={() => {
            stopAll();
            setPhase(Phase.Selected)
          }}>Try Again</button>
        <button className="phase-control"
          onClick={() => {
            stopAll();
            setPhase(Phase.StageSel)
          }}>Back to Title</button>
        <button
          className="close"
          onClick={() => { setShowRetry(false) }}
        >X</button>
      </div>
    </div>}
    <button id="top-retry-button" onClick={() => {
      setShowRetry(!showRetry)
    }}>︙</button>
  </div>

}

const countRest = (world: WorldType): number => (
  world.cells.reduce((acc, x) => acc + (x.state == CellState.placed ? 1 : 0), 0)
)
function Game(): React.JSX.Element {
  const { soundOn } = useStageSelStore()
  const { currentGame, updateCurrentGame } = useCurrentGameStore();
  const { world } = useWorldStore();
  const { phase, setPhase } = usePhaseStore();
  const { stageStates, updateStageUnit } = useStageStore();
  const { stageIx, sizeID } = useStageSelStore();
  if (stageIx == null || stageIx < 0) {
    return <div>No stage selected.</div>;
  }
  const stage = makeStageID(stageIx, sizeID)
  const rest = countRest(world)
  React.useEffect(() => {
    play("bgm.game", soundOn)
    return () => stopAll()
  }, [])
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
      {phase == Phase.Completed && <CompletedUI title={title} stageID={stage} />}
    </div>
  </>;
};

export default Game;
