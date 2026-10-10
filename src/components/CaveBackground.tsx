export function CaveBackground() {
  return (
    <div className="cave" aria-hidden="true">
      <div className="cave-shade" />
      <div className="cave-columns cave-columns-left" />
      <div className="cave-columns cave-columns-right" />
      <svg className="crystal crystal-left" viewBox="0 0 220 520">
        <defs>
          <linearGradient id="crystal-blue-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d7ecff" />
            <stop offset="0.35" stopColor="#3d7dff" />
            <stop offset="1" stopColor="#123a86" />
          </linearGradient>
        </defs>
        <polygon points="70,10 118,150 96,310 28,210" fill="url(#crystal-blue-a)" opacity="0.9" />
        <polygon points="150,70 196,190 168,340 112,230" fill="#1d4ed8" opacity="0.55" />
        <polygon points="40,250 92,360 70,500 8,390" fill="#60a5fa" opacity="0.35" />
      </svg>
      <svg className="crystal crystal-right" viewBox="0 0 220 520">
        <polygon points="150,20 196,160 160,330 104,220" fill="#7dd3fc" opacity="0.75" />
        <polygon points="70,90 120,230 92,410 24,270" fill="#1d4ed8" opacity="0.6" />
        <polygon points="130,280 188,390 150,510 96,400" fill="#93c5fd" opacity="0.4" />
      </svg>
      <svg className="crystal crystal-top" viewBox="0 0 180 240">
        <polygon points="90,8 132,90 108,210 48,120" fill="#93c5fd" opacity="0.55" />
        <polygon points="40,40 78,120 58,220 12,130" fill="#1d4ed8" opacity="0.4" />
      </svg>
      <svg className="ruin ruin-left" viewBox="0 0 220 280">
        <path d="M20 270 V90 H70 V40 H110 V110 H160 V270" fill="none" stroke="#1d3358" strokeWidth="10" />
        <path d="M40 270 V140 H90 V80" fill="none" stroke="#24406e" strokeWidth="6" />
      </svg>
      <svg className="ruin ruin-right" viewBox="0 0 220 280">
        <path d="M30 270 V120 H80 V50 H130 V150 H190 V270" fill="none" stroke="#1d3358" strokeWidth="10" />
        <circle cx="150" cy="70" r="22" fill="none" stroke="#c9a35a" strokeWidth="2" opacity="0.7" />
      </svg>
      <svg className="stream stream-floor" viewBox="0 0 1200 160" preserveAspectRatio="none">
        <path d="M0 90 C 180 20, 320 140, 520 70 S 860 20, 1200 80" />
        <path d="M0 120 C 240 60, 420 150, 680 90 S 980 40, 1200 110" />
      </svg>
      <svg className="stream stream-left" viewBox="0 0 280 640">
        <path d="M40 600 C 90 470, 30 390, 120 300 S 70 140, 160 40" />
        <path d="M90 620 C 150 500, 80 360, 170 250" />
      </svg>
      <svg className="stream stream-right" viewBox="0 0 280 640">
        <path d="M230 40 C 150 150, 240 250, 140 360 S 220 520, 120 620" />
        <path d="M200 80 C 120 210, 210 320, 110 460" />
      </svg>
      <div className="cave-motes" />
      <div className="cave-vignette" />
    </div>
  )
}
