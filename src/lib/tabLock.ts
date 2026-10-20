export const TAB_LOCK_KEY = 'rights-draw-tab-lock'
const HEARTBEAT_MS = 1500
const STALE_MS = 4000

export type TabLockState = {
  tabId: string
  updatedAt: number
}

function readLock(): TabLockState | null {
  try {
    const raw = localStorage.getItem(TAB_LOCK_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as TabLockState
    if (typeof parsed.tabId !== 'string' || typeof parsed.updatedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function writeLock(tabId: string) {
  const next: TabLockState = { tabId, updatedAt: Date.now() }
  localStorage.setItem(TAB_LOCK_KEY, JSON.stringify(next))
}

export function createTabId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * Claims leadership for one browser tab. Other tabs stay locked until this
 * heartbeat stops (tab closed) or leadership is released.
 */
export function claimTabLeadership(
  tabId: string,
  onChange: (isLeader: boolean) => void,
): () => void {
  let alive = true

  const evaluate = () => {
    if (!alive) return
    const current = readLock()
    const now = Date.now()
    if (!current || current.tabId === tabId || now - current.updatedAt > STALE_MS) {
      writeLock(tabId)
      onChange(true)
      return
    }
    onChange(false)
  }

  evaluate()
  const timer = window.setInterval(() => {
    if (!alive) return
    const current = readLock()
    if (current?.tabId === tabId) {
      writeLock(tabId)
      onChange(true)
      return
    }
    evaluate()
  }, HEARTBEAT_MS)

  const onStorage = (event: StorageEvent) => {
    if (event.key !== TAB_LOCK_KEY) return
    evaluate()
  }
  window.addEventListener('storage', onStorage)

  return () => {
    alive = false
    window.clearInterval(timer)
    window.removeEventListener('storage', onStorage)
    const current = readLock()
    if (current?.tabId === tabId) {
      localStorage.removeItem(TAB_LOCK_KEY)
    }
  }
}
