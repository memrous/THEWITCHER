import { gsap } from './gsap'

// Prepares a path to be drawn by animating strokeDashoffset to 0. The gap of the dash pattern is
// longer than the path, so a round line cap leaves no dot at the end before the drawing starts.
export function prepareStrokeDraw(path) {
  if (!path) return
  const length = path.getTotalLength()
  gsap.set(path, { strokeDasharray: `${length} ${length + 20}`, strokeDashoffset: length + 10 })
}
