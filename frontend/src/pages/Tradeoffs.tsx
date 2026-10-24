import { Check } from 'lucide-react'
import { api } from '../api/client'
import type { Plan, TradeoffResult, TradeoffRow } from '../api/types'
import { Card, PageHeading } from '../components/Cards'
import { PrimaryButton, SecondaryButton } from '../components/Controls'
import { Jar } from '../components/Jar'
import { Layout } from '../components/Layout'
import { Await } from '../components/Status'
import { goalNameById } from '../lib/outcome'
import {
  currentOrder,
  isCurrentOrder,
  lateMonths,
  leastDelayRows,
  outcomeJarLevel,
  outcomeStatusText,
  outcomeTone,
} from '../lib/tradeoffs'
import { useRemote } from '../state/useRemote'
import { useStore } from '../state/useStore'
import type { PageProps } from './types'

const EDIT_DELAY_MS = 200

export function TradeoffsPage({ navigate }: PageProps) {
  const { text, plan, situation, choice, applyOrder } = useStore()
  const copy = text.tradeoffs

  const key = plan ? JSON.stringify([plan, situation]) : null
  const remote = useRemote<TradeoffResult>(
    key,
    (signal) => api.tradeoffs(plan as Plan, situation, signal),
    EDIT_DELAY_MS,
  )

  const after =
    choice === 'no_income' ? text.whatIf.noIncome : choice === 'expense' ? text.whatIf.expense : text.whatIf.normal

  return (
    <Layout route="tradeoffs" navigate={navigate} speak={`${copy.title} ${copy.note}`}>
      <PageHeading title={copy.title} subtitle={copy.subtitle(after)} />
      <p>{copy.note}</p>
      {remote.error === 'not_implemented' && !remote.data ? (
        <Card>
          <p role="alert">{copy.unavailable}</p>
        </Card>
      ) : (
        <Await remote={remote}>
          {(result) => {
            if (!plan) return null
            const marked = leastDelayRows(result.rows)
            const now = result.rows.find((row) => isCurrentOrder(plan, row))
            return (
              <div className="grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {result.rows.map((row) => (
                  <OrderCard
                    key={row.prioritised_goal_id}
                    plan={plan}
                    row={row}
                    now={now}
                    isNow={now === row}
                    leastDelay={marked.has(row.prioritised_goal_id)}
                    onUse={() => {
                      applyOrder(row.priority_order)
                      navigate('plan')
                    }}
                  />
                ))}
              </div>
            )
          }}
        </Await>
      )}
      <SecondaryButton onClick={() => navigate('plan')}>{copy.backToPlan}</SecondaryButton>
    </Layout>
  )
}

interface OrderCardProps {
  plan: Plan
  row: TradeoffRow
  /** The row for the order the plan has now, to show what changes against it. */
  now: TradeoffRow | undefined
  isNow: boolean
  leastDelay: boolean
  onUse: () => void
}

function OrderCard({ plan, row, now, isNow, leastDelay, onUse }: OrderCardProps) {
  const { text } = useStore()
  const copy = text.tradeoffs
  const name = (id: string) => goalNameById(text, plan, id)
  const late = row.outcomes.filter((outcome) => outcome.status !== 'on_track')
  const outcomes = currentOrder(plan).flatMap((id) =>
    row.outcomes.filter((outcome) => outcome.goal_id === id),
  )

  return (
    <section
      className={`flex min-w-0 flex-col gap-4 rounded-3xl bg-paper p-6 shadow-card ${
        isNow ? 'border-2 border-turmeric' : 'border border-line'
      }`}
    >
      {isNow || leastDelay ? (
        <div className="flex flex-wrap gap-2">
          {isNow ? <Badge>{copy.current}</Badge> : null}
          {leastDelay ? <Badge good>{copy.leastDelay}</Badge> : null}
        </div>
      ) : null}
      <h2 className="font-display text-[28px] leading-[1.15] font-semibold">
        {copy.rowTitle(name(row.prioritised_goal_id))}
      </h2>
      <p className="text-muted">{copy.orderLine(row.priority_order.map(name).join(' → '))}</p>
      <ul className="flex flex-col gap-3">
        {outcomes.map((outcome) => {
          const goal = plan.goals.find((item) => item.id === outcome.goal_id)
          const tone = outcomeTone(outcome)
          const status = outcomeStatusText(text, outcome)
          const before = now?.outcomes.find((item) => item.goal_id === outcome.goal_id)
          const changed =
            !isNow &&
            before !== undefined &&
            (before.status !== outcome.status || lateMonths(before) !== lateMonths(outcome))
          return (
            <li key={outcome.goal_id} className="flex items-center gap-4">
              <Jar
                level={outcomeJarLevel(outcome, goal)}
                tone={tone}
                label={`${name(outcome.goal_id)}: ${status}`}
                className="h-[76px] w-[66px] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{name(outcome.goal_id)}</p>
                <p className={`font-semibold ${tone === 'late' ? 'text-late' : 'text-ontime'}`}>{status}</p>
                {changed && before ? (
                  <p className="text-muted">{copy.was(outcomeStatusText(text, before))}</p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
      <p className="font-semibold">
        {late.length === 0
          ? copy.allOnTime
          : late.map((outcome) => copy.waits(name(outcome.goal_id), lateMonths(outcome))).join(' ')}
      </p>
      {isNow ? null : (
        <PrimaryButton icon={Check} onClick={onUse}>
          {copy.useOrder}
        </PrimaryButton>
      )}
    </section>
  )
}

function Badge({ children, good }: { children: string; good?: boolean }) {
  return (
    <span className={`rounded-full px-3 py-1 font-semibold ${good ? 'bg-sage text-ontime' : 'bg-sand'}`}>
      {children}
    </span>
  )
}
