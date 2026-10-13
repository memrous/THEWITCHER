import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenis = null

// Smooth scroll driven by the GSAP ticker so ScrollTrigger stays in sync.
// Returns a cleanup function. Call it only once (from App), never with reduced motion.
export function initLenis() {
  if (lenis) return () => {}

  const instance = new Lenis({ autoRaf: false })
  lenis = instance

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
