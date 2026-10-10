type CompassIconProps = {
  className?: string
}

export function CompassIcon({ className }: CompassIconProps) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <path d="M50 6 L58 50 L50 94 L42 50 Z" fill="currentColor" />
      <path d="M6 50 L50 42 L94 50 L50 58 Z" fill="currentColor" opacity="0.55" />
      <path d="M50 14 L54.2 46 L50 50 L45.8 46 Z" fill="#f8f1de" />
      <circle cx="50" cy="50" r="3.2" fill="#f8f1de" />
      <circle cx="50" cy="50" r="1.3" fill="#8d6418" />
    </svg>
  )
}
