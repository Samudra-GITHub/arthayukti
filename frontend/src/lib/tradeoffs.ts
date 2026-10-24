import type { Goal, Plan, TradeoffOutcome, TradeoffRow } from '../api/types'
import type { Copy } from '../i18n/copy'
import { share, subMoney } from './money'
import type { Tone } from './outcome'

export function outcomeTone(outcome: TradeoffOutcome): Tone {
  return outcome.status === 'on_track' ? 'good' : 'late'
}

/** Delay is only meaningful for a goal that is late; a missing or zero delay means none. */
export function lateMonths(outcome: TradeoffOutcome): number | null {
  return outcome.status === 'delayed' ? (outcome.delay_months ?? null) : null
}

export function outcomeStatusText(text: Copy, outcome: TradeoffOutcome): string {
  if (outcome.status === 'on_track') return text.status.onTime
  const months = lateMonths(outcome)
  return months === null ? text.status.notReachable : text.status.late(months)
}

/** How full the jar is at the deadline: what was saved, in today's money, against the target. */
export function outcomeJarLevel(outcome: TradeoffOutcome, goal: Goal | undefined): number {
  if (outcome.status === 'on_track') return 1
  if (!goal) return 0
  return share(subMoney(goal.target_amount_today, outcome.shortfall_today), goal.target_amount_today)
}

export function currentOrder(plan: Plan): string[] {
  return [...plan.goals].sort((a, b) => a.priority - b.priority).map((goal) => goal.id)
}

export function isCurrentOrder(plan: Plan, row: TradeoffRow): boolean {
  const current = currentOrder(plan)
  return (
    row.priority_order.length === current.length &&
    row.priority_order.every((id, index) => id === current[index])
  )
}

/**
 * The rows with the fewest dreams missed and, among those, the least total delay. Nothing is
 * marked when every row comes out the same, because then no order is better than another.
 */
export function leastDelayRows(rows: TradeoffRow[]): Set<string> {
  const compare = (a: TradeoffRow, b: TradeoffRow) =>
    a.totals.goals_missed - b.totals.goals_missed ||
    a.totals.total_delay_months - b.totals.total_delay_months
  const best = [...rows].sort(compare)[0]
  if (!best) return new Set()
  const winners = rows.filter((row) => compare(row, best) === 0)
  return winners.length === rows.length
    ? new Set()
    : new Set(winners.map((row) => row.prioritised_goal_id))
}
