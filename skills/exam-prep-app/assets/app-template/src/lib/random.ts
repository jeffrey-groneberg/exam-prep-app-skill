/** Small deterministic PRNG (mulberry32) so exams and shuffles are reproducible in tests. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Stable hash of a string → 32-bit seed (FNV-1a). */
export function hashSeed(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * Shuffles items for display but guarantees the result differs from the given order
 * when possible, so an ordering question never starts out solved.
 */
export function shuffleAwayFrom<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  if (items.length < 2) return items.slice()
  for (let attempt = 0; attempt < 8; attempt++) {
    const s = shuffle(items, rng)
    if (s.some((v, i) => v !== items[i])) return s
  }
  const rotated = items.slice(1)
  rotated.push(items[0])
  return rotated
}
