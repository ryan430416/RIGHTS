import { lazy, Suspense, useSyncExternalStore } from 'react'
import type { DrawPhase } from '../../lib/draw.ts'
import { useDocumentVisible } from '../../hooks/useDocumentVisible.ts'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts'
import { detectWebGL } from '../../hooks/useWebGLSupport.ts'
import { RuinSceneFallback } from './RuinSceneFallback.tsx'

const RuinSceneCanvas = lazy(async () => {
  const mod = await import('./RuinSceneCanvas.tsx')
  return { default: mod.RuinSceneCanvas }
})

type SceneBackgroundProps = {
  phase: DrawPhase
}

function subscribeMobile(breakpoint: number, onChange: () => void) {
  const media = window.matchMedia(`(max-width: ${breakpoint}px)`)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function useIsMobile(breakpoint = 900): boolean {
  return useSyncExternalStore(
    (onChange) => (typeof window === 'undefined' ? () => undefined : subscribeMobile(breakpoint, onChange)),
    () => window.matchMedia(`(max-width: ${breakpoint}px)`).matches,
    () => false,
  )
}

export function SceneBackground({ phase }: SceneBackgroundProps) {
  const webgl = typeof document === 'undefined' ? false : detectWebGL()
  const reducedMotion = usePrefersReducedMotion()
  const visible = useDocumentVisible()
  const mobile = useIsMobile()

  if (!webgl) {
    return <RuinSceneFallback mode={phase} mobile={mobile} />
  }

  return (
    <div className="scene-bg" aria-hidden="true">
      <Suspense fallback={<RuinSceneFallback mode={phase} mobile={mobile} />}>
        <RuinSceneCanvas
          mode={phase}
          reducedMotion={reducedMotion}
          mobile={mobile}
          active={visible}
        />
      </Suspense>
      <div className={phase === 'result' ? 'scene-veil is-result' : 'scene-veil'} />
    </div>
  )
}
