import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { isGateOpen, saveSoundChoice } from '../lib/gate'
import { AudioContext } from './context'
import { enableAudio, getAudioState, setMuted, subscribeAudio } from './engine'
import SoundScape from './SoundScape'

// Sound state for the UI (the medallion) and the M key. The first turn-on happens at the gate
// ("Enter with sound"); after that the medallion or M switch it on and off. Nothing ever starts
// on its own, and M does nothing while the gate is still closed.
export default function AudioProvider({ children }) {
  const { enabled, muted } = useSyncExternalStore(subscribeAudio, getAudioState, getAudioState)

  const toggle = useCallback(() => {
    const on = !enabled || muted
    if (on) enableAudio()
    else setMuted(true)
    saveSoundChoice(on)
  }, [enabled, muted])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'm' && e.key !== 'M') return
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || !isGateOpen()) return
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return
      toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  const value = useMemo(() => ({ enabled, muted, toggle }), [enabled, muted, toggle])

  return (
    <AudioContext.Provider value={value}>
      <SoundScape />
      {children}
    </AudioContext.Provider>
  )
}
