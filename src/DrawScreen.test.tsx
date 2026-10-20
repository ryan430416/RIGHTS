import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DrawScreen } from './DrawScreen.tsx'
import {
  commitDraw,
  createProgress,
  memoryProgressStore,
  PROGRESS_STORAGE_KEY,
} from './lib/progress.ts'

const identity = () => 0.999999

async function flushReady() {
  await act(async () => {
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(0)
  })
}

describe('DrawScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('shows the summon stage with a start button and no duplicate visible titles', async () => {
    render(<DrawScreen random={identity} store={memoryProgressStore()} forceLeader tabId="home" />)
    expect(screen.getByRole('heading', { name: '權流・溯源', hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /開始抽卡|載入素材/ })).toBeInTheDocument()
    expect(document.querySelector('.card-back')).not.toBeNull()
    expect(document.querySelectorAll('h1:not(.visually-hidden)')).toHaveLength(0)
    await flushReady()
    expect(screen.getByRole('button', { name: '開始抽卡' })).toBeEnabled()
  })

  it('locks during the summon and reveals the committed card in place', async () => {
    const store = memoryProgressStore()
    render(<DrawScreen random={identity} revealDurationMs={1800} store={store} forceLeader tabId="t1" />)
    await flushReady()
    const start = screen.getByRole('button', { name: '開始抽卡' })
    fireEvent.click(start)
    fireEvent.click(start)

    expect(screen.queryByRole('button', { name: '再抽一次' })).not.toBeInTheDocument()
    expect(store.read()?.result).toBe('A')
    expect(store.read()?.totalDraws).toBe(1)
    expect(document.querySelector('.card-slot.is-flipping')).not.toBeNull()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1799)
    })
    expect(screen.queryByRole('button', { name: '再抽一次' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(screen.getByRole('img', { name: '守護騎士' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再抽一次' })).toBeInTheDocument()
  })

  it('starts the next draw from the result screen without a separate intro page', async () => {
    const progress = commitDraw(createProgress(identity), identity)
    const store = memoryProgressStore(progress)
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
    render(<DrawScreen random={() => 0} revealDurationMs={0} store={store} forceLeader tabId="t2" />)
    expect(screen.getByRole('img', { name: '守護騎士' })).toBeInTheDocument()
    expect(store.read()?.totalDraws).toBe(1)

    await flushReady()
    fireEvent.click(screen.getByRole('button', { name: '再抽一次' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(screen.getByRole('img', { name: '巡境遊俠' })).toBeInTheDocument()
    expect(store.read()?.totalDraws).toBe(2)
    expect(screen.queryByRole('button', { name: '開始抽卡' })).not.toBeInTheDocument()
  })

  it('locks a non-leader tab', () => {
    const store = memoryProgressStore()
    render(<DrawScreen random={identity} store={store} forceLeader={false} tabId="follower" />)
    expect(screen.getByText('抽卡已在另一個分頁進行中。')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '開始抽卡' })).not.toBeInTheDocument()
  })
})
