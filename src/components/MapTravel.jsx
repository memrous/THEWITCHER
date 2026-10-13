import { useEffect, useRef } from 'react'
import mapSource from '../assets/map/continent-map.svg?raw'
import useReducedMotion from '../hooks/useReducedMotion'
import { afterFirstScroll } from '../lib/idle'
import { MAP_LAYOUT_ZOOM } from '../lib/mapCamera'
import { drawMapBackground, splitMap } from '../lib/mapSvg'

const MAP = splitMap(mapSource)
const MAX_CANVAS_WIDTH = 4096
const MAX_CANVAS_WIDTH_MOBILE = 2048

// The map itself: a canvas with the static paper and an inline SVG with the animated parts.
function MapLayers({ canvasRef }) {
  return (
    <>
      {MAP.background && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full bg-[#dcc9a0]" />}
      <svg
        viewBox="0 0 1600 900"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={MAP.title}
        dangerouslySetInnerHTML={{ __html: MAP.overlay }}
      />
    </>
  )
}

// Sailing from Skellige to Novigrad over a hand-drawn map.
// Animated from Journey with createMapCamera (src/lib/mapCamera.js): .map-cam (x, y, scale),
// .map-blur (filter, desktop only), .route-reveal (dash offset), #ship (motion path, rotation),
// #pin-novigrad ring (pulse). With reduced motion it is a static map with the whole route.
export default function MapTravel({ className = '', ...props }) {
  const canvasRef = useRef(null)
  const reducedMotion = useReducedMotion()

  // Rasterise the paper once, at the size it is laid out at (capped, smaller on phones), when the
  // page is first scrolled – the map is far down the page, so it must not hold up the first load.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelDraw = null
    const cancelLater = afterFirstScroll(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const max = window.innerWidth < 768 ? MAX_CANVAS_WIDTH_MOBILE : MAX_CANVAS_WIDTH
      const width = Math.min(max, Math.round(canvas.clientWidth * dpr))
      cancelDraw = drawMapBackground(canvas, MAP.background, width)
    })
    return () => {
      cancelLater()
      cancelDraw?.()
    }
  }, [reducedMotion])

  if (reducedMotion) {
    return (
      <section className={`flex flex-col items-center justify-center gap-8 bg-[#1c140c] px-4 py-16 ${className}`} {...props}>
        <div className="relative aspect-video w-full max-w-6xl shadow-[0_10px_60px_rgba(0,0,0,0.6)]">
          <MapLayers canvasRef={canvasRef} />
        </div>
        <p className="text-center font-heading text-base tracking-[0.15em] text-neutral-200 sm:text-lg md:text-xl">
          From Skellige, across the Great Sea, to Novigrad.
        </p>
      </section>
    )
  }

  return (
    <section className={`map-scene overflow-hidden bg-[#1c140c] ${className}`} {...props}>
      <div className="map-blur absolute inset-0">
        <div
          className="map-cam absolute top-0 left-0 aspect-video"
          style={{ width: `calc(${MAP_LAYOUT_ZOOM} * max(100%, 177.778svh))` }}
        >
          <MapLayers canvasRef={canvasRef} />
        </div>
      </div>
      {/* Paper shadow – the map lies on a dark table. */}
      <div
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_160px_rgba(20,12,4,0.75)]"
        aria-hidden="true"
      />
    </section>
  )
}
