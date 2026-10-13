import useReducedMotion from '../../hooks/useReducedMotion'
import Shot from '../Shot'
import SplitLetters from '../SplitLetters'
import VideoBackground from '../VideoBackground'

// Light holds 65 % of the frame at first – the scroll later shifts it to 35 %.
const SPLIT = 65

// 10) "Choices." – the word top centre with "There is no lesser evil." under it; below, two
// shots side by side with shared soft edges: what you protect (Ciri at home in Corvo Bianco)
// against what is coming (a village burning, the Wild Hunt riding through).
// Animated from WitcherChapter: the shot (see Shot), .ch-word / .ch-letter (emerging text),
// .choices-sub (fade in), .choice-light / .choice-dark (clip-path – the border between them
// moves), .choice-seam (x – soft dark seam on the border), .ch-text (vanish). Both clips play on
// their own while the scene is on screen (each half has its own play window, data-play).
export default function ChoicesScene({ className = '', play, ...props }) {
  const reducedMotion = useReducedMotion()

  return (
    <section className={`choices-scene overflow-hidden bg-dark ${className}`} {...props}>
      <div className="ch-text absolute inset-x-6 top-[9%] text-center md:inset-x-0 md:top-[8%]">
        <h2 className="font-display text-[clamp(3rem,7vw,7rem)] leading-none font-bold tracking-[0.02em] text-[#e8e4dc] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
          <SplitLetters text="Choices." wordClass="ch-word" letterClass="ch-letter" />
        </h2>
        <p className="choices-sub mt-4 font-heading text-base tracking-[0.2em] text-neutral-300 sm:text-lg md:text-xl">
          There is no lesser evil.
        </p>
      </div>

      <Shot className="inset-x-0 bottom-[6%] h-[60%] md:inset-x-[4%] md:top-[34%] md:bottom-[5%] md:h-auto">
        <div className="choice-light absolute inset-0" style={{ clipPath: `inset(0% ${100 - SPLIT}% 0% 0%)` }} data-play={play}>
          <VideoBackground name="choice-light" webm={false} />
        </div>
        <div className="choice-dark absolute inset-0" style={{ clipPath: `inset(0% 0% 0% ${SPLIT}%)` }} data-play={play}>
          <VideoBackground name="choice-dark" webm={false} />
        </div>
        {/* Soft dark seam that rides on the border (placed by the timeline). */}
        {!reducedMotion && (
          <div className="choice-seam pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-y-0 -left-[3%] w-[6%] bg-linear-to-r from-transparent via-dark/70 to-transparent" />
          </div>
        )}
      </Shot>
    </section>
  )
}
