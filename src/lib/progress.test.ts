import { describe, expect, it } from 'vitest'
import type { CharacterId } from '../config/cards.ts'
import {
  clearResult,
  commitDraw,
  createProgress,
  parseProgress,
  type DrawProgress,
} from './progress.ts'

const identity = () => 0.999999

function play(count: number, random: () => number = Math.random) {
  let progress = createProgress(random)
  const sequence: CharacterId[] = []
  for (let draw = 0; draw < count; draw += 1) {
    progress = commitDraw(clearResult(progress), random)
    if (!progress.result) throw new Error('missing result')
    sequence.push(progress.result)
  }
  return { progress, sequence }
}

describe('round progress', () => {
  it('gives each character once in every complete four-draw segment', () => {
    const { sequence, progress } = play(304)
    for (let start = 0; start < sequence.length; start += 4) {
      expect([...sequence.slice(start, start + 4)].sort()).toEqual(['A', 'B', 'C', 'D'])
    }
    expect(progress.counts).toEqual({ A: 76, B: 76, C: 76, D: 76 })
  })

  it('reaches equal counts at 300 and 600 draws', () => {
    expect(play(300).progress.counts).toEqual({ A: 75, B: 75, C: 75, D: 75 })
    expect(play(600).progress.counts).toEqual({ A: 150, B: 150, C: 150, D: 150 })
  })

  it('keeps working past 300 and 600 draws', () => {
    const after301 = play(301, identity)
    expect(after301.sequence).toHaveLength(301)
    expect(after301.progress.totalDraws).toBe(301)
    const after601 = play(601, identity)
    expect(after601.progress.totalDraws).toBe(601)
  })

  it('does not advance again while a result is still shown', () => {
    let progress = createProgress(identity)
    const first = commitDraw(progress, identity)
    const again = commitDraw(first, identity)
    expect(again).toEqual(first)
    expect(first.totalDraws).toBe(1)
    expect(first.counts.A).toBe(1)
  })

  it('restores the same result after refresh without counting twice', () => {
    const drawn = commitDraw(createProgress(identity), identity)
    const restored = parseProgress(JSON.parse(JSON.stringify(drawn))) as DrawProgress
    expect(restored).toEqual(drawn)
    expect(commitDraw(restored, identity)).toEqual(restored)
    const next = commitDraw(clearResult(restored), identity)
    expect(next.totalDraws).toBe(2)
    expect(next.result).toBe('B')
  })

  it('allows the same character across round boundaries', () => {
    const values = [0.999999, 0.999999, 0.999999, 0, 0.999999, 0.999999]
    let index = 0
    const random = () => values[index++] ?? 0.999999
    const { sequence } = play(5, random)
    expect(sequence.slice(0, 4)).toEqual(['A', 'B', 'C', 'D'])
    expect(sequence[4]).toBe('D')
  })
})
