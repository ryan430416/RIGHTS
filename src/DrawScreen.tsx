import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Banner } from './components/Banner.tsx'
import { CardBack } from './components/CardBack.tsx'
import { CharacterCard } from './components/CharacterCard.tsx'
import { CARD_DEFINITIONS } from './config/cards.ts'
import type { CardDefinition } from './config/cards.ts'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.ts'
import { canPick, REVEAL_DURATION_MS, shuffleCards } from './lib/draw.ts'
import type { DrawPhase } from './lib/draw.ts'

type DrawScreenProps = {
  random?: () => number
  revealDurationMs?: number
}

const MOTES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const ORBIT = [0, 1, 2, 3, 4, 5, 6, 7]

export function DrawScreen({
  random,
  revealDurationMs = REVEAL_DURATION_MS,
}: DrawScreenProps) {
  const [deck, setDeck] = useState<CardDefinition[]>(() => shuffleCards(CARD_DEFINITIONS, random))
  const [phase, setPhase] = useState<DrawPhase>('select')
  const [drawn, setDrawn] = useState<CardDefinition | null>(null)
  const locked = useRef(false)
  const shouldFocusCard = useRef(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const duration = reducedMotion ? 0 : revealDurationMs
  const card = deck[0]

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
  }, [phase, deck])

  function pick() {
    if (!canPick(phase, locked.current) || !card) return
    locked.current = true
    setDrawn(card)
    setPhase('revealing')
  }

  function reset() {
    shouldFocusCard.current = true
    locked.current = false
    setDrawn(null)
    setDeck(shuffleCards(CARD_DEFINITIONS, random))
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
          <button ref={nextRef} type="button" className="next-button" onClick={reset}>
            確認
          </button>
        </section>
      ) : (
        <>
          <Banner />
          <div className="draw-body">
            <div className={drawing ? 'solo-card is-drawing' : 'solo-card'}>
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
