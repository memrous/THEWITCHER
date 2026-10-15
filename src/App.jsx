import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import AudioProvider from './audio/AudioProvider'
import Cursor from './components/Cursor'
import DarkWorld from './components/DarkWorld'
import FilmOverlay from './components/FilmOverlay'
import Footer from './components/Footer'
import Gate from './components/Gate'
import Journey from './components/Journey'
import JourneyIndicator from './components/JourneyIndicator'
import Letterbox from './components/Letterbox'
import Outro from './components/Outro'
import SoundMedallion from './components/SoundMedallion'
import Waypoint from './components/Waypoint'
import useReducedMotion from './hooks/useReducedMotion'
import { afterFirstScroll, whenIdle } from './lib/idle'
import { initLenis } from './lib/lenis'
import { BREATHS, chapterHeight } from './lib/witcherChapterLayout'

// Chapter II is far down the page: its code, fonts and timeline are loaded on the first scroll
// (or a few seconds after load). Until then a dark block of exactly its height holds its place.
const WitcherChapter = lazy(() => import('./components/WitcherChapter'))

function ChapterPlaceholder({ reducedMotion }) {
  return <div className="bg-dark" style={{ height: chapterHeight(reducedMotion) }} aria-hidden="true" />
}

export default function App() {
  const reducedMotion = useReducedMotion()
  const [chapterTwo, setChapterTwo] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)

  useEffect(() => {
    if (reducedMotion) return
    return initLenis()
  }, [reducedMotion])

  useEffect(() => afterFirstScroll(() => setChapterTwo(true)), [])
  // Better still: while the loaded gate waits for the click – nothing moves then, so the moment
  // the chapter takes to set up goes unnoticed.
  const [gateReady, setGateReady] = useState(false)
  useEffect(() => {
    if (gateReady) return whenIdle(() => setChapterTwo(true))
  }, [gateReady])

  const onGateReady = useCallback(() => setGateReady(true), [])
  const placeholder = <ChapterPlaceholder reducedMotion={reducedMotion} />

  return (
    <AudioProvider>
      <main>
        <Journey />
        {/* Wrapper that is there before the chapter loads: the indicator's stop and the film bars
            need it. "The Witcher" leads to the first scene's hold (its top with reduced motion). */}
        <div id="chapter-two" className="relative">
          <Waypoint id="witcher" at={reducedMotion ? 0 : BREATHS[0]} />
          {chapterTwo ? (
            <Suspense fallback={placeholder}>
              <WitcherChapter />
            </Suspense>
          ) : (
            placeholder
          )}
        </div>
        <Outro />
      </main>
      <Footer />

      {!reducedMotion && <DarkWorld />}
      {!reducedMotion && <Letterbox />}
      <FilmOverlay />
      <JourneyIndicator />
      {gateOpen && <SoundMedallion />}
      {!gateOpen && <Gate onReady={onGateReady} onDone={() => setGateOpen(true)} />}
      <Cursor />
    </AudioProvider>
  )
}
