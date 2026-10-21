import { Canvas, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { RuinWorld } from './RuinWorld.tsx'
import type { SceneMode } from './RuinWorld.tsx'

type RuinSceneCanvasProps = {
  mode: SceneMode
  reducedMotion: boolean
  mobile: boolean
  active: boolean
}

function FrameKick({ mode }: { mode: SceneMode }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
  }, [mode, invalidate])
  return null
}

export function RuinSceneCanvas({ mode, reducedMotion, mobile, active }: RuinSceneCanvasProps) {
  return (
    <Canvas
      className="ruin-canvas"
      dpr={mobile ? [1, 1.25] : [1, 1.5]}
      gl={{
        antialias: !mobile,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      camera={{ position: [0.2, 1.85, 6.6], fov: mobile ? 48 : 42, near: 0.1, far: 40 }}
      frameloop={active && !reducedMotion ? 'always' : 'demand'}
      onCreated={({ gl, invalidate }) => {
        gl.setClearColor('#070c16', 1)
        invalidate()
      }}
    >
      <FrameKick mode={mode} />
      <RuinWorld mode={mode} reducedMotion={reducedMotion || !active} mobile={mobile} />
    </Canvas>
  )
}
