import { useRef } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'
import { setVideoPlaying } from '../lib/video'
import FogCanvas from './FogCanvas'
import FogTransition from './FogTransition'
import HeroSection from './HeroSection'
import SkelligeParallax from './SkelligeParallax'

// Timeline length in "screens" – one unit = one viewport height of scrolling.
const LENGTH = 6

// Scroll window (in timeline units) in which each scene's video plays.
// Never more than two overlap, so at most two videos play at once.
const PLAY = {
  hero: '0,1.6',
  fog: '0.9,4',
  skellige: '3.3,99',
}

function syncVideos(root, t) {
  root.querySelectorAll('[data-play]').forEach((scene) => {
    const [from, to] = scene.dataset.play.split(',').map(Number)
    setVideoPlaying(scene.querySelector('video'), t >= from && t <= to)
  })
}

// Velen → Into the Fog → Skellige as one sticky stage driven by a single scrubbed timeline.
// With reduced motion the scenes are simply stacked as static sections.
export default function Journey() {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  useGSAP(
    () => {
      if (reducedMotion) return

      const vh = () => window.innerHeight

      gsap.set(['.fog-scene', '.sk-scene', '.fog-line'], { opacity: 0 })
      gsap.set('.fog-line', { y: 24 })
      gsap.set('.fog-sweep', { opacity: 0, xPercent: 75 })
      gsap.set('.fog-zoom', { scale: 1.12 })
      gsap.set('.sk-copy-inner', { opacity: 0, y: 30 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => syncVideos(ref.current, self.progress * LENGTH),
          onRefresh: (self) => syncVideos(ref.current, self.progress * LENGTH),
        },
      })

      // 1) Hero – video zooms in, logo grows and dissolves, small texts leave first.
      tl.to('.hero-zoom', { scale: 1.35, duration: 1.4 }, 0)
        .to('.hero-logo-outer', { scale: 3, opacity: 0, duration: 1 }, 0)
        .to(['.hero-sub-outer', '.hero-scroll-outer'], { opacity: 0, duration: 0.2 }, 0)

      // 2) Fog rolls in from the right and hides the cut to the fog scene.
        .to('.fog-sweep', { opacity: 1, duration: 0.4, ease: 'power1.out' }, 0.5)
        .to('.fog-sweep', { xPercent: 0, duration: 0.9, ease: 'power2.out' }, 0.5)
        .to('.fog-scene', { opacity: 1, duration: 0.4 }, 1.1)
        .to('.fog-zoom', { scale: 1, duration: 2.4 }, 1.1)
        .to('.fog-sweep', { opacity: 0.3, duration: 0.5 }, 1.5)
        .to('.fog-sweep', { xPercent: -25, duration: 2.6 }, 1.4)
        .to('.fog-line', { opacity: 1, y: 0, duration: 0.4, stagger: 0.3, ease: 'power2.out' }, 1.8)
        .to('.fog-copy', { opacity: 0, duration: 0.3 }, 3)

      // 3) Fog thickens again and clears to reveal Skellige.
        .to('.fog-sweep', { opacity: 1, duration: 0.5 }, 3.1)
        .to('.sk-scene', { opacity: 1, duration: 0.3 }, 3.5)
        .to('.fog-sweep', { opacity: 0, duration: 0.6 }, 3.8)

      // 4) Skellige parallax – each layer moves at its own speed.
        .fromTo('.sk-bg', { yPercent: 6 }, { yPercent: -6, duration: 2.5 }, 3.5)
        .fromTo('.sk-fog-far', { yPercent: 15 }, { yPercent: -20, duration: 2.5 }, 3.5)
        .fromTo('.sk-snow', { yPercent: 0 }, { yPercent: -30, duration: 2.5 }, 3.5)
        .fromTo('.sk-copy', { y: () => vh() * 0.3 }, { y: () => vh() * -0.12, duration: 2.5 }, 3.5)
        .to('.sk-copy-inner', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 4.1)
        .set({}, {}, LENGTH)

      // The near fog layer is not rendered on mobile.
      const nearFog = ref.current.querySelector('.sk-fog-near')
      if (nearFog) tl.fromTo(nearFog, { yPercent: 25 }, { yPercent: -15, duration: 2.5 }, 3.5)
    },
    { scope: ref, dependencies: [reducedMotion, isMobile], revertOnUpdate: true },
  )

  if (reducedMotion) {
    return (
      <div>
        <HeroSection className="relative h-svh" />
        <FogTransition className="relative h-svh" />
        <SkelligeParallax className="relative h-svh" />
      </div>
    )
  }

  const scene = 'absolute inset-0'

  return (
    <div ref={ref} className="relative" style={{ height: `${(LENGTH + 1) * 100}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <HeroSection className={scene} data-play={PLAY.hero} />
        <FogTransition className={scene} data-play={PLAY.fog} />
        <SkelligeParallax className={scene} data-play={PLAY.skellige} />

        {/* Fog sweep above all scenes – wide, with soft edges, so it can roll across. */}
        <FogCanvas
          seed={3}
          density={0.75}
          falloff={0.35}
          drift={40}
          className="fog-sweep absolute inset-y-0 -left-1/2 w-[200%] mask-[linear-gradient(90deg,transparent,#000_20%,#000_80%,transparent)] will-change-transform"
        />
      </div>
    </div>
  )
}
