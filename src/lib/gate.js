// State of the entry gate (Gate.jsx): the rest of the site waits for it to open – the hero intro
// starts only then, and (Phase 10) sound may play only after the visitor chose it there.

let open = false
const waiting = new Set()

// Runs `fn` once the gate is open (at once if it already is). Returns a cancel function.
export function whenGateOpen(fn) {
  if (open) {
    fn()
    return () => {}
  }
  waiting.add(fn)
  return () => waiting.delete(fn)
}

// Called by the gate once its light has flooded the screen.
export function markGateOpen() {
  if (open) return
  open = true
  waiting.forEach((fn) => fn())
  waiting.clear()
}

const SOUND_KEY = 'witcher-sound'

// The visitor's last choice at the gate: true (with sound), false (in silence), or null.
export function getSoundChoice() {
  try {
    const value = window.localStorage.getItem(SOUND_KEY)
    return value === null ? null : value === 'on'
  } catch {
    return null
  }
}

export function saveSoundChoice(withSound) {
  try {
    window.localStorage.setItem(SOUND_KEY, withSound ? 'on' : 'off')
  } catch {
    // Storage blocked (private mode) – the choice simply is not remembered.
  }
}

export const isGateOpen = () => open
