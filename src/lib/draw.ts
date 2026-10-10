export const REVEAL_DURATION_MS = 2800

export type DrawPhase = 'select' | 'revealing' | 'result'

export function defaultRandom(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buffer = new Uint32Array(1)
    crypto.getRandomValues(buffer)
    return (buffer[0] ?? 0) / 4294967296
  }
  return Math.random()
}

/** Uniform shuffle. Each card is equally likely to land in any position. */
export function shuffleCards<T>(cards: readonly T[], random: () => number = defaultRandom): T[] {
  const next = cards.slice()
  for (let i = next.length - 1; i > 0; i -= 1) {
    const raw = random()
    const unit = raw <= 0 ? 0 : raw >= 1 ? 0.999999 : raw
    const j = Math.floor(unit * (i + 1))
    const current = next[i]
    next[i] = next[j] as T
    next[j] = current as T
  }
  return next
}

export function canPick(phase: DrawPhase, locked: boolean): boolean {
  return phase === 'select' && !locked
}
