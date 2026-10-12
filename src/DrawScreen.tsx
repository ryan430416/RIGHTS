import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Banner } from './components/Banner.tsx'
import { CardBack } from './components/CardBack.tsx'
import { CharacterCard } from './components/CharacterCard.tsx'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.ts'
import { canPick, REVEAL_DURATION_MS } from './lib/draw.ts'
import type { DrawPhase } from './lib/draw.ts'
import {
  cardForCharacter,
  createProgress,
  drawAt,
  localProgressStore,
  returnToBacks,
} from './lib/progress.ts'
import type { DrawProgress, ProgressStore } from './lib/progress.ts'

type DrawScreenProps = {
  random?: () => number
  revealDurationMs?: number
  store?: ProgressStore
}

const MOTES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const ORBIT = [0, 1, 2, 3, 4, 5, 6, 7]
const browserProgressStore = localProgressStore()

export function DrawScreen({
  random,
  revealDurationMs = REVEAL_DURATION_MS,
  store = browserProgressStore,
}: DrawScreenProps) {
  const [progress, setProgress] = useState<DrawProgress>(() => store.read() ?? createProgress(random))
  const [phase, setPhase] = useState<DrawPhase>(progress.result ? 'result' : 'select')
  const locked = useRef(progress.result !== null)
  const shouldFocusCard = useRef(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLButtonElement>(null)
  const progressRef = useRef(progress)
  const reducedMotion = usePrefersReducedMotion()
  const duration = reducedMotion ? 0 : revealDurationMs
  const drawn = progress.result ? cardForCharacter(progress.result.character) : null

  useEffect(() => {
    progressRef.current = progress
    store.write(progress)
  }, [progress, store])

  useEffect(() => {
    if (phase !== 'revealing') return
    const timer = window.setTimeout(() => setPhase('result'), duration)
    return () => window.clearTimeout(timer)
  }, [phase, duration])

  useEffect(() => {
    if (phase === 'result') nextRef.current?.focus()
  }, [phase])

  useEffect(() => {
    if (phase !== 'select' || !shouldFocusCard.current) return
    shouldFocusCard.current = false
    cardRef.current?.focus()
  }, [phase, progress])

  function pick() {
    if (!canPick(phase, locked.current) || progressRef.current.result) return
    locked.current = true
    const next = drawAt(progressRef.current, 0, random)
    progressRef.current = next
    setProgress(next)
    setPhase('revealing')
  }

  function returnToSelect() {
    shouldFocusCard.current = true
    locked.current = false
    const next = returnToBacks(progressRef.current)
    progressRef.current = next
    setProgress(next)
    setPhase('select')
  }

  const style = { '--reveal-ms': `${duration}ms` } as CSSProperties
  const drawing = phase === 'revealing'

  return (
    <div className="draw" style={style}>
      <p className="visually-hidden" aria-live="polite">
        {phase === 'result' && drawn ? `已抽出${drawn.label}` : ''}
      </p>
      {phase === 'result' && drawn ? (
        <section className="result" aria-label="抽卡結果">
          <div className="result-stage">
            <div className="result-halo" aria-hidden="true" />
            <span className="result-sparks" aria-hidden="true">
              {MOTES.map((mote) => (
                <span key={mote} className="fx-mote" style={{ '--i': mote } as CSSProperties} />
              ))}
            </span>
            <CharacterCard card={drawn} prominent />
          </div>
          <button ref={nextRef} type="button" className="next-button" onClick={returnToSelect}>
            確認
          </button>
        </section>
      ) : (
        <>
          <Banner />
          <div className="draw-body">
            <div className={drawing ? 'solo-card is-drawing' : 'solo-card'}>
              <span className="solo-ambient" aria-hidden="true">
                <span className="ambient-pool" />
                <span className="ambient-ring" />
                <span className="ambient-ring ambient-ring-inner" />
                {ORBIT.map((star) => (
                  <span key={star} className="ambient-star" style={{ '--i': star } as CSSProperties} />
                ))}
              </span>
              {drawing ? (
                <span className="draw-fx" aria-hidden="true">
                  <span className="fx-pillar" />
                  <span className="fx-glow" />
                  <span className="fx-rays" />
                  <span className="fx-rays fx-rays-reverse" />
                  <span className="fx-orbit">
                    {ORBIT.map((star) => (
                      <span key={star} className="fx-orbit-star" style={{ '--i': star } as CSSProperties} />
                    ))}
                  </span>
                  <span className="fx-ring" />
                  <span className="fx-ring fx-ring-late" />
                  <span className="fx-ring fx-ring-last" />
                  {MOTES.map((mote) => (
                    <span key={`gather-${mote}`} className="fx-mote fx-gather" style={{ '--i': mote } as CSSProperties} />
                  ))}
                  {MOTES.map((mote) => (
                    <span key={mote} className="fx-mote" style={{ '--i': mote } as CSSProperties} />
                  ))}
                </span>
              ) : null}
              <button
                ref={cardRef}
                type="button"
                className="card-button"
                aria-label="選擇卡牌"
                aria-disabled={phase !== 'select'}
                tabIndex={phase === 'select' ? 0 : -1}
                onClick={pick}
              >
                <span className="card-tilt">
                  <span className="card-inner">
                    <span className="card-face card-face-back">
                      <CardBack />
                    </span>
                    <span className="card-face card-face-front" aria-hidden={!drawing}>
                      {drawing && drawn ? <CharacterCard card={drawn} /> : null}
                    </span>
                  </span>
                </span>
                {drawing ? <span className="card-shimmer" /> : null}
              </button>
            </div>
            <p id="draw-prompt" className={drawing ? 'prompt is-dim' : 'prompt'}>
              點選卡牌，開啟你的權益旅程。
            </p>
          </div>
        </>
      )}
    </div>
  )
}
