import React from 'react';
import { GameSize, gameSizeNumbers, makeStageID, Phase, PlayingStageProps } from './constants';
import { useStageStore } from './stage_store';
import { useCurrentGameStore } from './current_game_store';
import { useStageSelStore } from './stage_sel_store';
import useWorldStore from './worldStore';
import { newWorld } from './world';
import { usePhaseStore } from './phaseStore';

const StageSel: React.FC<PlayingStageProps> = ({ stage, setStage }) => {
  const { phase, setPhase } = usePhaseStore();
  const { stageStates, updateStageUnit } = useStageStore()
  const { updateCurrentGame } = useCurrentGameStore();
  const { sizeID, setSizeID, soundOn, setSoundOn } = useStageSelStore();
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
  const gameSizes = gameSizeNumbers()
  return (
    <div id="stage-sel">
      <div id="sound-ui">
        <button
          className={soundOn ? "sound-selected" : "sound-not-selected"}
          onClick={() => setSoundOn(true)}>Sound ON</button>
        <button
          className={soundOn ? "sound-not-selected" : "sound-selected"}
          onClick={() => setSoundOn(false)}>Sound OFF</button>
      </div>
      <h1>タ·イ·ツ タッチ</h1>
      <div className="size-selector" >
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
      <div id="stage-list">
        {Array.from({ length: 3000 }).map((_, ix) => {
          const sid = makeStageID(ix, sizeID)
          const stage = stageStates.m[sid]
          const count = stage == null ? 0 : stage.trialCount ?? 0
          const hue = ix * 5 + 150
          if (count <= 0) {
            return <button
              className='stage-num'
              style={{
                backgroundColor: `oklch(0.8 0.2 ${hue}`
              }}
              key={ix}
              onClick={() => startGame(ix, sizeID)}>
              <span>Stage #</span>{ix}
            </button>
          }
          return <div className="stage-info" key={ix}
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
              key={ix}
              style={{
                backgroundColor: `oklch(0.75 0.2 ${hue}`
              }}
              onClick={() => startGame(ix, sizeID)}>
              <span>Stage #</span>{ix}
            </button>
          </div>
        })}
      </div>
    </div>
  );
};

export default StageSel;
