import { createContext, useContext } from 'react'
import type {
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
  plan: Plan | null
  choice: Choice
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
  resetPlan: () => void
}

export const StoreContext = createContext<Store | null>(null)

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
