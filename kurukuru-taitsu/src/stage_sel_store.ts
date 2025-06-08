import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GameSize, persistName, type GameSizeValues } from "./constants";

type StageSelState = {
  stageIx: number | null,
  sizeID: GameSizeValues;
  soundOn: boolean;
  setStageIx: (stageIx: number) => void;
  setSizeID: (sizeID: GameSizeValues) => void;
  setSoundOn: (soundOn: boolean) => void;
};

export const useStageSelStore = create<StageSelState>()(
  persist(
    (set) => ({
      stageIx: null,
      sizeID: GameSize.Tiny,
      soundOn: false,
      setStageIx: (stageIx: number) => set({ stageIx }),
      setSizeID: (sizeID: GameSizeValues) => set({ sizeID }),
      setSoundOn: (soundOn: boolean) => set({ soundOn }),
    }),
    {
      name: persistName("stage-sel-store"),
    }
  )
);
