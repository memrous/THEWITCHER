import LocationTitle from './LocationTitle'
import VideoBackground from './VideoBackground'

// Novigrad scene. Animated from Journey: .nc-scene (opacity), .nc-shake (x jitter),
// .nc-filter (desaturation), .nc-bg (scale), .nc-copy (y parallax), .nc-title (see LocationTitle),
// .nc-text (reveal), .nc-copy-inner (fade out). Each wrapper owns one property.
export default function NovigradScene({ className = '', ...props }) {
  return (
    <section className={`nc-scene overflow-hidden bg-black ${className}`} {...props}>
      <div className="nc-shake absolute inset-0 will-change-transform">
        <div className="nc-filter absolute inset-0">
          <div className="nc-bg absolute inset-0 will-change-transform">
            <VideoBackground name="novigrad-city" />
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_45%,rgba(0,0,0,0.45),transparent_75%)]"
        aria-hidden="true"
      />

      <div className="nc-copy absolute inset-0 flex items-center justify-center px-6">
        <div className="nc-copy-inner flex flex-col items-center">
          <LocationTitle name="Novigrad" subtitle="The Free City" className="nc-title" />
          <p className="nc-text mx-auto mt-10 max-w-xl text-center font-heading text-base tracking-[0.15em] text-neutral-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:text-lg md:text-xl">
            Bells, bankers and burning pyres.
          </p>
        </div>
      </div>
    </section>
  )
}
