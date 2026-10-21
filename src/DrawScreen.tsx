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
  onPhaseChange?: (phase: DrawPhase) => void
}

const browserProgressStore = localProgressStore()
const AMBIENT = [0, 1, 2, 3, 4, 5]
const SPARKS = [0, 1, 2, 3, 4, 5, 6, 7]

export function DrawScreen({
  random,
  revealDurationMs = REVEAL_DURATION_MS,
  store = browserProgressStore,
  tabId,
  forceLeader,
  onPhaseChange,
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
    onPhaseChange?.(phase)
  }, [phase, onPhaseChange])

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

  function confirmResult() {
    if (!isLeader || phase !== 'result' || locked.current) return
    const next = clearResult(progressRef.current)
    progressRef.current = next
    store.write(next)
    setProgress(next)
    setPhase('home')
  }

  const style = { '--reveal-ms': `${duration}ms` } as CSSProperties

  return (
    <div className={`draw draw-${phase}`} style={style}>
      {!isLeader ? (
        <div className="tab-lock" role="status">
          <p>抽卡已在另一個分頁進行中。</p>
          <p>請關閉此分頁，或回到主要抽卡視窗繼續操作。</p>
        </div>
      ) : null}

      <p className="visually-hidden" aria-live="polite">
        {phase === 'result' && drawn ? `已抽出${drawn.name}` : ''}
      </p>

      {isLeader ? (
        <>
          <header className={`brand-panel ${phase === 'result' ? 'is-faded' : ''}`}>
            <p className="brand-event">{TITLE.event}</p>
            <h1 className="brand-main">{TITLE.main}</h1>
            <p className="brand-sub">{TITLE.chinese}</p>
            <p className="brand-en">{TITLE.english}</p>

            {phase === 'home' ? (
              <div className="brand-actions">
                <p className="summon-invite">觸碰權流・召喚角色</p>
                <button
                  ref={actionRef}
                  type="button"
                  className="action-button action-button-draw"
                  disabled={!ready || !isLeader}
                  onClick={draw}
                >
                  {ready ? '開始抽卡' : '載入素材中…'}
                </button>
              </div>
            ) : null}

            {phase === 'summoning' ? <p className="summon-caption">權流匯聚中…</p> : null}
          </header>

          <section
            className={`arena arena-${phase}`}
            aria-label={phase === 'result' ? '抽卡結果' : '抽卡召喚'}
            aria-busy={flipping || undefined}
          >
            <div className="summon-focus">
              <div
                className={[
                  'card-slot',
                  phase === 'home' ? 'is-idle' : '',
                  flipping ? 'is-flipping' : '',
                  revealed && drawn ? 'is-revealed' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {phase === 'home' || flipping ? (
                  <>
                    {phase === 'home' ? <span className="card-beckon" aria-hidden="true" /> : null}
                    <span className={flipping ? 'card-ambient is-summoning' : 'card-ambient'} aria-hidden="true">
                      {AMBIENT.map((mote) => (
                        <span key={mote} className="card-ambient-mote" style={{ '--i': mote } as CSSProperties} />
                      ))}
                    </span>
                  </>
                ) : null}
                {flipping ? (
                  <>
                    <span className="card-burst" aria-hidden="true" />
                    <span className="card-flash" aria-hidden="true" />
                    <span className="card-rim" aria-hidden="true" />
                    <span className="card-sparks" aria-hidden="true">
                      {SPARKS.map((spark) => (
                        <span key={spark} className="card-spark" style={{ '--i': spark } as CSSProperties} />
                      ))}
                    </span>
                  </>
                ) : null}
                <div className="card-flipper">
                  <div className="card-face card-face-back">
                    <CardBack />
                  </div>
                  <div className="card-face card-face-front">
                    {drawn ? <CharacterCard card={drawn} prominent /> : null}
                  </div>
                </div>
              </div>

              {phase === 'result' && drawn ? (
                <button
                  ref={actionRef}
                  type="button"
                  className="action-button"
                  disabled={!isLeader}
                  onClick={confirmResult}
                >
                  確定
                </button>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
