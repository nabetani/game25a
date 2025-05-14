import { useState } from 'react';
import './App.css';
import "./stage_store";
import { Phase } from './constants';
import StageSel from './StageSel';

export function App() {
  const [phase,setPhase] = useState<Phase>(Phase.StageSel)
  switch( phase ){
    case Phase.StageSel:
      return <StageSel phase={phase} setPhase={setPhase}/>
    case Phase.Playing:
    case Phase.GameOver:
    case Phase.Cleared:
    default:
      return <></>
  }
}
