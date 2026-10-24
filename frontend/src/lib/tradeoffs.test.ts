import { describe, expect, it } from 'vitest'
import stretched from '../../../contracts/samples/family_stretched.json'
import type { Plan, TradeoffResult } from '../api/types'
import fixture from '../test/tradeoffs.fixture.json'
import { currentOrder, isCurrentOrder, leastDelayRows, outcomeJarLevel } from './tradeoffs'

const plan = stretched.plan as Plan
const result = fixture as TradeoffResult

describe('trade-off helpers', () => {
  it('reads the current order from the goal priorities', () => {
    expect(currentOrder(plan)).toEqual(['emergency', 'education', 'home'])
  })

  it('finds the row that matches the current order', () => {
    const now = result.rows.filter((row) => isCurrentOrder(plan, row))
    expect(now.map((row) => row.prioritised_goal_id)).toEqual(['emergency'])
  })

  it('marks every row with the least total delay, and says nothing when all rows match', () => {
    expect([...leastDelayRows(result.rows)].sort()).toEqual(['education', 'emergency'])
    const same = result.rows.map((row) => ({ ...row, totals: result.rows[0].totals }))
    expect(leastDelayRows(same).size).toBe(0)
  })

  it('counts a missed goal before delay when picking the least', () => {
    const rows = [
      { ...result.rows[0], prioritised_goal_id: 'a', totals: { ...result.rows[0].totals, goals_missed: 2, total_delay_months: 1 } },
      { ...result.rows[0], prioritised_goal_id: 'b', totals: { ...result.rows[0].totals, goals_missed: 1, total_delay_months: 40 } },
    ]
    expect([...leastDelayRows(rows)]).toEqual(['b'])
  })

  it('fills a late jar by what was saved against the target', () => {
    const home = result.rows[0].outcomes.find((outcome) => outcome.goal_id === 'home')!
    const goal = plan.goals.find((item) => item.id === 'home')
    expect(outcomeJarLevel(home, goal)).toBe(0.875)
    expect(outcomeJarLevel(result.rows[2].outcomes[2], goal)).toBe(1)
  })
})
