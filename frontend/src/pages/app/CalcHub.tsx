import { useState } from 'react'
import { Notice, Panel } from '../../components/panel'
import { useRestructureCopy } from '../../state/useRestructureCopy'
import type { Route } from '../../lib/route'
import { CalculatorsPage } from './Calculators'
import { DebtCalculator } from './DebtCalc'
import { HoldingLedger } from './HoldingLedger'
import { AssetsPage, DebtsPage, InsurancePage } from './Records'

type Navigate = (route: Route) => void

const CARDS: { route: Route; key: 'insurance' | 'debts' | 'equities' }[] = [
  { route: 'insurance', key: 'insurance' },
  { route: 'debts', key: 'debts' },
  { route: 'equities', key: 'equities' },
]

/** The Calculators landing page: the three modules and what each is for. */
export function CalculatorsHubPage({ navigate }: { navigate: Navigate }) {
  const t = useRestructureCopy().hub
  return (
    <>
      <Panel title={t.title}>
        <p className="text-muted">{t.intro}</p>
      </Panel>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
        {CARDS.map((card) => (
          <Panel key={card.key} title={t.cards[card.key].title}>
            <p className="text-muted">{t.cards[card.key].body}</p>
            <button type="button" onClick={() => navigate(card.route)} className="min-h-12 self-start rounded-xl bg-brand px-6 font-semibold text-white">
              {t.open}
              <span className="sr-only"> {t.cards[card.key].title}</span>
            </button>
          </Panel>
        ))}
      </div>
    </>
  )
}

/** "Calculators > Insurance" with a way back, shown at the top of each module. */
function ModuleCrumb({ navigate, current }: { navigate: Navigate; current: string }) {
  const t = useRestructureCopy().hub
  return (
    <nav aria-label={t.path} className="flex flex-wrap items-center gap-2 px-1 text-[14px]">
      <button type="button" onClick={() => navigate('calculators')} className="font-semibold underline">
        {t.path}
      </button>
      <span aria-hidden="true" className="text-muted">
        /
      </span>
      <span aria-current="page" className="font-semibold">
        {current}
      </span>
    </nav>
  )
}

export function InsuranceModule({ navigate, title }: { navigate: Navigate; title: string }) {
  const t = useRestructureCopy().insurance
  return (
    <>
      <ModuleCrumb navigate={navigate} current={title} />
      <Notice>{t.note}</Notice>
      <InsurancePage />
    </>
  )
}

export function DebtsModule({ navigate, title }: { navigate: Navigate; title: string }) {
  return (
    <>
      <ModuleCrumb navigate={navigate} current={title} />
      <DebtCalculator />
      <DebtsPage />
    </>
  )
}

/** Equities: the investment calculator (growth, tax, inflation, saved scenarios) and the holdings it relates to. */
export function EquitiesModule({ navigate, title }: { navigate: Navigate; title: string }) {
  const t = useRestructureCopy().equities
  const [view, setView] = useState<'calculator' | 'holdings'>('calculator')
  return (
    <>
      <ModuleCrumb navigate={navigate} current={title} />
      <div role="group" aria-label={t.tabs} className="flex w-fit gap-1 rounded-xl bg-surface/60 p-1 text-[14px]">
        {(['calculator', 'holdings'] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => setView(id)}
            className={`min-h-10 rounded-xl px-4 ${view === id ? 'bg-brand font-semibold text-white' : 'text-muted hover:text-ink'}`}
          >
            {t[id]}
          </button>
        ))}
      </div>
      <Notice>{t.note}</Notice>
      {view === 'calculator' ? (
        <CalculatorsPage />
      ) : (
        <>
          <AssetsPage />
          <HoldingLedger />
        </>
      )}
    </>
  )
}
