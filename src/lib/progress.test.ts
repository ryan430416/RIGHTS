import { describe, expect, it } from 'vitest'
import {
  createProgress,
  drawAt,
  memoryProgressStore,
  parseProgress,
  returnToBacks,
  type CharacterId,
  type DrawProgress,
} from './progress.ts'

const identity = () => 0.999999

function play(count: number, random: () => number = Math.random) {
  let progress = createProgress(random)
  const sequence: CharacterId[] = []
  for (let draw = 0; draw < count; draw += 1) {
    progress = drawAt(progress, draw % 4, random)
    const result = progress.result
    if (!result) throw new Error('draw produced no result')
    sequence.push(result.character)
    progress = returnToBacks(progress)
  }
  return { progress, sequence }
}

describe('round progress', () => {
  it('gives each character once in every complete four-draw segment', () => {
    const { sequence } = play(304)
    expect(sequence).toHaveLength(304)
    for (let start = 0; start < sequence.length; start += 4) {
      expect([...sequence.slice(start, start + 4)].sort()).toEqual(['A', 'B', 'C', 'D'])
    }
    const counts = { A: 0, B: 0, C: 0, D: 0 }
    for (const character of sequence) counts[character] += 1
    expect(counts).toEqual({ A: 76, B: 76, C: 76, D: 76 })
  })

  it('still draws on the 301st pull and does not reshuffle inside a round', () => {
    const { sequence, progress } = play(301, identity)
    expect(sequence[300]).toBe('A')
    expect(sequence.slice(0, 4)).toEqual(['A', 'B', 'C', 'D'])
    expect(sequence.slice(296, 300)).toEqual(['A', 'B', 'C', 'D'])
    expect(progress.nextIndex).toBe(1)
    expect(progress.round).toEqual(['A', 'B', 'C', 'D'])
    expect(progress.result).toBeNull()
  })

  it('allows the same character where two rounds meet', () => {
    const values = [0.999999, 0.999999, 0.999999, 0, 0.999999, 0.999999]
    let index = 0
    const random = () => values[index++] ?? 0.999999
    const { sequence } = play(5, random)
    expect(sequence.slice(0, 4)).toEqual(['A', 'B', 'C', 'D'])
    expect(sequence[4]).toBe('D')
  })

  it('advances once per draw and ignores a second pick or next-person return', () => {
    let progress = createProgress(identity)
    const first = drawAt(progress, 3, identity)
    const repeated = drawAt(first, 0, identity)
    expect(repeated).toEqual(first)
    expect(first.result).toEqual({ character: 'A', position: 3 })
    expect(first.nextIndex).toBe(1)
    expect(first.round).toEqual(['A', 'B', 'C', 'D'])

    const returned = returnToBacks(first)
    expect(returned.result).toBeNull()
    expect(returned.round).toEqual(first.round)
    expect(returned.nextIndex).toBe(1)

    const second = drawAt(returned, 1, identity)
    expect(second.result).toEqual({ character: 'B', position: 1 })
    expect(returnToBacks(returned)).toEqual(returned)
  })

  it('restores the same result after a refresh without drawing again', () => {
    const store = memoryProgressStore()
    const drawn = drawAt(createProgress(identity), 2, identity)
    store.write(drawn)
    const restored = parseProgress(JSON.parse(JSON.stringify(store.read())))
    expect(restored).toEqual(drawn)
    expect(drawAt(restored as DrawProgress, 0, identity)).toEqual(restored)
  })
})
