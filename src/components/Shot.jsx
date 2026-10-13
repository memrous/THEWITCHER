// A chapter II shot: not full screen and without a hard frame – its edges dissolve into the dark.
// Animated from WitcherChapter (see addEmerge / addVanish there):
// .shot (opacity + scale when vanishing), .shot-inner (opacity + scale when emerging),
// .shot-veil (dark veil with a clear centre; it scales up so the clear part grows over the shot).
// Without animation the shot is simply visible.
// `edges="y"` softens only the top and bottom (a band across the full width).
export default function Shot({ className = '', children, edges = 'all' }) {
  return (
    <div className={`shot absolute overflow-hidden ${className}`}>
      {/* Inset by 2 px: with the edge exactly on the clip, scaling leaves a 1 px seam. */}
      <div className={`shot-inner absolute inset-[2px] will-change-transform ${edges === 'y' ? 'soft-edges-y' : 'soft-edges'}`}>
        {children}
      </div>
      <div
        className="shot-veil pointer-events-none absolute -inset-1/2 bg-[radial-gradient(closest-side,transparent_20%,var(--color-dark)_60%)] opacity-0 will-change-transform"
        aria-hidden="true"
      />
    </div>
  )
}
