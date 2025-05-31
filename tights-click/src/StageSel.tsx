import React from 'react';
import { GameSize, gameSizeNumbers, makeStageID, Phase, PlayingStageProps, StageIDType, title } from './constants';
import { useStageStore } from './stage_store';
import { useCurrentGameStore } from './current_game_store';
import { useStageSelStore } from './stage_sel_store';
import useWorldStore from './worldStore';
import { newWorld } from './world';
import { usePhaseStore } from './phaseStore';

const dayNum = (s?: string): number => {
  const d = s == null ? new Date() : new Date(s)
  return d.getTime() / (24 * 60 * 60 * 1000)
}

const stageCount = ((): number => {
  return Math.ceil(dayNum() - dayNum("2025-05-01T13:00:00+0900"))
})()

function SizeSelector(
  { sizeID, setSizeID }: {
    sizeID: number,
    setSizeID: (_: number) => void,
  }
): React.JSX.Element {
  const gameSizes = gameSizeNumbers()

  return <div className="size-selector" >
    {
      gameSizes.map((e, ix) => {
        if (e == sizeID) {
          return <div key={e} >{GameSize[e]}</div>
        } else {
          return <button key={e}
            style={{
              backgroundColor: `oklch( 0.8 0.3 ${e * 360 / gameSizes.length})`
            }}
            onClick={() => setSizeID(e)}
          >{GameSize[e]}</button>
        }
      }
      )}
  </div>

}

function StageList({
  sizeID,
  setStage
}: {
  sizeID: number,
  setStage: (_: StageIDType | null) => void
}): React.JSX.Element {
  const { setPhase } = usePhaseStore();
  const { stageStates, updateStageUnit } = useStageStore()
  const { updateCurrentGame } = useCurrentGameStore();
  const { setWorld } = useWorldStore()

  function startGame(ix: number, size: GameSize) {
    const stageID = makeStageID(ix, size);
    const selected = stageStates.m[stageID];
    updateStageUnit(stageID, { ...selected, trialCount: (selected?.trialCount ?? 0) + 1 });
    updateCurrentGame({ score: 0, combo: 0 });
    setStage(stageID);
    setPhase(Phase.Started);
    setWorld(newWorld(ix, size))
  }

  return <div id="stage-list">
    {Array.from({ length: stageCount }).map((_, ix) => {
      const stageNum = stageCount - ix
      const sid = makeStageID(stageNum, sizeID)
      const stage = stageStates.m[sid]
      const count = stage == null ? 0 : stage.trialCount ?? 0
      const hue = stageNum * 5 + 150
      if (count <= 0) {
        return <button
          className='stage-num'
          style={{
            backgroundColor: `oklch(0.8 0.2 ${hue}`
          }}
          key={stageNum}
          onClick={() => startGame(stageNum, sizeID)}>
          <span>Stage #</span>{stageNum}
        </button>
      }
      return <div className="stage-info" key={stageNum}
        style={{
          backgroundColor: `oklch(0.95 0.2 ${hue}`
        }}
      >
        <div>
          <span>best: {stage.best ?? "??"}</span>
          <span>tried: {stage.trialCount}</span>
        </div>
        <button
          className='stage-num'
          key={stageNum}
          style={{
            backgroundColor: `oklch(0.75 0.2 ${hue}`
          }}
          onClick={() => startGame(stageNum, sizeID)}>
          <span>Stage #</span>{stageNum}
        </button>
      </div>
    })}
  </div>

}

const StageSel: React.FC<PlayingStageProps> = (
  { stage, setStage }) => {
  const { sizeID, setSizeID } = useStageSelStore();

  return (
    <div id="stage-sel">
      <SoundUI />
      <h1>{title}</h1>
      <SizeSelector sizeID={sizeID} setSizeID={setSizeID} />
      <StageList sizeID={sizeID} setStage={setStage} />
    </div>
  );
};

function SoundUI() {
  const { soundOn, setSoundOn } = useStageSelStore();
  return <div id="sound-ui">
    <button
      className={soundOn ? "sound-selected" : "sound-not-selected"}
      onClick={() => setSoundOn(true)}>Sound ON</button>
    <button
      className={soundOn ? "sound-not-selected" : "sound-selected"}
      onClick={() => setSoundOn(false)}>Sound OFF</button>
  </div>;
}


export default StageSel;
