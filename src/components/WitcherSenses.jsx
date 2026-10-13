import useReducedMotion from '../hooks/useReducedMotion'
import VideoBackground from './VideoBackground'

// "Witcher senses" – Geralt appears inside a circular wave spreading from the centre.
// Animated from Journey: .senses-reveal (clip-path circle), .senses-ring (scale, opacity),
// .senses-zoom (scale), .senses-line (reveal).
export default function WitcherSenses({ className = '', ...props }) {
  const reducedMotion = useReducedMotion()

  return (
    <section className={`senses-scene overflow-hidden ${className}`} {...props}>
      <div className="senses-reveal absolute inset-0 bg-black">
        <div className="senses-zoom absolute inset-0 will-change-transform">
          <VideoBackground name="geralt-reveal" />
        </div>

        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,0,0,0.45),transparent_75%)]"
          aria-hidden="true"
        />
        {/* Blend into the dark of chapter II below. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-dark to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <p className="senses-line text-center font-heading text-2xl tracking-[0.2em] text-neutral-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-3xl md:text-4xl">
            But the Continent needs a witcher.
          </p>
        </div>
      </div>

      {/* Glowing edge of the wave – same radius as the clip-path circle (80vmax). */}
      {!reducedMotion && (
        <div
          className="senses-ring pointer-events-none absolute top-[calc(50%-80vmax)] left-[calc(50%-80vmax)] h-[160vmax] w-[160vmax] bg-[radial-gradient(circle_closest-side,transparent_86%,rgba(214,226,240,0.5)_98%,transparent_100%)] will-change-transform"
          aria-hidden="true"
        />
      )}
    </section>
  )
}
