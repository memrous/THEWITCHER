import { useRef } from 'react'
import { useAudio } from '../audio/context'
import { getLoudness } from '../audio/engine'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'

// Notches around the rim of the medallion.
const NOTCHES = Array.from({ length: 24 }, (_, i) => i * 15)

// Sound switch: a small round medallion in the bottom right corner (own drawing – a notched
// silver rim with three arcs of sound). While sound plays it quivers with the loudness of what
// plays (the analyser in the engine): .medal-pulse (scale), .medal-glow (opacity). Off, it
// rests dimmed with a stroke across. With reduced motion it does not quiver. Key: M.
export default function SoundMedallion() {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()
  const { enabled, muted, toggle } = useAudio()
  const playing = enabled && !muted

  useGSAP(
    () => {
      if (!playing || reducedMotion) return
      const scale = gsap.quickTo('.medal-pulse', 'scale', { duration: 0.12, ease: 'power2.out' })
      const glow = gsap.quickTo('.medal-glow', 'opacity', { duration: 0.2, ease: 'power2.out' })
      let smooth = 0
      const tick = () => {
        smooth += (getLoudness() - smooth) * 0.35
        scale(1 + smooth * 0.09)
        glow(0.15 + smooth * 0.85)
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope: ref, dependencies: [playing, reducedMotion], revertOnUpdate: true },
  )

  return (
    <div ref={ref} className="fixed right-4 bottom-4 z-[60] md:right-6 md:bottom-6">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Sound on – turn off (M)' : 'Sound off – turn on (M)'}
        title={playing ? 'Sound on (M)' : 'Sound off (M)'}
        className="group relative block size-11 rounded-full focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-neutral-200 md:size-12"
      >
        <span
          className="medal-glow pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle_closest-side,rgba(226,232,240,0.35),transparent)] opacity-0"
          aria-hidden="true"
        />
        <span className="medal-pulse block size-full">
          <svg
            viewBox="0 0 48 48"
            className={`block size-full transition-opacity duration-300 motion-reduce:transition-none ${
              playing ? 'opacity-100' : 'opacity-55 group-hover:opacity-90'
            }`}
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="medal-face" cx="40%" cy="35%" r="70%">
                <stop offset="0" stopColor="#2a2c30" />
                <stop offset="1" stopColor="#0b0c0e" />
              </radialGradient>
              <linearGradient id="medal-rim" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f1f3f5" />
                <stop offset="0.5" stopColor="#8d939b" />
                <stop offset="1" stopColor="#dfe3e8" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="22" fill="url(#medal-face)" stroke="url(#medal-rim)" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="18.5" fill="none" stroke="#c9ced5" strokeOpacity="0.35" strokeWidth="0.6" />
            {NOTCHES.map((deg) => (
              <line
                key={deg}
                x1="24"
                y1="3.4"
                x2="24"
                y2={deg % 45 === 0 ? 6.2 : 5}
                stroke="#c9ced5"
                strokeOpacity={deg % 45 === 0 ? 0.8 : 0.4}
                strokeWidth="0.7"
                transform={`rotate(${deg} 24 24)`}
              />
            ))}
            {/* A small point of sound and three arcs spreading from it. */}
            <g fill="none" stroke="#e6eaef" strokeLinecap="round" strokeWidth="1.4">
              <circle cx="17" cy="24" r="1.6" fill="#e6eaef" stroke="none" />
              <path d="M21 20.5 a5 5 0 0 1 0 7" strokeOpacity={playing ? 1 : 0.5} />
              <path d="M24.5 17.5 a9.5 9.5 0 0 1 0 13" strokeOpacity={playing ? 0.75 : 0.35} />
              <path d="M28 14.5 a14 14 0 0 1 0 19" strokeOpacity={playing ? 0.5 : 0.2} />
            </g>
            {!playing && <line x1="14" y1="34" x2="34" y2="14" stroke="#e6eaef" strokeWidth="1.3" strokeLinecap="round" />}
          </svg>
        </span>
      </button>
    </div>
  )
}
