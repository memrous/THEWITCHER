import { useEffect, useMemo, useRef, useState } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import useMediaQuery from '../hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { getLenis } from '../lib/lenis'
import { createRandom } from '../lib/random'
import { CHOICES, CONTRACTS, LENGTH, MONSTERS, SCAR } from '../lib/witcherChapterLayout'

// The traces drift a little slower than the page – they lie deeper in the dark.
const DEPTH = 0.7
// Embers keep away from the cursor within this radius (px).
const REPEL = 120
// Radius of the witcher-senses circle (px).
const SENSES = 130
// Faint red haze of the senses inside the circle.
const HAZE = 'radial-gradient(circle 160px at var(--x) var(--y), rgba(255,70,30,0.10), transparent)'

// Look of the embers in each scene of chapter II (from its start, in timeline units).
// rise: px per frame upwards (negative falls), glow: halo strength, flicker: how much they shimmer.
const PALETTES = [
  { from: 0, color: [205, 212, 222], rise: 0.25, size: 1.0, glow: 0.4, flicker: 0.2 }, // Path – silver dust
  { from: MONSTERS, color: [255, 64, 36], rise: 0.7, size: 1.25, glow: 1, flicker: 0.6 }, // Monsters – red sparks
  { from: CONTRACTS, color: [255, 196, 110], rise: 0.35, size: 1.15, glow: 0.8, flicker: 0.4 }, // Contracts – warm gold
  { from: CHOICES, color: [255, 128, 46], rise: 0.95, size: 1.45, glow: 1, flicker: 0.8 }, // Choices – fire
  { from: SCAR, color: [150, 160, 176], rise: -0.18, size: 1.35, glow: 0.15, flicker: 0.1 }, // Scar – cold ash
]
const KEYS = ['rise', 'size', 'glow', 'flicker']

// Palette at chapter position t: each one blends into the next around the scene border.
function paletteAt(t) {
  let out = { ...PALETTES[0], color: [...PALETTES[0].color] }
  for (let i = 1; i < PALETTES.length; i++) {
    const k = gsap.utils.clamp(0, 1, (t - (PALETTES[i].from - 0.6)) / 0.9)
    if (k <= 0) break
    const next = PALETTES[i]
    out = {
      color: out.color.map((c, j) => c + (next.color[j] - c) * k),
      ...Object.fromEntries(KEYS.map((key) => [key, out[key] + (next[key] - out[key]) * k])),
    }
  }
  return out
}

// What the traces show along each scene: boots and hooves on the Path, claws and blood by the
// monster, boots and blood to the notice board, hooves of the Hunt through the fire, blood at the end.
const MOTIFS = [
  { from: -1, kinds: ['boot', 'boot', 'hoof'] },
  { from: MONSTERS, kinds: ['claw', 'blood', 'boot'] },
  { from: CONTRACTS, kinds: ['boot', 'boot', 'blood'] },
  { from: CHOICES, kinds: ['hoof', 'hoof', 'blood'] },
  { from: SCAR, kinds: ['blood', 'boot', 'blood'] },
]

// A trail winding down through the whole chapter (layer px), with a print every ~110 px.
function makeTrail({ width, height, vh }) {
  const rnd = createRandom(11)
  const xAt = (y) => width * (0.5 + 0.3 * Math.sin(y / (vh * 0.9)) + 0.07 * Math.sin(y / 170))
  const items = []
  let side = 1
  for (let y = vh * 0.4, i = 0; y < height - vh * 0.2; y += 95 + rnd() * 40, i++) {
    // Chapter position of this point (it is centred on screen then).
    const t = (y - vh * 0.55) / DEPTH / vh
    const motif = [...MOTIFS].reverse().find((m) => t >= m.from) ?? MOTIFS[0]
    const kind = motif.kinds[i % motif.kinds.length]
    const ahead = xAt(y + 20) - xAt(y - 20)
    const angle = (Math.atan2(40, ahead) * 180) / Math.PI - 90
    side = -side
    items.push({ kind, x: xAt(y) + side * (kind === 'boot' ? 14 : 22), y, angle: angle + rnd() * 16 - 8, scale: 0.85 + rnd() * 0.35, seed: rnd() })
  }
  return { items, xAt }
}

function Print({ kind, x, y, angle, scale, seed }) {
  const transform = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${scale.toFixed(2)})`
  if (kind === 'boot') {
    return (
      <g transform={transform}>
        <ellipse cy="-7" rx="7" ry="12" />
        <ellipse cy="12" rx="5.5" ry="6" />
      </g>
    )
  }
  if (kind === 'hoof') {
    return (
      <g transform={transform} fill="none" strokeWidth="4" strokeLinecap="round">
        <path d="M -9 8 C -11 -6 -5 -12 0 -12 C 5 -12 11 -6 9 8" />
      </g>
    )
  }
  if (kind === 'claw') {
    return (
      <g transform={transform} fill="none" strokeWidth="2.6" strokeLinecap="round">
        <path d="M -16 -22 Q -10 0 -14 22" />
        <path d="M -2 -26 Q 4 0 0 26" />
        <path d="M 12 -22 Q 18 0 14 22" />
      </g>
    )
  }
  // Blood: one drop with a few smaller ones around it.
  return (
    <g transform={transform}>
      <circle r={4 + seed * 3} />
      <circle cx={9 + seed * 6} cy={-5} r={1.6} />
      <circle cx={-8} cy={6 + seed * 5} r={1.2} />
      <circle cx={3} cy={11} r={0.9} />
    </g>
  )
}

// Embers drifting through the dark: rising, swaying, swept aside by fast scrolling (and drawn
// out into streaks), shying away from the cursor; their colour follows the scene.
function createEmbers(canvas, count) {
  const ctx = canvas.getContext('2d')
  const rnd = createRandom(7)
  let w = 0
  let h = 0
  let dpr = 1
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    w = canvas.offsetWidth
    h = canvas.offsetHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
  }
  resize()
  const embers = Array.from({ length: count }, () => ({
    x: rnd() * w,
    y: rnd() * h,
    vx: 0,
    vy: 0,
    speed: 0.5 + rnd(),
    size: 0.6 + rnd() * 1.4,
    phase: rnd() * Math.PI * 2,
    alpha: 0.35 + rnd() * 0.65,
  }))

  const draw = ({ time, palette, wind, pointer }) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'lighter'
    const [r, g, b] = palette.color.map(Math.round)

    for (const e of embers) {
      // Target drift: rise and sway; the scroll wind pushes them along and out to the sides.
      const tx = Math.sin(time * 0.6 + e.phase) * 0.35 + ((e.x - w / 2) / w) * Math.abs(wind) * 0.25
      const ty = -palette.rise * e.speed - wind * 0.55
      e.vx += (tx - e.vx) * 0.08
      e.vy += (ty - e.vy) * 0.08
      if (pointer) {
        const dx = e.x - pointer.x
        const dy = e.y - pointer.y
        const d = Math.hypot(dx, dy)
        if (d < REPEL && d > 0.1) {
          const push = (1 - d / REPEL) * 2.4
          e.vx += (dx / d) * push
          e.vy += (dy / d) * push
        }
      }
      e.x += e.vx
      e.y += e.vy
      if (e.y < -20) (e.y = h + 20), (e.x = rnd() * w)
      else if (e.y > h + 20) (e.y = -20), (e.x = rnd() * w)
      if (e.x < -20) e.x = w + 20
      else if (e.x > w + 20) e.x = -20

      const shimmer = 1 - palette.flicker * 0.5 * (1 + Math.sin(time * 5 + e.phase * 3))
      const a = e.alpha * shimmer
      const size = e.size * palette.size
      const speed = Math.hypot(e.vx, e.vy)

      if (speed > 2.5) {
        // Fast: drawn out into a streak along its motion.
        const k = Math.min(speed * 3, 40) / speed
        ctx.strokeStyle = `rgba(${r},${g},${b},${a})`
        ctx.lineWidth = size
        ctx.beginPath()
        ctx.moveTo(e.x, e.y)
        ctx.lineTo(e.x - e.vx * k, e.y - e.vy * k)
        ctx.stroke()
      } else {
        if (palette.glow > 0.05) {
          ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.12 * palette.glow})`
          ctx.beginPath()
          ctx.arc(e.x, e.y, size * 4, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`
        ctx.beginPath()
        ctx.arc(e.x, e.y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  return { draw, resize, clear: () => ctx.clearRect(0, 0, canvas.width, canvas.height) }
}

// Chapter II measured on the page (px): top, height, and the screen it was measured with.
function measureChapter() {
  const el = document.querySelector('#chapter-two')
  if (!el) return null
  return {
    top: el.getBoundingClientRect().top + window.scrollY,
    height: el.offsetHeight,
    width: window.innerWidth,
    vh: window.innerHeight,
  }
}
const sameLayout = (a, b) => a && b && a.top === b.top && a.height === b.height && a.width === b.width && a.vh === b.vh

// Interactive darkness under chapter II (and the transitions into and out of it): one fixed layer
// behind the page – it shows wherever the page is see-through, which is only chapter II.
// 1) Embers in a canvas (120, 50 on mobile), coloured by the scene.
// 2) Witcher senses: hidden traces (boot and hoof prints, claw marks, blood) winding down
//    through the chapter light up red-orange inside a soft circle around the cursor
//    (`mask-image` at --x/--y, eased after the cursor). On touch screens the circle follows the
//    trail by itself as the page scrolls. Drawn only while the chapter is on screen.
// Not rendered with reduced motion (App).
export default function DarkWorld() {
  const ref = useRef(null)
  const canvasRef = useRef(null)
  const isMobile = useIsMobile()
  const finePointer = useMediaQuery('(pointer: fine)')
  const [layout, setLayout] = useState(null)

  // Re-measure whenever ScrollTrigger refreshes (load, resize, the chapter mounting).
  useEffect(() => {
    const update = () => setLayout((prev) => {
      const next = measureChapter()
      return sameLayout(prev, next) ? prev : next
    })
    update()
    ScrollTrigger.addEventListener('refresh', update)
    return () => ScrollTrigger.removeEventListener('refresh', update)
  }, [])

  const trail = useMemo(() => {
    if (!layout) return null
    const height = (layout.height - layout.vh) * DEPTH + layout.vh * 1.6
    return { height, ...makeTrail({ width: layout.width, height, vh: layout.vh }) }
  }, [layout])

  useGSAP(
    () => {
      if (!layout || !trail) return
      const root = ref.current
      const senses = root.querySelector('.dw-senses')
      const setTrailY = gsap.quickSetter(root.querySelector('.dw-trail'), 'y', 'px')
      const embers = createEmbers(canvasRef.current, isMobile ? 50 : 120)

      const vh = layout.vh
      let pointer = null
      // The circle eases after its target (the cursor, or the trail on touch screens).
      const circle = { x: layout.width / 2, y: vh * 0.55, shown: 0 }
      let target = null
      let wind = 0

      const onMove = (e) => {
        pointer = { x: e.clientX, y: e.clientY }
        target = pointer
      }
      const onLeave = (e) => {
        if (!e.relatedTarget) pointer = target = null
      }
      if (finePointer) {
        window.addEventListener('pointermove', onMove, { passive: true })
        document.addEventListener('pointerout', onLeave, { passive: true })
      }

      const tick = (time) => {
        const offset = window.scrollY - layout.top
        const t = gsap.utils.clamp(-1, LENGTH + 1, offset / vh)
        // The traces scroll a little slower than the page.
        const trailY = -offset * DEPTH
        setTrailY(trailY)

        if (!finePointer) {
          // On touch screens the circle walks the trail at the middle of the screen.
          const y = vh * 0.55
          target = { x: trail.xAt(y - trailY), y }
        }
        const k = target ? 0.12 : 0.05
        if (target) {
          circle.x += (target.x - circle.x) * k
          circle.y += (target.y - circle.y) * k
        }
        circle.shown += ((target ? 1 : 0) - circle.shown) * 0.08
        senses.style.setProperty('--x', `${circle.x.toFixed(1)}px`)
        senses.style.setProperty('--y', `${circle.y.toFixed(1)}px`)
        senses.style.opacity = circle.shown.toFixed(3)

        // Scroll speed (Lenis, px per frame) becomes wind, settling slowly.
        const velocity = gsap.utils.clamp(-60, 60, getLenis()?.velocity ?? 0)
        wind += (velocity - wind) * 0.15
        embers.draw({ time, palette: paletteAt(t), wind, pointer })
      }

      let running = false
      const run = (on) => {
        if (on === running) return
        running = on
        gsap.set(root, { visibility: on ? 'visible' : 'hidden' })
        if (on) gsap.ticker.add(tick)
        else {
          gsap.ticker.remove(tick)
          embers.clear()
        }
      }
      // From a screen before the chapter (Geralt sinking into the dark) to its end (the outro).
      const active = ScrollTrigger.create({
        trigger: '#chapter-two',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => run(self.isActive),
      })
      run(active.isActive)
      const onResize = () => embers.resize()
      window.addEventListener('resize', onResize)

      return () => {
        run(false)
        active.kill()
        window.removeEventListener('resize', onResize)
        window.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerout', onLeave)
      }
    },
    { scope: ref, dependencies: [layout, trail, isMobile, finePointer], revertOnUpdate: true },
  )

  const mask = `radial-gradient(circle ${SENSES}px at var(--x) var(--y), #000 0%, rgba(0,0,0,0.55) 45%, transparent 100%)`

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-dark" style={{ visibility: 'hidden' }} aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="dw-senses absolute inset-0 opacity-0" style={{ WebkitMaskImage: mask, maskImage: mask }}>
        <div className="absolute inset-0" style={{ background: HAZE }} />
        {trail && (
          <svg
            className="dw-trail absolute top-0 left-0 will-change-transform"
            width={layout.width}
            height={trail.height}
            fill="#ff5a2a"
            stroke="#ff5a2a"
          >
            {/* A soft wide copy under the sharp one stands in for a glow (no costly filter). */}
            <g opacity="0.25" strokeWidth="6">
              {trail.items.map((item, i) => (
                <Print key={`g${i}`} {...item} scale={item.scale * 1.25} />
              ))}
            </g>
            <g opacity="0.9">
              {trail.items.map((item, i) => (
                <Print key={i} {...item} />
              ))}
            </g>
          </svg>
        )}
      </div>
    </div>
  )
}
