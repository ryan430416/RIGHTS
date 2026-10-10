import { CompassIcon } from './CompassIcon.tsx'

export function CardBack() {
  return (
    <div className="card-back">
      <span className="card-back-star card-back-star-nw" />
      <span className="card-back-star card-back-star-ne" />
      <span className="card-back-star card-back-star-sw" />
      <span className="card-back-star card-back-star-se" />
      <CompassIcon className="card-back-compass" />
    </div>
  )
}
