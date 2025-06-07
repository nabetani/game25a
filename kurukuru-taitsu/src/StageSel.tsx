import React, { useState } from 'react';
import { gameSizeKey, gameSizeNumbers, makeStageID, Phase, title } from './constants';
import { type GameSizeValues } from './constants';
import { useStageStore } from './stage_store';
import { useCurrentGameStore } from './current_game_store';
import { useStageSelStore } from './stage_sel_store';
import useWorldStore from './worldStore';
import { newWorld } from './world';
import { usePhaseStore } from './phaseStore';
import titleImg from './assets/title.webp'

const dayNum = (s?: string): number => {
  const d = s == null ? new Date() : new Date(s)
  return d.getTime() / (24 * 60 * 60 * 1000)
}

const stageCount = ((): number => {
  return Math.ceil(dayNum() - dayNum("2025-05-01T13:00:00+0900"))
})()

function SizeSelector(): React.JSX.Element {
  const { sizeID, setSizeID } = useStageSelStore()
  const gameSizes = gameSizeNumbers()

  return <div id="size-selector" className="size-selector" >
    {
      gameSizes.map((e, _ix) => {
        if (e == sizeID) {
          return <div key={e} >{gameSizeKey(e as GameSizeValues)}</div>
        } else {
          return <button key={e}
            style={{
              backgroundColor: `oklch( 0.8 0.3 ${e * 360 / gameSizes.length})`
            }}
            onClick={() => setSizeID(e as GameSizeValues)}
          >{gameSizeKey(e as GameSizeValues)}</button>
        }
      }
      )}
  </div>

}

function StageList(): React.JSX.Element {
  const { setPhase } = usePhaseStore();
  const { stageStates } = useStageStore()
  const { sizeID, setStageIx } = useStageSelStore()

  function startGame(ix: number) {
    setStageIx(ix);
    setPhase(Phase.Selected);
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
          onClick={() => startGame(stageNum)}>
          <span>Stage #</span>{stageNum}
        </button>
      }
      return <div className="stage-info" key={stageNum}
        style={{
          backgroundColor: `oklch(0.95 0.2 ${hue}`
        }}
      >
        <div>
          <span>Best: {stage.best ?? "??"}</span>
          <span>Attempts: {stage.trialCount}</span>
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

const Mode = {
  StageSel: 1,
  Story: 2,
  Etc: 3
} as const
type ModeType = typeof Mode[keyof (typeof Mode)]

function Bottom({ setMode }: { setMode: (_: ModeType) => void }): React.JSX.Element {
  return <div id="stage-sel-bottom">
    <button onClick={() => setMode(Mode.Story)}>ストーリー</button>
    <button onClick={() => setMode(Mode.Etc)}>いろいろ</button>
  </div>
}

function Story({ close }: { close: () => void }): React.JSX.Element {
  return <div id="stage-sel-story">
    <div >
      <div >
        <p>ない</p>
        <button onClick={() => close()}>とじる</button>
      </div>
    </div>
  </div>
}
function Etc({ close }: { close: () => void }): React.JSX.Element {
  return <div id="stage-sel-etc">
    <div >
      <div >
        <div><a href="https://nabetani.hatenadiary.com/entry/game25a">制作ノート</a></div>
        <div><a href="https://taittsuu.com/users/nabetani">鍋谷武典@タイッツー</a></div>
        <div><a href="https://github.com/nabetani/game25a">Souce code and Licence</a></div>
        <div><a href="https://suzuri.jp/Nabetani-T/">SUZURI - Nabetani-T</a></div>
        <div><a href="https://taittsuu.com/search/taiitsus/hashtags?query=くるくるタイツ">タイッツー #くるくるタイツ</a></div>
        <button onClick={() => close()}>とじる</button>
      </div>
    </div>
  </div>
}

function StageSel(): React.JSX.Element {
  const [mode, setMode] = useState<ModeType>(Mode.StageSel)

  return (
    <div id="stage-sel">
      <SoundUI />
      <img id="title-img" src={titleImg} alt={title} />
      {mode == Mode.StageSel && <div id="game-sel">
        <SizeSelector />
        <StageList />
      </div>}
      {mode == Mode.Etc && <></>}
      {mode == Mode.Story && <Story close={() => setMode(Mode.StageSel)} />
      }
      {mode == Mode.Etc && <Etc close={() => setMode(Mode.StageSel)} />
      }
      <Bottom setMode={setMode} />
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
