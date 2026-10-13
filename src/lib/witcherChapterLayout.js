// Scroll layout of chapter II, shared by WitcherChapter and the placeholder App shows until the
// chapter is mounted (the placeholder must be exactly as tall, so nothing below it moves).

// Length of each scene in "screens" of scrolling (one unit = one viewport height). Every scene
// runs through the same phases: dark (0 → 0.1), emerge (0.1 → 0.35), hold (0.35 → 0.75),
// vanish (0.75 → 1). Contracts, Choices and Scar are longer – each has an accent in the hold.
export const SCENES = { path: 2, monsters: 2, contracts: 3, choices: 3, scar: 3 }

// Scene starts (timeline units).
export const PATH = 0
export const MONSTERS = PATH + SCENES.path
export const CONTRACTS = MONSTERS + SCENES.monsters
export const CHOICES = CONTRACTS + SCENES.contracts
export const SCAR = CHOICES + SCENES.choices
export const LENGTH = SCAR + SCENES.scar

// Height of the chapter: the sticky stage plus LENGTH screens of scrolling, or one static
// section per scene with reduced motion.
export const chapterHeight = (reducedMotion) =>
  reducedMotion ? `${Object.keys(SCENES).length * 100}svh` : `${(LENGTH + 1) * 100}svh`
