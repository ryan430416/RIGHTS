import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { CharacterCard } from './components/CharacterCard.tsx'
import { cardById, TITLE, VISUALS } from './config/cards.ts'
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
}

const browserProgressStore = localProgressStore()

export function DrawScreen({
  random,
  revealDurationMs = REVEAL_DURATION_MS,
  store = browserProgressStore,
  tabId,
  forceLeader,
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

  useEffect(() => {
    progressRef.current = progress
    store.write(progress)
  }, [progress, store])

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

  function draw() {
    if (!canDraw(phase, locked.current, isLeader)) return
    locked.current = true
    const base = progressRef.current.result ? clearResult(progressRef.current) : progressRef.current
    const next = commitDraw(base, random)
    progressRef.current = next
    store.write(next)
    setProgress(next)
    setPhase('summoning')
  }

  const style = { '--reveal-ms': `${duration}ms` } as CSSProperties

  return (
    <div className="draw" style={style}>
      {!isLeader ? (
        <div className="tab-lock" role="status">
          <p>抽卡已在另一個分頁進行中。</p>
          <p>請關閉此分頁，或回到主要抽卡視窗繼續操作。</p>
        </div>
      ) : null}

      <p className="visually-hidden" aria-live="polite">
        {phase === 'result' && drawn ? `已抽出${drawn.name}` : ''}
      </p>

      {isLeader && phase === 'home' ? (
        <section className="home" aria-label="活動首頁">
          <div className="home-copy">
            <p className="home-kicker">學生權益週</p>
            <h1>{TITLE.main}</h1>
            <p className="home-chinese">{TITLE.chinese}</p>
            <p className="home-english">{TITLE.english}</p>
            <button
              ref={actionRef}
              type="button"
              className="action-button"
              disabled={!ready || !isLeader}
              onClick={draw}
            >
              {ready ? '開始抽卡' : '載入素材中…'}
            </button>
          </div>
          <div className="home-art">
            <img src={VISUALS.portal} alt="" />
          </div>
        </section>
      ) : null}

      {isLeader && phase === 'summoning' ? (
        <section className="summon" aria-label="抽卡動畫" aria-busy="true">
          <div className="summon-stage">
            <span className="summon-portal" />
            <span className="summon-ring" />
            <span className="summon-ring summon-ring-late" />
            <span className="summon-spark" />
            {drawn ? (
              <div className="summon-card">
                <CharacterCard card={drawn} prominent />
              </div>
            ) : null}
          </div>
          <p className="summon-caption">權流匯聚中…</p>
        </section>
      ) : null}

      {isLeader && phase === 'result' && drawn ? (
        <section className="result" aria-label="抽卡結果">
          <div className="result-stage">
            <span className="result-glow" aria-hidden="true" />
            <CharacterCard card={drawn} prominent />
          </div>
          <button
            ref={actionRef}
            type="button"
            className="action-button"
            disabled={!isLeader}
            onClick={draw}
          >
            再抽一次
          </button>
        </section>
      ) : null}
    </div>
  )
}
