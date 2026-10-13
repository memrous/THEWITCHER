// In-game style area title: big name, thin rule and a small-caps subtitle.
// Animated from Journey (see addTitle there): .loc-letter (opacity + x spread),
// .loc-line (scaleX), .loc-sub (reveal). Without animations it renders in its final state.
export default function LocationTitle({ name, subtitle, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="pl-[0.2em] font-display text-[clamp(2.5rem,9vw,8rem)] leading-none font-bold tracking-[0.2em] text-neutral-100 uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        <span className="sr-only">{name}</span>
        {/* Letters are separate spans so the spacing can be animated with transforms only. */}
        <span aria-hidden="true">
          {[...name].map((char, i) => (
            <span key={i} className="loc-letter inline-block">
              {char}
            </span>
          ))}
        </span>
      </h2>
      <span
        className="loc-line mx-auto mt-5 block h-px w-[min(60%,22rem)] bg-linear-to-r from-transparent via-neutral-300 to-transparent"
        aria-hidden="true"
      />
      <p className="loc-sub mt-4 pl-[0.45em] font-heading text-xs tracking-[0.45em] text-neutral-300 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-sm md:text-base">
        {subtitle}
      </p>
    </div>
  )
}
