import { FullscreenButton } from './components/FullscreenButton.tsx'
import { PortalBackground } from './components/PortalBackground.tsx'
import { DrawScreen } from './DrawScreen.tsx'

export default function App() {
  return (
    <div className="app">
      <PortalBackground />
      <FullscreenButton />
      <main className="stage">
        <DrawScreen />
      </main>
    </div>
  )
}
