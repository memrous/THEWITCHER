// Plays or pauses a video only when the requested state changes.
// The state is remembered on the element, so repeated calls on every scroll update are free.
export function setVideoPlaying(video, playing) {
  if (!video) return
  const state = playing ? 'play' : 'pause'
  if (video.dataset.state === state) return
  video.dataset.state = state
  if (playing) video.play().catch(() => {})
  else video.pause()
}

// Starts downloading a lazy video (preload="none") and its poster, so both are ready when its
// scene arrives.
export function warmUpVideo(video) {
  if (!video || video.preload === 'auto') return
  if (!video.poster && video.dataset.poster) video.poster = video.dataset.poster
  video.preload = 'auto'
  video.load()
}

// How far ahead (in timeline units) a scene's video starts loading.
const WARM_UP = 0.6

// Plays the video of each [data-play="from,to"] scene only while the timeline position t
// (in timeline units) is inside that window, and warms it up a little before. Keep the windows
// so that no more than two overlap. `warm: false` skips the warm-up (e.g. while the chapter is
// still far below and its progress just sits at 0).
export function syncSceneVideos(root, t, { warm = true } = {}) {
  root.querySelectorAll('[data-play]').forEach((scene) => {
    const [from, to] = scene.dataset.play.split(',').map(Number)
    const video = scene.querySelector('video')
    if (warm && t >= from - WARM_UP && t <= to) warmUpVideo(video)
    setVideoPlaying(video, t >= from && t <= to)
  })
}
