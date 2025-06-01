import { useState } from 'react';
import './App.css';
import "./stage_store";
import { Phase } from './constants';
import type { StageIDType } from './constants';
import StageSel from './StageSel';
import Game from './Game';
import { usePhaseStore } from './phaseStore';

export function App() {
  const { phase } = usePhaseStore();
  const [stage, setStage] = useState<StageIDType | null>(null);
  switch (phase) {
    case Phase.StageSel:
      return <StageSel stage={stage} setStage={setStage} />;
    default:
      return <Game stage={stage} />;
  }
}
