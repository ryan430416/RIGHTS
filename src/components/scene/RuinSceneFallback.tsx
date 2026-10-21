type RuinSceneFallbackProps = {
  mode: 'home' | 'summoning' | 'result'
  mobile: boolean
}

/** SVG / CSS procedural fallback — never uses reference poster images. */
export function RuinSceneFallback({ mode, mobile }: RuinSceneFallbackProps) {
  const dim = mode === 'result' ? 'is-dim' : ''
  const surge = mode === 'summoning' ? 'is-surge' : ''

  return (
    <div className={`ruin-fallback ${dim} ${surge} ${mobile ? 'is-mobile' : ''}`} aria-hidden="true">
      <div className="ruin-fallback-sky" />
      <div className="ruin-fallback-haze" />
      <svg className="ruin-fallback-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rf-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1422" stopOpacity="0" />
            <stop offset="45%" stopColor="#0a101c" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#070c16" />
          </linearGradient>
          <radialGradient id="rf-vortex" cx="50%" cy="48%" r="55%">
            <stop offset="0%" stopColor="#e0b35a" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#6f93b8" stopOpacity="0.28" />
            <stop offset="70%" stopColor="#152238" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#070c16" stopOpacity="0.95" />
          </radialGradient>
          <linearGradient id="rf-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d8b25c" stopOpacity="0" />
            <stop offset="45%" stopColor="#e0c27a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d8b25c" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="rf-ice" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7aa7c9" stopOpacity="0" />
            <stop offset="50%" stopColor="#8eb8d4" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7aa7c9" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* distant silhouettes */}
        <g className="rf-far" fill="#101824">
          <path d="M80 620 L140 420 L200 620 Z" />
          <path d="M220 640 L270 460 L300 520 L340 450 L390 640 Z" />
          <path d="M980 650 L1040 430 L1100 520 L1160 410 L1240 650 Z" />
          <path d="M1280 640 L1340 470 L1400 640 Z" />
        </g>

        {/* mid ruins */}
        <g className="rf-mid" fill="#1c2536" stroke="#2a3348" strokeWidth="3">
          <path d="M160 700 L180 380 Q220 300 260 380 L280 700 Z" />
          <path d="M1320 710 L1345 360 Q1390 280 1435 360 L1460 710 Z" />
          <rect x="420" y="520" width="36" height="190" rx="4" />
          <rect x="1180" y="500" width="40" height="210" rx="4" />
        </g>

        {/* portal */}
        <g className="rf-portal" transform={mobile ? 'translate(520 80) scale(0.92)' : 'translate(820 40)'}>
          <path
            d="M120 620 L120 300 Q120 140 300 60 Q480 140 480 300 L480 620 Z"
            fill="#2a3348"
            stroke="#c49a4a"
            strokeWidth="8"
          />
          <path
            d="M170 610 L170 310 Q170 180 300 110 Q430 180 430 310 L430 610 Z"
            fill="url(#rf-vortex)"
          />
          <g className="rf-vortex-spin" stroke="#e0c27a" strokeWidth="2" fill="none" opacity="0.45">
            <ellipse cx="300" cy="360" rx="90" ry="120" />
            <ellipse cx="300" cy="360" rx="55" ry="80" />
            <ellipse cx="300" cy="360" rx="28" ry="42" />
          </g>
          <polygon points="300,48 308,68 328,70 312,84 318,104 300,92 282,104 288,84 272,70 292,68" fill="#e2c37a" />
        </g>

        {/* light flows — stay outside left reading band */}
        <path
          className="rf-flow rf-flow-gold"
          d="M520 220 C720 180 900 240 1100 300 C1200 330 1280 360 1340 390"
          stroke="url(#rf-gold)"
          strokeWidth="3"
          fill="none"
        />
        <path
          className="rf-flow rf-flow-ice"
          d="M540 360 C760 300 980 280 1180 340 C1260 370 1320 400 1360 420"
          stroke="url(#rf-ice)"
          strokeWidth="2.2"
          fill="none"
        />
        <path
          className="rf-flow rf-flow-gold-soft"
          d="M560 140 C800 120 1000 200 1220 280"
          stroke="url(#rf-gold)"
          strokeWidth="1.6"
          fill="none"
          opacity="0.7"
        />

        {/* foreground rocks */}
        <g fill="#243044">
          <path d="M60 780 L160 740 L240 800 L120 860 Z" />
          <path d="M1380 790 L1480 750 L1560 820 L1420 870 Z" />
          <path d="M720 820 L800 790 L860 840 L760 870 Z" opacity="0.85" />
        </g>

        <rect x="0" y="620" width="1600" height="280" fill="url(#rf-ground)" />
        <ellipse className="rf-reflect" cx="1180" cy="760" rx="160" ry="18" fill="#c9a04e" opacity="0.12" />
        <ellipse className="rf-reflect" cx="1040" cy="790" rx="90" ry="10" fill="#6d97b8" opacity="0.1" />
      </svg>
    </div>
  )
}
