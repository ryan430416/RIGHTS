import { useState } from 'react'
import type { CardDefinition } from '../config/cards.ts'
import { CardPlaceholder } from './CardPlaceholder.tsx'

type CharacterCardProps = {
  card: CardDefinition
  prominent?: boolean
}

export function CharacterCard({ card, prominent = false }: CharacterCardProps) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const ready = loaded && !failed

  return (
    <div className={prominent ? 'character-card is-prominent' : 'character-card'}>
      {ready ? null : <CardPlaceholder label={card.name} />}
      {failed ? null : (
        <img
          className={ready ? 'card-image' : 'card-image is-pending'}
          src={card.src}
          alt={ready ? card.name : ''}
          aria-hidden={ready ? undefined : true}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
