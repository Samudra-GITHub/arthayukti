import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import household from '../../contracts/samples/household.json'
import App from './App'

function outcome(id: string, target: string, date: string) {
  return {
    goal_id: id,
    label: id,
    status: 'on_track',
    target_date: date,
    target_amount_today: target,
    inflated_target_at_deadline: target,
    balance_at_deadline: target,
    shortfall_at_deadline_nominal: '0.00',
    shortfall_at_deadline_today: '0.00',
    required_monthly_level_standalone: '40000.00',
    projected_completion: '2029-11',
    delay_months: 0,
    average_monthly_contribution: '40000.00',
    total_contributed: '0.00',
    total_withdrawn: '0.00',
    crowded_out_by: [],
  }
}

const projection = {
  as_of: '2027-01',
  horizon_months: 12,
  summary: {
    goals_total: 2,
    on_track: 2,
    delayed: 0,
    not_achievable: 0,
    plan_feasible: true,
    uncovered_deficit_months: [],
    overcommitment_ratio: '0.8280',
    total_shortfall_today: '0.00',
  },
  goals: [
    outcome('home', '2400000.00', '2030-12'),
    outcome('education', '1800000.00', '2032-12'),
  ],
  monthly: [
    {
      month: '2027-01',
      income: '190000.00',
      expenses: '99000.00',
      commitments: '0.00',
      one_offs: '0.00',
      surplus: '91000.00',
      free_cash: '0.00',
      uncovered_deficit: '0.00',
      goals: [
        { goal_id: 'home', contribution: '55651.00', withdrawal: '0.00', growth: '0.00', balance: '0.00', required: '0.00', inflated_target: '0.00', realised: false },
        { goal_id: 'education', contribution: '20833.00', withdrawal: '0.00', growth: '0.00', balance: '0.00', required: '0.00', inflated_target: '0.00', realised: false },
      ],
    },
  ],
  warnings: [],
}

function reply(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function serve() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/samples/household')) return reply(household)
      if (url.endsWith('/projections')) return reply(projection)
      if (url.endsWith('/fixes')) {
        return reply({ needs_fix: false, options: [], recommended_option_id: null, no_single_fix_reason: null })
      }
      return new Response('{}', { status: 404 })
    }),
  )
}

beforeEach(() => {
  window.location.hash = ''
  window.localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('opens on the home screen and walks into the first setup step', async () => {
    serve()
    render(<App />)
    expect(
      await screen.findByRole('heading', { name: 'A little planning. A brighter tomorrow.' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Start/ }))
    expect(await screen.findByRole('heading', { name: 'What comes in each month?' })).toBeInTheDocument()
    expect(screen.getByText('₹1,90,000')).toBeInTheDocument()
  })

  it('adds up the household income as amounts change', async () => {
    serve()
    window.location.hash = '/money-in'
    render(<App />)
    const arjun = await screen.findByLabelText('Arjun’s income')
    fireEvent.change(arjun, { target: { value: '₹1,30,000' } })
    expect(screen.getByText('₹2,00,000')).toBeInTheDocument()
  })

  it('switches to Hindi and remembers the choice', async () => {
    serve()
    render(<App />)
    await screen.findByRole('heading', { name: 'A little planning. A brighter tomorrow.' })
    fireEvent.click(screen.getByRole('button', { name: 'हिन्दी' }))
    expect(await screen.findByRole('heading', { name: 'थोड़ी योजना, बेहतर कल।' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('hi')
    expect(window.localStorage.getItem('arthayukti.language')).toBe('hi')
  })

  it('shows what the engine says on the plan screen', async () => {
    serve()
    window.location.hash = '/plan'
    render(<App />)
    expect(await screen.findByText('You’re on time.')).toBeInTheDocument()
    expect(await screen.findAllByRole('img', { name: /On time/ })).toHaveLength(2)
    expect(screen.getByText('₹91,000')).toBeInTheDocument()
  })

  it('says so when the calculator cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not reach the calculator')
    await waitFor(() => expect(screen.getByRole('button', { name: /Try again/ })).toBeInTheDocument())
  })
})
