import React from 'react';
import { Phase, PhaseProps } from './constants';

const StageSel: React.FC<PhaseProps> = ({ phase, setPhase }) => {
  return (
    <div>
      <h1>Stage Selection</h1>
      <button onClick={()=>setPhase(Phase.Playing)}>play</button>
    </div>
  );
};

export default StageSel;
