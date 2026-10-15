import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'

// Bar height: what a 2.39:1 frame leaves, but at most 7 % of the screen, so no chapter II
// scene loses its text or shot under it.
const BAR = 'min(7svh, max(0px, (100svh - 100vw / 2.39) / 2))'

// Film bars of chapter II: they close in from the top and bottom as the page sinks into the dark
// (the story begins) and open again when the outro comes. `trigger` selects the chapter's wrapper.
// Not rendered with reduced motion (the scenes are static sections then).
export default function Letterbox({ trigger = '#chapter-two' }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      const close = gsap.fromTo(
        '.lb-bar',
        { scaleY: 0 },
        { scaleY: 1, duration: 1.2, ease: 'power3.inOut', paused: true },
      )
      ScrollTrigger.create({
        trigger,
        start: 'top 35%',
        end: 'bottom bottom',
        onToggle: (self) => (self.isActive ? close.play() : close.reverse()),
      })
    },
    { scope: ref, dependencies: [trigger], revertOnUpdate: true },
  )

  const bar = 'lb-bar absolute inset-x-0 bg-black will-change-transform'

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
      <div className={`${bar} top-0 origin-top border-b border-neutral-300/10`} style={{ height: BAR }} />
      <div className={`${bar} bottom-0 origin-bottom border-t border-neutral-300/10`} style={{ height: BAR }} />
    </div>
  )
}
