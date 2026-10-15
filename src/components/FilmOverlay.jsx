import { useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'

// Grey fractal noise tile (opaque, contrast boosted), rasterised once by the browser and repeated over the layer.
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='2 0 0 0 -.5 2 0 0 0 -.5 2 0 0 0 -.5 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

// How far the grain layer jumps each frame (px) – it is this much larger than the screen on
// every side, so its edge never shows.
const JUMP = 120

// Film grain and vignette over the whole site: one look for clips from different sources.
// The grain jumps to a random offset 8 times a second (transform only); with reduced motion it
// stays still.
export default function FilmOverlay() {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (reducedMotion) return
      gsap.to('.film-grain', {
        x: `random(-${JUMP}, ${JUMP}, 1)`,
        y: `random(-${JUMP}, ${JUMP}, 1)`,
        duration: 1 / 8,
        ease: 'steps(1)',
        repeat: -1,
        repeatRefresh: true,
      })
    },
    { scope: ref, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_70%_at_50%_50%,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
      <div
        className="film-grain absolute opacity-[0.06] mix-blend-overlay will-change-transform"
        style={{ inset: -JUMP, backgroundImage: NOISE }}
      />
    </div>
  )
}
