import { GameSize, type GameSizeValues } from "./constants";
import Prando from "prando"
import type { Specials } from "./current_game_store";

export const CellState = { // Object.values を使うために 非const
  placed: 1,
  fixed: 2,
  vanishing: 3,
  vanished: 4,
} as const
export type CellStateValues = typeof CellState[keyof typeof CellState];

export type CellType = {
  kind: number;
  dirPrev?: number | null;
  dir: number;
  state: CellStateValues,
}

export type WorldType = {
  width: number,
  height: number,
  count: number,
  cells: CellType[];
  nextKind: number;
  started: boolean;
  combo: number;
}

export const newWorld = (ix: number, size: GameSizeValues): WorldType => {
  const { width, height, spaces } = getSize(size)
  const rng = newRNG(ix, width, height);
  const rooms = Array.from({ length: width * height }).map((_, ix) => ix)
  for (let i = 1; i < rooms.length; i++) {
    const j = rng.nextInt(0, i);
    [rooms[i], rooms[j]] = [rooms[j], rooms[i]]
  }
  const cells: CellType[] = []

  let dir = 0
  // const vanished = width * height - (width * height) % 3
  let roomIx = 0
  rooms.forEach((pos) => {
    const isSpace = 0 != (spaces & 2 ** pos)
    const kind = 2 - roomIx % 3
    if (isSpace) {
      cells[pos] = { dir, kind, state: CellState.vanished }
    } else {
      if (kind == 2) {
        dir = rng.nextInt(0, 3)
      }
      const x = pos % width
      const y = (pos - x) / width
      const state = CellState.placed
      roomIx++
      cells[pos] = { dir, kind, state }
      const dx = [0, 1, 0, -1][dir & 3]
      const dy = [-1, 0, 1, 0][dir & 3]
      for (let i = 1; ; i++) {
        const cx = x + dx * i
        const cy = y + dy * i
        if (cx < 0 || width <= cx || cy < 0 || height <= cy) {
          break
        }
        const p = cx + cy * width
        if (cells[p] != null) {
          const rot = kind + 1
          cells[p] = { ...cells[p], dir: (cells[p].dir - rot) & 3 }
        }
      }
    }
  })
  return {
    width, height,
    cells,
    nextKind: 0,
    started: false,
    combo: 0,
    count: roomIx / 3,
  }
}
const getSize = (size: GameSizeValues): { width: number; height: number; spaces: number } => {
  switch (size) {
    case GameSize.Tiny:
      return { width: 3, height: 3, spaces: 0 };
    case GameSize.Small:
      return { width: 3, height: 5, spaces: 0 };
    case GameSize.Medium:
      return { width: 4, height: 5, spaces: 1 + (1 << 3) };
    case GameSize.Large:
      return { width: 4, height: 6, spaces: 0 };
    case GameSize.Huge:
      return { width: 5, height: 9, spaces: (1 + (1 << 4)) * (1 + 1024 + 1024 ** 2) };
  }
}
function newRNG(ix: number, width: number, height: number) {
  const rng = new Prando([ix, width, height].join("-"));
  for (let i = 0; i < 10; ++i) { rng.next(); }
  return rng;
}

class ScoreCalculator {
  constructor(world: WorldType) {
    this.width = world.width
    this.height = world.height
    this.prevCombo = world.combo
  }
  prevCombo: number
  width: number
  height: number
  xs: Set<number> = new Set<number>;
  ys: Set<number> = new Set<number>;
  dirs: Set<number> = new Set<number>;
  add(cell: CellType, ix: number) {
    const x = ix % this.width
    const y = (ix - x) / this.width
    this.xs.add(x)
    this.ys.add(y)
    console.log("add dir", cell.dir, cell.dir & 3)
    this.dirs.add(cell.dir & 3)
  }
  get combo(): number {
    console.log("ScoreCalculator", "combo", this.dirs, this.xs, this)
    if (this.isDirUniq()) {
      return this.prevCombo + 1
    }
    return 0
  }
  isDirUniq() {
    return this.dirs.size == 1;
  }

  get specials() {
    const r: Specials = {
      unicolor: this.isDirUniq(),
      x: (this.xs.size == 1 ? [...this.xs][0] : undefined),
      y: (this.ys.size == 1 ? [...this.ys][0] : undefined),
    }
    return r
  }

  get score(): number {
    const base = this.isDirUniq() ? (this.prevCombo + 2) * 100 : 100
    const extra = (this.xs.size == 1 || this.ys.size == 1) ? 2 : 1
    return base * extra
  }
}

export function progressWorld(
  cell: CellType, x: number, y: number, world: WorldType
): null | {
  world: WorldType, score: number, specials: Specials
} {
  if (cell.kind != world.nextKind) { return null }
  if (cell.state != CellState.placed) { return null }
  const rotCell = (c: CellType, ix: number): CellType => {
    const rot = cell.kind + 1
    const dir = (cell.dir) & 3
    const cx = ix % world.width
    const cy = (ix - cx) / world.width
    const m = (): boolean => {
      switch (dir) {
        default:
        case 0: return cx == x && cy < y
        case 1: return cy == y && x < cx
        case 2: return cx == x && y < cy
        case 3: return cy == y && cx < x
      }
    }
    if (m()) {
      return { ...c, dir: c.dir + rot, dirPrev: c.dir }
    }
    return c
  }
  if (cell.kind == 2) {
    const newCell = { ...cell, state: CellState.vanishing };
    const sc = new ScoreCalculator(world)
    const newCells = world.cells.map((c, ix) => {
      if (c === cell) {
        sc.add(c, ix)
        return newCell
      }
      switch (c.state) {
        case CellState.vanishing:
          return { ...c, state: CellState.vanished }
        case CellState.fixed:
          sc.add(c, ix)
          return { ...c, state: CellState.vanishing }
      }
      return rotCell(c, ix)
    })
    const nextKind = (world.nextKind + 1) % 3
    const newWorld: WorldType = {
      ...world,
      cells:
        newCells,
      nextKind,
      started: true,
      combo: sc.combo,
    };
    return { world: newWorld, score: sc.score, specials: sc.specials }
  } else {
    const newCell = { ...cell, state: CellState.fixed };
    const newCells = world.cells.map((c, ix) => {
      if (c === cell) { return newCell }
      switch (c.state) {
        case CellState.vanishing:
          return { ...c, state: CellState.vanished }
        case CellState.fixed:
          return c
      }
      return rotCell(c, ix)
    })
    const nextKind = (world.nextKind + 1) % 3
    const newWorld: WorldType = { ...world, cells: newCells, nextKind, started: true };
    return { world: newWorld, score: 0, specials: {} }
  }
}
