import './App.css';
import "./stage_store";
import { makeStageID, Phase } from './constants';
import StageSel from './StageSel';
import Game from './Game';
import { usePhaseStore } from './phaseStore';
import { useEffect, type ReactNode } from 'react';
import { useCurrentGameStore } from './current_game_store';
import { useStageSelStore } from './stage_sel_store';
import { useStageStore } from './stage_store';
import { newWorld } from './world';
import useWorldStore from './worldStore';

function Prepare({ children }: { children: ReactNode }): React.JSX.Element {
  const { phase, setPhase } = usePhaseStore();
  const { stageStates, updateStageUnit } = useStageStore()
  const { updateCurrentGame } = useCurrentGameStore();
  const { setWorld } = useWorldStore()
  const { stageIx, sizeID } = useStageSelStore()

  console.log("Prepare.render", phase, stageIx, sizeID)
  useEffect(() => {
    console.log("Prepare.useEffect", phase, stageIx, sizeID)
    if (phase != Phase.Selected || stageIx == null) { return }
    const stageID = makeStageID(stageIx, sizeID);
    console.log("Prepare.useEffect.prepare!", phase, stageID)
    const selected = stageStates.m[stageID];
    updateStageUnit(stageID, { ...selected, trialCount: (selected?.trialCount ?? 0) + 1 });
    updateCurrentGame({ score: 0, combo: 0 });
    setWorld(newWorld(stageIx, sizeID))
    setPhase(Phase.Started);
  }, [phase, stageIx, sizeID])

  return <>{children}</>
}

const preloadAudio = () => {
  document.querySelectorAll("audio").forEach(audio => {
    audio.load();
  });
}


export function App() {
  const { phase } = usePhaseStore();
  useEffect(() => {
    preloadAudio()
  }, []);
  return <Prepare>
    {
      (phase == Phase.StageSel || phase == Phase.Selected) ? <StageSel /> : <Game />
    }
  </Prepare>
}
