type CardPlaceholderProps = {
  label: string
}

export function CardPlaceholder({ label }: CardPlaceholderProps) {
  return (
    <div className="card-placeholder" role="img" aria-label={label}>
      <span aria-hidden="true">{label}</span>
      <small aria-hidden="true">圖片尚未載入</small>
    </div>
  )
}
