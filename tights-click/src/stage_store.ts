import { create } from "zustand";
import { StageIDType } from "./constants";

export type StageUnit = {
  trialCount: number;
  best: number | null;
  full: boolean;
};

export type StageStates = {
  m: Record<StageIDType, StageUnit>;
};

type StageStore = {
  stageStates: StageStates;
  updateStageUnit: (id: StageIDType, newUnit: Partial<StageUnit>) => void;
};

export const useStageStore = create<StageStore>((set) => ({
  stageStates: { m: {} },
  updateStageUnit: (id, newUnit) =>
    set((state) => ({
      stageStates: {
        ...state.stageStates,
        m: {
          ...state.stageStates.m,
          [id]: { ...(state.stageStates.m[id] || { trialCount: 0, best: null, full: false }), ...newUnit },
        },
      },
    })),
}));
