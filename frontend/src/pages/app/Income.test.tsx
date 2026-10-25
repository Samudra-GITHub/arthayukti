import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setAccessToken } from '../../api/client'
import App from '../../App'
import family from '../../../../contracts/samples/family_stretched.json'
import { json, mockApi } from '../../test/mockApi'

const PROFILE = { id: 'u1', email: 'asha@example.test', full_name: 'Asha', is_active: true, created_at: '2027-01-01T00:00:00' }
const summary = { goals_total: 1, on_track: 1, delayed: 0, not_achievable: 0, plan_feasible: true, uncovered_deficit_months: [], overcommitment_ratio: '0.5000', total_shortfall_today: '0.00' }
const projection = { as_of: '2027-01', horizon_months: 12, summary, goals: [], monthly: [], warnings: [] }
const INCOME = {
  plan_source: 'saved',
  horizon_months: 60,
  first_month: '2027-01',
  total_projected_income: '1250000.00',
  years: [
    { year: 2027, months_included: 12, annual_income: '600000.00', cumulative_income: '600000.00' },
    { year: 2028, months_included: 12, annual_income: '650000.00', cumulative_income: '1250000.00' },
  ],
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
  window.sessionStorage.setItem('arthayukti.session', 'tok_session')
  window.location.hash = '/finances'
  setAccessToken(null)
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const backend = (extra: Parameters<typeof mockApi>[0] = {}) =>
  mockApi({
    'GET /auth/me': () => json(PROFILE),
    'GET /plans': () => json([{ id: 'p1', name: 'Plan', updated_at: 'x' }]),
    'GET /plans/p1': () => json({ id: 'p1', plan: family.plan, created_at: 'x', updated_at: 'y' }),
    'GET /insurance/reminders': () => json([]),
    'POST /projections': () => json(projection),
    'POST /fixes': () => json({ needs_fix: false, options: [], recommended_option_id: null, no_single_fix_reason: null }),
    'POST /income/projection': () => json(INCOME),
    ...extra,
  })

describe('the Income page', () => {
  it('shows the server projection: total, chart values and the year table agree', async () => {
    const { calls } = backend()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Your Incomes' })).toBeInTheDocument()
    expect((await screen.findAllByText('₹12,50,000')).length).toBeGreaterThan(0) // hero total (and the last cumulative row)
    const table = await screen.findByRole('table', { name: 'Year by year' })
    expect(within(table).getByText('₹6,50,000')).toBeInTheDocument()
    expect(within(table).getAllByText('₹12,50,000').length).toBe(1) // the last cumulative value
    expect(screen.getByLabelText('2027: ₹6,00,000')).toBeInTheDocument()
    const sent = calls.find((c) => c.path === '/income/projection')
    expect(sent?.body).toMatchObject({ plan_id: 'p1', horizon_months: 60 })
    expect(Object.keys(sent?.body as object)).not.toContain('plan')
  })

  it('changes the horizon through the same endpoint', async () => {
    const { calls } = backend()
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: '12 months' }))
    await waitFor(() => expect(calls.some((c) => c.path === '/income/projection' && (c.body as { horizon_months: number }).horizon_months === 12)).toBe(true))
  })

  it('lets a fifth stream be added and sends the edited plan, not the saved one', async () => {
    const { calls } = backend()
    render(<App />)
    await screen.findByRole('heading', { name: 'Your Incomes' })
    const before = screen.queryAllByLabelText('Name').length
    fireEvent.click(screen.getByRole('button', { name: 'Add income stream' }))
    // Until the new stream is valid it is not sent: the page asks for the marked fields.
    expect(await screen.findByText('Fix the marked fields to update the projection.')).toBeInTheDocument()
    const names = screen.getAllByLabelText('Name')
    expect(names.length).toBe(before + 1)
    fireEvent.change(names[names.length - 1], { target: { value: 'Rent received' } })
    fireEvent.change(screen.getAllByLabelText('Amount')[before], { target: { value: '12000' } })
    await waitFor(() => {
      const last = [...calls].reverse().find((c) => c.path === '/income/projection')
      const body = last?.body as { plan?: { income_streams: { label: string; amount?: string }[] } }
      expect(body.plan?.income_streams.some((s) => s.label === 'Rent received' && s.amount === '12000.00')).toBe(true)
    })
  })

  it('checks a raise before using it: it must come after the first year', async () => {
    backend()
    render(<App />)
    await screen.findByRole('heading', { name: 'Your Incomes' })
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit with a schedule' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Add a raise' })[0])
    fireEvent.change(screen.getByLabelText('From year 1'), { target: { value: '2020' } })
    expect(await screen.findByText('Choose a year after the first year (and not after the last year).')).toBeInTheDocument()
  })

  it('downloads the CSV from the server endpoint, and says so when it fails', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    let fail = false
    const { calls } = backend({
      'POST /income/projection/csv': () => (fail ? json({ error: { code: 'http_error', message: 'x' } }, 500) : new Response('﻿Year,Annual projected income,Cumulative projected income\r\n', { status: 200, headers: { 'Content-Type': 'text/csv' } })),
    })
    render(<App />)
    await screen.findAllByText('₹12,50,000')
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))
    await waitFor(() => expect(calls.some((c) => c.path === '/income/projection/csv')).toBe(true))
    fail = true
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))
    expect(await screen.findByText('The export did not work. Try again.')).toBeInTheDocument()
  })
})
