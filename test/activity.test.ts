import { attackSummary, eventWeight, isValidUsername } from '../src/activity'
import { describe, expect, it } from 'vitest'

const now = new Date('2026-09-02T12:00:00Z')

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
