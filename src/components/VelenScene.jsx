import LocationTitle from './LocationTitle'
import VideoBackground from './VideoBackground'

// Velen scene. Animated from Journey: .velen-scene (opacity), .velen-zoom (scale),
// .velen-title (see LocationTitle), .velen-text (reveal), .velen-copy (fade out).
export default function VelenScene({ className = '', ...props }) {
  return (
    <section className={`velen-scene overflow-hidden bg-black ${className}`} {...props}>
      <div className="velen-zoom absolute inset-0 will-change-transform">
        <VideoBackground name="hero-velen-mill" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_50%,rgba(0,0,0,0.5),transparent_75%)]"
        aria-hidden="true"
      />

      <div className="velen-copy absolute inset-0 flex flex-col items-center justify-center px-6">
        <LocationTitle name="Velen" subtitle="No Man's Land" className="velen-title" />
        <p className="velen-text mx-auto mt-10 max-w-xl text-center font-heading text-base tracking-[0.15em] text-neutral-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:text-lg md:text-xl">
          War-torn marshes, gallows on every crossroad.
        </p>
      </div>
    </section>
  )
}
