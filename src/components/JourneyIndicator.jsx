import { useRef, useState } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { getLenis } from '../lib/lenis'
import { WAYPOINTS } from '../lib/waypoints'

// Scroll position (px) of each stop's marker, in page order.
function measure() {
  return WAYPOINTS.map(({ id }) => {
    const el = document.querySelector(`[data-waypoint="${id}"]`)
    return el ? el.getBoundingClientRect().top + window.scrollY : 0
  })
}

// Smooth through Lenis (longer trips take a little longer), a plain jump with reduced motion.
function travelTo(y) {
  const lenis = getLenis()
  if (!lenis) {
    window.scrollTo(0, y)
    return
  }
  const screens = Math.abs(y - window.scrollY) / window.innerHeight
  lenis.scrollTo(y, { duration: gsap.utils.clamp(1.2, 3.2, 0.9 + screens * 0.12) })
}

// Journey indicator in place of the scrollbar: a thin line on the left with the stops of the
// journey. The line is drawn between the stops as the page scrolls (scaleY of each segment's
// fill), the stop reached last is lit. A click on a stop travels there. On mobile it is a plain
// guide – no labels, not clickable.
export default function JourneyIndicator() {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()
  const [current, setCurrent] = useState(-1)

  useGSAP(
    () => {
      const fills = gsap.utils.toArray('.ji-fill')
      const setters = fills.map((el) => gsap.quickSetter(el, 'scaleY'))
      // Segment i runs from bounds[i] to bounds[i + 1]: page top → first stop → … → page end.
      let stops = []
      let bounds = []

      const update = (y) => {
        bounds.forEach((from, i) => {
          if (i === bounds.length - 1) return
          const to = bounds[i + 1]
          setters[i](to > from ? gsap.utils.clamp(0, 1, (y - from) / (to - from)) : y >= to ? 1 : 0)
        })
        // A stop is reached a little before its exact moment (half a screen).
        const ahead = y + window.innerHeight * 0.5
        let reached = -1
        stops.forEach((at, i) => {
          if (ahead >= at) reached = i
        })
        setCurrent(reached)
      }

      const remeasure = () => {
        stops = measure()
        bounds = [0, ...stops, ScrollTrigger.maxScroll(window)]
        update(window.scrollY)
      }

      const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => update(self.scroll()) })
      ScrollTrigger.addEventListener('refresh', remeasure)
      remeasure()

      const go = (e) => {
        const i = Number(e.currentTarget.dataset.stop)
        travelTo(stops[i])
      }
      const buttons = gsap.utils.toArray('.ji-stop')
      buttons.forEach((b) => b.addEventListener('click', go))

      return () => {
        trigger.kill()
        ScrollTrigger.removeEventListener('refresh', remeasure)
        buttons.forEach((b) => b.removeEventListener('click', go))
      }
    },
    { scope: ref, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  const segment = (key, grow = 1) => (
    <span key={key} className="relative block w-px bg-neutral-300/25" style={{ flexGrow: grow }} aria-hidden="true">
      <span
        className="ji-fill absolute inset-0 origin-top bg-linear-to-b from-neutral-300/60 to-neutral-100 shadow-[0_0_6px_rgba(230,234,239,0.5)]"
        style={{ transform: 'scaleY(0)' }}
      />
    </span>
  )

  return (
    <nav
      ref={ref}
      aria-label="Journey"
      className="group/ji pointer-events-none fixed top-1/4 bottom-1/4 left-2 z-[60] flex flex-col items-center md:left-5"
    >
      {segment('lead', 0.6)}
      {WAYPOINTS.map((stop, i) => {
        const lit = i === current
        const passed = i <= current
        return [
          // The whole 40 px square is the hit area; while the indicator is hovered, the names
          // can be clicked too.
          <button
            key={stop.id}
            type="button"
            data-stop={i}
            aria-label={`Travel to ${stop.name ?? stop.label}`}
            aria-current={lit ? 'step' : undefined}
            className="ji-stop group/stop relative flex size-4 items-center justify-center rounded-full focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-neutral-200 max-md:pointer-events-none md:pointer-events-auto md:size-10"
          >
            {/* Halo that rises on hover – a hint the stop can be clicked. */}
            <span
              className="absolute inset-[9px] scale-50 rounded-full border border-neutral-200/50 bg-neutral-200/5 opacity-0 transition-[opacity,transform] duration-300 group-hover/stop:scale-100 group-hover/stop:opacity-100 group-focus-visible/stop:scale-100 group-focus-visible/stop:opacity-100 motion-reduce:transition-none max-md:hidden"
              aria-hidden="true"
            />
            {stop.ornament ? (
              <span
                className={`text-[11px] leading-none transition-[color,transform] duration-500 group-hover/stop:scale-125 motion-reduce:transition-none md:text-[15px] ${
                  lit
                    ? 'scale-125 text-neutral-50 drop-shadow-[0_0_8px_rgba(230,234,239,1)]'
                    : passed
                      ? 'text-neutral-200'
                      : 'text-neutral-400/60 group-hover/stop:text-neutral-200'
                }`}
                aria-hidden="true"
              >
                {stop.label}
              </span>
            ) : (
              <span
                className={`block size-[6px] rounded-full transition-[background-color,box-shadow,transform] duration-500 group-hover/stop:scale-150 motion-reduce:transition-none md:size-2 ${
                  lit
                    ? 'scale-150 bg-neutral-50 shadow-[0_0_10px_rgba(230,234,239,1)]'
                    : passed
                      ? 'bg-neutral-200 shadow-[0_0_4px_rgba(230,234,239,0.5)]'
                      : 'bg-neutral-400/50 group-hover/stop:bg-neutral-200'
                }`}
                aria-hidden="true"
              />
            )}
            {/* The lit stop always shows its name; the others while the indicator is hovered. */}
            {!stop.ornament && (
              <span
                className={`pointer-events-none absolute top-1/2 left-full -translate-y-1/2 py-2 pr-3 font-heading text-xs tracking-[0.3em] whitespace-nowrap text-neutral-100 uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,1)] transition-opacity duration-500 group-hover/ji:pointer-events-auto motion-reduce:transition-none max-md:hidden ${
                  lit ? 'opacity-100' : 'opacity-0 group-hover/ji:opacity-60 group-hover/stop:opacity-100 group-focus-visible/stop:opacity-100'
                }`}
                aria-hidden="true"
              >
                {stop.label}
              </span>
            )}
          </button>,
          segment(`${stop.id}-after`, i === WAYPOINTS.length - 1 ? 1.4 : 1),
        ]
      })}
    </nav>
  )
}
