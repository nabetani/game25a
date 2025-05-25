import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GameSize } from "./constants";

type StageSelState = {
  sizeID: GameSize | null;
  soundOn: boolean;
  setSizeID: (sizeID: GameSize | null) => void;
  setSoundOn: (soundOn: boolean) => void;
};

export const useStageSelStore = create<StageSelState>()(
  persist(
    (set) => ({
      sizeID: null,
      soundOn: false,
      setSizeID: (sizeID: GameSize | null) => set({ sizeID }),
      setSoundOn: (soundOn: boolean) => set({ soundOn }),
    }),
    {
      name: "stage-sel-state",
    }
  )
);
