import { useEffect, useRef, useState } from 'react'
import { ApiFailure } from '../api/client'

export interface Remote<T> {
  data: T | null
  error: string | null
  loading: boolean
}

/** Runs a request whenever `key` changes and keeps the last answer on screen meanwhile. */
export function useRemote<T>(
  key: string | null,
  load: (signal: AbortSignal) => Promise<T>,
  delayMs = 0,
): Remote<T> {
  const [state, setState] = useState<Remote<T>>({ data: null, error: null, loading: key !== null })
  const loader = useRef(load)

  useEffect(() => {
    loader.current = load
  })

  useEffect(() => {
    if (key === null) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setState((previous) => ({ ...previous, loading: true, error: null }))
      loader
        .current(controller.signal)
        .then((data) => setState({ data, error: null, loading: false }))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return
          const code = error instanceof ApiFailure ? error.code : 'unknown'
          setState((previous) => ({ ...previous, loading: false, error: code }))
        })
    }, delayMs)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [key, delayMs])

  return state
}
