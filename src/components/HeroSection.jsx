import { useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { whenGateOpen } from '../lib/gate'
import { gsap, useGSAP } from '../lib/gsap'
import HeroTitle from './HeroTitle'
import VideoBackground from './VideoBackground'

// Intro timeline animates only inner elements (.hero-curtain, .hero-logo-inner, .logo-flare,
// .logo-glow, the logo words #logo-witcher / #logo-the, .logo-shine-band, .hero-sub,
// .hero-scroll, .hero-scroll-pulse). Scroll animations in Journey use the outer wrappers
// (.hero-zoom, .hero-logo-outer, .hero-sub-outer, .hero-scroll-outer).
export default function HeroSection({ className = '', ...props }) {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (reducedMotion) return

      // Waits for the entry gate (Gate.jsx) – it starts under the light the gate fades from.
      const tl = gsap.timeline({ paused: true })
      // A black curtain fades away instead of the video fading in, so the poster is painted at once
      // (the browser counts it as the largest paint).
      tl.fromTo('.hero-curtain', { opacity: 1 }, { opacity: 0, duration: 2, ease: 'power1.inOut' }, 0)
        // Reveal from the centre: a flare of light cuts through WITCHER and the logo opens
        // from it to both sides, settling from a slight zoom and blur while a bloom fades.
        .add('logo', 0.9)
        .fromTo(
          '.logo-flare',
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power3.out' },
          'logo',
        )
        .to('.logo-flare', { opacity: 0, duration: 0.9, ease: 'power1.in' }, 'logo+=0.8')
        .fromTo(
          '.hero-logo-inner',
          { clipPath: 'inset(-40% 50% -40% 50%)' },
          { clipPath: 'inset(-40% -10% -40% -10%)', duration: 1.4, ease: 'expo.out' },
          'logo+=0.2',
        )
        .fromTo('.hero-logo-inner', { scale: 1.12 }, { scale: 1, duration: 2.6, ease: 'expo.out' }, 'logo+=0.2')
        .fromTo('.hero-logo-inner', { filter: 'blur(10px)' }, { filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' }, 'logo+=0.2')
        .set('.hero-logo-inner', { filter: 'none', clipPath: 'none' }, 'logo+=1.6')
        .fromTo('.logo-glow', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 'logo+=0.2')
        .to('.logo-glow', { opacity: 0, scale: 1.5, duration: 1.6, ease: 'power2.out' }, 'logo+=0.7')
        // WITCHER comes with the light, THE follows 0.3 s later.
        .fromTo('#logo-witcher', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 'logo+=0.2')
        .fromTo('#logo-the', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 'logo+=0.5')
        // Shine: the mask band sweeps across the whole logo (SVG units, past its right edge).
        .fromTo('.logo-shine-band', { x: 0 }, { x: 1250, duration: 1.6, ease: 'power2.inOut' }, 'logo+=1.9')
        // Starts at 0.01, not 0: invisible to the eye, but the browser counts it as painted, so the
        // largest-paint metric is taken at once instead of only after the fade.
        .fromTo('.hero-sub', { opacity: 0.01, y: 10 }, { opacity: 1, y: 0, duration: 1 }, 'logo+=2.4')
        .fromTo('.hero-scroll', { opacity: 0 }, { opacity: 1, duration: 1 }, 'logo+=3')
        // Gentle pulse on an inner element so it never fights the fade-in above.
        .to('.hero-scroll-pulse', {
          opacity: 0.45,
          y: 6,
          duration: 1.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })

      return whenGateOpen(() => tl.play())
    },
    { scope: ref, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section ref={ref} className={`hero overflow-hidden bg-black ${className}`} {...props}>
      <div className="hero-zoom absolute inset-0 will-change-transform">
        <VideoBackground name="hero-velen" eager />
      </div>
      <div className="hero-curtain pointer-events-none absolute inset-0 bg-black opacity-0" aria-hidden="true" />

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
