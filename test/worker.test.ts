import { describe, expect, it, vi } from 'vitest'
import worker from '../src/index'
import type { CachedSnapshot, KvNamespace } from '../src/types'

describe('graph endpoint', () => {
  it('renders a cached SVG for a valid username', async () => {
    const createdAt = new Date().toISOString()
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([
      { type: 'PushEvent', created_at: createdAt, repo: { name: 'AlexBybye/demo' }, payload: { commits: [{}, {}] } }
    ]), { headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const context = { waitUntil: vi.fn() } as unknown as ExecutionContext

    const first = await worker.fetch(new Request('https://widget.test/graph?username=octocat&club=realmadrid'), {}, context)
    expect(first.headers.get('content-type')).toBe('image/svg+xml; charset=UTF-8')
    expect(await first.text()).toContain('#00529f')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const second = await worker.fetch(new Request('https://widget.test/graph?username=octocat&club=unknown'), {}, context)
    expect(await second.text()).toContain('#e30613')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('refreshes a still-unexpired KV snapshot whose date window ends yesterday', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-04T01:00:00Z'))

    const days = Array.from({ length: 15 }, (_, index) => {
      const date = new Date('2026-09-03T00:00:00Z')
      date.setUTCDate(date.getUTCDate() - (14 - index))
      return { date: date.toISOString().slice(0, 10), actions: 0, events: 0 }
    })
    const cached: CachedSnapshot = {
      version: 1,
      username: 'date-window-user',
      attackSummary: { days, totalActions: 0, eventCount: 0, activeDays: 0, repositories: 0, topEvent: 'OtherEvent', lastActionAt: null },
      fetchedAt: '2026-09-03T23:00:00Z',
      expiresAt: '2026-09-04T23:00:00Z'
    }
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([
      { type: 'PushEvent', created_at: '2026-09-04T00:30:00Z', repo: { name: 'date-window-user/demo' }, payload: { size: 1, commits: [{}] } }
    ]), { headers: { 'content-type': 'application/json' } }))
    const put = vi.fn(async (_key: string, _value: string, _options?: { expirationTtl?: number }) => undefined)
    const cache: KvNamespace = {
      get: async <T>() => cached as T,
      put
    }
    vi.stubGlobal('fetch', fetchMock)

    try {
      const response = await worker.fetch(
        new Request('https://widget.test/graph?username=date-window-user'),
        { ATTACK_PULSE_CACHE: cache },
        { waitUntil: vi.fn() } as unknown as ExecutionContext
      )

      const second = await worker.fetch(
        new Request('https://widget.test/graph?username=date-window-user'),
        { ATTACK_PULSE_CACHE: cache },
        { waitUntil: vi.fn() } as unknown as ExecutionContext
      )

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(put).toHaveBeenCalledTimes(1)
      const written = JSON.parse(put.mock.calls[0][1])
      expect(written.attackSummary.days.at(-1).date).toBe('2026-09-04')
      expect(await response.text()).toContain('<title>Sep 4: 2 weighted actions</title>')
      expect(await second.text()).toContain('<title>Sep 4: 2 weighted actions</title>')
    } finally {
      vi.useRealTimers()
      vi.unstubAllGlobals()
    }
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
