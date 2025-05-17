
export enum GameSize { // Object.values を使うために 非const
  Tiny = 1,
  Small = 2,
  Medium = 3,
  Large = 4,
  Huge = 5,
}

export const gameSizeNumbers = (): GameSize[] => {
  return Object.values(GameSize).filter(
    (v) => typeof v === 'number'
  ) as GameSize[];
}

export const enum Phase {
  StageSel = 1,
  Playing = 2,
  GameOver = 3,
  Cleared = 4,
}

export interface PhaseProps {
  phase: Phase;
  setPhase: (_: Phase) => void;
}

export type StageIDType = string;

export const makeStageID = (course: number, size: number): StageIDType => {
  return [course, size].join(":")
}

export const splitStageID = (s: StageIDType): { course: number, size: number } => {
  const [co, si] = s.split(":")
  return { course: parseInt(co), size: parseInt(si) }
}




export interface PlayingStageProps {
  stage: StageIDType | null;
  setStage: (_: StageIDType | null) => void;
}

