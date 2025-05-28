import { create } from 'zustand';
import { WorldType } from './world';

interface WorldState {
  world: WorldType;
  setWorld: (world: WorldType) => void;
}

const initialWorldState: WorldType = {
  width: 1,
  height: 1,
  started: false,
  cells: [],
  nextKind: 0,
  combo: 0,
  count: 0,
};

const useWorldStore = create<WorldState>((set) => ({
  world: initialWorldState,
  setWorld: (world) => set({ world }),
}));

export default useWorldStore;
