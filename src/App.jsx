import { useEffect } from 'react'
import Footer from './components/Footer'
import GeraltPinned from './components/GeraltPinned'
import Journey from './components/Journey'
import Outro from './components/Outro'
import useReducedMotion from './hooks/useReducedMotion'
import { initLenis } from './lib/lenis'

export default function App() {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    return initLenis()
  }, [reducedMotion])

  return (
    <>
      <main>
        <Journey />
        <GeraltPinned />
        <Outro />
      </main>
      <Footer />
    </>
  )
}
