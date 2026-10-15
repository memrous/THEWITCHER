import { CHOICES, LENGTH, SCAR } from '../lib/witcherChapterLayout'

// What sounds where (PLAN.md 9.2a). Each zone lasts from its start to the next one's.
// `at` – [chapter wrapper, timeline units]: the scroll position where that chapter's timeline
//        is at that moment (one unit = one viewport height of scrolling).
// `still` – where the zone starts with reduced motion, when the scenes are static sections:
//        a scene selector, or [chapter wrapper, sections] for chapter II (one screen each). The
//        zone switches when that section is half on screen.
export const ZONES = [
  // Gate → hero → Velen.
  { at: ['#journey', 0], still: null, music: 'geralt-of-rivia', amb: ['velen-wind-crows'] },
  // From the fog across Skellige and the map (the wind of Velen carries through the fog).
  { at: ['#journey', 3.4], still: '.fog-scene', music: 'fields-of-ard-skellig', amb: ['velen-wind-crows'] },
  { at: ['#journey', 6], still: '.sk-scene', music: 'fields-of-ard-skellig', amb: ['skellige-sea'] },
  // The harbour and Novigrad: the first theme comes back.
  { at: ['#journey', 11.1], still: '.port-scene', music: 'geralt-of-rivia', amb: ['novigrad-bells'] },
  // Witcher senses: the city falls silent, only the music stays.
  { at: ['#journey', 14.3], still: '.senses-scene', music: 'geralt-of-rivia', amb: [] },
  // Into the dark of chapter II.
  { at: ['#chapter-two', -0.5], still: ['#chapter-two', -0.5], music: 'silver-for-monsters', amb: ['dark-heartbeat'] },
  { at: ['#chapter-two', CHOICES], still: ['#chapter-two', 3], music: 'silver-for-monsters', amb: ['dark-heartbeat', 'choices-fire'] },
  { at: ['#chapter-two', SCAR], still: ['#chapter-two', 4], music: 'kaer-morhen', amb: ['dark-heartbeat'] },
  // The outro.
  { at: ['#chapter-two', LENGTH], still: ['#chapter-two', 5], music: 'kaer-morhen', amb: [] },
]
