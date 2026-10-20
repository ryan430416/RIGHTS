import { useState } from 'react'
import { FullscreenButton } from './components/FullscreenButton.tsx'
import { PortalBackground } from './components/PortalBackground.tsx'
import { DrawScreen } from './DrawScreen.tsx'

export default function App() {
  const [dimmed, setDimmed] = useState(false)

  return (
    <div className="app">
      <PortalBackground dimmed={dimmed} />
      <FullscreenButton />
      <main className="stage">
        <DrawScreen onDimChange={setDimmed} />
      </main>
    </div>
  )
}
