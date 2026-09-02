export interface GithubEventResponse {
  type: string
  created_at: string
  repo: { name: string }
  payload?: {
    commits?: unknown[]
    size?: number
  }
}

export interface AttackDay {
  date: string
  actions: number
  events: number
}

export interface AttackSummary {
  days: AttackDay[]
  totalActions: number
  eventCount: number
  activeDays: number
  repositories: number
  topEvent: string
  lastActionAt: string | null
}

export interface CachedSnapshot {
  version: 1
  username: string
  attackSummary: AttackSummary
  fetchedAt: string
  expiresAt: string
}

export interface Theme {
  key: string
  background: string
  panel: string
  grid: string
  text: string
  muted: string
  accent: string
  accentStrong: string
  area: string
}

export interface KvNamespace {
  get<T>(key: string, type: 'json'): Promise<T | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

export interface Env {
  GITHUB_PUBLIC_TOKEN?: string
  ATTACK_PULSE_CACHE?: KvNamespace
}
