import { gsap } from './gsap'
import { MAP_H, MAP_W } from './mapSvg'

// The map layer is laid out at this zoom (relative to "cover"), so the middle of the
// journey is sharp; the closer zooms upscale it a little.
export const MAP_LAYOUT_ZOOM = 1.6

const PINS = {
  skellige: [400, 380],
  novigrad: [822, 352],
}

const clamp = (v, min, max) => (min > max ? (min + max) / 2 : Math.min(max, Math.max(min, v)))

// Virtual camera over the map. Tween `state` and call `apply()`:
// - z: zoom (1 = map covers the stage), fx/fy: map point wanted in the centre of the screen
//   (clamped so the edge of the map never shows),
// - one entry per circle: radius (0–1, 1 = reaches the farthest corner) of a clip-path circle
//   centred on that pin's current screen position.
export function createMapCamera({ stage, map, circles }) {
  const [fx, fy] = PINS.skellige
  const state = { z: 4, fx, fy, ...Object.fromEntries(circles.map(({ pin, radius }) => [pin, radius])) }

  gsap.set(map, { transformOrigin: '0 0' })

  function apply() {
    const vw = stage.clientWidth
    const vh = stage.clientHeight
    const scale = Math.max(vw / MAP_W, vh / MAP_H) * state.z
    const cx = clamp(state.fx, vw / 2 / scale, MAP_W - vw / 2 / scale)
    const cy = clamp(state.fy, vh / 2 / scale, MAP_H - vh / 2 / scale)

    gsap.set(map, { x: vw / 2 - cx * scale, y: vh / 2 - cy * scale, scale: state.z / MAP_LAYOUT_ZOOM })

    circles.forEach(({ el, pin }) => {
      const [px, py] = PINS[pin]
      const x = vw / 2 + (px - cx) * scale
      const y = vh / 2 + (py - cy) * scale
      // Radius 1 just reaches the farthest corner, so any value below 1 is already visible.
      const reach = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y))
      el.style.clipPath = `circle(${(state[pin] * reach).toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`
    })
  }

  function reset() {
    circles.forEach(({ el }) => (el.style.clipPath = ''))
  }

  return { state, apply, reset }
}
