import { create } from 'zustand';
import { Phase } from './constants';

interface PhaseState {
  phase: Phase;
  setPhase: (phase: Phase) => void;
}

export const usePhaseStore = create<PhaseState>((set) => ({
  phase: Phase.StageSel,
  setPhase: (phase: Phase) => set({ phase }),
}));
