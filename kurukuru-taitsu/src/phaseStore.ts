import { create } from 'zustand';
import { Phase } from './constants';
import type { PhaseValues } from './constants';

interface PhaseState {
  phase: PhaseValues;
  setPhase: (phase: PhaseValues) => void;
}

export const usePhaseStore = create<PhaseState>((set) => ({
  phase: Phase.StageSel,
  setPhase: (phase: PhaseValues) => set({ phase }),
}));
