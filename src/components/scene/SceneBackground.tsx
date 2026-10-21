import type { DrawPhase } from '../../lib/draw.ts'
import { AtmosphereScene } from './AtmosphereScene.tsx'

type SceneBackgroundProps = {
  phase: DrawPhase
}

/** Atmosphere scene via SVG/CSS — reference posters are style guides only. */
export function SceneBackground({ phase }: SceneBackgroundProps) {
  return <AtmosphereScene phase={phase} />
}
