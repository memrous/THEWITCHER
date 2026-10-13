import '@fontsource/unifrakturmaguntia'
import '@fontsource/im-fell-english'
import '@fontsource/im-fell-english/400-italic.css'
import '@fontsource/pinyon-script'
import paperSvg from '../../assets/contract/contract-paper.svg?raw'

// Witcher contract on torn, aged parchment. Purely presentational – the scene animates it via classes:
//   .contract-root      whole sheet (unroll: clip-path inset top→bottom)
//   .contract-line      each text block (typewriter / fade in order)
//   .contract-sign      Geralt's signature (write-on: clip-path inset right→left)
//   .contract-seal      wax seal (stamp: scale 2 → 1, short shake)
export default function ContractParchment({ className = '' }) {
  return (
    <div
      className={`contract-root relative aspect-[600/840] w-full max-w-[600px] drop-shadow-[0_18px_30px_rgba(0,0,0,0.7)] ${className}`}
      style={{ containerType: 'inline-size' }}
      role="img"
      aria-label="A witcher contract on torn parchment: The Thing in the Mill, reward 300 crowns."
    >
      <div className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: paperSvg }} />

      <div
        className="absolute inset-0 flex flex-col px-[10%] pt-[7.5%] pb-[16%] text-center text-[#2a1a0c]"
        style={{ fontFamily: '"IM Fell English", serif', fontSize: 'clamp(9px, 3.33cqw, 20px)' }}
        aria-hidden="true"
      >
        <Emblem className="contract-line mx-auto mb-[1%] w-[14%]" />
        <h3 className="contract-line mb-[2.5%] text-[2em] leading-[1.05] text-[#1d1208]" style={{ fontFamily: '"UnifrakturMaguntia", serif' }}>
          Contract: The Thing
          <br />
          in the Mill
        </h3>
        <p className="contract-line mb-[2.2%] leading-[1.42]">To any witcher passing through Harrowfield.</p>
        <p className="contract-line mb-[2.2%] leading-[1.42]">
          For three nights now, folk have gone missing near the old water mill. Their tracks lead down to the millrace and no further.
        </p>
        <p className="contract-line mb-[2.2%] leading-[1.42]">
          The miller swears he hears scratching beneath the boards after dark, and not a dog in the village will go near the river.
        </p>
        <p className="contract-line mb-[2.2%] leading-[1.42]">
          Whoever rids us of this foul thing shall be paid upon showing proof of its death.
        </p>
        <p className="contract-line mb-[2.2%] text-[1.05em]">
          Reward: <span className="text-[1.25em]" style={{ fontFamily: '"UnifrakturMaguntia", serif' }}>300 crowns</span>
        </p>
        <p className="contract-line text-[0.9em] italic">❖ Ask for the alderman at the tavern by the crossroads.</p>

        <div className="mt-auto text-left text-[0.9em]">
          <p className="contract-line mb-[1%]">
            Contract offered by: <Sig>Alderman Bertram Holt</Sig>
          </p>
          <p className="contract-line">
            Contract accepted by: <Sig className="contract-sign">Geralt of Rivia</Sig>
          </p>
        </div>
      </div>

      <Seal className="contract-seal absolute right-[7%] bottom-[3.5%] w-[19%] -rotate-12" />
    </div>
  )
}

function Sig({ children, className = '' }) {
  return (
    <span className={`ml-1 inline-block text-[1.5em] ${className}`} style={{ fontFamily: '"Pinyon Script", cursive' }}>
      {children}
    </span>
  )
}

function Emblem({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 116" aria-hidden="true">
      <defs>
        <linearGradient id="ct-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1d27a" />
          <stop offset="1" stopColor="#a87a2a" />
        </linearGradient>
      </defs>
      <path d="M8 6 H92 V54 C92 84 70 102 50 112 C30 102 8 84 8 54 Z" fill="#1a1410" stroke="#6b4a22" strokeWidth="5" />
      <path d="M14 12 H86 V54 C86 80 67 96 50 105 C33 96 14 80 14 54 Z" fill="none" stroke="#3a2a18" strokeWidth="2" />
      <g fill="url(#ct-gold)">
        <path d="M38 86 V50 H34 V40 H40 V44 H46 V40 H54 V44 H60 V40 H66 V50 H62 V86 Z" />
        <rect x="30" y="86" width="40" height="6" />
      </g>
      <path d="M46 70 a4 4 0 0 1 8 0 V86 H46 Z" fill="#1a1410" />
      <path d="M50 18 l3 8 h8 l-6 5 2 8 -7-5 -7 5 2-8 -6-5 h8 z" fill="url(#ct-gold)" />
    </svg>
  )
}

function Seal({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="ct-wax" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#c2332a" />
          <stop offset=".6" stopColor="#8e1a14" />
          <stop offset="1" stopColor="#5a0d0a" />
        </radialGradient>
        <filter id="ct-wax-edge">
          <feTurbulence baseFrequency=".05" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="12" />
        </filter>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#ct-wax)" filter="url(#ct-wax-edge)" />
      <circle cx="60" cy="60" r="34" fill="none" stroke="#5a0d0a" strokeWidth="3" opacity=".8" />
      <circle cx="59" cy="59" r="34" fill="none" stroke="#e46a5c" strokeWidth="1" opacity=".5" />
      <g stroke="#5a0d0a" strokeWidth="4" strokeLinecap="round">
        <path d="M44 44 L76 76" />
        <path d="M76 44 L44 76" />
      </g>
      <g stroke="#e46a5c" strokeWidth="1.2" strokeLinecap="round" opacity=".55" transform="translate(-1 -1)">
        <path d="M44 44 L76 76" />
        <path d="M76 44 L44 76" />
      </g>
      <ellipse cx="44" cy="38" rx="14" ry="6" fill="#fff" opacity=".12" transform="rotate(-30 44 38)" />
    </svg>
  )
}
