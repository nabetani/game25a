import { GameSize } from "./constants";
import { CellType, WorldType } from "./world";

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
  combo: number;
}

export const newWorld = (ix: number, size: GameSize): WorldType => {
  const { width, height } = getSize(size)
  const cells = Array.from({ length: width * height }).map((_, ix) => {
    const dir = (ix + (ix ^ 5) * 0.3) & 3
    const dirPrev = dir - 1 - ((ix + (ix ^ 5) * 0.7) % 3 | 0)
    const kind = ((ix + (ix ^ 5) * 0.7) | 0) % 3
    const states = Object.values(CellState) as CellState[];
    const state = states[ix % states.length]
    return { dir, dirPrev, kind, state }
  })
  return {
    width, height,
    cells,
    nextKind: 0,
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
export function progressWorld(cell: CellType, x: number, y: number, world: WorldType): null | { world: WorldType, score: number } {
  if (cell.kind != world.nextKind) { return null }
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
    const newCells = world.cells.map((c, ix) => {
      if (c === cell) { return newCell }
      switch (c.state) {
        case CellState.vanishing:
          return { ...c, state: CellState.vanished }
        case CellState.fixed:
          return { ...c, state: CellState.vanishing }
      }
      return rotCell(c, ix)
    })
    const nextKind = (world.nextKind + 1) % 3
    const newWorld: WorldType = { ...world, cells: newCells, nextKind };
    return { world: newWorld, score: 10 }
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
    const newWorld: WorldType = { ...world, cells: newCells, nextKind };
    return { world: newWorld, score: 10 }
  }
}
