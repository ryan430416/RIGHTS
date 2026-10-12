import { CARD_DEFINITIONS } from '../config/cards.ts'
import type { CardDefinition } from '../config/cards.ts'
import { defaultRandom, shuffleCards } from './draw.ts'

export const CHARACTER_IDS = ['A', 'B', 'C', 'D'] as const

export type CharacterId = (typeof CHARACTER_IDS)[number]

export type DrawnResult = {
  character: CharacterId
  position: number
}

export type DrawProgress = {
  round: CharacterId[]
  nextIndex: number
  result: DrawnResult | null
}

export const PROGRESS_STORAGE_KEY = 'rights-draw-progress'

const CHARACTER_SET = new Set<string>(CHARACTER_IDS)

export function cardForCharacter(character: CharacterId): CardDefinition {
  return CARD_DEFINITIONS[CHARACTER_IDS.indexOf(character)] ?? CARD_DEFINITIONS[0]
}

export function createRound(random: () => number = defaultRandom): CharacterId[] {
  return shuffleCards(CHARACTER_IDS, random)
}

export function createProgress(random: () => number = defaultRandom): DrawProgress {
  return { round: createRound(random), nextIndex: 0, result: null }
}

export function drawAt(
  progress: DrawProgress,
  position: number,
  random: () => number = defaultRandom,
): DrawProgress {
  if (progress.result) return progress
  if (!Number.isInteger(position) || position < 0 || position > 3) return progress
  const character = progress.round[progress.nextIndex]
  if (!character) return progress
  const finished = progress.nextIndex + 1 >= progress.round.length
  return {
    round: finished ? createRound(random) : progress.round,
    nextIndex: finished ? 0 : progress.nextIndex + 1,
    result: { character, position },
  }
}

export function returnToBacks(progress: DrawProgress): DrawProgress {
  if (!progress.result) return progress
  return { round: progress.round, nextIndex: progress.nextIndex, result: null }
}

export function parseProgress(value: unknown): DrawProgress | null {
  if (!value || typeof value !== 'object') return null
  const record = value as { round?: unknown; nextIndex?: unknown; result?: unknown }
  if (!Array.isArray(record.round) || record.round.length !== 4) return null
  if (record.round.some((id) => typeof id !== 'string' || !CHARACTER_SET.has(id))) return null
  if (new Set(record.round).size !== 4) return null
  if (typeof record.nextIndex !== 'number' || !Number.isInteger(record.nextIndex)) return null
  if (record.nextIndex < 0 || record.nextIndex > 3) return null
  if (record.result == null) {
    return { round: record.round as CharacterId[], nextIndex: record.nextIndex, result: null }
  }
  if (!record.result || typeof record.result !== 'object') return null
  const result = record.result as { character?: unknown; position?: unknown }
  if (typeof result.character !== 'string' || !CHARACTER_SET.has(result.character)) return null
  if (typeof result.position !== 'number' || !Number.isInteger(result.position)) return null
  if (result.position < 0 || result.position > 3) return null
  return {
    round: record.round as CharacterId[],
    nextIndex: record.nextIndex,
    result: { character: result.character as CharacterId, position: result.position },
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
