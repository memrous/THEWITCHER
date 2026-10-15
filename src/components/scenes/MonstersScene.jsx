import useIsMobile from '../../hooks/useIsMobile'
import useReducedMotion from '../../hooks/useReducedMotion'
import Shot from '../Shot'
import SplitLetters from '../SplitLetters'
import VideoBackground from '../VideoBackground'

// 8) "Kills Monsters." – a wide 2.39:1 shot in the top left corner, the words bottom right under it.
// On mobile the word is on top and the shot below it. Animated from WitcherChapter:
// the shot (see Shot), .ch-word / .ch-letter (emerging text),
// .monsters-text-shake (short jolt), .ch-text (vanish). The fight loops on its own on
// desktop (Geralt vs. the bruxa, ending on the bloodied face); mobile and reduced motion use
// the montage loop (or its poster).
export default function MonstersScene({ className = '', ...props }) {
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const wide = !isMobile && !reducedMotion

  return (
    <section className={`monsters-scene overflow-hidden ${className}`} {...props}>
      <Shot
        className="inset-x-0 bottom-[6%] h-[60%] md:inset-x-auto md:top-0 md:bottom-auto md:left-0 md:aspect-[2.39/1] md:h-auto md:w-[min(92%,calc(72svh*2.39))]"
      >
        {wide ? (
          <VideoBackground name="monsters-bruxa" webm={false} />
        ) : (
          <VideoBackground name="monsters-montage" />
        )}
      </Shot>

      <div className="ch-text absolute inset-x-6 top-[10%] md:inset-x-auto md:top-auto md:right-[5%] md:bottom-[9%] md:text-right">
        <div className="monsters-text-shake">
          <h2 className="font-display text-[clamp(3rem,7vw,7rem)] leading-none font-bold tracking-[0.02em] text-[#e8e4dc] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
            <SplitLetters text="Kills Monsters." wordClass="ch-word" letterClass="ch-letter" />
          </h2>
        </div>
      </div>
    </section>
  )
}
