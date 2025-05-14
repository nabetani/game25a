
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

export const makeStageID = (ix: number, size: number): StageIDType => {
  return [ix, size].join(":")
}

export const splitStageID = (s: StageIDType): { course: number, size: number } => {
  const [co, si] = s.split(":")
  return { course: parseInt(co), size: parseInt(si) }
}




export interface PlayingStageProps {
  stage: StageIDType | null;
  setStage: (_: StageIDType | null) => void;
}

