import VideoBackground from './VideoBackground'

// "Into the Fog" scene. Animated from Journey: .fog-scene (opacity), .fog-zoom (scale),
// .fog-line (reveal), .fog-copy (fade out).
export default function FogTransition({ className = '', ...props }) {
  return (
    <section className={`fog-scene overflow-hidden bg-black ${className}`} {...props}>
      <div className="fog-zoom absolute inset-0 will-change-transform">
        <VideoBackground name="fog-geralt" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_50%,rgba(0,0,0,0.5),transparent_75%)]"
        aria-hidden="true"
      />

      <div className="fog-copy absolute inset-0 flex items-center justify-center px-6">
        <h2 className="text-center font-heading text-2xl leading-relaxed tracking-[0.2em] text-neutral-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-3xl md:text-4xl">
          <span className="fog-line block">The mist rolls in.</span>
          <span className="fog-line block text-neutral-300">Something is watching.</span>
        </h2>
      </div>
    </section>
  )
}
