// Text fallback of the logo. When the SVG logo arrives (src/assets/logo/),
// swap the contents of LogoMark – the wrapper classes used by the animations stay the same.
function LogoMark({ className = '' }) {
  return (
    <span
      className={`block whitespace-nowrap pl-[0.15em] font-display text-[clamp(2.25rem,8vw,7.5rem)] leading-none font-bold tracking-[0.15em] ${className}`}
    >
      THE WITCHER
    </span>
  )
}

export default function HeroTitle() {
  return (
    // .hero-logo-outer → scroll animations, .hero-logo-inner → intro animations.
    <div className="hero-logo-outer">
      <div className="hero-logo-inner relative">
        <h1 className="drop-shadow-[0_4px_18px_rgba(0,0,0,0.75)]">
          <LogoMark className="bg-linear-to-b from-[#fbfbfc] via-[#c3c7cd] to-[#55595f] bg-clip-text text-transparent" />
        </h1>

        {/* Metallic shine: a masked band slides right while the bright copy counter-slides,
            so the highlight stays clipped to the letters (transform only). */}
        <div
          className="logo-shine pointer-events-none absolute inset-0 overflow-hidden mask-[linear-gradient(100deg,transparent_38%,#000_50%,transparent_62%)]"
          aria-hidden="true"
        >
          <LogoMark className="logo-shine-text bg-linear-to-b from-white via-[#f1f3f5] to-[#b9bec5] bg-clip-text text-transparent" />
        </div>
      </div>
    </div>
  )
}
