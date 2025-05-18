import { GameSize } from "./constants";

export type CellType = {
  kind: number;
  dirPrev?: number | null;
  dir: number;
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
    const dirPrev = dir - (ix * 0.7 + 1) & 3 % 3
    const kind = ((ix + (ix ^ 5) * 0.7) | 0) % 3
    return { dir, dirPrev, kind }
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

