export const enum Phase {
    StageSel = 1,
    Playing = 2,
    GameOver = 3,
    Cleared = 4,
}export interface PhaseProps {
  phase: Phase;
  setPhase: (_: Phase) => void;
}

