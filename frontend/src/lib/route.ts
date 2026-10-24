import { useCallback, useEffect, useState } from 'react'

export type Route =
  | 'home'
  | 'money-in'
  | 'money-out'
  | 'dreams'
  | 'plan'
  | 'what-if'
  | 'fixes'
  | 'compare'
  | 'tradeoffs'

const ROUTES: Route[] = [
  'home',
  'money-in',
  'money-out',
  'dreams',
  'plan',
  'what-if',
  'fixes',
  'compare',
  'tradeoffs',
]

export function parseRoute(hash: string): Route {
  const name = hash.replace(/^#\/?/, '')
  return ROUTES.find((route) => route === name) ?? 'home'
}

/** A tiny hash router: the back button works and no server setup is needed. */
export function useRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((next: Route) => {
    window.location.hash = `/${next}`
  }, [])

  return [route, navigate]
}
