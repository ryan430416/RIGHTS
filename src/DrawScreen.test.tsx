import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { DrawScreen } from './DrawScreen.tsx'

const stay = () => 0.999999

describe('DrawScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows one card back and the opening prompt', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '權流・溯源' })).toBeInTheDocument()
    expect(screen.getByText('溯其源，知其權')).toBeInTheDocument()
    expect(screen.getByText('TRACE THE SOURCE. KNOW YOUR RIGHTS.')).toBeInTheDocument()
    expect(screen.getByText('點選卡牌，開啟你的權益旅程。')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '選擇卡牌' })).toHaveLength(1)
    expect(document.querySelectorAll('img')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '全螢幕' })).toBeInTheDocument()
  })

  it('locks the round on the first pick and reveals that same card', async () => {
    render(<DrawScreen random={stay} revealDurationMs={2000} />)
    const card = screen.getByRole('button', { name: '選擇卡牌' })
    fireEvent.click(card)
    fireEvent.click(card)
    fireEvent.click(card)

    expect(screen.queryByRole('button', { name: '下一位' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1999)
    })
    expect(screen.queryByRole('button', { name: '下一位' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(screen.getAllByRole('img', { name: '卡片1' })).toHaveLength(1)
    expect(screen.queryByRole('img', { name: '卡片2' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '權流・溯源' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一位' })).toBeInTheDocument()
  })

  it('keeps the result after the reveal timer and does not draw again', async () => {
    let calls = 0
    const random = () => {
      calls += 1
      return 0.999999
    }
    render(<DrawScreen random={random} revealDurationMs={2000} />)
    expect(calls).toBe(3)

    const card = screen.getByRole('button', { name: '選擇卡牌' })
    fireEvent.click(card)
    fireEvent.click(card)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(calls).toBe(3)
    expect(screen.getByRole('img', { name: '卡片1' })).toBeInTheDocument()
  })

  it('reshuffles when the next person starts', async () => {
    const values = [0.999999, 0.999999, 0.999999, 0, 0, 0]
    let index = 0
    const random = () => values[index++] ?? 0.999999
    render(<DrawScreen random={random} revealDurationMs={0} />)

    fireEvent.click(screen.getByRole('button', { name: '選擇卡牌' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(screen.getByRole('img', { name: '卡片1' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '下一位' }))
    expect(screen.getByText('點選卡牌，開啟你的權益旅程。')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '選擇卡牌' })).toHaveLength(1)
    expect(document.querySelectorAll('img')).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: '選擇卡牌' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(screen.getByRole('img', { name: '卡片2' })).toBeInTheDocument()
  })

  it('shows the placeholder when a card image fails and still completes the draw', async () => {
    render(<DrawScreen random={stay} revealDurationMs={0} />)
    fireEvent.click(screen.getByRole('button', { name: '選擇卡牌' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    const image = document.querySelector('img')
    expect(image).not.toBeNull()
    fireEvent.error(image!)

    expect(screen.getByRole('img', { name: '卡片1' })).toHaveTextContent('圖片尚未載入')
    expect(screen.getByRole('button', { name: '下一位' })).toBeInTheDocument()
  })
})
