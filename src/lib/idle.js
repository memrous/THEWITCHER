// Runs heavy one-off work (procedural textures, rasterising the map) when the browser is idle,
// so it does not delay the first paint. Returns a cancel function.
export function whenIdle(fn, timeout = 2000) {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(fn, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(fn, 200)
  return () => window.clearTimeout(id)
}

// For work that is only needed further down the page: runs (when idle) on the first scroll, or
// after `fallback` ms at the latest – so the first load stays free of it. Returns a cancel function.
export function afterFirstScroll(fn, fallback = 8000) {
  let cancelIdle = null
  const run = () => {
    cleanup()
    cancelIdle = whenIdle(fn, 1000)
  }
  const timer = window.setTimeout(run, fallback)
  const cleanup = () => {
    window.clearTimeout(timer)
    window.removeEventListener('scroll', run)
  }
  window.addEventListener('scroll', run, { passive: true, once: true })
  return () => {
    cleanup()
    cancelIdle?.()
  }
}
