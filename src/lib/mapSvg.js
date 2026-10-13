// Splits the hand-drawn map (src/assets/map/continent-map.svg) into two layers:
// - background: paper, sea and coastlines – the filtered, static part. It is rasterised once
//   into a canvas, so zooming never re-runs the SVG filters.
// - overlay: everything from #route-past on (routes, pins, ship, labels, compass, frame) –
//   stays inline so its parts can be animated.
// The split relies on the drawing order in the file: all filtered layers come before #route-past.

const OVERLAY_START = '<path id="route-past"'

export const MAP_W = 1600
export const MAP_H = 900

export function splitMap(source) {
  const start = source.indexOf(OVERLAY_START)
  const end = source.lastIndexOf('</svg>')
  const title = source.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? ''
  const defs = source.match(/<defs>[\s\S]*?<\/defs>/)?.[0] ?? ''

  // Unexpected file layout – keep everything inline (slower, but correct).
  if (start < 0) {
    return { title, background: null, overlay: source.slice(source.indexOf('>', source.indexOf('<svg')) + 1, end) }
  }

  // #route-new is dashed, so it is revealed through a mask: a solid copy of the path
  // whose dash offset is animated (.route-reveal).
  const routeD = source.match(/id="route-new"[\s\S]*?\sd="([^"]+)"/)?.[1]
  const reveal = routeD
    ? `<mask id="route-new-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="${MAP_W}" height="${MAP_H}">` +
      `<path class="route-reveal" d="${routeD}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/></mask>`
    : ''
  const overlay = source
    .slice(start, end)
    .replace('<path id="route-new"', routeD ? '<path id="route-new" mask="url(#route-new-reveal)"' : '<path id="route-new"')

  return {
    title,
    background: `${source.slice(0, start)}</svg>`,
    overlay: defs + reveal + overlay,
  }
}

// Rasterises the background SVG into the canvas at the given pixel width.
export function drawMapBackground(canvas, background, width) {
  const height = Math.round((width * MAP_H) / MAP_W)
  const svg = background.replace('<svg ', `<svg width="${width}" height="${height}" `)
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  const img = new Image()
  let cancelled = false

  img.onload = () => {
    URL.revokeObjectURL(url)
    if (cancelled) return
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(img, 0, 0, width, height)
  }
  img.onerror = () => URL.revokeObjectURL(url)
  img.src = url

  return () => {
    cancelled = true
  }
}
