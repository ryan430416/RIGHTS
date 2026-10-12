import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { DrawScreen } from './DrawScreen.tsx'
import { createProgress, drawAt, memoryProgressStore, PROGRESS_STORAGE_KEY } from './lib/progress.ts'

const identity = () => 0.999999

describe('DrawScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('shows four card backs and no assigned characters', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '權流・溯源' })).toBeInTheDocument()
    expect(screen.getByText('選擇一張卡牌，開啟你的權益旅程。')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /選擇第/ })).toHaveLength(4)
    expect(document.querySelectorAll('img')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '全螢幕' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '下一位' })).not.toBeInTheDocument()
  })

  it('locks the first click and reveals the next character at the chosen position', async () => {
    const store = memoryProgressStore()
    render(<DrawScreen random={identity} revealDurationMs={2000} store={store} />)
    const cards = screen.getAllByRole('button', { name: /選擇第/ })
    fireEvent.click(cards[2]!)
    fireEvent.click(cards[2]!)
    fireEvent.click(cards[0]!)

    expect(screen.queryByRole('button', { name: '下一位' })).not.toBeInTheDocument()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(screen.getByRole('img', { name: '卡片1' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: '卡片2' })).not.toBeInTheDocument()
    expect(store.read()?.result).toEqual({ character: 'A', position: 2 })
    expect(store.read()?.nextIndex).toBe(1)
  })

  it('returns to the backs without reshuffling or drawing again', async () => {
    const store = memoryProgressStore()
    const view = render(<DrawScreen random={identity} revealDurationMs={0} store={store} />)
    fireEvent.click(screen.getAllByRole('button', { name: /選擇第/ })[1]!)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    const savedRound = store.read()?.round

    fireEvent.click(screen.getByRole('button', { name: '下一位' }))
    expect(screen.getAllByRole('button', { name: /選擇第/ })).toHaveLength(4)
    expect(document.querySelectorAll('img')).toHaveLength(0)
    expect(store.read()).toMatchObject({ round: savedRound, nextIndex: 1, result: null })

    fireEvent.click(screen.getAllByRole('button', { name: /選擇第/ })[0]!)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(screen.getByRole('img', { name: '卡片2' })).toBeInTheDocument()

    view.unmount()
    render(<DrawScreen random={identity} revealDurationMs={0} store={store} />)
    expect(screen.getByRole('img', { name: '卡片2' })).toBeInTheDocument()
    expect(store.read()?.nextIndex).toBe(2)
    expect(screen.queryByRole('img', { name: '卡片3' })).not.toBeInTheDocument()
  })

  it('continues the saved result when the page reloads during the reveal', () => {
    const progress = drawAt(createProgress(identity), 3, identity)
    const store = memoryProgressStore(progress)
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))

    render(<DrawScreen random={() => 0} store={store} />)
    expect(screen.getByRole('img', { name: '卡片1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一位' })).toBeInTheDocument()
    expect(store.read()).toEqual(progress)
  })
})
