import { useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { setVideoPlaying } from '../lib/video'
import VideoBackground from './VideoBackground'

// Dark finale: the lake at dusk slowly sinks into darkness, then the call to action appears.
// The scene sticks for one screen; with reduced motion it is a static section.
export default function Outro() {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (reducedMotion) return

      // Play the video only while the section is on screen.
      const sync = (self) => setVideoPlaying(ref.current.querySelector('video'), self.isActive)
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: sync,
        onRefresh: sync,
      })

      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
        })
        .fromTo('.outro-zoom', { scale: 1.15 }, { scale: 1, duration: 1 }, 0)
        .fromTo('.outro-dark', { opacity: 0 }, { opacity: 0.7, duration: 1 }, 0)
        .fromTo(
          '.outro-content',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
          0.6,
        )
    },
    { scope: ref, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section ref={ref} className={`relative bg-black ${reducedMotion ? 'h-svh' : 'h-[200svh]'}`}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="outro-zoom absolute inset-0 will-change-transform">
          <VideoBackground name="outro-lake-dusk" />
        </div>

        <div
          className={`outro-dark pointer-events-none absolute inset-0 bg-black ${reducedMotion ? 'opacity-60' : ''}`}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="outro-content flex flex-col items-center gap-10 text-center">
            <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] leading-tight font-bold tracking-[0.1em] text-neutral-100 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              The Continent awaits
            </h2>
            <a
              href="https://www.thewitcher.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 border border-neutral-300/60 bg-black/30 px-8 py-4 font-heading text-sm tracking-[0.3em] text-neutral-100 uppercase backdrop-blur-sm transition-colors duration-300 hover:border-neutral-100 hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-100 sm:text-base"
            >
              Enter the World
              <span className="sr-only"> (opens the official site in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
