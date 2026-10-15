import { useEffect, useRef } from 'react'
import useMediaQuery from '../hooks/useMediaQuery'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'

// Elements the cursor opens into a ring over.
const INTERACTIVE = 'a, button, [role="button"], label, input, select, textarea, [data-cursor="hover"]'

// Own cursor: a small silver dot with a soft echo trailing behind it; over anything clickable the
// echo opens into a ring. Only on devices with a mouse – there the system cursor is hidden (the
// `has-cursor` class, see index.css). Wrappers move (x, y), their children change look (scale,
// opacity). With reduced motion the echo does not trail – both follow the mouse exactly.
export default function Cursor() {
  const finePointer = useMediaQuery('(pointer: fine)')
  return finePointer ? <CursorLayer /> : null
}

function CursorLayer() {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    document.documentElement.classList.add('has-cursor')
    return () => document.documentElement.classList.remove('has-cursor')
  }, [])

  useGSAP(
    () => {
      const lag = reducedMotion ? 0 : 1
      const look = { duration: reducedMotion ? 0 : 0.3, ease: 'power2.out', overwrite: 'auto' }
      const dotX = gsap.quickTo('.cursor-dot-pos', 'x', { duration: 0.08 * lag, ease: 'power3.out' })
      const dotY = gsap.quickTo('.cursor-dot-pos', 'y', { duration: 0.08 * lag, ease: 'power3.out' })
      const echoX = gsap.quickTo('.cursor-echo-pos', 'x', { duration: 0.45 * lag, ease: 'power3.out' })
      const echoY = gsap.quickTo('.cursor-echo-pos', 'y', { duration: 0.45 * lag, ease: 'power3.out' })

      gsap.set('.cursor-layer', { opacity: 0 })
      gsap.set('.cursor-ring', { scale: 0.4, opacity: 0 })

      let shown = false
      let hovering = false

      const show = (visible) => {
        if (visible === shown) return
        shown = visible
        gsap.to('.cursor-layer', { ...look, opacity: visible ? 1 : 0 })
      }

      const onMove = (e) => {
        if (!shown) {
          // Appear right under the mouse, not flying in from the corner.
          gsap.set(['.cursor-dot-pos', '.cursor-echo-pos'], { x: e.clientX, y: e.clientY })
        }
        dotX(e.clientX)
        dotY(e.clientY)
        echoX(e.clientX)
        echoY(e.clientY)
        show(true)
      }

      const onOver = (e) => {
        const over = Boolean(e.target.closest?.(INTERACTIVE))
        if (over === hovering) return
        hovering = over
        gsap.to('.cursor-ring', { ...look, scale: over ? 1 : 0.4, opacity: over ? 1 : 0 })
        gsap.to('.cursor-glow', { ...look, opacity: over ? 0 : 1 })
        gsap.to('.cursor-dot', { ...look, scale: over ? 0.6 : 1 })
      }

      // Leaving the window (no element to go to) hides the cursor.
      const onOut = (e) => {
        if (!e.relatedTarget) show(false)
      }
      const onDown = () => gsap.to('.cursor-press', { ...look, duration: reducedMotion ? 0 : 0.15, scale: 0.7 })
      const onUp = () => gsap.to('.cursor-press', { ...look, scale: 1 })

      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerover', onOver, { passive: true })
      document.addEventListener('pointerout', onOut, { passive: true })
      window.addEventListener('pointerdown', onDown, { passive: true })
      window.addEventListener('pointerup', onUp, { passive: true })
      return () => {
        window.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerover', onOver)
        document.removeEventListener('pointerout', onOut)
        window.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointerup', onUp)
      }
    },
    { scope: ref, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <div ref={ref} className="cursor-layer pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      <div className="cursor-echo-pos absolute top-0 left-0">
        <div className="cursor-glow absolute -top-3 -left-3 size-6 rounded-full bg-[radial-gradient(circle_closest-side,rgba(220,228,236,0.35),transparent)]" />
        <div className="cursor-ring absolute -top-5 -left-5 size-10 rounded-full border border-[#dfe4ea]/70 bg-[#dfe4ea]/5" />
      </div>
      <div className="cursor-dot-pos absolute top-0 left-0">
        <div className="cursor-press">
          <div className="cursor-dot absolute -top-[3px] -left-[3px] size-1.5 rounded-full bg-[#e6eaef] shadow-[0_0_6px_rgba(230,234,239,0.8)]" />
        </div>
      </div>
    </div>
  )
}
