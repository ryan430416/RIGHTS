export function CardBack() {
  return (
    <div className="card-back" aria-hidden="true">
      <span className="card-back-frame" />
      <span className="card-back-frame card-back-frame-inner" />
      <span className="card-back-star card-back-star-nw" />
      <span className="card-back-star card-back-star-ne" />
      <span className="card-back-star card-back-star-sw" />
      <span className="card-back-star card-back-star-se" />
      <span className="card-back-medallion">
        <span className="card-back-ring" />
        <span className="card-back-cross" />
      </span>
    </div>
  )
}
