import type { FixOption, SampleDetail, Scenario } from '../api/types'
import { addMoney } from './money'

export type Choice = 'normal' | 'no_income' | 'expense'

/** The situations on the "What if" screen are the sample's preset scenarios. */
export function scenarioFor(sample: SampleDetail, choice: Choice): Scenario | undefined {
  if (choice === 'normal') return undefined
  const wanted = choice === 'no_income' ? 'income_change' : 'one_time_expense'
  return sample.scenarios.find((scenario) =>
    (scenario.events ?? []).some((event) => event.type === wanted),
  )
}

type Override = NonNullable<Scenario['goal_overrides']>[number]

function mergeOverrides(existing: Override[], added: Override[]): Override[] {
  const byGoal = new Map<string, Override>()
  for (const override of [...existing, ...added]) {
    byGoal.set(override.goal_id, { ...byGoal.get(override.goal_id), ...stripNulls(override) })
  }
  return [...byGoal.values()]
}

function stripNulls(override: Override): Override {
  const clean: Override = { goal_id: override.goal_id }
  if (override.target_date) clean.target_date = override.target_date
  if (override.target_amount_today) clean.target_amount_today = override.target_amount_today
  return clean
}

/** Adds a chosen fix on top of the current situation. */
export function withFix(scenario: Scenario | undefined, fix: FixOption | null): Scenario | undefined {
  if (!fix) return scenario
  const base: Scenario = scenario ?? { name: 'Smallest fix', extra_monthly_savings: '0.00' }
  const delta = fix.scenario_delta
  return {
    ...base,
    extra_monthly_savings: addMoney(base.extra_monthly_savings, delta.extra_monthly_savings),
    goal_overrides: mergeOverrides(base.goal_overrides ?? [], delta.goal_overrides ?? []),
  }
}
