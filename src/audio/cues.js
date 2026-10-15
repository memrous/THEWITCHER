import { haptic, isFlying, sfx } from './engine'

// Sound effects (and buzzes) on key moments of a scrubbed timeline. A cue sounds only while
// scrolling down, once per pass: it is re-armed once the scroll is outside its scene again.
// Cues flown past on an indicator trip stay silent.
//   cues: [{ at, sound?, volume?, haptic?, scene: [from, to] }] – times in timeline units.
// Returns `rearm(t)` – call it with the timeline position on every update.
export function addSoundCues(tl, cues) {
  const played = cues.map(() => false)

  cues.forEach((cue, i) => {
    tl.call(
      () => {
        if (played[i] || (tl.scrollTrigger?.direction ?? 1) < 0 || isFlying()) return
        played[i] = true
        if (cue.sound) sfx(cue.sound, { volume: cue.volume })
        if (cue.haptic) haptic()
      },
      null,
      cue.at,
    )
  })

  return (t) =>
    cues.forEach((cue, i) => {
      if (t < cue.scene[0] || t > cue.scene[1]) played[i] = false
    })
}
