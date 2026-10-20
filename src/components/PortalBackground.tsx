import { VISUALS } from '../config/cards.ts'

type PortalBackgroundProps = {
  dimmed?: boolean
}

export function PortalBackground({ dimmed = false }: PortalBackgroundProps) {
  return (
    <div className={dimmed ? 'portal-bg is-dimmed' : 'portal-bg'} aria-hidden="true">
      <picture>
        <source media="(max-width: 900px)" srcSet={VISUALS.portal} />
        <img className="portal-bg-image" src={VISUALS.hero} alt="" />
      </picture>
      <div className="portal-bg-veil" />
      <div className="portal-bg-floor" />
    </div>
  )
}
