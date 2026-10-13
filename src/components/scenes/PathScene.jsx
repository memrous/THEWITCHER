import Shot from '../Shot'
import SplitLetters from '../SplitLetters'
import VideoBackground from '../VideoBackground'

// Thin winding road under the sentence, like a route on a map.
const ROAD = 'M 4 20 C 60 4 110 34 170 20 S 280 6 340 20 S 450 34 510 18 S 570 10 596 22'

// 7) "A witcher walks the Path." – shot in the top right corner, the sentence on one line
// bottom left.
// On mobile the sentence is on top and the shot below it. Animated from WitcherChapter:
// the shot (see Shot), .ch-word / .ch-letter (emerging text), .path-road (dash offset),
// .ch-text (vanish). The ride loops on its own while the scene is on screen (720p on mobile,
// the poster with reduced motion).
export default function PathScene({ className = '', ...props }) {
  return (
    <section className={`path-scene overflow-hidden bg-dark ${className}`} {...props}>
      <Shot className="inset-x-0 bottom-[6%] h-[60%] md:inset-x-auto md:top-0 md:right-0 md:bottom-auto md:h-[72%] md:w-[70%]">
        <VideoBackground name="path-ride" webm={false} />
      </Shot>

      <div className="ch-text absolute inset-x-6 top-[10%] md:inset-x-auto md:top-auto md:bottom-[13%] md:left-[6%]">
        <h2 className="font-display text-[4.6vw] leading-tight font-bold tracking-[0.02em] whitespace-nowrap text-[#e8e4dc] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] md:text-[clamp(2rem,4.2vw,4.25rem)]">
          <SplitLetters text="A witcher walks the Path." wordClass="ch-word" letterClass="ch-letter" />
        </h2>

        <svg className="mt-3 block h-auto w-full text-neutral-300 md:mt-5" viewBox="0 0 600 36" aria-hidden="true">
          <path
            className="path-road"
            d={ROAD}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.8"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="4" cy="20" r="3" fill="currentColor" />
          <path d="M 590 16 L 602 28 M 602 16 L 590 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  )
}
