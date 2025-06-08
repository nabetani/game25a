import { lookUpReverse } from "./util";

export const GameSize = {
  Tiny: 1,
  Small: 2,
  Medium: 3,
  Large: 4,
  Huge: 5,
} as const

export type GameSizeValues = typeof GameSize[keyof typeof GameSize];

export const gameSizeKey = lookUpReverse(GameSize)

export const title = "くるくるタイツ"

export const gameSizeNumbers = (): number[] => {
  return Object.values(GameSize).filter(
    (v) => typeof v === 'number'
  );
}

export const persistName = (seed: string): string => {
  return "8nnjwst2t4/" + seed
}

export const Phase = {
  StageSel: 1,
  Selected: 2,
  Started: 3,
  Playing: 4,
  Completed: 5,
} as const
export type PhaseValues = typeof Phase[keyof typeof Phase];

// console.log(Phase.StageSel)

export type StageIDType = string;

export const makeStageID = (stageIx: number, sizeID: number): StageIDType => {
  return [stageIx, sizeID].join(":")
}

export const splitStageID = (s: StageIDType): { course: number, size: number } => {
  const [co, si] = s.split(":")
  return { course: parseInt(co), size: parseInt(si) }
}

export interface PlayingStageProps {
  stage: StageIDType | null;
  setStage: (_: StageIDType | null) => void;
}

