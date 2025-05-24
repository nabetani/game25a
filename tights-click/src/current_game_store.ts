import { create } from "zustand";

export type Specials = {
  unicolor?: boolean,
  x?: number | null,
  y?: number | null,
}

export type CurrentGame = {
  score: number;
  combo: number;
  specials: Specials;
};

type CurrentGameStore = {
  currentGame: CurrentGame;
  updateCurrentGame: (newSum: Partial<CurrentGame>) => void;
};

export const useCurrentGameStore = create<CurrentGameStore>((set) => ({
  currentGame: { score: 0, combo: 0, specials: {} },
  updateCurrentGame: (newSum: Partial<CurrentGame>) =>
    set((state) => ({
      currentGame: { ...state.currentGame, ...newSum },
    })),
}));
