// "Breaths": when the scroll comes to rest close to a key moment (an area title fully shown, the
// hold of a chapter II scene), it settles gently onto it, so the scene gets a moment to breathe.
// Anywhere else the scroll stays where it stopped. Desktop only (the callers decide).
//
// `times` are moments in timeline units, `length` is the timeline length (progress = t / length),
// `reach` is how close (in units ≈ screens) the scroll must stop for the snap to kick in.
export function breathSnap(times, length, reach = 0.45) {
  return {
    snapTo: (progress) => {
      const t = progress * length
      const nearest = times.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a))
      return Math.abs(nearest - t) <= reach ? nearest / length : progress
    },
    duration: 0.8,
    delay: 0.15,
    ease: 'power1.inOut',
    inertia: false,
  }
}
