import { lazy, Suspense, useEffect, useState } from 'react'
import Footer from './components/Footer'
import Journey from './components/Journey'
import Outro from './components/Outro'
import useReducedMotion from './hooks/useReducedMotion'
import { afterFirstScroll } from './lib/idle'
import { initLenis } from './lib/lenis'
import { chapterHeight } from './lib/witcherChapterLayout'

// Chapter II is far down the page: its code, fonts and timeline are loaded on the first scroll
// (or a few seconds after load). Until then a dark block of exactly its height holds its place.
const WitcherChapter = lazy(() => import('./components/WitcherChapter'))

function ChapterPlaceholder({ reducedMotion }) {
  return <div className="bg-dark" style={{ height: chapterHeight(reducedMotion) }} aria-hidden="true" />
}

export default function App() {
  const reducedMotion = useReducedMotion()
  const [chapterTwo, setChapterTwo] = useState(false)

  useEffect(() => {
    if (reducedMotion) return
    return initLenis()
  }, [reducedMotion])

  useEffect(() => afterFirstScroll(() => setChapterTwo(true)), [])

  const placeholder = <ChapterPlaceholder reducedMotion={reducedMotion} />

  return (
    <>
      <main>
        <Journey />
        {chapterTwo ? (
          <Suspense fallback={placeholder}>
            <WitcherChapter />
          </Suspense>
        ) : (
          placeholder
        )}
        <Outro />
      </main>
      <Footer />
    </>
  )
}
