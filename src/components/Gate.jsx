import { useEffect, useRef, useState } from 'react'
import { enableAudio, loadAudio, sfx } from '../audio/engine'
import logoSource from '../assets/logo/thewitcher-logo.svg?raw'
import useIsMobile from '../hooks/useIsMobile'
import useReducedMotion from '../hooks/useReducedMotion'
import { getSoundChoice, markGateOpen, saveSoundChoice } from '../lib/gate'
import { gsap, useGSAP } from '../lib/gsap'
import { lockScroll } from '../lib/lenis'
import { trackLoading } from '../lib/preload'

const BASE = import.meta.env.BASE_URL
const LAYERS = {
  frame: `${BASE}gate/gate-frame.webp`,
  left: `${BASE}gate/gate-leaf-left.webp`,
  right: `${BASE}gate/gate-leaf-right.webp`,
}

// The logo without its ids – the hero already has them (HeroTitle).
const LOGO = logoSource.replace(/\sid="[^"]*"/g, '')

// The doorway inside the square gate box (all layers are cut from one 1254 px render).
const DOORWAY = { left: '16.587%', top: '11.404%', width: '66.986%', height: '81.021%' }

// Dust in the light: a few dozen warm specks drifting out of the doorway towards the viewer.
function createDust(canvas, count) {
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = (canvas.width = canvas.offsetWidth * dpr)
  const h = (canvas.height = canvas.offsetHeight * dpr)
  const r = gsap.utils.random
  const specks = Array.from({ length: count }, () => ({
    x: r(0.2, 0.8) * w,
    y: r(0.15, 0.95) * h,
    vx: r(-0.25, 0.25) * dpr,
    vy: r(-0.45, -0.05) * dpr,
    size: r(0.6, 2.2) * dpr,
    alpha: r(0.25, 0.9),
    phase: r(0, Math.PI * 2),
  }))
  const state = { strength: 0 }

  const draw = (time) => {
    ctx.clearRect(0, 0, w, h)
    if (state.strength <= 0) return
    ctx.globalCompositeOperation = 'lighter'
    for (const s of specks) {
      // Drift outwards from the centre line, sway, and grow as they come closer.
      s.x += s.vx + (s.x - w / 2) * 0.0016
      s.y += s.vy + Math.sin(time * 1.3 + s.phase) * 0.15 * dpr
      s.size *= 1.0025
      if (s.y < -10 || s.x < -10 || s.x > w + 10) {
        s.x = r(0.3, 0.7) * w
        s.y = r(0.6, 1) * h
        s.size = r(0.6, 2.2) * dpr
      }
      const flicker = 0.75 + 0.25 * Math.sin(time * 4 + s.phase)
      ctx.globalAlpha = s.alpha * flicker * state.strength
      ctx.fillStyle = '#ffe2a8'
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return {
    state,
    start: () => gsap.ticker.add(draw),
    stop: () => gsap.ticker.remove(draw),
  }
}

// Entry gate: preloader and the choice of sound in one. The doors of a stone gateway glow along
// their seam as the first screen loads (the hero video); after the click they swing open into
// warm light, the whole scene moves through them and fades into the hero – only then does the
// hero intro start (see src/lib/gate.js). The page cannot scroll meanwhile.
// Layers back to front: light, dust (canvas), the two leaves (3D, rotateY), the stone frame
// with a hole for the doorway, the glowing seam. Wrappers: .gate-scene (scale), .gate-shake (x),
// each leaf (rotationY) with its .gate-leaf-shade (opacity). With reduced motion it only fades.
export default function Gate({ onReady, onDone }) {
  const ref = useRef(null)
  const seamRef = useRef(null)
  const percentRef = useRef(null)
  const dustRef = useRef(null)
  const soundRef = useRef(null)
  const silenceRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const [ready, setReady] = useState(false)
  // The choice made last time is the highlighted one (with sound on a first visit).
  const [preferSound] = useState(() => getSoundChoice() ?? true)

  // The still frame of the gate in index.html (painted before any script ran) gives way once
  // these layers are decoded and on screen.
  useEffect(() => {
    const layers = [...ref.current.querySelectorAll('img')]
    Promise.all(layers.map((img) => img.decode?.().catch(() => {}))).then(() =>
      requestAnimationFrame(() => document.getElementById('gate-shell')?.remove()),
    )
  }, [])

  // Always enter at the top, with the page held still.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    lockScroll(true)
    return () => lockScroll(false)
  }, [])

  useEffect(() => {
    if (ready) onReady?.()
  }, [ready, onReady])

  // Once the gate can open, the highlighted choice takes the keyboard focus (Enter opens it).
  useEffect(() => {
    if (ready) (preferSound ? soundRef : silenceRef).current?.focus({ preventScroll: true })
  }, [ready, preferSound])

  // Loading: the seam glows stronger with the progress, the percentage follows smoothly.
  useGSAP(
    () => {
      // The sound library loads alongside; the gate opens only once both are here.
      const audioReady = loadAudio().catch(() => {})
      const shown = { p: 0 }
      const render = () => {
        const p = shown.p
        gsap.set(seamRef.current, { opacity: 0.2 + 0.8 * p, scaleY: 0.25 + 0.75 * p })
        if (percentRef.current) percentRef.current.textContent = `${Math.round(p * 100)} %`
      }
      render()
      return trackLoading(
        { images: Object.values(LAYERS), video: document.querySelector('.hero video') },
        (p) => {
          gsap.to(shown, {
            p,
            duration: reducedMotion ? 0 : 0.6,
            ease: 'power1.out',
            overwrite: true,
            onUpdate: render,
            onComplete: () => p >= 1 && audioReady.then(() => setReady(true)),
          })
        },
      )
    },
    { scope: ref, dependencies: [reducedMotion] },
  )

  // Once loaded, the buttons light up and open the gate.
  useGSAP(
    (context, contextSafe) => {
      if (!ready) return
      gsap.fromTo('.gate-buttons', { opacity: 0.35 }, { opacity: 1, duration: reducedMotion ? 0 : 0.8 })

      let entered = false
      let dust = null

      const enter = contextSafe((withSound) => {
        if (entered) return
        entered = true
        saveSoundChoice(withSound)
        // Still inside the click – the only moment the browser lets sound start.
        if (withSound) enableAudio()
        sfx('gate-thud')

        const finish = () => {
          lockScroll(false)
          onDone?.()
        }

        if (reducedMotion) {
          markGateOpen()
          gsap.to(ref.current, { opacity: 0, duration: 0.4, ease: 'power1.out', onComplete: finish })
          return
        }

        dust = createDust(dustRef.current, isMobile ? 18 : 40)
        dust.start()

        // The knock of the click (played above), then the creak of the leaves.
        gsap
          .timeline({ onComplete: () => dust.stop() })
          .addLabel('thud', 0)
          .to('.gate-ui', { opacity: 0, duration: 0.4, ease: 'power1.out' }, 0)
          .to(seamRef.current, { opacity: 0, duration: 0.25 }, 0)
          .to('.gate-shake', { keyframes: { x: [0, -3, 2.5, -1.5, 0.5, 0] }, duration: 0.3, ease: 'none' }, 0)
          .addLabel('creak', 0.15)
          .call(() => sfx('gate-creak'), null, 'creak')
          .to('.gate-leaf-l', { rotationY: -84, duration: 1.8, ease: 'power3.inOut' }, 'creak')
          .to('.gate-leaf-r', { rotationY: 84, duration: 1.8, ease: 'power3.inOut' }, 'creak')
          .to('.gate-leaf-shade', { opacity: 0.55, duration: 1.8, ease: 'power3.inOut' }, 'creak')
          .to(dust.state, { strength: 1, duration: 1, ease: 'power1.in' }, 0.4)
          .to('.gate-scene', { scale: 1.35, duration: 2.1, ease: 'power2.in' }, 0.7)
          .to('.gate-flood', { opacity: 1, duration: 0.9, ease: 'power2.in' }, 1.5)
          // The light fills the screen: the hero intro starts under it while the gate fades away.
          .call(markGateOpen, null, 2.35)
          .to(ref.current, { opacity: 0, duration: 0.9, ease: 'power1.out', onComplete: finish }, 2.4)
      })

      const withSound = () => enter(true)
      const inSilence = () => enter(false)
      const sound = soundRef.current
      const silence = silenceRef.current
      sound.addEventListener('click', withSound)
      silence.addEventListener('click', inSilence)
      return () => {
        sound.removeEventListener('click', withSound)
        silence.removeEventListener('click', inSilence)
        dust?.stop()
      }
    },
    { scope: ref, dependencies: [ready, reducedMotion, isMobile] },
  )

  const leaf = 'absolute inset-y-0 w-1/2 [transform-style:preserve-3d] will-change-transform'
  const edge = 'absolute top-[1.5%] bottom-0 w-[22px] bg-[linear-gradient(90deg,#120a05,#2b1a0e_40%,#1a0f07)]'
  const button =
    'cursor-pointer border px-6 py-3.5 font-heading text-xs tracking-[0.28em] text-[#ecdcb8] uppercase transition-[background-color,border-color,box-shadow] duration-300 hover:border-[#f0d08a] hover:bg-[#1a120a] focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#ecdcb8] disabled:cursor-default motion-reduce:transition-none sm:px-7 sm:text-sm'
  const primary = 'border-[#e6c47e] bg-[#0a0705]/80 shadow-[inset_0_0_24px_rgba(201,169,106,0.25)]'
  const secondary = 'border-[#c9a96a]/60 bg-[#0a0705]/80'

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[80] overflow-hidden bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Enter the Continent"
    >
      <div className="gate-scene absolute inset-0 flex items-center justify-center will-change-transform">
        <div className="gate-shake relative h-svh shrink-0" style={{ aspectRatio: '1 / 1' }}>
          <div className="absolute" style={DOORWAY}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_50%_60%,#fff1c9_0%,#f2c674_22%,#a8652a_50%,#2a1408_85%)]" />
            <canvas ref={dustRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

            <div className="absolute inset-0 [perspective-origin:50%_55%] [perspective:1400px]">
              <div className={`gate-leaf-l left-0 origin-left ${leaf}`}>
                <img src={LAYERS.left} alt="" className="absolute inset-0 h-full w-full" draggable="false" />
                <div className="gate-leaf-shade absolute inset-0 bg-black opacity-0" />
                <div className={`${edge} right-0 origin-right [transform:rotateY(90deg)]`} />
              </div>
              <div className={`gate-leaf-r right-0 origin-right ${leaf}`}>
                <img src={LAYERS.right} alt="" className="absolute inset-0 h-full w-full" draggable="false" />
                <div className="gate-leaf-shade absolute inset-0 bg-black opacity-0" />
                <div className={`${edge} left-0 origin-left [transform:rotateY(-90deg)]`} />
              </div>
            </div>
          </div>

          <img src={LAYERS.frame} alt="" className="absolute inset-0 h-full w-full" draggable="false" />

          {/* The glowing seam between the leaves – its strength is the loading progress. */}
          <div className="absolute" style={DOORWAY}>
            <div
              ref={seamRef}
              className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-[linear-gradient(transparent,#ffcf7a_12%,#ffd88f_85%,#ffb85a)] opacity-20 shadow-[0_0_10px_2px_rgba(255,184,90,0.6),0_0_40px_6px_rgba(255,154,58,0.27)]"
            />
          </div>

          {/* The sides of the box fade into the black of the screen. */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000,transparent_18%,transparent_82%,#000)]" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_45%,rgba(0,0,0,0.85)_100%)]" />
      <div className="gate-flood pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_58%,#fff6dc,#f5d08a_45%,#c98a45)] opacity-0" />

      <div className="gate-ui absolute inset-0">
        <div
          className="absolute inset-x-0 top-[6%] mx-auto w-[min(62vw,34vh,420px)] text-[#d7d9db] drop-shadow-[0_6px_14px_rgba(0,0,0,1)] [&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: LOGO }}
        />

        <div className="absolute inset-x-0 bottom-[7%] flex flex-col items-center gap-4 px-6 text-center">
          <div className="gate-buttons flex flex-col gap-3 opacity-35 sm:flex-row sm:gap-4">
            <button
              type="button"
              disabled={!ready}
              ref={soundRef}
              className={`${button} ${preferSound ? primary : secondary}`}
            >
              Enter with sound
            </button>
            <button
              type="button"
              disabled={!ready}
              ref={silenceRef}
              className={`${button} ${preferSound ? secondary : primary}`}
            >
              Enter in silence
            </button>
          </div>
          <p className="font-heading text-[11px] tracking-[0.25em] text-[#8a8170] uppercase">
            {ready ? (
              'Headphones recommended'
            ) : (
              <>
                The Continent awaits · <span ref={percentRef}>0 %</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
