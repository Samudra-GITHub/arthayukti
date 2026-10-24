import { createContext, useContext } from 'react'
import type {
  Goal,
  FixOption,
  FixResult,
  Plan,
  ProjectionResult,
  SampleDetail,
  Scenario,
} from '../api/types'
import type { Copy } from '../i18n/copy'
import type { Language } from '../lib/months'
import type { Choice } from '../lib/scenarios'
import type { Remote } from './useRemote'

export interface Store {
  language: Language
  setLanguage: (language: Language) => void
  text: Copy
  sample: SampleDetail | null
  sampleError: string | null
  exampleLoading: boolean
  /** Where the plan came from: the person's own numbers or the labelled example. */
  source: 'own' | 'example' | null
  startOwn: () => void
  loadExample: () => Promise<boolean>
  startOver: () => void
  shockAmount: string
  setShockAmount: (amount: string) => void
  addGoal: (type: Goal['type'], label: string, amount: string, targetDate: string) => void
  removeGoal: (goalId: string) => void
  plan: Plan | null
  choice: Choice
  /** The situation actually being calculated. An expense with no amount yet is still 'normal'. */
  activeChoice: Choice
  setChoice: (choice: Choice) => void
  fix: FixOption | null
  setFix: (fix: FixOption | null) => void
  /** The situation being looked at, with any chosen fix on top. */
  scenario: Scenario | undefined
  /** The same situation without the fix, used to compare before and after. */
  situation: Scenario | undefined
  projection: Remote<ProjectionResult>
  baseline: Remote<ProjectionResult>
  fixes: Remote<FixResult>
  setIncome: (streamId: string, amount: string) => void
  setExpense: (expenseId: string, amount: string) => void
  setGoalAmount: (goalId: string, amount: string) => void
  setGoalDate: (goalId: string, month: string) => void
  moveGoal: (goalId: string, direction: 'up' | 'down') => void
  /** Makes the first goal in the list priority 1, the next priority 2, and so on. */
  applyOrder: (goalIds: string[]) => void
  /** The order before the last applied one, so it can be undone; null when there is none. */
  previousOrder: string[] | null
  undoOrder: () => void
  resetPlan: () => void
}

export const StoreContext = createContext<Store | null>(null)

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
