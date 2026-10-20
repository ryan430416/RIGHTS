import { VISUALS } from '../config/cards.ts'

export function PortalBackground() {
  return (
    <div className="portal-bg" aria-hidden="true">
      <img className="portal-bg-image" src={VISUALS.hero} alt="" />
      <div className="portal-bg-veil" />
      <div className="portal-bg-glow" />
      <div className="portal-bg-vignette" />
      <div className="portal-bg-dust" />
      <div className="portal-bg-stream" />
    </div>
  )
}
