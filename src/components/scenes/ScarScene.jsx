import useReducedMotion from '../../hooks/useReducedMotion'
import Shot from '../Shot'
import SplitLetters from '../SplitLetters'
import VideoBackground from '../VideoBackground'

// The sword cut runs from the lower left to the upper right of the band.
const CUT_LEFT = 70
const CUT_RIGHT = 30
// The lower half reaches a little over the cut, so the two halves never leave a seam.
const OVERLAP = 1.5

// 11) "Every road leaves a scar." – a wide band across the full width (soft top and bottom),
// the sentence under it. At the end a sword cut: a bright diagonal, then the band splits along it
// and both halves slide apart into the dark. Each half is its own copy of the clip (they play in
// step, so the cut never shows before it happens).
// Animated from WitcherChapter: the shot (see Shot), .ch-word / .ch-letter (emerging text),
// .scar-cut (clip-path – the line is drawn), .scar-upper / .scar-lower (y, opacity),
// .ch-text (vanish).
export default function ScarScene({ className = '', play, ...props }) {
  const reducedMotion = useReducedMotion()

  return (
    <section className={`scar-scene overflow-hidden bg-dark ${className}`} {...props}>
      <Shot className="inset-x-0 top-[22%] h-[45%] md:top-[16%]" edges="y">
        <div
          className="scar-upper absolute inset-0 will-change-transform"
          style={{ clipPath: `polygon(0% 0%, 100% 0%, 100% ${CUT_RIGHT}%, 0% ${CUT_LEFT}%)` }}
          data-play={play}
        >
          <VideoBackground name="outro-lake-dusk" />
        </div>
        <div
          className="scar-lower absolute inset-0 will-change-transform"
          style={{ clipPath: `polygon(0% ${CUT_LEFT - OVERLAP}%, 100% ${CUT_RIGHT - OVERLAP}%, 100% 100%, 0% 100%)` }}
          data-play={play}
        >
          <VideoBackground name="outro-lake-dusk" />
        </div>

        {!reducedMotion && (
          <svg
            className="scar-cut pointer-events-none absolute inset-0 h-full w-full [filter:drop-shadow(0_0_6px_rgba(255,240,215,1))_drop-shadow(0_0_18px_rgba(255,220,170,0.8))]"
            style={{ clipPath: 'inset(0% 100% 0% 0%)' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1={CUT_LEFT}
              x2="100"
              y2={CUT_RIGHT}
              stroke="#fff6e6"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </Shot>

      <div className="ch-text absolute inset-x-6 bottom-[14%] text-center md:inset-x-0 md:bottom-[13%]">
        <h2 className="font-display text-[clamp(2rem,5vw,5rem)] leading-tight font-bold tracking-[0.02em] text-[#e8e4dc] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
          <SplitLetters text="Every road leaves a scar." wordClass="ch-word" letterClass="ch-letter" />
        </h2>
      </div>
    </section>
  )
}
