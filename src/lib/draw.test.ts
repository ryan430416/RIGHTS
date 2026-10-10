import { describe, expect, it } from 'vitest'
import { CARD_DEFINITIONS } from '../config/cards.ts'
import { canPick, shuffleCards } from './draw.ts'

const identityRandom = () => 0.999999

describe('shuffleCards', () => {
  it('keeps every card exactly once', () => {
    const shuffled = shuffleCards(CARD_DEFINITIONS, identityRandom)
    expect(shuffled.map((card) => card.id).sort()).toEqual(
      CARD_DEFINITIONS.map((card) => card.id).sort(),
    )
  })

  it('is deterministic for a fixed random source', () => {
    expect(shuffleCards(CARD_DEFINITIONS, identityRandom).map((card) => card.id)).toEqual(
      shuffleCards(CARD_DEFINITIONS, identityRandom).map((card) => card.id),
    )
    expect(shuffleCards(['a', 'b', 'c', 'd'], () => 0)).toEqual(['b', 'c', 'd', 'a'])
  })

  it('gives each card about a 25% chance at the chosen position', () => {
    const counts = new Map<string, number>()
    const trials = 4000
    for (let trial = 0; trial < trials; trial += 1) {
      const top = shuffleCards(CARD_DEFINITIONS)[0]
      counts.set(top.id, (counts.get(top.id) ?? 0) + 1)
    }
    for (const card of CARD_DEFINITIONS) {
      const count = counts.get(card.id) ?? 0
      expect(count).toBeGreaterThan(800)
      expect(count).toBeLessThan(1200)
    }
  })
})

describe('canPick', () => {
  it('allows one pick only while the round is open and unlocked', () => {
    expect(canPick('select', false)).toBe(true)
    expect(canPick('select', true)).toBe(false)
    expect(canPick('revealing', false)).toBe(false)
    expect(canPick('result', false)).toBe(false)
  })
})
