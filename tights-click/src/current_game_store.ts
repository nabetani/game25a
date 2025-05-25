import { create } from "zustand";

export type Specials = {
  unicolor?: boolean,
  x?: number | null,
  y?: number | null,
}

export enum GamePhase {
  started = 1,
  playing = 2,
  completed = 3,
}

export type CurrentGame = {
  score: number;
  combo: number;
  specials: Specials;
  phase: GamePhase,
  rest?: number;
};

type CurrentGameStore = {
  currentGame: CurrentGame;
  updateCurrentGame: (newSum: Partial<CurrentGame>) => void;
};

export const useCurrentGameStore = create<CurrentGameStore>((set) => ({
  currentGame: { score: 0, combo: 0, specials: {}, phase: GamePhase.started },
  updateCurrentGame: (newSum: Partial<CurrentGame>) =>
    set((state) => ({
      currentGame: { ...state.currentGame, ...newSum },
    })),
}));
