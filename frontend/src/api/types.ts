import type { components } from './schema'

type Schemas = components['schemas']

export type Plan = Schemas['Plan']
export type Goal = Schemas['Goal']
export type Scenario = Schemas['Scenario']
export type SampleDetail = Schemas['SampleDetail']
export type ProjectionResult = Schemas['ProjectionResult']
export type GoalOutcome = Schemas['GoalOutcome']
export type MonthRow = Schemas['MonthRow']
export type FixResult = Schemas['FixResult']
export type FixOption = Schemas['FixOption']
export type CompareResult = Schemas['CompareResult']
export type TradeoffResult = Schemas['TradeoffResult']
export type TradeoffRow = Schemas['TradeoffRow']
export type TradeoffOutcome = Schemas['TradeoffOutcome']
