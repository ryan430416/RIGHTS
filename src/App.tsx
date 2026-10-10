import { CaveBackground } from './components/CaveBackground.tsx'
import { FullscreenButton } from './components/FullscreenButton.tsx'
import { DrawScreen } from './DrawScreen.tsx'

export default function App() {
  return (
    <div className="app">
      <CaveBackground />
      <FullscreenButton />
      <main className="stage">
        <DrawScreen />
      </main>
    </div>
  )
}
