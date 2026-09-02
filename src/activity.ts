import type { AttackDay, AttackSummary, Env, GithubEventResponse } from './types'

export const ATTACK_DAY_COUNT = 30
export const ATTACK_EVENT_LIMIT = 200
export const ATTACK_EVENT_PAGE_SIZE = 100

export function eventWeight(event: GithubEventResponse): number {
  if (event.type === 'PushEvent') return Math.max(2, event.payload?.commits?.length || event.payload?.size || 0)
  if (event.type === 'PullRequestEvent') return 4
  if (event.type === 'PullRequestReviewEvent') return 3
  if (event.type === 'ReleaseEvent') return 5
  if (event.type === 'IssuesEvent' || event.type === 'ForkEvent') return 2
  return 1
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function attackSummary(events: GithubEventResponse[], now = new Date()): AttackSummary {
  const today = new Date(now)
  today.setUTCHours(0, 0, 0, 0)
  const days: AttackDay[] = Array.from({ length: ATTACK_DAY_COUNT }, (_, index) => {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() - (ATTACK_DAY_COUNT - 1 - index))
    return { date: isoDay(date), actions: 0, events: 0 }
  })
  const dayMap = new Map(days.map((day) => [day.date, day]))
  const eventTypes = new Map<string, number>()
  const repositories = new Set<string>()

  for (const event of events) {
    const day = dayMap.get(event.created_at.slice(0, 10))
    if (!day) continue
    day.actions += eventWeight(event)
    day.events += 1
    repositories.add(event.repo.name)
    eventTypes.set(event.type, (eventTypes.get(event.type) || 0) + 1)
  }

  const topEvent = Array.from(eventTypes.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || 'OtherEvent'
  const latest = events
    .slice()
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0]

  return {
    days,
    totalActions: days.reduce((sum, day) => sum + day.actions, 0),
    eventCount: days.reduce((sum, day) => sum + day.events, 0),
    activeDays: days.filter((day) => day.events > 0).length,
    repositories: repositories.size,
    topEvent,
    lastActionAt: latest?.created_at || null
  }
}

function githubHeaders(env: Env): Record<string, string> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': 'github-readme-attack-pulse',
    'x-github-api-version': '2022-11-28'
  }
  if (env.GITHUB_PUBLIC_TOKEN) headers.authorization = `Bearer ${env.GITHUB_PUBLIC_TOKEN}`
  return headers
}

async function githubJson<T>(path: string, env: Env): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders(env),
    signal: AbortSignal.timeout(15_000)
  })
  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    throw new Error(`GitHub request failed (${response.status}, remaining: ${remaining ?? 'unknown'})`)
  }
  return response.json() as Promise<T>
}

export function isValidUsername(username: string): boolean {
  return /^(?!-)(?!.*--)[A-Za-z0-9-]{1,39}(?<!-)$/.test(username)
}

export async function fetchAttackEvents(username: string, env: Env): Promise<GithubEventResponse[]> {
  const encodedUser = encodeURIComponent(username)
  const events: GithubEventResponse[] = []
  const pageCount = Math.ceil(ATTACK_EVENT_LIMIT / ATTACK_EVENT_PAGE_SIZE)

  for (let page = 1; page <= pageCount; page += 1) {
    const perPage = Math.min(ATTACK_EVENT_PAGE_SIZE, ATTACK_EVENT_LIMIT - events.length)
    let batch: GithubEventResponse[]
    try {
      batch = await githubJson<GithubEventResponse[]>(`/users/${encodedUser}/events/public?per_page=${perPage}&page=${page}`, env)
    } catch (error) {
      if (page === 1) throw error
      break
    }
    events.push(...batch)
    if (batch.length < perPage) break
  }
  return events
}

export async function buildSnapshot(username: string, env: Env, now = new Date()) {
  const events = await fetchAttackEvents(username, env)
  const fetchedAt = now
  return {
    version: 1 as const,
    username,
    attackSummary: attackSummary(events, now),
    fetchedAt: fetchedAt.toISOString(),
    expiresAt: new Date(fetchedAt.getTime() + 12 * 60 * 60 * 1000).toISOString()
  }
}
