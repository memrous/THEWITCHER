// Plays or pauses a video only when the requested state changes.
// The state is remembered on the element: a not-yet-loaded autoplay video reports paused,
// so it must be paused explicitly or it would start on its own later.
export function setVideoPlaying(video, playing) {
  if (!video) return
  const state = playing ? 'play' : 'pause'
  if (video.dataset.state === state) return
  video.dataset.state = state
  if (playing) video.play().catch(() => {})
  else video.pause()
}
