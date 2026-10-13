import { useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'

const POSTER = `${import.meta.env.BASE_URL}video/fog-geralt-poster.webp`

const LINES = ['A witcher walks the Path.', 'Monsters. Contracts. Choices.', 'Every road leaves a scar.']

// Pinned section: the lines swap one by one while the scene slowly zooms out and darkens.
// With reduced motion it is a static section with all lines visible.
export default function GeraltPinned() {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (reducedMotion) return

      const lines = gsap.utils.toArray('.geralt-line')
      gsap.set(lines, { opacity: 0, y: 30 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: true,
        },
      })

      tl.fromTo('.geralt-bg', { scale: 1.15 }, { scale: 1, duration: 3 }, 0)
        .fromTo('.geralt-dark', { opacity: 0 }, { opacity: 0.8, duration: 3 }, 0)

      lines.forEach((line, i) => {
        const at = 0.25 + i * 0.9
        tl.to(line, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, at)
        // The last line stays.
        if (i < lines.length - 1) {
          tl.to(line, { opacity: 0, y: -30, duration: 0.3, ease: 'power2.in' }, at + 0.6)
        }
      })

      tl.set({}, {}, 3)
    },
    { scope: ref, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section ref={ref} className="relative h-svh overflow-hidden bg-black">
      <div className="geralt-bg absolute inset-0 will-change-transform">
        <img
          src={POSTER}
          alt="Geralt of Rivia standing on a cliff as fog rolls over the hills."
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="geralt-dark pointer-events-none absolute inset-0 bg-black" aria-hidden="true" />
      {/* Soft entry from the black end of Skellige. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,0,0,0.5),transparent_75%)]"
        aria-hidden="true"
      />

      <div
        className={`absolute inset-0 px-6 ${
          reducedMotion ? 'flex flex-col items-center justify-center gap-6' : 'grid place-items-center'
        }`}
      >
        {LINES.map((line) => (
          <p
            key={line}
            className="geralt-line col-start-1 row-start-1 text-center font-heading text-2xl tracking-[0.2em] text-neutral-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-3xl md:text-4xl"
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  )
}
