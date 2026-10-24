import type {
  CompareResult,
  FixResult,
  Plan,
  ProjectionResult,
  SampleDetail,
  Scenario,
  TradeoffResult,
} from './types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const PREFIX = `${BASE}/api/v1`

export class ApiFailure extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${PREFIX}${path}`, init)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiFailure('offline', 'The service is not reachable.')
  }
  if (!response.ok) {
    let code = 'http_error'
    let message = `Request failed (${response.status}).`
    try {
      const body = (await response.json()) as { error?: { code?: string; message?: string } }
      code = body.error?.code ?? code
      message = body.error?.message ?? message
    } catch {
      // keep the generic message
    }
    throw new ApiFailure(code, message)
  }
  return (await response.json()) as T
}

function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
}

export const api = {
  health: (signal?: AbortSignal) => request<{ status: string }>('/health', { signal }),
  sample: (id: string, signal?: AbortSignal) =>
    request<SampleDetail>(`/samples/${id}`, { signal }),
  project: (plan: Plan, scenario: Scenario | undefined, signal?: AbortSignal) =>
    post<ProjectionResult>('/projections', { plan, scenario, include_monthly: true }, signal),
  fixes: (plan: Plan, scenario: Scenario | undefined, signal?: AbortSignal) =>
    post<FixResult>('/fixes', { plan, scenario }, signal),
  compare: (plan: Plan, scenarios: Scenario[], signal?: AbortSignal) =>
    post<CompareResult>('/compare', { plan, scenarios }, signal),
  tradeoffs: (plan: Plan, scenario: Scenario | undefined, signal?: AbortSignal) =>
    post<TradeoffResult>('/tradeoffs', { plan, scenario }, signal),
}
