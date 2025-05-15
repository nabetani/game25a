import { create } from "zustand";

export type CurrentStageSum = {
  score: number;
  combo: number;
};

type CurrentStageSumStore = {
  currentStageSum: CurrentStageSum;
  updateCurrentStageSum: (newSum: Partial<CurrentStageSum>) => void;
};

export const useCurrentStageSumStore = create<CurrentStageSumStore>((set) => ({
  currentStageSum: { score: 0, combo: 0 },
  updateCurrentStageSum: (newSum) =>
    set((state) => ({
      currentStageSum: { ...state.currentStageSum, ...newSum },
    })),
}));
