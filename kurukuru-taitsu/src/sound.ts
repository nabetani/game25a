const audioContext = new (window.AudioContext)();

var sounds: { [key: string]: ((start: boolean) => void) | null } = {}

export const play = (t: string) => {
  const e = document.getElementById(t) as HTMLAudioElement;
  const attrNum = (name: string, fallback: number): number => {
    const a = e.getAttribute(name)
    return a ? parseFloat(a) : fallback
  }
  const attrBool = (name: string, fallback: boolean): boolean => {
    const a = e.getAttribute(name)
    return a ? a.toLowerCase() == "true" : fallback
  }
  (async () => {
    const sound = sounds[t] ?? await (async (): Promise<((start: boolean) => void) | null> => {
      const res = await fetch(e.src);
      if (!res.ok) {
        // console.log({ "sound.play": res })
        return null
      }
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = attrNum("volume", 1);
      const loop = attrBool("loop", false);
      let source: AudioBufferSourceNode | null = null
      return (start: boolean) => {
        if (start) {
          if (source != null) {
            source.stop();
          }
          source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(gainNode)
          source.loop = loop
          gainNode.connect(audioContext.destination);
          source.start();
        } else {
          source?.stop()
        }
      }
    })()
    if (sound != null) {
      sounds[t] = sound
      sound(true)
    }
  })()
}

export const stopAll = () => {
  Object.entries(sounds).forEach(([_, v]) => v && v(false))
}
