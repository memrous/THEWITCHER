import { useRef } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import useReducedMotion from '../hooks/useReducedMotion'
import { breathSnap } from '../lib/breath'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { createMapCamera } from '../lib/mapCamera'
import { prepareStrokeDraw } from '../lib/stroke'
import { setVideoPlaying, syncSceneVideos } from '../lib/video'
import FogCanvas from './FogCanvas'
import FogTransition from './FogTransition'
import HeroSection from './HeroSection'
import MapTravel from './MapTravel'
import NovigradScene from './NovigradScene'
import PortScene from './PortScene'
import SkelligeParallax from './SkelligeParallax'
import VelenScene from './VelenScene'
import Waypoint from './Waypoint'
import WitcherSenses from './WitcherSenses'

// Timeline length in "screens" – one unit = one viewport height of scrolling.
const LENGTH = 16.6

// Scroll window (in timeline units) in which each scene's video plays.
// Never more than two overlap, so at most two videos play at once.
// While the ship crosses the map (9.35–10.6) no video plays at all.
const PLAY = {
  hero: '0,1.4',
  velen: '0.7,4.1',
  fog: '3.6,6.4',
  skellige: '6,9.35',
  port: '10.6,12.4',
  novigrad: '11.8,15.6',
  senses: '14.3,99',
}

// Moments the scroll settles on (see breathSnap): each area title with its line of text fully
// shown, just before it fades. The journey indicator leads to the same moments.
const BREATHS = { velen: 2.6, skellige: 7.7, novigrad: 13.4 }
// "But the Continent needs a witcher." is fully shown.
const SENSES_AT = 15.95

// Letters start spread apart (about as if letter-spacing were 0.6em) and close in to the rest
// spacing. In percent of each letter's own width (a Cinzel capital is ~0.8em wide) – nothing has to
// be measured, which keeps the setup free of forced style recalculations.
const spread = (i, el, all) => (i - (all.length - 1) / 2) * 50

// LocationTitle entrance. Its exit is handled by the scene's copy wrapper.
function addTitle(tl, title, at) {
  tl.fromTo(
    `${title} .loc-letter`,
    { opacity: 0, xPercent: spread },
    { opacity: 1, xPercent: 0, duration: 0.7, ease: 'power2.out' },
    at,
  )
    .fromTo(`${title} .loc-line`, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, at + 0.2)
    .fromTo(`${title} .loc-sub`, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, at + 0.35)
}

const reveal = { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }

// Wide fog band with soft edges, so it can roll across the whole screen.
const sweepClass =
  'absolute inset-y-0 -left-1/2 w-[200%] mask-[linear-gradient(90deg,transparent,#000_20%,#000_80%,transparent)] will-change-transform'

// Chapter I – The Continent: hero → Velen → fog → Skellige → map → Novigrad → witcher senses,
// as one sticky stage driven by a single scrubbed timeline.
// With reduced motion the scenes are simply stacked as static sections.
export default function Journey() {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  useGSAP(
    () => {
      if (reducedMotion) return

      const vh = () => window.innerHeight
      const root = ref.current

      gsap.set(['.velen-scene', '.fog-scene', '.sk-scene', '.nc-scene', '.fog-line'], { opacity: 0 })
      gsap.set(['.velen-text', '.sk-text', '.nc-text', '.senses-line'], { opacity: 0, y: 20 })
      gsap.set('.fog-line', { y: 24 })
      gsap.set(['.intro-fog', '.fog-sweep'], { opacity: 0, xPercent: 75 })
      gsap.set('.fog-zoom', { scale: 1.12 })
      gsap.set('.senses-ring', { scale: 0 })
      gsap.set('.map-scene', { visibility: 'hidden' })

      // Camera over the map. Skellige shrinks into a circle on its pin, the harbour opens
      // from the Novigrad pin.
      const camera = createMapCamera({
        stage: root.querySelector('.journey-stage'),
        map: root.querySelector('.map-cam'),
        circles: [
          { el: root.querySelector('.sk-scene'), pin: 'skellige', radius: 1 },
          { el: root.querySelector('.port-scene'), pin: 'novigrad', radius: 0 },
        ],
      })
      const cam = camera.state
      const moveCamera = { onUpdate: camera.apply }
      camera.apply()

      const routeReveal = root.querySelector('.route-reveal')
      prepareStrokeDraw(routeReveal)

      // At the end the whole stage scrolls away into the dark of chapter II (see onScreen below).
      // Once it is off screen, none of its videos keeps playing. Both triggers may call this
      // while they are being created, hence the guards.
      let tl = null
      let onScreen = null
      const sync = () => {
        if (!tl?.scrollTrigger) return
        if (!onScreen || onScreen.isActive) syncSceneVideos(root, tl.scrollTrigger.progress * LENGTH)
        else root.querySelectorAll('video').forEach((video) => setVideoPlaying(video, false))
      }

      tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          ...(isMobile ? {} : { snap: breathSnap(Object.values(BREATHS), LENGTH) }),
          onUpdate: sync,
          onRefresh: () => {
            camera.apply()
            sync()
          },
        },
      })
      onScreen = ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onToggle: sync })

      // 1) Hero – video zooms in, logo grows and dissolves, small texts leave first.
      tl.to('.hero-zoom', { scale: 1.35, duration: 1.4 }, 0)
        .to('.hero-logo-outer', { scale: 3, opacity: 0, duration: 1 }, 0)
        .to(['.hero-sub-outer', '.hero-scroll-outer'], { opacity: 0, duration: 0.2 }, 0)

      // 2) Fog rolls in over the hero, Velen fades in behind it and the fog drifts away.
        .to('.intro-fog', { opacity: 1, duration: 0.4, ease: 'power1.out' }, 0.35)
        .to('.intro-fog', { xPercent: 0, duration: 0.8, ease: 'power2.out' }, 0.35)
        .to('.velen-scene', { opacity: 1, duration: 0.5 }, 0.8)
        .set('.hero', { visibility: 'hidden' }, 1.4)
        .to('.intro-fog', { xPercent: -40, duration: 1, ease: 'power1.in' }, 1.15)
        .to('.intro-fog', { opacity: 0, duration: 0.6 }, 1.3)
        .set('.intro-fog', { visibility: 'hidden' }, 2.2)

      // 3) Velen – area title, one line of text.
        .fromTo('.velen-zoom', { scale: 1.15 }, { scale: 1, duration: 3.3 }, 0.8)
      addTitle(tl, '.velen-title', 1.6)
      tl.to('.velen-text', { ...reveal }, 2.1)
        .to('.velen-copy', { opacity: 0, duration: 0.3 }, 3)

      // 4) Fog rolls in from the right and hides the cut to the fog scene.
        .to('.fog-sweep', { opacity: 1, duration: 0.4, ease: 'power1.out' }, 3.1)
        .to('.fog-sweep', { xPercent: 0, duration: 0.9, ease: 'power2.out' }, 3.1)
        .to('.fog-scene', { opacity: 1, duration: 0.4 }, 3.7)
        .set('.velen-scene', { visibility: 'hidden' }, 4.1)
        .to('.fog-zoom', { scale: 1, duration: 2.4 }, 3.7)
        .to('.fog-sweep', { opacity: 0.3, duration: 0.5 }, 4.1)
        .to('.fog-sweep', { xPercent: -25, duration: 2.6 }, 4)
        .to('.fog-line', { opacity: 1, y: 0, duration: 0.4, stagger: 0.3, ease: 'power2.out' }, 4.4)
        .to('.fog-copy', { opacity: 0, duration: 0.3 }, 5.6)

      // 5) Fog thickens again and clears to reveal Skellige.
        .to('.fog-sweep', { opacity: 1, duration: 0.5 }, 5.7)
        .to('.sk-scene', { opacity: 1, duration: 0.3 }, 6.1)
        .set('.fog-scene', { visibility: 'hidden' }, 6.4)
        .to('.fog-sweep', { opacity: 0, duration: 0.6 }, 6.4)
        .set('.fog-sweep', { visibility: 'hidden' }, 7)

      // 6) Skellige parallax – each layer moves at its own speed.
        .fromTo('.sk-bg', { yPercent: 6 }, { yPercent: -6, duration: 3.4 }, 6.1)
        .fromTo('.sk-fog-far', { yPercent: 15 }, { yPercent: -20, duration: 3.4 }, 6.1)
        .fromTo('.sk-snow', { yPercent: 0 }, { yPercent: -30, duration: 3.4 }, 6.1)
        .fromTo('.sk-copy', { y: () => vh() * 0.3 }, { y: () => vh() * -0.12, duration: 2.6 }, 6.1)
      addTitle(tl, '.sk-title', 6.6)
      tl.to('.sk-text', { ...reveal }, 7.1)
        .to('.sk-copy-inner', { opacity: 0, duration: 0.3 }, 8.2)

      // 7) Map – the camera rises out of Skellige: the video shrinks into its pin while the
      //    map below zooms out.
        .set('.map-scene', { visibility: 'visible' }, 8.6)
        .to(cam, { z: 1.6, duration: 0.75, ease: 'power2.inOut', ...moveCamera }, 8.6)
        .to(cam, { skellige: 0, duration: 0.7, ease: 'power2.in', ...moveCamera }, 8.6)
        .set('.sk-scene', { visibility: 'hidden' }, 9.35)

      //    Sailing – the new route is drawn, the ship follows it, the map pans along.
        .to('.route-reveal', { strokeDashoffset: 0, duration: 1.3, ease: 'power1.inOut' }, 9.3)
        .to(
          '#ship',
          {
            motionPath: { path: '#route-new', align: '#route-new', alignOrigin: [0.5, 0.8] },
            duration: 1.3,
            ease: 'power1.inOut',
          },
          9.3,
        )
        .to('#ship', { keyframes: { rotation: [0, 4, -4, 4, -4, 0] }, transformOrigin: '50% 100%', duration: 1.3 }, 9.3)
        .to(cam, { fx: 822, fy: 352, duration: 1.5, ease: 'power1.inOut', ...moveCamera }, 9.2)

      //    Arrival – the Novigrad pin pulses, the camera dives in and the harbour opens from it.
        .fromTo(
          '#pin-novigrad circle:nth-of-type(2)',
          { scale: 1, opacity: 0.7 },
          { scale: 1.6, opacity: 0, duration: 0.3, transformOrigin: '50% 50%' },
          10.6,
        )
        .to(cam, { z: 4, duration: 0.8, ease: 'power2.in', ...moveCamera }, 10.7)
        .to(cam, { novigrad: 1, duration: 0.5, ease: 'power2.in', ...moveCamera }, 11.1)
        // The harbour keeps drifting (and settles at the full frame) until the city takes over.
        .fromTo('.port-pan', { scale: 1.15, xPercent: 4 }, { scale: 1, xPercent: 0, duration: 1.5, ease: 'power1.out' }, 11.1)
        .set('.map-scene', { visibility: 'hidden' }, 11.6)

      // A touch of blur while the map is close to the lens (desktop only – filters are costly).
      if (!isMobile) {
        tl.fromTo('.map-blur', { filter: 'blur(2px)' }, { filter: 'blur(0px)', duration: 0.4 }, 8.6)
          .set('.map-blur', { filter: 'none' }, 9)
          .fromTo('.map-blur', { filter: 'blur(0px)' }, { filter: 'blur(2px)', duration: 0.3, immediateRender: false }, 11.2)
      }

      // 8) Novigrad – crossfade to the city, light parallax (title moves faster than the city).
      tl.to('.nc-scene', { opacity: 1, duration: 0.5 }, 11.9)
        .set('.port-scene', { visibility: 'hidden' }, 12.4)
        .fromTo('.nc-bg', { scale: 1.1 }, { scale: 1, duration: 2.6 }, 11.9)
        .fromTo('.nc-copy', { y: () => vh() * 0.25 }, { y: () => vh() * -0.15, duration: 2.2 }, 11.9)
      addTitle(tl, '.nc-title', 12.4)
      tl.to('.nc-text', { ...reveal }, 12.9)
        .to('.nc-copy-inner', { opacity: 0, duration: 0.3 }, 13.8)

      // 9) Witcher senses – the city shudders and drains of colour, then Geralt appears
      //    inside a circular wave spreading from the centre.
        .to('.nc-shake', { keyframes: { x: [0, -6, 5, -4, 6, -3, 2, 0] }, duration: 0.5 }, 14)
        .fromTo(
          '.nc-filter',
          { filter: 'saturate(1) brightness(1)' },
          { filter: 'saturate(0) brightness(0.6)', duration: 0.5 },
          14,
        )
        .fromTo(
          '.senses-reveal',
          { clipPath: 'circle(0vmax at 50% 50%)' },
          { clipPath: 'circle(80vmax at 50% 50%)', duration: 1.2, ease: 'power1.in' },
          14.4,
        )
        .to('.senses-ring', { scale: 1, duration: 1.2, ease: 'power1.in' }, 14.4)
        .to('.senses-ring', { opacity: 0, duration: 0.3 }, 15.3)
        .fromTo('.senses-zoom', { scale: 1.15 }, { scale: 1, duration: 2 }, 14.4)
        .set('.nc-scene', { visibility: 'hidden' }, 15.6)
        .to('.senses-line', { ...reveal, duration: 0.5 }, 15.4)
        .set({}, {}, LENGTH)

      // The near fog layer is not rendered on mobile.
      const nearFog = root.querySelector('.sk-fog-near')
      if (nearFog) tl.fromTo(nearFog, { yPercent: 25 }, { yPercent: -15, duration: 3.4 }, 6.1)

      return () => camera.reset()
    },
    { scope: ref, dependencies: [reducedMotion, isMobile], revertOnUpdate: true },
  )

  if (reducedMotion) {
    return (
      <div id="journey">
        <HeroSection className="relative h-svh" />
        <VelenScene className="relative h-svh" data-waypoint="velen" />
        <FogTransition className="relative h-svh" />
        <SkelligeParallax className="relative h-svh" data-waypoint="skellige" />
        <MapTravel className="relative min-h-svh" />
        <PortScene className="relative h-svh" />
        <NovigradScene className="relative h-svh" data-waypoint="novigrad" />
        <WitcherSenses className="relative h-svh" data-waypoint="senses" />
      </div>
    )
  }

  const scene = 'absolute inset-0'

  return (
    <div ref={ref} id="journey" className="relative" style={{ height: `${(LENGTH + 1) * 100}svh` }}>
      {Object.entries(BREATHS).map(([id, at]) => (
        <Waypoint key={id} id={id} at={at} />
      ))}
      <Waypoint id="senses" at={SENSES_AT} />
      <div className="journey-stage sticky top-0 h-svh overflow-hidden bg-dark">
        <HeroSection className={scene} data-play={PLAY.hero} />
        <VelenScene className={scene} data-play={PLAY.velen} />

        {/* Fog that hides the cut from the hero to Velen. */}
        <FogCanvas seed={5} density={0.75} falloff={0.35} drift={40} className={`intro-fog ${sweepClass}`} />

        <FogTransition className={scene} data-play={PLAY.fog} />
        {/* Under Skellige – revealed as the Skellige video shrinks into its pin. */}
        <MapTravel className={scene} />
        <SkelligeParallax className={scene} data-play={PLAY.skellige} />

        {/* Fog sweep above Velen, the fog scene and Skellige. */}
        <FogCanvas seed={3} density={0.75} falloff={0.35} drift={40} className={`fog-sweep ${sweepClass}`} />

        <PortScene className={scene} data-play={PLAY.port} />
        <NovigradScene className={scene} data-play={PLAY.novigrad} />
        <WitcherSenses className={scene} data-play={PLAY.senses} />
      </div>
    </div>
  )
}
