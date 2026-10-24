import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

type Health = 'checking' | 'online' | 'offline'

export default function App() {
  const [health, setHealth] = useState<Health>('checking')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API_BASE}/api/v1/health`, { signal: controller.signal })
      .then((response) => setHealth(response.ok ? 'online' : 'offline'))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setHealth('offline')
        }
      })
    return () => controller.abort()
  }, [])

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-4">
      <h1 className="text-4xl font-semibold tracking-tight">ArthaYukti</h1>
      <p className="text-lg text-slate-600">
        See which goal you lose when money runs short, and the smallest change that fixes it.
      </p>
      <p role="status" className="text-sm text-slate-500">
        API: {health}
      </p>
    </main>
  )
}
