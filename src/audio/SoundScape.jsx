import useReducedMotion from '../hooks/useReducedMotion'
import { ScrollTrigger, useGSAP } from '../lib/gsap'
import { setSoundscape } from './engine'
import { ZONES } from './zones'

const top = (selector) => {
  const el = document.querySelector(selector)
  return el ? el.getBoundingClientRect().top + window.scrollY : null
}

// Scroll position (px) where a zone starts.
function startOf(zone, reducedMotion) {
  const vh = window.innerHeight
  if (!reducedMotion) {
    const [chapter, units] = zone.at
    return (top(chapter) ?? 0) + units * vh
  }
  if (!zone.still) return 0
  if (Array.isArray(zone.still)) {
    const [chapter, sections] = zone.still
    return (top(chapter) ?? 0) + sections * vh - vh / 2
  }
  return (top(zone.still) ?? 0) - vh / 2
}

// Picks the soundscape for the current place on the page (see zones.js) – the engine crossfades
// to it. Renders nothing; runs whether sound is on or not, so the right zone is ready the moment
// the visitor turns it on.
export default function SoundScape() {
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      let starts = []
      const pick = (y) => {
        let zone = ZONES[0]
        starts.forEach((start, i) => {
          if (y >= start) zone = ZONES[i]
        })
        setSoundscape(zone.music, zone.amb)
      }
      const measure = () => {
        starts = ZONES.map((zone) => startOf(zone, reducedMotion))
        pick(window.scrollY)
      }

      const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => pick(self.scroll()) })
      ScrollTrigger.addEventListener('refresh', measure)
      measure()
      return () => {
        trigger.kill()
        ScrollTrigger.removeEventListener('refresh', measure)
      }
    },
    { dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return null
}
