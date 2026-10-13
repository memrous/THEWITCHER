import { useRef } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { prepareStrokeDraw } from '../lib/stroke'
import { syncSceneVideos, warmUpVideo } from '../lib/video'
import { chapterHeight, CHOICES, CONTRACTS, LENGTH, MONSTERS, PATH, SCAR, SCENES } from '../lib/witcherChapterLayout'
import ChoicesScene from './scenes/ChoicesScene'
import ContractsScene from './scenes/ContractsScene'
import MonstersScene from './scenes/MonstersScene'
import PathScene from './scenes/PathScene'
import ScarScene from './scenes/ScarScene'

// Scene lengths and starts live in src/lib/witcherChapterLayout.js; these are their phase times.
const phases = (start, length) => ({ emerge: start + 0.1 * length, vanish: start + 0.75 * length })
const PATH_AT = phases(PATH, SCENES.path)
const MONSTERS_AT = phases(MONSTERS, SCENES.monsters)
const CONTRACTS_AT = phases(CONTRACTS, SCENES.contracts)
const CHOICES_AT = phases(CHOICES, SCENES.choices)
const SCAR_AT = phases(SCAR, SCENES.scar)

// Autoplay windows (timeline units). Outside the chapter its progress stays at 0 or 1, so the
// windows start and end just inside it – nothing plays while chapter I or the outro is on screen.
// Choices and Scar play two clips each, so their windows touch nothing else.
const PLAY = {
  path: `0.01,${MONSTERS + 0.1}`,
  monsters: `${MONSTERS - 0.1},${CONTRACTS}`,
  choices: `${CHOICES},${SCAR - 0.05}`,
  scar: `${SCAR + 0.05},${LENGTH - 0.01}`,
}

// Choices: share of the frame for the light shot, at first and at the end.
const LIGHT_FROM = 65
const LIGHT_TO = 35

// Letters of a word start spread apart (about as if letter-spacing were 0.3em) and close in to the
// rest spacing (0.02em) – transforms only, in percent of each letter's width so nothing is measured.
const spread = (i, el, all) => (i - (all.length - 1) / 2) * 38

// Emerge from the dark: the clear centre of the veil grows over the shot while the shot fades
// in and settles; the text lights up word by word (opacity over the dark does the colour shift).
// The text follows right after the shot unless `textAt` says otherwise.
function addEmerge(tl, root, scene, at, textAt = at + 0.1) {
  if (root.querySelector(`${scene} .shot-inner`)) {
    tl.fromTo(
      `${scene} .shot-inner`,
      { opacity: 0, scale: 1.06 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
      at,
    )
      .fromTo(`${scene} .shot-veil`, { opacity: 1, scale: 1 }, { scale: 3, duration: 0.5, ease: 'power2.out' }, at)
      .set(`${scene} .shot-veil`, { opacity: 0 }, at + 0.5)
  }

  root.querySelectorAll(`${scene} .ch-word`).forEach((word, i) => {
    const t = textAt + i * 0.08
    tl.fromTo(word, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t).fromTo(
      word.querySelectorAll('.ch-letter'),
      { xPercent: spread },
      { xPercent: 0, duration: 0.35, ease: 'power2.out' },
      t,
    )
  })
}

// Vanish into the dark: the shot fades and shrinks a little, the text drifts up.
function addVanish(tl, scene, at) {
  tl.to(`${scene} .shot`, { opacity: 0, scale: 0.96, duration: 0.5, ease: 'power1.in' }, at).to(
    `${scene} .ch-text`,
    { opacity: 0, y: -20, duration: 0.5, ease: 'power1.in' },
    at,
  )
}

// Chapter II – The Witcher: one sentence per scene, all on the dark, on its own sticky stage
// driven by a single scrubbed timeline (same principle as Journey). The videos play on their own
// while their scene is on screen. With reduced motion the scenes are stacked as static sections.
export default function WitcherChapter() {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  useGSAP(
    () => {
      if (reducedMotion) return

      const root = ref.current
      // Living paper: the contract sways slowly (time-based, not scrubbed) while its scene is on.
      const sway = gsap.fromTo(
        '.contract-sway',
        { rotation: -0.6, y: -4 },
        { rotation: 0.6, y: 4, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true },
      )
      const sync = (self) => {
        const t = self.progress * LENGTH
        // Before the chapter its progress just sits at 0 – no warm-up from there (see below).
        syncSceneVideos(root, t, { warm: Boolean(self.isActive) })
        sway.paused(t < CONTRACTS || t > CHOICES)
      }
      // The first clip starts loading while chapter I is still ending.
      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom+=100%',
        once: true,
        onEnter: () => warmUpVideo(root.querySelector('.path-scene video')),
      })

      // Only the current scene is visible – each one has an opaque dark background.
      gsap.set(['.monsters-scene', '.contracts-scene', '.choices-scene', '.scar-scene'], { visibility: 'hidden' })
      // Shows a scene at its start and hides it again at its end.
      const showScene = (scene, from, to) =>
        tl.set(scene, { visibility: 'visible' }, from).set(scene, { visibility: 'hidden' }, to)

      prepareStrokeDraw(root.querySelector('.path-road'))

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: sync,
          onRefresh: sync,
        },
      })

      // 7) A witcher walks the Path. – a route is drawn under the sentence.
      addEmerge(tl, root, '.path-scene', PATH_AT.emerge)
      tl.to('.path-road', { strokeDashoffset: 0, duration: 0.9, ease: 'power1.inOut' }, PATH_AT.emerge + 0.25)
      addVanish(tl, '.path-scene', PATH_AT.vanish)
      tl.set('.path-scene', { visibility: 'hidden' }, MONSTERS)

      // 8) Kills Monsters. – the words light up with the shot and give a short jolt once they land.
      showScene('.monsters-scene', MONSTERS, CONTRACTS)
      addEmerge(tl, root, '.monsters-scene', MONSTERS_AT.emerge)
      tl.to('.monsters-text-shake', { keyframes: { x: [0, -9, 8, -6, 4, -2, 0] }, duration: 0.2 }, MONSTERS_AT.emerge + 0.55)
      addVanish(tl, '.monsters-scene', MONSTERS_AT.vanish)

      // 9) Contracts. – the sheet unrolls from the top, its lines appear one by one, Geralt's
      //    signature is written on and the wax seal lands with a jolt. While it is held the paper
      //    gently sways and drifts against the text.
      const linesAt = CONTRACTS_AT.emerge + 0.35
      const signAt = linesAt + 0.85
      const sealAt = signAt + 0.35
      // Set up front: a staggered fromTo would only apply its start state to the first line.
      gsap.set('.contract-line', { opacity: 0, y: 6 })
      showScene('.contracts-scene', CONTRACTS, CHOICES)
      addEmerge(tl, root, '.contracts-scene', CONTRACTS_AT.emerge)
      tl.fromTo(
        '.contract-root',
        { clipPath: 'inset(0% 0% 100% 0%)', y: 40 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.5, ease: 'power2.out' },
        CONTRACTS_AT.emerge,
      )
        .to('.contract-line', { opacity: 1, y: 0, duration: 0.2, stagger: 0.07, ease: 'power2.out' }, linesAt)
        .fromTo(
          '.contract-sign',
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.25, ease: 'power1.inOut' },
          signAt,
        )
        .fromTo('.contract-seal', { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(2)' }, sealAt)
        .to('.contract-jolt', { keyframes: { x: [0, -7, 6, -4, 2, 0], y: [0, 4, -3, 2, -1, 0] }, duration: 0.15 }, sealAt + 0.13)
        .fromTo('.contract-parallax', { y: 50 }, { y: -50, duration: SCENES.contracts }, CONTRACTS)
      addVanish(tl, '.contracts-scene', CONTRACTS_AT.vanish)

      // 10) Choices. – light holds most of the frame at first; through the hold the border slides
      //     over and darkness wins.
      const shift = { from: CHOICES_AT.emerge + 0.5, duration: CHOICES_AT.vanish - CHOICES_AT.emerge - 0.5 }
      showScene('.choices-scene', CHOICES, SCAR)
      addEmerge(tl, root, '.choices-scene', CHOICES_AT.emerge)
      tl.fromTo('.choices-sub', { opacity: 0 }, { opacity: 1, duration: 0.4 }, CHOICES_AT.emerge + 0.4)
        .fromTo(
          '.choice-light',
          { clipPath: `inset(0% ${100 - LIGHT_FROM}% 0% 0%)` },
          { clipPath: `inset(0% ${100 - LIGHT_TO}% 0% 0%)`, duration: shift.duration, ease: 'power1.inOut' },
          shift.from,
        )
        .fromTo(
          '.choice-dark',
          { clipPath: `inset(0% 0% 0% ${LIGHT_FROM}%)` },
          { clipPath: `inset(0% 0% 0% ${LIGHT_TO}%)`, duration: shift.duration, ease: 'power1.inOut' },
          shift.from,
        )
        .fromTo(
          '.choice-seam',
          { xPercent: LIGHT_FROM },
          { xPercent: LIGHT_TO, duration: shift.duration, ease: 'power1.inOut' },
          shift.from,
        )
      addVanish(tl, '.choices-scene', CHOICES_AT.vanish)

      // 11) Every road leaves a scar. – instead of fading, the band is cut: a bright diagonal
      //     flashes across it and both halves slide apart into the dark the outro rises from.
      const cutAt = SCAR + 0.68 * SCENES.scar
      showScene('.scar-scene', SCAR, LENGTH)
      addEmerge(tl, root, '.scar-scene', SCAR_AT.emerge)
      tl.fromTo(
        '.scar-cut',
        { clipPath: 'inset(0% 100% 0% 0%)', opacity: 1 },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.12, ease: 'power3.in' },
        cutAt,
      )
        .to('.scar-cut', { opacity: 0, duration: 0.3 }, cutAt + 0.2)
        .to('.scar-upper', { yPercent: -30, opacity: 0, duration: 0.6, ease: 'power2.in' }, cutAt + 0.2)
        .to('.scar-lower', { yPercent: 30, opacity: 0, duration: 0.6, ease: 'power2.in' }, cutAt + 0.2)
        .to('.scar-scene .ch-text', { opacity: 0, y: -20, duration: 0.5, ease: 'power1.in' }, cutAt + 0.35)

      tl.set({}, {}, LENGTH)

    },
    { scope: ref, dependencies: [reducedMotion, isMobile], revertOnUpdate: true },
  )

  if (reducedMotion) {
    return (
      <div className="bg-dark">
        <PathScene className="relative h-svh" />
        <MonstersScene className="relative h-svh" />
        <ContractsScene className="relative h-svh" />
        <ChoicesScene className="relative h-svh" />
        <ScarScene className="relative h-svh" />
      </div>
    )
  }

  const scene = 'absolute inset-0'

  return (
    <div ref={ref} className="relative bg-dark" style={{ height: chapterHeight(false) }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <PathScene className={scene} data-play={PLAY.path} />
        <MonstersScene className={scene} data-play={PLAY.monsters} />
        <ContractsScene className={scene} />
        <ChoicesScene className={scene} play={PLAY.choices} />
        <ScarScene className={scene} play={PLAY.scar} />
      </div>
    </div>
  )
}
