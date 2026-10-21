import type { CSSProperties } from 'react'
import type { DrawPhase } from '../../lib/draw.ts'

type AtmosphereSceneProps = {
  phase: DrawPhase
}

/**
 * Illustrative SVG/CSS atmosphere — not reference bitmaps.
 * Stone look is procedural (gradients, cracks, noise). Photoreal PBR
 * stone albedo/normal maps are not present; if you need closer match
 * to print posters, provide seamless blue-gray stone textures.
 */
export function AtmosphereScene({ phase }: AtmosphereSceneProps) {
  const mode =
    phase === 'summoning' ? 'is-summon' : phase === 'result' ? 'is-result' : 'is-idle'

  return (
    <div className={`atmosphere ${mode}`} aria-hidden="true">
      <div className="atmosphere-sky" />
      <div className="atmosphere-fog atmosphere-fog-far" />
      <div className="atmosphere-fog atmosphere-fog-mid" />
      <div className="atmosphere-fog atmosphere-fog-read" />

      <svg className="atmosphere-svg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1424" />
            <stop offset="55%" stopColor="#0a121e" />
            <stop offset="100%" stopColor="#070c14" />
          </linearGradient>
          <linearGradient id="stoneFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a455c" />
            <stop offset="45%" stopColor="#2a3348" />
            <stop offset="100%" stopColor="#1a2233" />
          </linearGradient>
          <linearGradient id="stoneRim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a3348" />
            <stop offset="70%" stopColor="#3d4a63" />
            <stop offset="100%" stopColor="#c9a35a" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="vortexFog" cx="50%" cy="48%" r="62%">
            <stop offset="0%" stopColor="#d4a85a" stopOpacity="0.42" />
            <stop offset="18%" stopColor="#6a8db0" stopOpacity="0.22" />
            <stop offset="48%" stopColor="#152238" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#070c16" stopOpacity="0.96" />
          </radialGradient>
          <linearGradient id="filGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e2c37a" stopOpacity="0" />
            <stop offset="35%" stopColor="#e2c37a" stopOpacity="0.55" />
            <stop offset="78%" stopColor="#d4a85a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#d4a85a" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="filIce" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8eb8d4" stopOpacity="0" />
            <stop offset="40%" stopColor="#8eb8d4" stopOpacity="0.4" />
            <stop offset="85%" stopColor="#6f93b8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#6f93b8" stopOpacity="0.08" />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="portalAura" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="g" />
            <feMerge>
              <feMergeNode in="g" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="portalHalo" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#e2c37a" stopOpacity="0.28" />
            <stop offset="45%" stopColor="#6f93b8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#070c16" stopOpacity="0" />
          </radialGradient>
          <filter id="stoneNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0.12
                      0 0 0 0 0.15
                      0 0 0 0 0.2
                      0 0 0 0.22 0"
              result="t"
            />
            <feBlend in="SourceGraphic" in2="t" mode="overlay" />
          </filter>
          <clipPath id="portalClip">
            <path d="M742 560 L742 292 Q742 168 900 108 Q1058 168 1058 292 L1058 560 Z" />
          </clipPath>
        </defs>

        <rect width="1280" height="720" fill="url(#skyGrad)" />

        {/* far silhouettes — low contrast */}
        <g opacity="0.35" fill="#121926">
          <path d="M180 520 L210 360 L235 420 L260 350 L300 520 Z" />
          <path d="M980 530 L1015 370 L1040 430 L1070 360 L1115 530 Z" />
          <path d="M1140 540 L1175 390 L1210 540 Z" />
        </g>

        {/* mid stone pillars / broken arches */}
        <g filter="url(#stoneNoise)">
          <g className="stone-piece" transform="translate(1040 250)">
            <path
              d="M0 320 L8 40 Q18 -10 40 40 L48 320 Z"
              fill="url(#stoneFace)"
              stroke="#4a5670"
              strokeWidth="1"
            />
            <path d="M10 90 L42 95 M12 160 L40 168 M14 230 L38 236" stroke="#1a2233" strokeWidth="1" opacity="0.55" />
            <path d="M46 60 L48 280" stroke="#c9a35a" strokeWidth="1.1" opacity="0.35" />
          </g>
          <g className="stone-piece" transform="translate(1188 290)">
            <path
              d="M0 260 L6 70 Q14 20 30 70 L36 260 Z"
              fill="#243044"
              stroke="#3a455c"
              strokeWidth="1"
            />
            <path d="M34 90 L36 230" stroke="#b8924e" strokeWidth="0.9" opacity="0.3" />
          </g>
          {/* left distant thin ruin — stays behind reading fog */}
          <g opacity="0.4" transform="translate(210 300)">
            <path d="M0 280 L5 80 Q12 30 26 80 L32 280 Z" fill="#1a2233" />
          </g>
        </g>

        {/* main portal — blue-gray stone, warm rim only on lit edge */}
        <g className="portal" transform="translate(0 0)">
          <ellipse className="portal-halo" cx="900" cy="340" rx="210" ry="250" fill="url(#portalHalo)" />
          <path
            d="M720 575 L720 285 Q720 150 900 85 Q1080 150 1080 285 L1080 575 Z"
            fill="url(#stoneFace)"
            stroke="#4a5670"
            strokeWidth="2"
            filter="url(#stoneNoise)"
          />
          {/* stone block segments */}
          <g stroke="#1c2536" strokeWidth="1.2" opacity="0.65" fill="none">
            <path d="M738 520 L738 360" />
            <path d="M1062 520 L1062 360" />
            <path d="M748 300 Q748 190 900 130" />
            <path d="M1052 300 Q1052 190 900 130" />
            <path d="M760 440 L790 440 M1010 455 L1040 455" />
            <path d="M770 250 L800 235 M1000 235 L1030 250" />
          </g>
          {/* fine cracks */}
          <g stroke="#151d2c" strokeWidth="0.8" opacity="0.5" fill="none">
            <path d="M770 380 L785 410 L778 450" />
            <path d="M1035 360 L1020 400 L1028 445" />
            <path d="M860 160 L875 190" />
          </g>
          {/* warm gold rim — lit edge only */}
          <path
            d="M1070 560 L1070 292 Q1070 175 900 115"
            fill="none"
            stroke="url(#stoneRim)"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M730 560 L730 292 Q730 175 900 115"
            fill="none"
            stroke="#5a6a86"
            strokeWidth="1.4"
            opacity="0.45"
          />
          {/* apex star */}
          <g transform="translate(900 98)" fill="#e2c37a" opacity="0.9">
            <path d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" />
          </g>

          {/* vortex depth — nested fog rings + sparse arcs (no fan wedges) */}
          <g clipPath="url(#portalClip)">
            <rect x="742" y="108" width="316" height="452" fill="url(#vortexFog)" />
            <ellipse cx="900" cy="340" rx="120" ry="160" fill="#0d1828" opacity="0.35" />
            <ellipse cx="900" cy="335" rx="78" ry="108" fill="#152238" opacity="0.4" />
            <ellipse cx="900" cy="330" rx="42" ry="60" fill="#1a2c44" opacity="0.45" />
            <g className="vortex-arcs" fill="none" strokeLinecap="round">
              <path d="M790 455 C820 360 980 360 1010 455" stroke="#6f93b8" strokeWidth="1" opacity="0.22" />
              <path d="M815 420 C845 345 955 345 985 420" stroke="#d4a85a" strokeWidth="0.85" opacity="0.28" />
              <path d="M840 390 C865 335 935 335 960 390" stroke="#8eb8d4" strokeWidth="0.75" opacity="0.32" />
              <path d="M862 362 C880 328 920 328 938 362" stroke="#e2c37a" strokeWidth="0.7" opacity="0.4" />
              <ellipse cx="900" cy="328" rx="52" ry="70" stroke="#6f93b8" strokeWidth="0.65" opacity="0.25" />
              <ellipse cx="900" cy="328" rx="30" ry="42" stroke="#d4a85a" strokeWidth="0.6" opacity="0.32" />
              <ellipse cx="900" cy="328" rx="14" ry="20" stroke="#e8d49a" strokeWidth="0.75" opacity="0.5" />
              <circle cx="900" cy="326" r="3.2" fill="#f0dfa0" opacity="0.75" />
            </g>
          </g>
        </g>

        {/* thin filaments — outer path into portal, avoid left reading band */}
        <g className="filaments" filter="url(#softGlow)" fill="none" strokeLinecap="round">
          <path
            className="filament filament-gold"
            d="M520 168 C640 140 760 170 860 230 C920 268 960 300 990 330"
            stroke="url(#filGold)"
            strokeWidth="1.25"
          />
          <path
            className="filament filament-gold-core"
            d="M520 168 C640 140 760 170 860 230 C920 268 960 300 990 330"
            stroke="#fff6d8"
            strokeWidth="0.4"
            opacity="0.7"
          />
          <path
            className="filament filament-ice"
            d="M540 250 C670 210 800 220 900 280 C950 310 985 340 1010 360"
            stroke="url(#filIce)"
            strokeWidth="1.05"
          />
          <path
            className="filament filament-ice-core"
            d="M540 250 C670 210 800 220 900 280 C950 310 985 340 1010 360"
            stroke="#d7ebf7"
            strokeWidth="0.35"
            opacity="0.55"
          />
          <path
            className="filament filament-gold-soft"
            d="M560 120 C700 100 820 150 920 210 C970 245 1005 285 1025 315"
            stroke="url(#filGold)"
            strokeWidth="0.8"
            opacity="0.85"
          />
          <path
            className="filament filament-ice-soft"
            d="M580 300 C720 270 850 290 940 330 C980 352 1005 375 1020 390"
            stroke="url(#filIce)"
            strokeWidth="0.65"
            opacity="0.65"
          />
        </g>

        {/* ground plane + broken reflections */}
        <path d="M0 580 Q640 545 1280 590 L1280 720 L0 720 Z" fill="#070c14" opacity="0.92" />
        <g className="ground-reflect" opacity="0.55">
          <ellipse cx="900" cy="620" rx="120" ry="10" fill="#c9a35a" opacity="0.12" />
          <ellipse cx="860" cy="645" rx="70" ry="6" fill="#6f93b8" opacity="0.1" />
          <ellipse cx="980" cy="655" rx="48" ry="5" fill="#d4a85a" opacity="0.09" />
          <path d="M820 635 L910 628" stroke="#c9a35a" strokeWidth="1" opacity="0.14" />
          <path d="M930 650 L1010 642" stroke="#6f93b8" strokeWidth="0.8" opacity="0.12" />
        </g>

        {/* floating dust near portal */}
        <g className="atmosphere-dust" fill="#e2c37a">
          {[
            [780, 220, 1.1, 0],
            [950, 180, 0.9, 1],
            [1020, 260, 1, 2],
            [880, 400, 0.8, 3],
            [1100, 320, 0.9, 4],
            [840, 280, 0.7, 5],
            [980, 210, 0.8, 6],
            [1050, 380, 0.7, 7],
            [920, 150, 0.6, 8],
            [860, 470, 0.7, 9],
            [1080, 240, 0.8, 10],
            [760, 340, 0.6, 11],
          ].map(([x, y, r, i]) => (
            <circle
              key={i}
              className="dust-mote"
              cx={x}
              cy={y}
              r={r}
              style={{ '--i': i } as CSSProperties}
            />
          ))}
        </g>
      </svg>

      <div className="atmosphere-portal-glow" />
      <div className="atmosphere-vignette" />
    </div>
  )
}
