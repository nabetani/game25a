import { create } from "zustand";

export type CurrentGame = {
  score: number;
  combo: number;
};

type CurrentGameStore = {
  currentGame: CurrentGame;
  updateCurrentGame: (newSum: Partial<CurrentGame>) => void;
};

export const useCurrentGameStore = create<CurrentGameStore>((set) => ({
  currentGame: { score: 0, combo: 0 },
  updateCurrentGame: (newSum) =>
    set((state) => ({
      currentGame: { ...state.currentGame, ...newSum },
    })),
}));
