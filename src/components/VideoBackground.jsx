import useIsMobile from '../hooks/useIsMobile'
import useReducedMotion from '../hooks/useReducedMotion'

const BASE = `${import.meta.env.BASE_URL}video/`

// Decorative looping background video. Expects files from public/video/:
// <name>.webm, <name>.mp4, <name>-720.mp4 and <name>-poster.webp.
// `webm={false}` for clips that exist only as MP4 (e.g. path-ride).
// The video never starts on its own: the scene timelines play and pause it (src/lib/video.js) and
// warm it up shortly before its scene. Only `eager` videos (the hero) load with the page – the
// rest show their poster until then, which keeps the first load light.
export default function VideoBackground({ name, className = '', webm = true, eager = false }) {
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const src = BASE + name

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* An eager video also gets its poster as a real image: painted at once and counted as the
          largest paint, while the video itself is still loading. */}
      {eager && (
        <img
          src={`${src}-poster.webp`}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <video
        // Remount when the source set changes – <source> swaps are ignored after load.
        key={`${isMobile}-${reducedMotion}`}
        className="relative h-full w-full object-cover"
        // Lazy videos get their poster at warm-up (src/lib/video.js), so the first load stays light.
        // With reduced motion the poster is the content of the static section – load it at once.
        poster={eager || reducedMotion ? `${src}-poster.webp` : undefined}
        data-poster={`${src}-poster.webp`}
        muted
        loop
        playsInline
        preload={eager && !reducedMotion ? 'auto' : 'none'}
        disablePictureInPicture
        tabIndex={-1}
      >
        {isMobile ? (
          <source src={`${src}-720.mp4`} type="video/mp4" />
        ) : (
          <>
            {webm && <source src={`${src}.webm`} type="video/webm" />}
            <source src={`${src}.mp4`} type="video/mp4" />
          </>
        )}
      </video>
    </div>
  )
}
