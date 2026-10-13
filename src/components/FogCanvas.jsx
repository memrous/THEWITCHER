import { useEffect, useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'
import { createRandom } from '../lib/random'

const TILE_W = 320
const TILE_H = 160
const OCTAVES = 5

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// Renders a horizontally tileable fBm value-noise texture once (low-res, upscaled by CSS
// for softness). The canvas holds two copies of the tile so it can drift seamlessly.
function renderFog(canvas, { seed, density, falloff, color }) {
  const rand = createRandom(seed)
  const layers = Array.from({ length: OCTAVES }, (_, o) => {
    const cx = 3 << o
    const cy = (2 << o) + 1
    return { cx, cy, grid: Float32Array.from({ length: cx * cy }, rand) }
  })

  const [r, g, b] = color.split(',').map(Number)
  const lo = 0.75 - density
  const hi = lo + 0.6

  canvas.width = TILE_W * 2
  canvas.height = TILE_H
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(TILE_W, TILE_H)

  for (let y = 0; y < TILE_H; y++) {
    const fy = y / (TILE_H - 1)
    const profile = 1 - falloff * (1 - smooth(0.05, 0.7, fy))

    for (let x = 0; x < TILE_W; x++) {
      let n = 0
      let amp = 1
      let total = 0

      for (const { cx, cy, grid } of layers) {
        const u = (x / TILE_W) * cx
        const v = fy * (cy - 1)
        const i0 = Math.floor(u)
        const j0 = Math.min(Math.floor(v), cy - 2)
        const i1 = (i0 + 1) % cx
        const su = smooth(0, 1, u - i0)
        const sv = smooth(0, 1, v - j0)
        const top = grid[j0 * cx + i0] * (1 - su) + grid[j0 * cx + i1] * su
        const bottom = grid[(j0 + 1) * cx + i0] * (1 - su) + grid[(j0 + 1) * cx + i1] * su
        n += (top * (1 - sv) + bottom * sv) * amp
        total += amp
        amp *= 0.5
      }

      const i = (y * TILE_W + x) * 4
      img.data[i] = r
      img.data[i + 1] = g
      img.data[i + 2] = b
      img.data[i + 3] = smooth(lo, hi, n / total) * profile * 255
    }
  }

  ctx.putImageData(img, 0, 0)
  ctx.putImageData(img, TILE_W, 0)
}

// Procedural fog layer. The outer element is free for scroll animations;
// the canvas itself only drifts sideways in an endless loop.
export default function FogCanvas({
  seed = 1,
  density = 0.5,
  falloff = 0.8,
  color = '214,220,226',
  drift = 60,
  className = '',
}) {
  const ref = useRef(null)
  const canvasRef = useRef(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    renderFog(canvasRef.current, { seed, density, falloff, color })
  }, [seed, density, falloff, color])

  useGSAP(
    () => {
      if (reducedMotion || !drift) return
      gsap.fromTo(
        canvasRef.current,
        { xPercent: 0 },
        { xPercent: -50, duration: drift, ease: 'none', repeat: -1 },
      )
    },
    { scope: ref, dependencies: [reducedMotion, drift], revertOnUpdate: true },
  )

  return (
    <div ref={ref} className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-[200%] max-w-none will-change-transform" />
    </div>
  )
}
