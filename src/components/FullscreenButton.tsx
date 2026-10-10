import { useEffect, useState } from 'react'

export function FullscreenButton() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const sync = () => setActive(document.fullscreenElement != null)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        if (typeof document.exitFullscreen === 'function') await document.exitFullscreen()
        return
      }
      if (typeof document.documentElement.requestFullscreen === 'function') {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Fullscreen can be declined by the browser. The draw flow still works.
    }
  }

  return (
    <button type="button" className="fullscreen-button" onClick={() => void toggleFullscreen()}>
      {active ? '結束全螢幕' : '全螢幕'}
    </button>
  )
}
