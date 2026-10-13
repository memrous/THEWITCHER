import logoSource from '../assets/logo/thewitcher-logo.svg?raw'

const VIEW_W = 695.38
const VIEW_H = 192.06

// Path data of one group of the logo file, so the logo stays a single source.
function groupPaths(id) {
  const group = logoSource.match(new RegExp(`<g id="${id}"[^>]*>([\\s\\S]*?)</g>`))?.[1] ?? ''
  return [...group.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1])
}

const WORDS = [
  // Vertical extent of each word, so the dark band of the metal runs through its middle.
  { id: 'logo-witcher', paths: groupPaths('logo-witcher'), y1: 68.7, y2: 173.6 },
  { id: 'logo-the', paths: groupPaths('logo-the'), y1: 0, y2: 45.3 },
]

// Light silver → grey → darker band in the middle → silver.
const METAL = [
  [0, '#f6f7f9'],
  [0.38, '#b9bec5'],
  [0.5, '#5a5f66'],
  [0.6, '#a3a8af'],
  [1, '#e9ecef'],
]

// The Witcher logo as inline SVG (src/assets/logo/thewitcher-logo.svg).
// .hero-logo-outer → scroll animations (Journey), .hero-logo-inner → intro reveal (clip-path,
// scale, blur), .logo-flare / .logo-glow → light of the reveal, #logo-witcher / #logo-the →
// staggered fade-in, .logo-shine-band → shine sweep (x). All set up in HeroSection.
// Each word is drawn twice: in metal, and in white through a mask with a moving band.
export default function HeroTitle() {
  return (
    <div className="hero-logo-outer">
      <div className="relative">
        {/* Bloom behind the logo at the moment of the reveal. Invisible unless animated. */}
        <div
          className="logo-glow pointer-events-none absolute -inset-x-[15%] -inset-y-[70%] bg-[radial-gradient(ellipse_at_center,rgba(236,241,248,0.8),rgba(196,208,226,0.3)_35%,transparent_68%)] opacity-0 will-change-transform"
          aria-hidden="true"
        />

        <div className="hero-logo-inner relative">
          <h1>
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="block h-auto w-[clamp(18rem,82vw,72rem)] overflow-visible drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)]"
              role="img"
              aria-label="The Witcher"
            >
              <defs>
                {WORDS.map(({ id, paths, y1, y2 }) => (
                  <g key={id}>
                    <linearGradient id={`${id}-metal`} gradientUnits="userSpaceOnUse" x1="0" y1={y1} x2="0" y2={y2}>
                      {METAL.map(([offset, color]) => (
                        <stop key={offset} offset={offset} stopColor={color} />
                      ))}
                    </linearGradient>
                    <g id={`${id}-shape`}>
                      {paths.map((d, i) => (
                        <path key={i} d={d} />
                      ))}
                    </g>
                  </g>
                ))}
  
                <linearGradient id="logo-shine-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                {/* The band starts left of the logo, so without animation there is no shine. */}
                <mask id="logo-shine-mask" maskUnits="userSpaceOnUse" x="-400" y="-100" width={VIEW_W + 800} height={VIEW_H + 200}>
                  <g className="logo-shine-band">
                    <rect x="-340" y="-60" width="240" height={VIEW_H + 120} fill="url(#logo-shine-gradient)" transform="skewX(-20)" />
                  </g>
                </mask>
              </defs>
  
              {WORDS.map(({ id }) => (
                <g key={id} id={id}>
                  <use href={`#${id}-shape`} fill={`url(#${id}-metal)`} />
                  <use href={`#${id}-shape`} fill="#fff" mask="url(#logo-shine-mask)" />
                </g>
              ))}
            </svg>
          </h1>
        </div>

        {/* Light flare through the middle of WITCHER – the reveal opens from it. */}
        <div
          className="logo-flare pointer-events-none absolute -inset-x-[12%] top-[calc(62%-1.5px)] h-[3px] bg-linear-to-r from-transparent via-white to-transparent opacity-0 shadow-[0_0_28px_8px_rgba(214,226,242,0.55)] will-change-transform"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
