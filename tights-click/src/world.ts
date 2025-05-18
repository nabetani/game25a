import { GameSize } from "./constants";

export enum CellState { // Object.values を使うために 非const
  placed = 1,
  fixed = 2,
  hidden = 3,
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

