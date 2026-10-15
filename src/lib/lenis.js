import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenis = null
let locked = false

// Smooth scroll driven by the GSAP ticker so ScrollTrigger stays in sync.
// Returns a cleanup function. Call it only once (from App), never with reduced motion.
export function initLenis() {
  if (lenis) return () => {}

  const instance = new Lenis({ autoRaf: false })
  lenis = instance
  // The gate may have locked the scroll before Lenis existed.
  if (locked) instance.stop()

  instance.on('scroll', ScrollTrigger.update)
  const raf = (time) => instance.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(raf)
    gsap.ticker.lagSmoothing(500, 33)
    instance.destroy()
    lenis = null
  }
}

export const getLenis = () => lenis

// Locks or unlocks scrolling (the gate keeps the page still until it opens). Through Lenis when
// it runs, otherwise (reduced motion) by hiding the page overflow. Remembered for a Lenis
// created later.
export function lockScroll(lock) {
  locked = lock
  if (lenis) {
    if (lock) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}
