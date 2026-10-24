import type { ReactNode } from 'react'
import type { Route } from '../lib/route'
import { householdName } from '../lib/household'
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
  { route: 'tradeoffs', key: 'tradeoffs', covers: ['tradeoffs'] },
  { route: 'what-if', key: 'whatIf', covers: ['what-if', 'fixes'] },
  { route: 'compare', key: 'compare', covers: ['compare'] },
]

export function Layout({ route, navigate, speak, children }: LayoutProps) {
  const { text, sample, plan } = useStore()
  const name = householdName(text, sample, plan)

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-paper px-4 py-3 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="font-display text-[28px] leading-none font-semibold text-ink"
          >
            ArthaYukti<span className="text-turmeric">.</span>
          </button>
          <nav aria-label="Main" className="order-3 flex w-full flex-wrap gap-x-3 gap-y-0 sm:gap-x-5 lg:order-none lg:w-auto lg:flex-1">
            {NAV.map((item) => {
              const active = item.covers.includes(route)
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => navigate(item.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-11 border-b-2 text-[16px] whitespace-nowrap sm:text-[17px] ${
                    active ? 'border-turmeric font-semibold' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {text.nav[item.key]}
                </button>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LanguageControl />
            <ListenButton speak={speak} />
          </div>
        </div>
        {name ? (
          <div className="mx-auto mt-1 flex max-w-[1180px] items-center gap-2 text-[15px] text-muted">
            <span className="font-semibold text-ink">{name}</span>
            {sample ? <span className="rounded-full bg-sand px-2 py-0.5">{text.shell.sample}</span> : null}
          </div>
        ) : null}
      </header>

      <main className="px-4 pt-8 pb-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8">{children}</div>
      </main>

      <footer className="border-t border-line px-4 py-6 text-[15px] text-muted sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p>{text.footer.example}</p>
          <p>{text.footer.scope}</p>
          <p>{text.footer.legal}</p>
        </div>
      </footer>
    </div>
  )
}
