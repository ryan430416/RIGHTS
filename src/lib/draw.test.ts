import { describe, expect, it } from 'vitest'
import { CHARACTER_IDS } from './progress.ts'
import { canDraw, shuffleCards } from './draw.ts'

const identity = () => 0.999999

describe('shuffleCards', () => {
  it('keeps every card exactly once', () => {
    expect(shuffleCards(CHARACTER_IDS, identity).slice().sort()).toEqual(['A', 'B', 'C', 'D'])
  })

  it('is deterministic for a fixed random source', () => {
    expect(shuffleCards(['a', 'b', 'c', 'd'], () => 0)).toEqual(['b', 'c', 'd', 'a'])
  })
})

describe('canDraw', () => {
  it('only allows the leader to draw from the home screen', () => {
    expect(canDraw('home', false, true)).toBe(true)
    expect(canDraw('result', false, true)).toBe(false)
    expect(canDraw('summoning', false, true)).toBe(false)
    expect(canDraw('home', true, true)).toBe(false)
    expect(canDraw('home', false, false)).toBe(false)
  })
})
