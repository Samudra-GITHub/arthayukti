import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import stretched from '../../../contracts/samples/family_stretched.json'
import App from '../App'
import fixture from '../test/tradeoffs.fixture.json'

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function serve(tradeoffs: () => Response) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/samples/household')) return reply(stretched)
    if (url.endsWith('/tradeoffs')) return tradeoffs()
    if (url.endsWith('/fixes')) {
      return reply({ needs_fix: false, options: [], recommended_option_id: null, no_single_fix_reason: null })
    }
    return reply({}, 404)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  window.location.hash = '/tradeoffs'
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Trade-offs screen', () => {
  it('shows one card per goal with what each order does to every goal', async () => {
    serve(() => reply(fixture))
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Put Home first' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Put Emergency money first' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Put Children’s education first' })).toBeInTheDocument()

    const homeFirst = screen.getByRole('heading', { name: 'Put Home first' }).closest('section')!
    expect(within(homeFirst).getByText('Emergency money waits 3 months. Children’s education waits 29 months.')).toBeInTheDocument()
    expect(within(homeFirst).getAllByText('Now: On time')).toHaveLength(2)
    expect(within(homeFirst).queryByText('Least total delay')).toBeNull()

    const current = screen.getByRole('heading', { name: 'Put Emergency money first' }).closest('section')!
    expect(within(current).getByText('Your current order')).toBeInTheDocument()
    expect(within(current).getByText('Least total delay')).toBeInTheDocument()
    expect(within(current).queryByRole('button', { name: 'Use this order' })).toBeNull()
  })

  it('applies a chosen order to the plan and opens My plan', async () => {
    const fetchMock = serve(() => reply(fixture))
    render(<App />)
    const homeFirst = (await screen.findByRole('heading', { name: 'Put Home first' })).closest('section')!
    fireEvent.click(within(homeFirst).getByRole('button', { name: 'Use this order' }))
    expect(window.location.hash).toBe('#/plan')

    await waitFor(() => {
      const projections = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/projections'))
      const init = projections.at(-1)?.[1]
      expect(init).toBeDefined()
      const body = JSON.parse(String(init?.body))
      const priorities = Object.fromEntries(body.plan.goals.map((goal: { id: string; priority: number }) => [goal.id, goal.priority]))
      expect(priorities).toEqual({ home: 1, emergency: 2, education: 3 })
    })
  })

  it('says the calculator is not ready when the endpoint is not built yet', async () => {
    serve(() => reply({ error: { code: 'not_implemented', message: 'not available yet' } }, 501))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('not available yet')
  })

  it('reads in Hindi', async () => {
    serve(() => reply(fixture))
    render(<App />)
    await screen.findByRole('heading', { name: 'Put Home first' })
    fireEvent.click(screen.getByRole('button', { name: 'हिन्दी' }))
    expect(await screen.findByRole('heading', { name: 'घर को पहले रखें' })).toBeInTheDocument()
  })
})
