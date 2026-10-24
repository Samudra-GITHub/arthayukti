import type { ReactNode } from 'react'
import type { Route } from '../lib/route'
import { useStore } from '../state/useStore'
import { LanguageControl, ListenButton } from './Controls'

interface LayoutProps {
  route: Route
  navigate: (route: Route) => void
  /** What the Listen button reads aloud. */
  speak: string
  children: ReactNode
}

const NAV: { route: Route; key: 'myPlan' | 'whatIf' | 'compare' | 'tradeoffs'; covers: Route[] }[] = [
  { route: 'plan', key: 'myPlan', covers: ['plan'] },
  { route: 'what-if', key: 'whatIf', covers: ['what-if', 'fixes'] },
  { route: 'compare', key: 'compare', covers: ['compare'] },
  { route: 'tradeoffs', key: 'tradeoffs', covers: ['tradeoffs'] },
]

export function Layout({ route, navigate, speak, children }: LayoutProps) {
  const { text } = useStore()

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line px-4 py-6 sm:px-8 lg:px-20">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="font-display text-[32px] leading-none font-semibold text-ink"
            >
              ArthaYukti<span className="text-turmeric">.</span>
            </button>
            <p className="text-right text-muted">{text.family}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageControl />
            <ListenButton speak={speak} />
            <nav
              aria-label="Main"
              className="flex min-h-14 flex-1 flex-wrap items-center justify-end gap-x-6 gap-y-1 sm:gap-x-8"
            >
              {NAV.map((item) => (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => navigate(item.route)}
                  aria-current={item.covers.includes(route) ? 'page' : undefined}
                  className={`py-2 whitespace-nowrap ${
                    item.covers.includes(route) ? 'font-semibold underline decoration-turmeric decoration-2 underline-offset-8' : ''
                  }`}
                >
                  {text.nav[item.key]}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="px-4 pt-8 pb-12 sm:px-8 lg:px-20">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8">{children}</div>
      </main>

      <footer className="border-t border-line px-4 py-6 text-muted sm:px-8 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <p>{text.footer.example}</p>
          <p>{text.footer.scope}</p>
          <p>{text.footer.legal}</p>
        </div>
      </footer>
    </div>
  )
}
