import useIsMobile from '../hooks/useIsMobile'
import useReducedMotion from '../hooks/useReducedMotion'

const BASE = `${import.meta.env.BASE_URL}video/`

// Decorative looping background video. Expects files from public/video/:
// <name>.webm, <name>.mp4, <name>-720.mp4 and <name>-poster.webp.
export default function VideoBackground({ name, className = '', videoClassName = '' }) {
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const src = BASE + name

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <video
        // Remount when the source set changes – <source> swaps are ignored after load.
        key={`${isMobile}-${reducedMotion}`}
        className={`h-full w-full object-cover ${videoClassName}`}
        poster={`${src}-poster.webp`}
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        tabIndex={-1}
      >
        {isMobile ? (
          <source src={`${src}-720.mp4`} type="video/mp4" />
        ) : (
          <>
            <source src={`${src}.webm`} type="video/webm" />
            <source src={`${src}.mp4`} type="video/mp4" />
          </>
        )}
      </video>
    </div>
  )
}
