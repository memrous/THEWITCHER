import { createContext, useContext } from 'react'

// { enabled, muted, toggle } – provided by AudioProvider.
export const AudioContext = createContext({ enabled: false, muted: false, toggle: () => {} })

export const useAudio = () => useContext(AudioContext)
