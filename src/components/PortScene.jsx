import VideoBackground from './VideoBackground'

// Novigrad harbour – it opens from the Novigrad pin on the map.
// Animated from Journey: .port-scene (clip-path circle, via the map camera), .port-pan (scale).
export default function PortScene({ className = '', ...props }) {
  return (
    <section className={`port-scene overflow-hidden bg-black ${className}`} {...props}>
      <div className="port-pan absolute inset-0 will-change-transform">
        <VideoBackground name="novigrad-port" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,transparent_40%,rgba(0,0,0,0.45))]"
        aria-hidden="true"
      />
    </section>
  )
}
