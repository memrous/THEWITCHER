// Sound sources (freesound.org, CC0) – not required, but fair to name.
const SOUND_CREDITS =
  'cinetony, owl, kevp888, doctor_jekyll, thewoodlandnomad, zabuhailo, benjaminnelan, marcoman89, cerise_virtuelle, wenpire'

export default function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-black px-6 py-10 text-center">
      <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-400">
        A fan-made showcase of The Witcher 3: Wild Hunt. Not affiliated with CD PROJEKT RED.
      </p>
      <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-neutral-400">
        Ambient sounds and effects from freesound.org (CC0): {SOUND_CREDITS}.
      </p>
    </footer>
  )
}
