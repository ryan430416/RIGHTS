import type { CharacterId } from '../config/cards.ts'
import { CARD_DEFINITIONS } from '../config/cards.ts'
import { defaultRandom, shuffleCards } from './draw.ts'

export const CHARACTER_IDS = CARD_DEFINITIONS.map((card) => card.id) as CharacterId[]

export type DrawProgress = {
  round: CharacterId[]
  nextIndex: number
  totalDraws: number
  counts: Record<CharacterId, number>
  result: CharacterId | null
}

export const PROGRESS_STORAGE_KEY = 'rights-draw-progress-v2'

const CHARACTER_SET = new Set<string>(CHARACTER_IDS)

function emptyCounts(): Record<CharacterId, number> {
  return { A: 0, B: 0, C: 0, D: 0 }
}

export function createRound(random: () => number = defaultRandom): CharacterId[] {
  return shuffleCards(CHARACTER_IDS, random)
}

export function createProgress(random: () => number = defaultRandom): DrawProgress {
  return {
    round: createRound(random),
    nextIndex: 0,
    totalDraws: 0,
    counts: emptyCounts(),
    result: null,
  }
}

/** Commit the next card before animation. Refresh must restore this same result. */
export function commitDraw(progress: DrawProgress, random: () => number = defaultRandom): DrawProgress {
  if (progress.result) return progress
  const character = progress.round[progress.nextIndex]
  if (!character) return progress
  const finished = progress.nextIndex + 1 >= progress.round.length
  return {
    round: finished ? createRound(random) : progress.round,
    nextIndex: finished ? 0 : progress.nextIndex + 1,
    totalDraws: progress.totalDraws + 1,
    counts: { ...progress.counts, [character]: progress.counts[character] + 1 },
    result: character,
  }
}

/** Clear the shown result so the next draw can begin. Does not reshuffle. */
export function clearResult(progress: DrawProgress): DrawProgress {
  if (!progress.result) return progress
  return { ...progress, result: null }
}

export function parseProgress(value: unknown): DrawProgress | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (!Array.isArray(record.round) || record.round.length !== 4) return null
  if (record.round.some((id) => typeof id !== 'string' || !CHARACTER_SET.has(id))) return null
  if (new Set(record.round).size !== 4) return null
  if (typeof record.nextIndex !== 'number' || !Number.isInteger(record.nextIndex)) return null
  if (record.nextIndex < 0 || record.nextIndex > 3) return null
  if (typeof record.totalDraws !== 'number' || !Number.isInteger(record.totalDraws) || record.totalDraws < 0) {
    return null
  }
  if (!record.counts || typeof record.counts !== 'object') return null
  const counts = emptyCounts()
  for (const id of CHARACTER_IDS) {
    const count = (record.counts as Record<string, unknown>)[id]
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) return null
    counts[id] = count
  }
  if (record.result != null && (typeof record.result !== 'string' || !CHARACTER_SET.has(record.result))) {
    return null
  }
  return {
    round: record.round as CharacterId[],
    nextIndex: record.nextIndex,
    totalDraws: record.totalDraws,
    counts,
    result: (record.result as CharacterId | null) ?? null,
  }
}

export type ProgressStore = {
  read: () => DrawProgress | null
  write: (progress: DrawProgress) => void
}

export function localProgressStore(): ProgressStore {
  return {
    read() {
      try {
        const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
        if (!raw) return null
        return parseProgress(JSON.parse(raw))
      } catch {
        return null
      }
    },
    write(progress) {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
    },
  }
}

export function memoryProgressStore(initial: DrawProgress | null = null): ProgressStore {
  let current = initial
  return {
    read: () => current,
    write(progress) {
      current = progress
    },
  }
}
