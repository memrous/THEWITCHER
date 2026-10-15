const VIDEO_EVENTS = ['progress', 'loadedmetadata', 'canplaythrough', 'error']

// Loading progress of what the first screen needs: a few images and the hero video.
// `onProgress(p)` gets 0–1 (each part counts the same; the video by how much of it is buffered).
// After `timeout` ms it reports 1 anyway, so a slow network never keeps the gate shut.
// Returns a cleanup function.
export function trackLoading({ images = [], video = null, timeout = 12000 }, onProgress) {
  // A lazy video (reduced motion shows only its poster) is not waited for.
  const waitForVideo = Boolean(video) && video.preload !== 'none'
  const parts = images.map(() => 0)
  if (waitForVideo) parts.push(0)
  const videoPart = parts.length - 1

  let done = false
  const loaders = []
  let timer = null
  const report = () => {
    if (done) return
    const p = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 1
    onProgress(p)
    if (p >= 1) finish()
  }
  const set = (i, value) => {
    parts[i] = Math.max(parts[i], value)
    report()
  }

  images.forEach((src, i) => {
    const img = new Image()
    img.onload = img.onerror = () => set(i, 1)
    img.src = src
    if (img.complete) set(i, 1)
    loaders.push(img)
  })

  const onVideo = () => {
    // Enough to play through (or broken – no reason to wait for it then).
    if (video.readyState >= 4 || video.error) return set(videoPart, 1)
    const { buffered, duration } = video
    if (buffered.length && duration) set(videoPart, Math.min(0.98, buffered.end(buffered.length - 1) / duration))
  }
  if (waitForVideo) {
    VIDEO_EVENTS.forEach((e) => video.addEventListener(e, onVideo))
    onVideo()
  }

  if (!done) {
    timer = window.setTimeout(() => {
      parts.fill(1)
      report()
    }, timeout)
  }

  function finish() {
    done = true
    window.clearTimeout(timer)
    if (waitForVideo) VIDEO_EVENTS.forEach((e) => video.removeEventListener(e, onVideo))
    loaders.forEach((img) => (img.onload = img.onerror = null))
  }

  report()
  return finish
}
