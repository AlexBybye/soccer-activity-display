import { ATTACK_CACHE_TTL_MS, attackSummary, buildSnapshot, eventWeight, fetchAttackEvents, isValidUsername } from '../src/activity'
import { describe, expect, it, vi } from 'vitest'

const now = new Date('2026-09-02T12:00:00Z')

function eventAt(createdAt: string): { type: string; created_at: string; repo: { name: string }; payload?: { commits: unknown[] } } {
  return { type: 'PushEvent', created_at: createdAt, repo: { name: 'a/b' }, payload: { commits: [{}] } }
}

describe('attack activity analysis', () => {
  it('keeps the 30-day window and weighted action contract', () => {
    const summary = attackSummary([
      { type: 'PushEvent', created_at: '2026-09-02T09:00:00Z', repo: { name: 'a' }, payload: { commits: [{}, {}] } },
      { type: 'PullRequestEvent', created_at: '2026-09-01T09:00:00Z', repo: { name: 'b' } },
      { type: 'WatchEvent', created_at: '2026-08-01T09:00:00Z', repo: { name: 'old' } }
    ], now)
    expect(summary.days).toHaveLength(30)
    expect(summary.totalActions).toBe(6)
    expect(summary.activeDays).toBe(2)
    expect(summary.repositories).toBe(2)
    expect(summary.topEvent).toBe('PullRequestEvent')
  })

  it('preserves event weighting', () => {
    expect(eventWeight({ type: 'PushEvent', created_at: now.toISOString(), repo: { name: 'a' }, payload: { commits: [{}, {}, {}] } })).toBe(3)
    expect(eventWeight({ type: 'ReleaseEvent', created_at: now.toISOString(), repo: { name: 'a' } })).toBe(5)
  })
})

describe('username validation', () => {
  it.each(['AlexBybye', 'octocat', 'a1-b2'])('accepts %s', (username) => expect(isValidUsername(username)).toBe(true))
  it.each(['', '-bad', 'bad-', 'two--hyphens', 'a'.repeat(40)])('rejects %s', (username) => expect(isValidUsername(username)).toBe(false))
})

describe('snapshot caching', () => {
  it('sets a 24-hour expiry so each username is re-read once per day', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('[]', { headers: { 'content-type': 'application/json' } })))
    try {
      const snapshot = await buildSnapshot('octocat', {}, now)
      expect(Date.parse(snapshot.expiresAt) - Date.parse(snapshot.fetchedAt)).toBe(ATTACK_CACHE_TTL_MS)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('event fetching', () => {
  it('fetches by the 30-day window instead of a 200-event cap', async () => {
    const pages = [
      Array.from({ length: 100 }, (_, i) => eventAt(new Date(Date.UTC(2026, 8, 2) - i * 3_600_000).toISOString())),
      Array.from({ length: 100 }, (_, i) => eventAt(new Date(Date.UTC(2026, 8, 2) - (100 + i) * 3_600_000).toISOString())),
      Array.from({ length: 50 }, (_, i) => eventAt(new Date(Date.UTC(2026, 8, 2) - (200 + i) * 3_600_000).toISOString()))
    ]
    let calls = 0
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const page = Number(new URL(url).searchParams.get('page')) || 1
      calls += 1
      return new Response(JSON.stringify(pages[page - 1] || []), { headers: { 'content-type': 'application/json' } })
    }))
    try {
      const events = await fetchAttackEvents('octocat', {}, now)
      expect(events).toHaveLength(250)
      expect(calls).toBe(3)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('stops paginating once events fall outside the 30-day window', async () => {
    const pages = [
      Array.from({ length: 100 }, (_, i) => eventAt(new Date(Date.UTC(2026, 8, 2) - i * 3_600_000).toISOString())),
      [eventAt('2026-08-10T00:00:00Z'), eventAt('2026-07-01T00:00:00Z')]
    ]
    let calls = 0
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const page = Number(new URL(url).searchParams.get('page')) || 1
      calls += 1
      return new Response(JSON.stringify(pages[page - 1] || []), { headers: { 'content-type': 'application/json' } })
    }))
    try {
      const events = await fetchAttackEvents('octocat', {}, now)
      expect(events).toHaveLength(101)
      expect(calls).toBe(2)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
