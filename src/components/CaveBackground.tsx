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
