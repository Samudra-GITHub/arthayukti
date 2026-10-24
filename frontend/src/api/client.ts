import type {
  AccountCreateRequest,
  AccountResponse,
  AuthResponse,
  CompareResult,
  CSVImportResponse,
  ExportResponse,
  FixResult,
  InsuranceDashboardSummary,
  IntentSuggestions,
  InsuranceReminderItem,
  InvestmentCreateRequest,
  InvestmentResponse,
  LiabilityCreateRequest,
  LiabilityResponse,
  MessageResponse,
  NetWorthResponse,
  Plan,
  PlanRecord,
  PlanSummary,
  PolicyCreateRequest,
  PolicyResponse,
  ProjectionResult,
  SampleDetail,
  Scenario,
  TradeoffResult,
  TransactionResponse,
  UserProfile,
  AIConsultResponse,
  EscalationCreateRequest,
  EscalationHistoryResponse,
  EscalationResponse,
  MarketQuoteResponse,
  ProcessEscalationEventRequest,
  RescueRequest,
  RescueResponse,
  TransactionCreateRequest,
} from './types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const PREFIX = `${BASE}/api/v1`

export class ApiFailure extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, message: string, status = 0) {
    super(message)
    this.code = code
    this.status = status
  }
}

// The access token is held here, in memory. The session store may also keep it for the life of
// the browser tab so a refresh does not sign the person out.
let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

/** Called when a signed-in request is refused with 401, so the app can end the session. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const headers = new Headers(init.headers)
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  let response: Response
  try {
    response = await fetch(`${PREFIX}${path}`, { ...init, headers })
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
    if (response.status === 401 && accessToken && code === 'unauthorized') onUnauthorized?.()
    throw new ApiFailure(code, message, response.status)
  }
  return (await response.json()) as T
}

function send<T>(method: string, path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
}

const post = <T>(path: string, body: unknown, signal?: AbortSignal) => send<T>('POST', path, body, signal)
const get = <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal })

export const api = {
  health: (signal?: AbortSignal) => get<{ status: string }>('/health', signal),
  sample: (id: string, signal?: AbortSignal) => get<SampleDetail>(`/samples/${id}`, signal),
  project: (plan: Plan, scenario: Scenario | undefined, signal?: AbortSignal) =>
    post<ProjectionResult>('/projections', { plan, scenario, include_monthly: true }, signal),
  fixes: (plan: Plan, scenario: Scenario | undefined, signal?: AbortSignal) =>
    post<FixResult>('/fixes', { plan, scenario }, signal),
  compare: (plan: Plan, scenarios: Scenario[], signal?: AbortSignal) =>
    post<CompareResult>('/compare', { plan, scenarios }, signal),
  tradeoffs: (plan: Plan, scenario: Scenario | undefined, signal?: AbortSignal) =>
    post<TradeoffResult>('/tradeoffs', { plan, scenario }, signal),

  // Accounts and sessions
  signup: (email: string, password: string, fullName: string) =>
    post<AuthResponse>('/auth/signup', { email, password, full_name: fullName }),
  login: (email: string, password: string) => post<AuthResponse>('/auth/login', { email, password }),
  me: (signal?: AbortSignal) => get<UserProfile>('/auth/me', signal),
  logout: () => post<MessageResponse>('/auth/logout', {}),
  requestPasswordReset: (email: string) =>
    post<MessageResponse>('/auth/password-reset/request', { email }),
  resetPassword: (token: string, newPassword: string, signal?: AbortSignal) =>
    post<MessageResponse>('/auth/password-reset/confirm', { token, new_password: newPassword }, signal),
  exportData: (signal?: AbortSignal) => get<ExportResponse>('/auth/export-data', signal),
  deleteAccount: () => request<MessageResponse>('/auth/delete-account', { method: 'DELETE' }),

  // Saved plans
  plans: (signal?: AbortSignal) => get<PlanSummary[]>('/plans', signal),
  plan: (id: string, signal?: AbortSignal) => get<PlanRecord>(`/plans/${id}`, signal),
  createPlan: (plan: Plan) => post<PlanRecord>('/plans', plan),
  updatePlan: (id: string, plan: Plan) => send<PlanRecord>('PUT', `/plans/${id}`, plan),

  // Financial records
  netWorth: (signal?: AbortSignal) => get<NetWorthResponse>('/financials/net-worth', signal),
  accounts: (signal?: AbortSignal) => get<AccountResponse[]>('/financials/accounts', signal),
  createAccount: (body: AccountCreateRequest) => post<AccountResponse>('/financials/accounts', body),
  investments: (signal?: AbortSignal) => get<InvestmentResponse[]>('/financials/investments', signal),
  createInvestment: (body: InvestmentCreateRequest) =>
    post<InvestmentResponse>('/financials/investments', body),
  liabilities: (signal?: AbortSignal) => get<LiabilityResponse[]>('/financials/liabilities', signal),
  createLiability: (body: LiabilityCreateRequest) =>
    post<LiabilityResponse>('/financials/liabilities', body),
  transactions: (signal?: AbortSignal) => get<TransactionResponse[]>('/financials/transactions', signal),
  importTransactions: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<CSVImportResponse>('/financials/transactions/import', { method: 'POST', body: form })
  },

  parseIntent: (prompt: string) => post<IntentSuggestions>('/ai/parse-intent', { prompt }),
  consult: (plan: Plan, scenario: Scenario | undefined, prompt: string) =>
    post<AIConsultResponse>('/ai/consult', { plan, scenario, user_prompt: prompt }),
  rescue: (body: RescueRequest) => post<RescueResponse>('/rescue/analyze', body),
  marketQuote: (symbol: string, signal?: AbortSignal) =>
    get<MarketQuoteResponse>(`/market/quotes/${encodeURIComponent(symbol)}`, signal),
  createTransaction: (body: TransactionCreateRequest) => post<TransactionResponse>('/financials/transactions', body),

  // Insurance
  policies: (signal?: AbortSignal) => get<PolicyResponse[]>('/insurance/policies', signal),
  createPolicy: (body: PolicyCreateRequest) => post<PolicyResponse>('/insurance/policies', body),
  insuranceDashboard: (signal?: AbortSignal) =>
    get<InsuranceDashboardSummary>('/insurance/dashboard', signal),
  reminders: (signal?: AbortSignal) => get<InsuranceReminderItem[]>('/insurance/reminders', signal),
  acknowledgeReminder: (id: string) => post<{ status: string }>(`/insurance/reminders/${id}/ack`, {}),
  policy: (id: string, signal?: AbortSignal) => get<PolicyResponse>(`/insurance/policies/${id}`, signal),
  createEscalation: (body: EscalationCreateRequest) => post<EscalationResponse>('/insurance/escalations', body),
  escalation: (id: string, signal?: AbortSignal) => get<EscalationResponse>(`/insurance/escalations/${id}`, signal),
  escalationHistory: (id: string, signal?: AbortSignal) =>
    get<EscalationHistoryResponse[]>(`/insurance/escalations/${id}/history`, signal),
  processEscalation: (id: string, body: ProcessEscalationEventRequest) =>
    post<EscalationHistoryResponse>(`/insurance/escalations/${id}/process-event`, body),
}
