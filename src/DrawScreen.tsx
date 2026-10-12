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
const POSITIONS = [0, 1, 2, 3]
const SLOT_LABELS = ['選擇第 1 張卡牌', '選擇第 2 張卡牌', '選擇第 3 張卡牌', '選擇第 4 張卡牌']
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
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([])
  const progressRef = useRef(progress)
  const reducedMotion = usePrefersReducedMotion()
  const duration = reducedMotion ? 0 : revealDurationMs
  const drawn = progress.result ? cardForCharacter(progress.result.character) : null
  const chosenPosition = progress.result?.position ?? null

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
    cardRefs.current[0]?.focus()
  }, [phase, progress])

  function pick(position: number) {
    if (!canPick(phase, locked.current) || progressRef.current.result) return
    locked.current = true
    const next = drawAt(progressRef.current, position, random)
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

  function moveFocus(index: number, key: string) {
    const columns = window.matchMedia('(max-width: 900px)').matches ? 2 : 4
    const delta =
      key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : key === 'ArrowDown' ? columns : key === 'ArrowUp' ? -columns : 0
    if (delta === 0) return
    const next = (index + delta + POSITIONS.length) % POSITIONS.length
    cardRefs.current[next]?.focus()
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
            下一位
          </button>
        </section>
      ) : (
        <>
          <Banner />
          <div className="draw-body">
            <div className={drawing ? 'card-grid is-locked' : 'card-grid'} role="group" aria-describedby="draw-prompt">
              <span className="solo-ambient" aria-hidden="true">
                <span className="ambient-pool" />
                <span className="ambient-ring" />
                <span className="ambient-ring ambient-ring-inner" />
              </span>
              {POSITIONS.map((position) => {
                const chosen = drawing && chosenPosition === position
                const dimmed = drawing && chosenPosition !== position
                const className = ['card-button', chosen ? 'is-drawing' : '', dimmed ? 'is-dimmed' : '']
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button
                    key={position}
                    ref={(node) => {
                      cardRefs.current[position] = node
                    }}
                    type="button"
                    className={className}
                    aria-label={SLOT_LABELS[position]}
                    aria-disabled={phase !== 'select'}
                    tabIndex={phase === 'select' ? 0 : -1}
                    onClick={() => pick(position)}
                    onKeyDown={(event) => {
                      if (phase !== 'select') return
                      if (
                        event.key === 'ArrowRight' ||
                        event.key === 'ArrowLeft' ||
                        event.key === 'ArrowDown' ||
                        event.key === 'ArrowUp'
                      ) {
                        event.preventDefault()
                        moveFocus(position, event.key)
                      }
                    }}
                  >
                    {chosen ? (
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
                          <span
                            key={`gather-${mote}`}
                            className="fx-mote fx-gather"
                            style={{ '--i': mote } as CSSProperties}
                          />
                        ))}
                        {MOTES.map((mote) => (
                          <span key={mote} className="fx-mote" style={{ '--i': mote } as CSSProperties} />
                        ))}
                      </span>
                    ) : null}
                    <span className="card-tilt">
                      <span className="card-inner">
                        <span className="card-face card-face-back">
                          <CardBack />
                        </span>
                        <span className="card-face card-face-front" aria-hidden={!chosen}>
                          {chosen && drawn ? <CharacterCard card={drawn} /> : null}
                        </span>
                      </span>
                    </span>
                    {chosen ? <span className="card-shimmer" /> : null}
                  </button>
                )
              })}
            </div>
            <p id="draw-prompt" className={drawing ? 'prompt is-dim' : 'prompt'}>
              選擇一張卡牌，開啟你的權益旅程。
            </p>
          </div>
        </>
      )}
    </div>
  )
}
