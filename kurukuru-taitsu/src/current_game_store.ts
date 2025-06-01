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
  newBest: boolean;
};

type CurrentGameStore = {
  currentGame: CurrentGame;
  updateCurrentGame: (newSum: Partial<CurrentGame>) => void;
  clearCurrnetGame: () => void;
};

export const useCurrentGameStore = create<CurrentGameStore>((set) => ({
  currentGame: { score: 0, combo: 0, newBest: false, specials: {} },
  updateCurrentGame: (newSum: Partial<CurrentGame>) =>
    set((state) => ({
      currentGame: { ...state.currentGame, ...newSum },
    })),
  clearCurrnetGame: () => {
    set((_state) => ({
      currentGame: {
        score: 0,
        combo: 0,
        specials: {},
        newBest: false,
      },
    }))
  }
}));
