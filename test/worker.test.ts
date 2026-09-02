import { describe, expect, it, vi } from 'vitest'
import worker from '../src/index'

describe('graph endpoint', () => {
  it('renders a cached SVG for a valid username', async () => {
    const createdAt = new Date().toISOString()
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([
      { type: 'PushEvent', created_at: createdAt, repo: { name: 'AlexBybye/demo' }, payload: { commits: [{}, {}] } }
    ]), { headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const context = { waitUntil: vi.fn() } as unknown as ExecutionContext

    const first = await worker.fetch(new Request('https://widget.test/graph?username=octocat&club=sky'), {}, context)
    expect(first.headers.get('content-type')).toBe('image/svg+xml; charset=UTF-8')
    expect(await first.text()).toContain('#38bdf8')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const second = await worker.fetch(new Request('https://widget.test/graph?username=octocat&club=unknown'), {}, context)
    expect(await second.text()).toContain('#e30613')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns an SVG error card without calling GitHub for an invalid username', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await worker.fetch(new Request('https://widget.test/graph?username=%3Cscript%3E'), {}, { waitUntil: vi.fn() } as unknown as ExecutionContext)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('A valid GitHub username is required.')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
