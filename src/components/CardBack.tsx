/** Astrolabe / star-chart card back — no religious cross motif. */
export function CardBack() {
  return (
    <div className="card-back" aria-hidden="true">
      <span className="card-back-frame" />
      <span className="card-back-frame card-back-frame-inner" />
      <span className="card-back-corner card-back-corner-nw" />
      <span className="card-back-corner card-back-corner-ne" />
      <span className="card-back-corner card-back-corner-sw" />
      <span className="card-back-corner card-back-corner-se" />
      <svg className="card-back-sigil" viewBox="0 0 100 100" role="presentation">
        <defs>
          <linearGradient id="cb-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0dfa0" />
            <stop offset="100%" stopColor="#b8924e" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="34" fill="none" stroke="url(#cb-gold)" strokeWidth="0.8" opacity="0.75" />
        <circle cx="50" cy="50" r="24" fill="none" stroke="url(#cb-gold)" strokeWidth="0.55" opacity="0.55" />
        <circle cx="50" cy="50" r="12" fill="none" stroke="url(#cb-gold)" strokeWidth="0.5" opacity="0.65" />
        {/* orbital ellipses */}
        <ellipse cx="50" cy="50" rx="30" ry="14" fill="none" stroke="url(#cb-gold)" strokeWidth="0.45" opacity="0.4" transform="rotate(-28 50 50)" />
        <ellipse cx="50" cy="50" rx="28" ry="12" fill="none" stroke="url(#cb-gold)" strokeWidth="0.4" opacity="0.35" transform="rotate(38 50 50)" />
        {/* four-point star */}
        <path
          d="M50 28 L52.2 47.8 L72 50 L52.2 52.2 L50 72 L47.8 52.2 L28 50 L47.8 47.8 Z"
          fill="none"
          stroke="url(#cb-gold)"
          strokeWidth="0.7"
          opacity="0.85"
        />
        <circle cx="50" cy="50" r="2.2" fill="#e8d49a" opacity="0.9" />
        {/* tick marks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="14"
            x2="50"
            y2="17.5"
            stroke="#e2c37a"
            strokeWidth="0.6"
            opacity="0.55"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
      </svg>
    </div>
  )
}
