import { CompassIcon } from './CompassIcon.tsx'

export function Banner() {
  return (
    <header className="banner">
      <div className="banner-flank" aria-hidden="true">
        <span className="banner-flare" />
        <span className="banner-diamond" />
        <span className="banner-flare banner-flare-right" />
      </div>
      <CompassIcon className="banner-compass" />
      <h1>權流・溯源</h1>
      <p className="banner-subtitle">溯其源，知其權</p>
      <p className="banner-english">TRACE THE SOURCE. KNOW YOUR RIGHTS.</p>
      <div className="banner-rule" aria-hidden="true" />
    </header>
  )
}
