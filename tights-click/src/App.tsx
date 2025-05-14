import { useState } from 'react';
import './App.css';
import "./stage_store";
import { Phase, StageIDType } from './constants';
import StageSel from './StageSel';

export function App() {
  const [phase, setPhase] = useState<Phase>(Phase.StageSel)
  const [stage, setStage] = useState<StageIDType | null>(null)
  switch (phase) {
    case Phase.StageSel:
      return <StageSel phase={phase} setPhase={setPhase} stage={stage} setStage={setStage} />
    case Phase.Playing:
    case Phase.GameOver:
    case Phase.Cleared:
    default:
      return <></>
  }
}
