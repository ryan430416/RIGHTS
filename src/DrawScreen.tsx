import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { CardBack } from './components/CardBack.tsx'
import { CharacterCard } from './components/CharacterCard.tsx'
import { cardById, TITLE } from './config/cards.ts'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.ts'
import { canDraw, REVEAL_DURATION_MS } from './lib/draw.ts'
import type { DrawPhase } from './lib/draw.ts'
import { preloadSiteAssets } from './lib/preload.ts'
import {
  clearResult,
  commitDraw,
  createProgress,
  localProgressStore,
} from './lib/progress.ts'
import type { DrawProgress, ProgressStore } from './lib/progress.ts'
import { claimTabLeadership, createTabId } from './lib/tabLock.ts'

type DrawScreenProps = {
  random?: () => number
  revealDurationMs?: number
  store?: ProgressStore
  tabId?: string
  forceLeader?: boolean
  onDimChange?: (dimmed: boolean) => void
}

const browserProgressStore = localProgressStore()
const AMBIENT = [0, 1, 2, 3, 4, 5]

export function DrawScreen({
  random,
  revealDurationMs = REVEAL_DURATION_MS,
  store = browserProgressStore,
  tabId,
  forceLeader,
  onDimChange,
}: DrawScreenProps) {
  const [progress, setProgress] = useState<DrawProgress>(() => store.read() ?? createProgress(random))
  const [phase, setPhase] = useState<DrawPhase>(() => (progress.result ? 'result' : 'home'))
  const [ready, setReady] = useState(false)
  const [electedLeader, setElectedLeader] = useState(true)
  const locked = useRef(false)
  const progressRef = useRef(progress)
  const actionRef = useRef<HTMLButtonElement>(null)
  const ownTabId = useRef(tabId ?? createTabId())
  const reducedMotion = usePrefersReducedMotion()
  const duration = reducedMotion ? 0 : revealDurationMs
  const drawn = progress.result ? cardById(progress.result) : null
  const isLeader = forceLeader ?? electedLeader
  const flipping = phase === 'summoning'
  const revealed = phase === 'result' || phase === 'summoning'

  useEffect(() => {
    progressRef.current = progress
    store.write(progress)
  }, [progress, store])

  useEffect(() => {
    onDimChange?.(phase === 'result')
  }, [phase, onDimChange])

  useEffect(() => {
    let cancelled = false
    void preloadSiteAssets().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (forceLeader != null) return
    return claimTabLeadership(ownTabId.current, setElectedLeader)
  }, [forceLeader])

  useEffect(() => {
    if (phase !== 'summoning') return
    const timer = window.setTimeout(() => {
      locked.current = false
      setPhase('result')
    }, duration)
    return () => window.clearTimeout(timer)
  }, [phase, duration])

  useEffect(() => {
    if (phase === 'home' || phase === 'result') actionRef.current?.focus()
  }, [phase])

  function beginDraw() {
    locked.current = true
    const base = progressRef.current.result ? clearResult(progressRef.current) : progressRef.current
    const next = commitDraw(base, random)
    progressRef.current = next
    store.write(next)
    setProgress(next)
    setPhase('summoning')
  }

  function draw() {
    if (!canDraw(phase, locked.current, isLeader) || progressRef.current.result) return
    beginDraw()
  }

  function drawAgain() {
    if (!isLeader || phase !== 'result' || locked.current) return
    beginDraw()
  }

  const style = { '--reveal-ms': `${duration}ms` } as CSSProperties

  return (
    <div className={phase === 'result' ? 'draw is-result' : 'draw'} style={style}>
      {!isLeader ? (
        <div className="tab-lock" role="status">
          <p>抽卡已在另一個分頁進行中。</p>
          <p>請關閉此分頁，或回到主要抽卡視窗繼續操作。</p>
        </div>
      ) : null}

      <h1 className="visually-hidden">{TITLE.main}</h1>
      <p className="visually-hidden">{TITLE.chinese}</p>
      <p className="visually-hidden">{TITLE.english}</p>
      <p className="visually-hidden" aria-live="polite">
        {phase === 'result' && drawn ? `已抽出${drawn.name}` : ''}
      </p>

      {isLeader ? (
        <section
          className={`arena arena-${phase}`}
          aria-label={phase === 'result' ? '抽卡結果' : '抽卡召喚'}
          aria-busy={flipping || undefined}
        >
          <div className="summon-focus">
            <div
              className={[
                'card-slot',
                flipping ? 'is-flipping' : '',
                revealed && drawn ? 'is-revealed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {phase === 'home' ? (
                <span className="card-ambient" aria-hidden="true">
                  {AMBIENT.map((mote) => (
                    <span key={mote} className="card-ambient-mote" style={{ '--i': mote } as CSSProperties} />
                  ))}
                </span>
              ) : null}
              {flipping ? <span className="card-rim" aria-hidden="true" /> : null}
              <div className="card-flipper">
                <div className="card-face card-face-back">
                  <CardBack />
                </div>
                <div className="card-face card-face-front">
                  {drawn ? <CharacterCard card={drawn} prominent /> : null}
                </div>
              </div>
            </div>

            {phase === 'home' ? (
              <button
                ref={actionRef}
                type="button"
                className="action-button"
                disabled={!ready || !isLeader}
                onClick={draw}
              >
                {ready ? '開始抽卡' : '載入素材中…'}
              </button>
            ) : null}

            {phase === 'summoning' ? <p className="summon-caption">權流匯聚中…</p> : null}

            {phase === 'result' && drawn ? (
              <button
                ref={actionRef}
                type="button"
                className="action-button"
                disabled={!isLeader}
                onClick={drawAgain}
              >
                再抽一次
              </button>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  )
}
