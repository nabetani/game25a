import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistName, type StageIDType } from "./constants";

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

export const useStageStore = create<StageStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: persistName("stage-store"),
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
