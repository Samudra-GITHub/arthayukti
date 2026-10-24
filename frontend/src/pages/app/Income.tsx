import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Plus, Trash2 } from 'lucide-react'
import { api } from '../../api/client'
import type { IncomeStream } from '../../api/types'
import { AmountField, FormError, SelectField, TextField } from '../../components/forms'
import { Loaded, Panel, Table } from '../../components/panel'
import { monthlyEquivalent, type Frequency } from '../../lib/frequency'
import { formatMoney, fromPaise, toPaise } from '../../lib/money'
import { percentToRate } from '../../lib/onboarding'
import { useAction } from '../../state/useAction'
import { useExtrasCopy } from '../../state/useExtrasCopy'
import { useRemote } from '../../state/useRemote'
import { useStore } from '../../state/useStore'

type IncomeFrequency = 'monthly' | 'quarterly' | 'yearly'
const HORIZONS = [12, 24, 60] as const

interface StepRow {
  id: string
  year: string
  amount: string
}

/** What is being edited. A legacy row is a plain monthly stream that is carried through unchanged. */
interface Row {
  id: string
  name: string
  amount: string
  frequency: IncomeFrequency
  startYear: string
  endYear: string
  growth: string
  steps: StepRow[]
  legacy: IncomeStream | null
}

let counter = 0
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter += 1)}`

function toRow(stream: IncomeStream): Row {
  if (stream.start_year == null) {
    return { id: stream.id, name: stream.label, amount: stream.monthly_net, frequency: 'monthly', startYear: '', endYear: '', growth: '', steps: [], legacy: stream }
  }
  return {
    id: stream.id,
    name: stream.label,
    amount: stream.amount ?? stream.monthly_net,
    frequency: stream.frequency,
    startYear: String(stream.start_year),
    endYear: stream.end_year == null ? '' : String(stream.end_year),
    growth: stream.annual_growth ? String(Number(stream.annual_growth) * 100) : '',
    steps: (stream.step_ups ?? []).map((step) => ({ id: step.id, year: String(step.year), amount: step.amount })),
    legacy: null,
  }
}

type Issue = 'name' | 'amount' | 'start' | 'end' | 'growth' | 'stepYear' | 'stepDuplicate' | 'stepAmount'

function issuesFor(row: Row, firstYear: number): { row: Issue[]; steps: Record<string, Issue[]> } {
  if (row.legacy) return { row: [], steps: {} }
  const found: Issue[] = []
  if (row.name.trim() === '') found.push('name')
  if (row.amount === '' || toPaise(row.amount) <= 0n) found.push('amount')
  const start = /^\d{4}$/.test(row.startYear) ? Number(row.startYear) : NaN
  if (Number.isNaN(start) || start < firstYear) found.push('start')
  const end = row.endYear.trim() === '' ? null : /^\d{4}$/.test(row.endYear.trim()) ? Number(row.endYear) : NaN
  if (end !== null && (Number.isNaN(end) || Number.isNaN(start) || end < start)) found.push('end')
  if (row.growth.trim() !== '' && percentToRate(row.growth) === null) found.push('growth')
  const steps: Record<string, Issue[]> = {}
  const seen = new Map<string, number>()
  row.steps.forEach((step) => seen.set(step.year, (seen.get(step.year) ?? 0) + 1))
  for (const step of row.steps) {
    const list: Issue[] = []
    const year = /^\d{4}$/.test(step.year) ? Number(step.year) : NaN
    if (Number.isNaN(year) || Number.isNaN(start) || year <= start || (end !== null && !Number.isNaN(end) && year > end)) list.push('stepYear')
    if ((seen.get(step.year) ?? 0) > 1) list.push('stepDuplicate')
    if (step.amount === '' || toPaise(step.amount) <= 0n) list.push('stepAmount')
    if (list.length) steps[step.id] = list
  }
  return { row: found, steps }
}

function toStream(row: Row): IncomeStream {
  if (row.legacy) return row.legacy
  const amount = fromPaise(toPaise(row.amount))
  return {
    id: row.id,
    label: row.name.trim(),
    // The server derives the monthly equivalent; sent for a consistent shape.
    monthly_net: monthlyEquivalent(amount, row.frequency as Frequency),
    ends_after: null,
    amount,
    frequency: row.frequency,
    start_year: Number(row.startYear),
    ...(row.endYear.trim() ? { end_year: Number(row.endYear) } : {}),
    ...(row.growth.trim() ? { annual_growth: percentToRate(row.growth) ?? '0.000000' } : {}),
    step_ups: row.steps.map((step) => ({ id: step.id, year: Number(step.year), amount: fromPaise(toPaise(step.amount)) })),
  }
}

function sameStreams(a: IncomeStream[], b: IncomeStream[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Large heading band, then the projection and the stream editor. */
export function IncomeSection() {
  const t = useExtrasCopy().income
  const { plan, planId, dirty, language, setIncomeStreams } = useStore()
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>(60)
  const [rows, setRows] = useState<Row[]>(() => (plan ? plan.income_streams.map(toRow) : []))
  const [asking, setAsking] = useState<string | null>(null)
  const exporter = useAction()
  const pushed = useRef<IncomeStream[] | null>(null)
  const firstYear = Number(plan?.as_of.slice(0, 4) ?? 0)

  const checks = useMemo(() => rows.map((row) => issuesFor(row, firstYear)), [rows, firstYear])
  const hasIssues = checks.some((check) => check.row.length > 0 || Object.keys(check.steps).length > 0)

  // Valid edits go to the plan; while something is invalid the plan keeps its last valid streams.
  useEffect(() => {
    if (!plan || hasIssues || rows.length === 0) return
    const next = rows.map(toStream)
    if (sameStreams(next, plan.income_streams) || (pushed.current && sameStreams(next, pushed.current))) return
    pushed.current = next
    setIncomeStreams(next)
  }, [rows, hasIssues, plan, setIncomeStreams])

  const useSaved = planId !== null && !dirty
  const source = plan ? (useSaved && planId ? { planId } : { plan }) : null
  const projection = useRemote(
    plan && !hasIssues ? JSON.stringify(['income-projection', horizon, useSaved ? planId : plan.income_streams, plan.as_of]) : null,
    (signal) => (source ? api.incomeProjection(source, horizon, signal) : Promise.reject(new Error('No plan'))),
  )

  if (!plan) return null

  const update = (id: string, change: Partial<Row>) => setRows((list) => list.map((row) => (row.id === id ? { ...row, ...change } : row)))
  const addStream = () =>
    setRows((list) => [...list, { id: uid('income'), name: '', amount: '', frequency: 'monthly', startYear: String(firstYear), endYear: '', growth: '', steps: [], legacy: null }])
  const removeStream = (id: string) => {
    if (rows.length <= 1) {
      setAsking(null)
      return // the plan always keeps at least one income stream
    }
    setRows((list) => list.filter((row) => row.id !== id))
    setAsking(null)
    // Removing the last remaining stream is pushed straight away: the plan needs at least one.
  }
  const monthlyNow = plan.income_streams.reduce((sum, s) => sum + toPaise(s.monthly_net), 0n)
  const maxAnnual = projection.data ? Math.max(1, ...projection.data.years.map((y) => Number(toPaise(y.annual_income)))) : 1

  async function download() {
    if (!source) return
    const ok = await exporter.run(async () => {
      const blob = await api.incomeProjectionCsv(source, horizon)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'arthayukti_income_projection.csv'
      link.click()
      URL.revokeObjectURL(url)
    })
    return ok
  }

  return (
    <>
      <section className="income-hero flex flex-col gap-5 rounded-3xl p-6 sm:p-10" aria-labelledby="income-title">
        <p className="eyebrow font-figures text-[13px] font-semibold uppercase">{t.eyebrow}</p>
        <h2 id="income-title" className="font-display text-[34px] leading-[1.05] font-extrabold tracking-tight sm:text-[52px]">
          {t.title}
        </h2>
        <p className="max-w-[640px] text-[16px] text-white/80">{t.lead}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[14px] text-white/70">{t.total}</p>
            <p className="font-figures text-[36px] font-semibold sm:text-[46px]" aria-live="polite">
              {projection.data ? formatMoney(projection.data.total_projected_income) : '–'}
            </p>
            {projection.data ? <p className="text-[13px] text-white/70">{t.totalNote(projection.data.horizon_months, projection.data.first_month)}</p> : null}
          </div>
          <div>
            <p className="text-[14px] text-white/70">{t.monthlyNow}</p>
            <p className="font-figures text-[24px] font-semibold">{formatMoney(fromPaise(monthlyNow))}</p>
          </div>
        </div>
      </section>

      <Panel
        id="income-chart"
        title={t.chartTitle}
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label={t.horizon} className="flex gap-1 rounded-xl bg-surface/60 p-1 text-[14px]">
              {HORIZONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={horizon === value}
                  onClick={() => setHorizon(value)}
                  className={`min-h-9 rounded-lg px-3 ${horizon === value ? 'bg-ink font-semibold text-white' : 'text-muted hover:text-ink'}`}
                >
                  {t.horizons[value]}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={exporter.busy || hasIssues}
              onClick={() => void download()}
              className="flex min-h-9 items-center gap-2 rounded-lg border border-ink px-3 text-[14px] font-semibold disabled:opacity-50"
            >
              <Download size={16} aria-hidden="true" />
              {exporter.busy ? t.exporting : t.export}
            </button>
          </div>
        }
      >
        <p className="text-[13px] text-muted">{dirty ? t.unsavedNote : t.savedNote}</p>
        {exporter.failure ? <FormError>{t.exportFailed}</FormError> : null}
        {hasIssues ? <FormError>{t.fixIssues}</FormError> : null}
        {!hasIssues ? (
          <Loaded remote={projection}>
            {(result) =>
              result.years.length === 0 ? (
                <p className="text-muted">{t.emptyProjection}</p>
              ) : (
                <>
                  <figure className="m-0">
                    <div role="img" aria-label={t.chartSummary} className="flex h-56 items-end gap-2 pt-8">
                      {result.years.map((row) => (
                        <div key={row.year} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                          <span className="font-figures text-[11px] font-semibold sm:text-[12px]">{formatMoney(row.annual_income)}</span>
                          <div
                            tabIndex={0}
                            aria-label={`${row.year}: ${formatMoney(row.annual_income)}`}
                            className="income-bar w-full rounded-md"
                            style={{ height: `${Math.max(3, (Number(toPaise(row.annual_income)) / maxAnnual) * 78)}%` }}
                          />
                          <span className="font-figures text-[12px] text-muted">{row.year}</span>
                        </div>
                      ))}
                    </div>
                  </figure>
                  <Table
                    caption={t.tableTitle}
                    head={[t.year, t.annual, t.cumulative]}
                    rows={result.years.map((row) => [
                      row.months_included < 12 ? `${row.year} (${t.partial(row.months_included)})` : String(row.year),
                      formatMoney(row.annual_income),
                      formatMoney(row.cumulative_income),
                    ])}
                  />
                  {result.years.some((row) => row.months_included < 12) ? <p className="text-[13px] text-muted">{t.partialNote}</p> : null}
                </>
              )
            }
          </Loaded>
        ) : null}
      </Panel>

      <Panel id="income-streams" title={t.streams} aside={<span className="sr-only">{language}</span>}>
        <p className="text-muted">{t.streamsLead}</p>
        <ul className="flex flex-col gap-4">
          {rows.map((row, index) => {
            const check = checks[index]
            const monthly = row.amount === '' || toPaise(row.amount) <= 0n ? null : monthlyEquivalent(fromPaise(toPaise(row.amount)), row.frequency as Frequency)
            const err = (issue: Issue) => (check.row.includes(issue) ? t.issues[issue] : null)
            return (
              <li key={row.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/60 p-4">
                {row.legacy ? (
                  <LegacyRow row={row} onConvert={() => convertLegacy(row)} remove={() => removeStream(row.id)} />
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <TextField label={t.name} value={row.name} onChange={(name) => update(row.id, { name })} maxLength={80} error={err('name')} />
                      <AmountField label={t.amount} value={row.amount} onChange={(amount) => update(row.id, { amount })} error={err('amount')} />
                      <SelectField
                        label={t.frequency}
                        value={row.frequency}
                        onChange={(frequency: IncomeFrequency) => update(row.id, { frequency })}
                        options={(['monthly', 'quarterly', 'yearly'] as const).map((value) => ({ value, label: t.frequencies[value] }))}
                      />
                      <div className="flex items-end pb-2 text-[14px] text-muted">{monthly ? t.perMonth(formatMoney(monthly)) : ''}</div>
                      <TextField label={t.startYear} hint={t.startHint} value={row.startYear} onChange={(startYear) => update(row.id, { startYear })} maxLength={4} error={err('start')} />
                      <TextField label={t.endYear} hint={t.endHint} value={row.endYear} onChange={(endYear) => update(row.id, { endYear })} maxLength={4} error={err('end')} />
                      <TextField label={t.growth} hint={t.growthHint} value={row.growth} onChange={(growth) => update(row.id, { growth })} maxLength={5} error={err('growth')} />
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl bg-sand/50 p-3">
                      <p className="font-semibold">{t.stepUps}</p>
                      <p className="text-[13px] text-muted">{t.stepHint}</p>
                      {row.steps.map((step, stepIndex) => (
                        <div key={step.id} className="grid items-start gap-3 sm:grid-cols-[1fr_1fr_auto]">
                          <TextField
                            label={`${t.stepYear} ${stepIndex + 1}`}
                            value={step.year}
                            onChange={(year) => update(row.id, { steps: row.steps.map((s) => (s.id === step.id ? { ...s, year } : s)) })}
                            maxLength={4}
                            error={check.steps[step.id]?.includes('stepYear') ? t.issues.stepYear : check.steps[step.id]?.includes('stepDuplicate') ? t.issues.stepDuplicate : null}
                          />
                          <AmountField
                            label={`${t.stepAmount} ${stepIndex + 1}`}
                            value={step.amount}
                            onChange={(amount) => update(row.id, { steps: row.steps.map((s) => (s.id === step.id ? { ...s, amount } : s)) })}
                            error={check.steps[step.id]?.includes('stepAmount') ? t.issues.stepAmount : null}
                          />
                          <button
                            type="button"
                            aria-label={`${t.removeStep} ${stepIndex + 1}`}
                            onClick={() => update(row.id, { steps: row.steps.filter((s) => s.id !== step.id) })}
                            className="mt-8 flex size-10 items-center justify-center rounded-lg border border-line"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => update(row.id, { steps: [...row.steps, { id: uid('raise'), year: '', amount: '' }] })}
                        className="flex min-h-10 items-center gap-2 self-start rounded-lg border border-ink px-3 text-[14px] font-semibold"
                      >
                        <Plus size={16} aria-hidden="true" />
                        {t.addStep}
                      </button>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      {asking === row.id ? (
                        <>
                          <span role="alert" className="mr-auto text-[14px] font-semibold">
                            {t.confirmRemove}
                          </span>
                          <button type="button" onClick={() => removeStream(row.id)} className="min-h-10 rounded-lg bg-late px-3 font-semibold text-white">
                            {t.yes}
                          </button>
                          <button type="button" onClick={() => setAsking(null)} className="min-h-10 rounded-lg border border-line px-3 font-semibold">
                            {t.keep}
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setAsking(row.id)} className="flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 text-[14px] font-semibold">
                          <Trash2 size={16} aria-hidden="true" />
                          {t.remove}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </li>
            )
          })}
        </ul>
        <button type="button" onClick={addStream} className="flex min-h-12 items-center gap-2 self-start rounded-xl bg-ink px-5 font-semibold text-white">
          <Plus size={18} aria-hidden="true" />
          {t.add}
        </button>
      </Panel>
    </>
  )

  function convertLegacy(row: Row) {
    const old = row.legacy
    if (!old) return
    const growth = plan?.assumptions.income_growth_annual ?? '0'
    update(row.id, {
      legacy: null,
      amount: old.monthly_net,
      frequency: 'monthly',
      startYear: String(firstYear),
      // The plan-wide yearly increase moves into this stream so its forecast is kept.
      growth: Number(growth) > 0 ? String(Number(growth) * 100) : '',
    })
  }
}

function LegacyRow({ row, onConvert, remove }: { row: Row; onConvert: () => void; remove: () => void }) {
  const t = useExtrasCopy().income
  const { plan } = useStore()
  const old = row.legacy as IncomeStream
  const midYear = old.ends_after != null && !old.ends_after.endsWith('-12')
  const growth = plan ? Number(plan.assumptions.income_growth_annual) : 0
  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold">{old.label}</span>
        <span className="font-figures">{formatMoney(old.monthly_net)}</span>
      </p>
      <p className="text-[13px] text-muted">{t.legacyNote(old.ends_after ?? null)}</p>
      {growth > 0 ? <p className="text-[13px] text-muted">{t.legacyGrowth(String(growth * 100))}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={midYear} onClick={onConvert} className="min-h-10 rounded-lg border border-ink px-3 text-[14px] font-semibold disabled:opacity-50">
          {t.convert}
        </button>
        <button type="button" onClick={remove} className="min-h-10 rounded-lg border border-line px-3 text-[14px] font-semibold">
          {t.remove}
        </button>
      </div>
    </div>
  )
}
