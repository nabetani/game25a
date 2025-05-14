import React from 'react';
import { Phase } from './constants';

interface StageSelProps {
  phase: Phase;
  setPhase: (_:Phase)=>void;
}

const StageSel: React.FC<StageSelProps> = ({ phase, setPhase }) => {
  return (
    <div>
      <h1>Stage Selection</h1>
      <button onClick={()=>setPhase(Phase.Playing)}>play</button>
    </div>
  );
};

export default StageSel;
