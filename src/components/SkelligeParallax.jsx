import { useMemo, useRef } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'
import { createRandom } from '../lib/random'
import FogCanvas from './FogCanvas'
import VideoBackground from './VideoBackground'

// Ambient snowfall – each flake falls through its layer and sways (transform only).
function Snow({ count }) {
  const ref = useRef(null)
  const flakes = useMemo(() => {
    const rand = createRandom(7)
    return Array.from({ length: count }, () => ({
      left: rand() * 100,
      size: 1 + rand() * 2.5,
      opacity: 0.3 + rand() * 0.5,
      duration: 10 + rand() * 12,
      sway: 10 + rand() * 30,
      progress: rand(),
    }))
  }, [count])

  useGSAP(
    () => {
      const height = ref.current.offsetHeight
      ref.current.querySelectorAll('.flake').forEach((el, i) => {
        const { duration, sway, progress } = flakes[i]
        gsap
          .fromTo(el, { y: -20 }, { y: height + 20, duration, ease: 'none', repeat: -1 })
          .progress(progress)
        gsap.to(el, { x: sway, duration: duration / 4, ease: 'sine.inOut', repeat: -1, yoyo: true })
      })
    },
    { scope: ref, dependencies: [flakes], revertOnUpdate: true },
  )

  return (
    <div ref={ref} className="absolute inset-0" aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="flake absolute top-0 rounded-full bg-white"
          style={{ left: `${f.left}%`, width: f.size, height: f.size, opacity: f.opacity }}
        />
      ))}
    </div>
  )
}

// Skellige scene. Animated from Journey: .sk-scene (opacity) and the parallax layers
// .sk-bg, .sk-fog-far, .sk-snow, .sk-fog-near, .sk-copy (y), .sk-copy-inner (reveal).
export default function SkelligeParallax({ className = '', ...props }) {
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()

  return (
    <section className={`sk-scene overflow-hidden bg-black ${className}`} {...props}>
      <div className="sk-bg absolute inset-x-0 -inset-y-[10%] will-change-transform">
        <VideoBackground name="skellige-valley" />
      </div>

      <FogCanvas
        seed={11}
        density={0.4}
        falloff={0.9}
        drift={90}
        className="sk-fog-far absolute inset-x-0 top-[20%] h-[80%] opacity-60 will-change-transform"
      />

      {!reducedMotion && (
        <div className="sk-snow absolute inset-x-0 top-0 h-[150%] will-change-transform">
          <Snow count={isMobile ? 24 : 60} />
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_45%,rgba(0,0,0,0.4),transparent_75%)]"
        aria-hidden="true"
      />

      <div className="sk-copy absolute inset-0 flex items-center justify-center px-6">
        <div className="sk-copy-inner text-center">
          <h2 className="font-display text-[clamp(3rem,11vw,9rem)] leading-none font-bold tracking-[0.12em] text-neutral-100 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            Skellige
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-heading text-base tracking-[0.15em] text-neutral-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:text-lg md:text-xl">
            Storm-lashed isles where the sea meets the sword.
          </p>
        </div>
      </div>

      {!isMobile && (
        <FogCanvas
          seed={23}
          density={0.5}
          falloff={1}
          drift={45}
          className="sk-fog-near absolute inset-x-0 -bottom-[10%] h-[55%] will-change-transform"
        />
      )}

      {/* Blend into the next (black) section. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black to-transparent"
        aria-hidden="true"
      />
    </section>
  )
}
