import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GameSize } from "./constants";

type StageSelState = {
  sizeID: GameSize;
  soundOn: boolean;
  setSizeID: (sizeID: GameSize) => void;
  setSoundOn: (soundOn: boolean) => void;
};

export const useStageSelStore = create<StageSelState>()(
  persist(
    (set) => ({
      sizeID: GameSize.Tiny,
      soundOn: false,
      setSizeID: (sizeID: GameSize) => set({ sizeID }),
      setSoundOn: (soundOn: boolean) => set({ soundOn }),
    }),
    {
      name: "stage-sel-state",
    }
  )
);
