// Invisible marker of a journey indicator stop (see src/lib/waypoints.js). Inside a scrubbed
// stage of N screens it sits `at` screens below the top – exactly where the stage's timeline is at
// `at` (one timeline unit = one viewport height of scrolling).
export default function Waypoint({ id, at = 0 }) {
  return (
    <span
      data-waypoint={id}
      className="pointer-events-none absolute left-0 h-0 w-0"
      style={{ top: `${at * 100}svh` }}
      aria-hidden="true"
    />
  )
}
