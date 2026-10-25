import { useState } from 'react'
import { Notice } from '../../components/panel'
import { useRestructureCopy } from '../../state/useRestructureCopy'
import { CalculatorsPage } from './Calculators'
import { DebtCalculator } from './DebtCalc'
import { HoldingLedger } from './HoldingLedger'
import { AssetsPage, DebtsPage, InsurancePage } from './Records'

/** Insurance is its own area: policies, premiums and renewal reminders. */
export function InsuranceModule() {
  const t = useRestructureCopy().insurance
  return (
    <>
      <Notice>{t.note}</Notice>
      <InsurancePage />
    </>
  )
}

/** Debts is its own area: the loan calculator and the debts you record. */
export function DebtsModule() {
  return (
    <>
      <DebtCalculator />
      <DebtsPage />
    </>
  )
}

/** Equities: the investment calculator (growth, tax, inflation, saved scenarios) and the holdings it relates to. */
export function EquitiesModule() {
  const t = useRestructureCopy().equities
  const [view, setView] = useState<'calculator' | 'holdings'>('calculator')
  return (
    <>
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
