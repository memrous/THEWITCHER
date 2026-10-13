// Text split into words (`wordClass`) and letters (`letterClass`) for staggered reveals with
// transforms only. Words stay unbreakable so a line never wraps mid-word; screen readers get
// the plain text.
export default function SplitLetters({ text, wordClass = 'split-word', letterClass = 'split-letter' }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(' ').map((word, w) => (
          <span key={w}>
            {w > 0 && ' '}
            <span className={`${wordClass} inline-block whitespace-nowrap`}>
              {[...word].map((char, i) => (
                <span key={i} className={`${letterClass} inline-block`}>
                  {char}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </>
  )
}
