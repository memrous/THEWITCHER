import { gsap } from '../lib/gsap'
import { getLenis } from '../lib/lenis'

// Sound of the site (Howler). Nothing is created – and nothing can play – until enableAudio() is
// called from a click (the gate's "Enter with sound" or the medallion).
//
// Three layers: music (one track per part of the journey, crossfaded over 3 s, at most two at
// once), ambient loops (crossfaded over 2 s, at most two at once, each with its own level set by
// its scene) and one-shot effects. The files are loudness-matched (see PLAN.md 9.2a), so the
// base volumes below are enough.
//
// Music is streamed (html5) – decoded it would take tens of MB each. Its element is routed into
// Web Audio once it plays (a gain node instead of the element volume, which iOS ignores; the
// master then carries it to mute and to the analyser of the medallion). Loops and effects are
// decoded Web Audio, so loops have no gap.

// Howler itself is loaded apart from the page (it is not needed for the first paint): the gate
// starts it and opens only once it is here, so the click can still start the sound.
let Howl = null
let Howler = null
let loading = null
export function loadAudio() {
  loading ??= import('howler').then((module) => {
    const howler = module.Howl ? module : module.default
    Howl = howler.Howl
    Howler = howler.Howler
    // Howler creates its audio context on import and suspends it after 30 s without a Web Audio
    // sound. That timer survives the context being replaced at the first click and would silence
    // the streamed music routed through it – so the context is never suspended on its own.
    Howler.autoSuspend = false
  })
  return loading
}

const BASE = `${import.meta.env.BASE_URL}audio/`
const src = (path) => [`${BASE}${path}.webm`, `${BASE}${path}.mp3`]

const VOLUME = { music: 0.7, amb: 0.35, sfx: 0.6 }
const FADE = { music: 3, amb: 2 }
// Fast scroll: the music steps back to 60 % until the scroll calms down.
const FAST_SCROLL = 30
const DUCK = 0.6
// The heartbeat is nearly all below 150 Hz, which small speakers barely play – at the plain
// ambient volume it disappears under the music (loudness-matched or not).
const BOOST = { 'dark-heartbeat': 2.5 }
// Faster than this (an indicator trip) the effects of the scenes flown past stay silent.
const FLYING = 80

export const SFX = ['gate-thud', 'gate-creak', 'paper-rustle', 'quill-writing', 'wax-seal', 'sword-slash']

// Fades belong to the engine, not to whatever component happened to start them: created inside
// a useGSAP context (the gate's click), they would be reverted – back to silence – when that
// component unmounts. So they are always made outside any context.
const detached = gsap.context(() => {})
function loose(make) {
  let made = null
  detached.ignore(() => {
    made = make()
  })
  return made
}

let enabled = false
let muted = false
let hidden = false
const listeners = new Set()

const channels = new Map()
const levels = new Map()
const effects = new Map()
const duck = { value: 1 }
let wanted = { music: null, amb: [] }
let current = { music: null, amb: [] }
let analyser = null
let samples = null

// --- state for React (AudioProvider) -------------------------------------------------------

let snapshot = { enabled, muted }
const emit = () => {
  snapshot = { enabled, muted }
  listeners.forEach((fn) => fn())
}
export const subscribeAudio = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const getAudioState = () => snapshot

// --- channels (music and ambient loops) ----------------------------------------------------

const volumeOf = (ch) =>
  VOLUME[ch.kind] * (BOOST[ch.name] ?? 1) * ch.gain * (levels.get(ch.name) ?? 1) * (ch.kind === 'music' ? duck.value : 1)

function apply(ch) {
  const v = volumeOf(ch)
  if (ch.node) ch.node.gain.value = v
  else ch.howl.volume(v)
}

function getChannel(kind, name) {
  const key = `${kind}/${name}`
  if (!channels.has(key)) {
    const howl = new Howl({ src: src(key), loop: true, html5: kind === 'music', volume: 0 })
    // Howler "unlocks" streamed sounds on the next click or key press by reloading their
    // element – which would stop a track already playing. Ours are created after a click, so
    // they count as unlocked.
    howl._sounds.forEach((sound) => {
      if (sound._node) sound._node._unlocked = true
    })
    channels.set(key, { kind, name, howl, gain: 0, target: 0, id: null, node: null })
  }
  return channels.get(key)
}

// Routes a streamed track through its own gain node into the master (so mute and the analyser
// cover it like everything else). If the browser refuses, the track simply keeps using the
// element volume.
function tap(ch) {
  if (ch.node || ch.tapFailed || !Howler?.ctx) return
  try {
    const element = ch.howl._sounds[0]?._node
    if (!element) return
    const source = Howler.ctx.createMediaElementSource(element)
    const gain = Howler.ctx.createGain()
    source.connect(gain)
    gain.connect(Howler.masterGain)
    ch.node = gain
    ch.howl.volume(1)
    apply(ch)
  } catch {
    ch.tapFailed = true
  }
}

function fadeTo(ch, target, duration) {
  if (ch.target === target && (target > 0 || ch.gain === 0)) return
  ch.target = target
  if (target > 0 && !ch.howl.playing(ch.id ?? undefined)) {
    ch.id = ch.howl.play(ch.id ?? undefined)
    if (ch.kind === 'music') tap(ch)
  }
  loose(() =>
    gsap.to(ch, {
      gain: target,
      duration,
      ease: 'sine.inOut',
      overwrite: true,
      onUpdate: () => apply(ch),
      onComplete: () => {
        if (ch.target === 0) ch.howl.pause(ch.id ?? undefined)
      },
    }),
  )
}

// Brings the layers to what the current place on the page asks for.
function mix() {
  if (!enabled) return
  // Just in case the browser suspended the context (allowed again after the first click).
  if (Howler?.ctx?.state === 'suspended') Howler.ctx.resume?.()
  const before = current
  current = { music: wanted.music, amb: [...wanted.amb] }

  // Music: the new track fades in, the previous one out; anything older leaves at once.
  if (current.music) fadeTo(getChannel('music', current.music), 1, FADE.music)
  channels.forEach((ch) => {
    if (ch.kind !== 'music' || ch.name === current.music) return
    fadeTo(ch, 0, ch.name === before.music ? FADE.music : 0.4)
  })

  // Ambient: the same, the loops of this place in, those of the last one out.
  current.amb.forEach((name) => fadeTo(getChannel('amb', name), 1, FADE.amb))
  channels.forEach((ch) => {
    if (ch.kind !== 'amb' || current.amb.includes(ch.name)) return
    fadeTo(ch, 0, before.amb.includes(ch.name) ? FADE.amb : 0.4)
  })
}

// --- public API --------------------------------------------------------------------------------

// What should sound here: one music track (or null) and up to two ambient loops.
// Called by SoundScape as the page scrolls; remembered while sound is off.
export function setSoundscape(music, amb = []) {
  if (wanted.music === music && wanted.amb.join() === amb.join()) return
  wanted = { music, amb: amb.slice(0, 2) }
  mix()
}

// Level (0–1) of one track or loop within its scene, e.g. the fire grows as darkness wins.
export function setLevel(name, level) {
  if (levels.get(name) === level) return
  levels.set(name, level)
  channels.forEach((ch) => ch.name === name && apply(ch))
}

// One-shot effect. `volume` scales the effect's base volume.
export function sfx(name, { volume = 1 } = {}) {
  if (!enabled) return
  const howl = effects.get(name)
  if (!howl) return
  const id = howl.play()
  howl.volume(VOLUME.sfx * volume, id)
}

// A short buzz (Android) – only for visitors who chose sound and have it on.
export function haptic(ms = 30) {
  if (enabled && !muted) navigator.vibrate?.(ms)
}

// True while the page is flying past (an indicator trip): scene effects are skipped then.
export function isFlying() {
  return Math.abs(getLenis()?.velocity ?? 0) > FLYING
}

// Loudness (0–1) of what plays right now – for the medallion.
export function getLoudness() {
  if (!analyser || !enabled || muted || hidden) return 0
  analyser.getByteTimeDomainData(samples)
  let sum = 0
  for (let i = 0; i < samples.length; i++) {
    const v = (samples[i] - 128) / 128
    sum += v * v
  }
  return Math.min(1, Math.sqrt(sum / samples.length) * 4)
}

export function setMuted(value) {
  muted = value
  Howler?.mute(muted || hidden)
  emit()
}

let duckRestore = null
function onScroll({ velocity }) {
  if (Math.abs(velocity) < FAST_SCROLL) return
  if (duck.value === 1 || !duckRestore) {
    loose(() => gsap.to(duck, { value: DUCK, duration: 0.4, overwrite: true, onUpdate: applyMusic }))
  }
  duckRestore?.kill()
  duckRestore = loose(() =>
    gsap.delayedCall(0.3, () => {
      duckRestore = null
      gsap.to(duck, { value: 1, duration: 0.4, overwrite: true, onUpdate: applyMusic })
    }),
  )
}
const applyMusic = () => channels.forEach((ch) => ch.kind === 'music' && apply(ch))

const onVisibility = () => {
  hidden = document.hidden
  Howler?.mute(muted || hidden)
}

// Turns sound on. Must be called from a click (browsers allow audio only after one).
export function enableAudio() {
  if (!Howler) return
  if (enabled) {
    setMuted(false)
    return
  }
  enabled = true
  muted = false
  Howler.mute(false)

  SFX.forEach((name) => effects.set(name, new Howl({ src: src(`sfx/${name}`) })))
  // The first Howl created the audio context; resume it while still inside the click.
  if (Howler.ctx) {
    Howler.ctx.resume?.()
    analyser = Howler.ctx.createAnalyser()
    analyser.fftSize = 512
    samples = new Uint8Array(analyser.fftSize)
    Howler.masterGain.connect(analyser)
  }

  getLenis()?.on('scroll', onScroll)
  document.addEventListener('visibilitychange', onVisibility)
  emit()
  mix()
}
