import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { FixOption, Goal, Plan, SampleDetail } from '../api/types'
import { copy } from '../i18n/copy'
import type { Language } from '../lib/months'
import { blankPlan, hasGoals, MAX_GOALS, newGoal } from '../lib/blank'
import { currentOrder } from '../lib/tradeoffs'
import { ownScenario, scenarioFor, withFix, type Choice } from '../lib/scenarios'
import { StoreContext, type Store } from './useStore'
import { useRemote } from './useRemote'

const LANGUAGE_KEY = 'arthayukti.language'
const EXAMPLE_ID = 'household'
const EDIT_DELAY_MS = 200


function readLanguage(): Language {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY) === 'hi' ? 'hi' : 'en'
  } catch {
    return 'en'
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readLanguage)
  const [sample, setSample] = useState<SampleDetail | null>(null)
  const [sampleError, setSampleError] = useState<string | null>(null)
  const [exampleLoading, setExampleLoading] = useState(false)
  const [source, setSource] = useState<'own' | 'example' | null>(null)
  const [shockAmount, setShockAmount] = useState('')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [choice, setChoiceState] = useState<Choice>('normal')
  const [fix, setFix] = useState<FixOption | null>(null)
  const [previousOrder, setPreviousOrder] = useState<string[] | null>(null)

  useEffect(() => {
    document.documentElement.lang = copy[language].htmlLang
  }, [language])

  const startOwn = useCallback(() => {
    setSample(null)
    setSampleError(null)
    setPlan(blankPlan())
    setSource('own')
    setChoiceState('normal')
    setFix(null)
    setShockAmount('')
    setPreviousOrder(null)
  }, [])

  /** Loads the labelled example only when someone asks for it. Returns whether it loaded. */
  const loadExample = useCallback(async () => {
    setExampleLoading(true)
    setSampleError(null)
    try {
      const loaded = await api.sample(EXAMPLE_ID)
      setSample(loaded)
      setPlan(loaded.plan)
      setSource('example')
      setChoiceState('normal')
      setFix(null)
      setPreviousOrder(null)
      return true
    } catch {
      setSampleError('offline')
      return false
    } finally {
      setExampleLoading(false)
    }
  }, [])

  const startOver = useCallback(() => {
    setSample(null)
    setPlan(null)
    setSource(null)
    setChoiceState('normal')
    setFix(null)
    setShockAmount('')
    setPreviousOrder(null)
  }, [])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    try {
      window.localStorage.setItem(LANGUAGE_KEY, next)
    } catch {
      // the choice still works for this visit
    }
  }, [])

  const setChoice = useCallback((next: Choice) => {
    setChoiceState(next)
    setFix(null)
  }, [])

  const situation = useMemo(
    () =>
      sample
        ? scenarioFor(sample, choice)
        : plan
          ? ownScenario(plan, choice, shockAmount)
          : undefined,
    [sample, plan, choice, shockAmount],
  )
  const scenario = useMemo(() => withFix(situation, fix), [situation, fix])
  const activeChoice: Choice = choice !== 'normal' && !situation ? 'normal' : choice

  const ready = hasGoals(plan)
  const projectionKey = ready ? JSON.stringify([plan, scenario]) : null
  const projection = useRemote(
    projectionKey,
    (signal) => api.project(plan as Plan, scenario, signal),
    EDIT_DELAY_MS,
  )

  const baselineKey = ready && fix ? JSON.stringify([plan, situation]) : null
  const baseline = useRemote(
    baselineKey,
    (signal) => api.project(plan as Plan, situation, signal),
    EDIT_DELAY_MS,
  )

  const fixesKey = ready ? JSON.stringify([plan, situation]) : null
  const fixes = useRemote(
    fixesKey,
    (signal) => api.fixes(plan as Plan, situation, signal),
    EDIT_DELAY_MS,
  )

  const update = useCallback((change: (current: Plan) => Plan) => {
    setPlan((current) => (current ? change(current) : current))
    setFix(null)
  }, [])

  const setIncome = useCallback(
    (streamId: string, amount: string) =>
      update((current) => ({
        ...current,
        income_streams: current.income_streams.map((stream) =>
          stream.id === streamId ? { ...stream, monthly_net: amount } : stream,
        ),
      })),
    [update],
  )

  const setExpense = useCallback(
    (expenseId: string, amount: string) =>
      update((current) => ({
        ...current,
        expenses: (current.expenses ?? []).map((expense) =>
          expense.id === expenseId ? { ...expense, monthly: amount } : expense,
        ),
      })),
    [update],
  )

  const setGoalAmount = useCallback(
    (goalId: string, amount: string) =>
      update((current) => ({
        ...current,
        goals: current.goals.map((goal) =>
          goal.id === goalId ? { ...goal, target_amount_today: amount } : goal,
        ),
      })),
    [update],
  )

  const setGoalDate = useCallback(
    (goalId: string, month: string) =>
      update((current) => ({
        ...current,
        goals: current.goals.map((goal) =>
          goal.id === goalId ? { ...goal, target_date: month } : goal,
        ),
      })),
    [update],
  )

  const moveGoal = useCallback(
    (goalId: string, direction: 'up' | 'down') =>
      update((current) => {
        const ordered = [...current.goals].sort((a, b) => a.priority - b.priority)
        const index = ordered.findIndex((goal) => goal.id === goalId)
        const swapWith = direction === 'up' ? index - 1 : index + 1
        if (index < 0 || swapWith < 0 || swapWith >= ordered.length) return current
        const first = ordered[index]
        const second = ordered[swapWith]
        return {
          ...current,
          goals: current.goals.map((goal) => {
            if (goal.id === first.id) return { ...goal, priority: second.priority }
            if (goal.id === second.id) return { ...goal, priority: first.priority }
            return goal
          }),
        }
      }),
    [update],
  )

  const rank = useCallback(
    (goalIds: string[]) =>
      update((current) => ({
        ...current,
        goals: current.goals.map((goal) => {
          const position = goalIds.indexOf(goal.id)
          return position < 0 ? goal : { ...goal, priority: position + 1 }
        }),
      })),
    [update],
  )

  const addGoal = useCallback(
    (type: Goal['type'], label: string, amount: string, targetDate: string) =>
      update((current) =>
        current.goals.length >= MAX_GOALS
          ? current
          : { ...current, goals: [...current.goals, newGoal(current, type, label, amount, targetDate)] },
      ),
    [update],
  )

  const removeGoal = useCallback(
    (goalId: string) =>
      update((current) => ({
        ...current,
        goals: current.goals.filter((goal) => goal.id !== goalId),
      })),
    [update],
  )

  const applyOrder = useCallback(
    (goalIds: string[]) => {
      if (plan) setPreviousOrder(currentOrder(plan))
      rank(goalIds)
    },
    [plan, rank],
  )

  const undoOrder = useCallback(() => {
    if (previousOrder) rank(previousOrder)
    setPreviousOrder(null)
  }, [previousOrder, rank])

  const resetPlan = useCallback(() => {
    if (sample) setPlan(sample.plan)
    else if (source === 'own') setPlan(blankPlan())
    setPreviousOrder(null)
    setChoiceState('normal')
    setFix(null)
  }, [sample, source])

  const value: Store = {
    language,
    setLanguage,
    text: copy[language],
    sample,
    sampleError,
    exampleLoading,
    source,
    startOwn,
    loadExample,
    startOver,
    shockAmount,
    setShockAmount,
    addGoal,
    removeGoal,
    plan,
    choice,
    activeChoice,
    setChoice,
    fix,
    setFix,
    scenario,
    situation,
    projection,
    baseline,
    fixes,
    setIncome,
    setExpense,
    setGoalAmount,
    setGoalDate,
    moveGoal,
    applyOrder,
    previousOrder,
    undoOrder,
    resetPlan,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
