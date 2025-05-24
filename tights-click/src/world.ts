import { GameSize } from "./constants";
import Prando from "prando"

export enum CellState { // Object.values を使うために 非const
  placed = 1,
  fixed = 2,
  vanishing = 3,
  vanished = 4,
}


export type CellType = {
  kind: number;
  dirPrev?: number | null;
  dir: number;
  state: CellState,
}

export type WorldType = {
  width: number,
  height: number,
  cells: CellType[];
  nextKind: number;
  started: boolean;
  combo: number;
}

export const newWorld = (ix: number, size: GameSize): WorldType => {
  const { width, height } = getSize(size)
  const rng = newRNG(ix, width, height);
  const rooms = Array.from({ length: width * height }).map((_, ix) => ix)
  for (let i = 1; i < rooms.length; i++) {
    const j = rng.nextInt(0, i);
    [rooms[i], rooms[j]] = [rooms[j], rooms[i]]
  }
  const cells: CellType[] = []

  let dir = 0
  rooms.forEach((pos, ix) => {
    const kind = 2 - ix % 3
    if (kind == 2) {
      dir = rng.nextInt(0, 3)
    }
    const x = pos % width
    const y = (pos - x) / width
    const state = CellState.placed
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
  })
  return {
    width, height,
    cells,
    nextKind: 0,
    started: false,
    combo: 0,
  }
}
const getSize = (size: GameSize): { width: number; height: number; } => {
  switch (size) {
    case GameSize.Tiny:
      return { width: 2, height: 3 };
    case GameSize.Small:
      return { width: 3, height: 4 };
    case GameSize.Medium:
      return { width: 4, height: 6 };
    case GameSize.Large:
      return { width: 6, height: 9 };
    case GameSize.Huge:
      return { width: 8, height: 12 };
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
    if (this.dirs.size != 1) {
      return 0
    }
    return this.prevCombo + 1
  }
  get score(): number { return 1 }
}

export function progressWorld(cell: CellType, x: number, y: number, world: WorldType): null | { world: WorldType, score: number } {
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
    return { world: newWorld, score: sc.score }
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
    return { world: newWorld, score: 10 }
  }
}
