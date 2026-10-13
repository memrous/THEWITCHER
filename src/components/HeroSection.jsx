import { useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'
import HeroTitle from './HeroTitle'
import VideoBackground from './VideoBackground'

// Intro timeline animates only inner elements (.hero-video, .hero-logo-inner, .hero-sub,
// .hero-scroll, .hero-scroll-pulse). Scroll animations in Journey use the outer wrappers
// (.hero-zoom, .hero-logo-outer, .hero-sub-outer, .hero-scroll-outer).
export default function HeroSection({ className = '', ...props }) {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (reducedMotion) return

      gsap.set('.logo-shine', { xPercent: -100 })
      gsap.set('.logo-shine-text', { xPercent: 100 })

      const tl = gsap.timeline({ delay: 0.5 })
      tl.fromTo('.hero-video', { opacity: 0 }, { opacity: 1, duration: 2, ease: 'power1.inOut' }, 0)
        .fromTo(
          '.hero-logo-inner',
          { opacity: 0, y: 80, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 2.4, ease: 'power3.out' },
          '-=1.2',
        )
        .to('.logo-shine', { xPercent: 100, duration: 1.6, ease: 'power2.inOut' }, '-=0.4')
        .to('.logo-shine-text', { xPercent: -100, duration: 1.6, ease: 'power2.inOut' }, '<')
        .fromTo('.hero-sub', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 }, '-=0.8')
        .fromTo('.hero-scroll', { opacity: 0 }, { opacity: 1, duration: 1 }, '-=0.4')
        // Gentle pulse on an inner element so it never fights the fade-in above.
        .to('.hero-scroll-pulse', {
          opacity: 0.45,
          y: 6,
          duration: 1.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
    },
    { scope: ref, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section ref={ref} className={`hero overflow-hidden bg-black ${className}`} {...props}>
      <div className="hero-zoom absolute inset-0 will-change-transform">
        <VideoBackground name="hero-velen" className="hero-video" />
      </div>

      {/* Readability: soft vignette behind the title + darker bottom edge. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,0,0,0.45),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 via-black/30 to-transparent"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="relative">
          <HeroTitle />
          <div className="hero-sub-outer absolute inset-x-0 top-full mt-6">
            <p className="hero-sub text-center font-heading text-sm tracking-[0.35em] text-neutral-200 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-base md:text-lg">
              Step into the Continent
            </p>
          </div>
        </div>
      </div>

      <div className="hero-scroll-outer absolute inset-x-0 bottom-8 flex justify-center">
        <div className="hero-scroll">
          <div className="hero-scroll-pulse flex flex-col items-center gap-3 text-neutral-300">
            <span className="font-heading text-xs tracking-[0.3em] uppercase">Scroll to begin</span>
            <span className="block h-10 w-px bg-linear-to-b from-neutral-300 to-transparent" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
