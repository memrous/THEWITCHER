import SplitLetters from '../SplitLetters'
import ContractParchment from './ContractParchment'

// 9) "Contracts." – no video: the word top left, the contract on the right (~80 % of the screen
// height, slightly turned). On mobile the word is on top and the parchment below it.
// Animated from WitcherChapter, one wrapper per job:
// .shot (vanish), .contract-parallax (y – drifts against the text), .contract-sway (living paper,
// time-based), .contract-jolt (short shake when the seal lands), and inside ContractParchment
// .contract-root (unroll + y), .contract-line (one by one), .contract-sign (written on),
// .contract-seal (stamped). .ch-word / .ch-letter / .ch-text as in every scene.
export default function ContractsScene({ className = '', ...props }) {
  return (
    <section className={`contracts-scene overflow-hidden bg-dark ${className}`} {...props}>
      <div className="ch-text absolute inset-x-6 top-[10%] md:inset-x-auto md:top-[10%] md:left-[6%]">
        <h2 className="font-display text-[clamp(3rem,7vw,7rem)] leading-none font-bold tracking-[0.02em] text-[#e8e4dc] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
          <SplitLetters text="Contracts." wordClass="ch-word" letterClass="ch-letter" />
        </h2>
      </div>

      {/* Width follows the height: the sheet is 600 × 840, so this keeps it at ~80 % (60 % on mobile). */}
      <div className="shot absolute inset-x-0 bottom-[4%] mx-auto w-[min(42svh,86vw)] rotate-[2deg] md:inset-x-auto md:top-[10%] md:right-[7%] md:bottom-auto md:mx-0 md:w-[min(57svh,44vw)]">
        <div className="contract-parallax">
          <div className="contract-sway">
            <div className="contract-jolt">
              <ContractParchment />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
