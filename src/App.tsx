import { FullscreenButton } from './components/FullscreenButton.tsx'
import { SceneBackground } from './components/scene/SceneBackground.tsx'
import { DrawScreen } from './DrawScreen.tsx'
import { useState } from 'react'
import type { DrawPhase } from './lib/draw.ts'

export default function App() {
  const [phase, setPhase] = useState<DrawPhase>('home')

  return (
    <div className="app">
      <SceneBackground phase={phase} />
      <FullscreenButton />
      <main className="stage">
        <DrawScreen onPhaseChange={setPhase} />
      </main>
    </div>
  )
}
