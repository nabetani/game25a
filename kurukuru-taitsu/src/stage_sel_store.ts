import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GameSize, type GameSizeValues } from "./constants";

type StageSelState = {
  sizeID: GameSizeValues;
  soundOn: boolean;
  setSizeID: (sizeID: GameSizeValues) => void;
  setSoundOn: (soundOn: boolean) => void;
};

export const useStageSelStore = create<StageSelState>()(
  persist(
    (set) => ({
      sizeID: GameSize.Tiny,
      soundOn: false,
      setSizeID: (sizeID: GameSizeValues) => set({ sizeID }),
      setSoundOn: (soundOn: boolean) => set({ soundOn }),
    }),
    {
      name: "stage-sel-state",
    }
  )
);
