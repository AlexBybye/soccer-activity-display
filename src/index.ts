import { ATTACK_CACHE_TTL_MS, attackSummary, buildSnapshot, isValidUsername } from './activity'
import { renderErrorSvg, renderSvg } from './svg'
import { resolveTheme } from './themes'
import type { CachedSnapshot, Env } from './types'

const CACHE_PREFIX = 'attack-pulse:v1:'
const memoryCache = new Map<string, CachedSnapshot>()
const refreshes = new Map<string, Promise<CachedSnapshot>>()

function responseHeaders(cacheControl = 'public, max-age=300, s-maxage=300, stale-while-revalidate=43200'): HeadersInit {
  return { 'content-type': 'image/svg+xml; charset=UTF-8', 'cache-control': cacheControl, 'access-control-allow-origin': '*', 'x-content-type-options': 'nosniff' }
}

function key(username: string): string { return `${CACHE_PREFIX}${username.toLowerCase()}` }

async function readCache(username: string, env: Env): Promise<CachedSnapshot | null> {
  const remote = await env.ATTACK_PULSE_CACHE?.get<CachedSnapshot>(key(username), 'json')
  return remote || memoryCache.get(key(username)) || null
}

async function writeCache(username: string, snapshot: CachedSnapshot, env: Env): Promise<void> {
  memoryCache.set(key(username), snapshot)
  await env.ATTACK_PULSE_CACHE?.put(key(username), JSON.stringify(snapshot), { expirationTtl: Math.floor(ATTACK_CACHE_TTL_MS / 1000) })
}

function refresh(username: string, env: Env): Promise<CachedSnapshot> {
  const existing = refreshes.get(key(username))
  if (existing) return existing
  const promise = buildSnapshot(username, env)
    .then(async (snapshot) => { await writeCache(username, snapshot, env); return snapshot })
    .finally(() => { refreshes.delete(key(username)) })
  refreshes.set(key(username), promise)
  return promise
}

async function snapshotFor(username: string, env: Env, context: ExecutionContext): Promise<{ snapshot: CachedSnapshot; stale: boolean }> {
  const cached = await readCache(username, env)
  if (cached) {
    const stale = Date.parse(cached.expiresAt) <= Date.now()
    if (stale) context.waitUntil(refresh(username, env).catch(() => undefined))
    return { snapshot: cached, stale }
  }
  return { snapshot: await refresh(username, env), stale: false }
}

export default {
  async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...responseHeaders('no-store'), 'access-control-allow-methods': 'GET, OPTIONS' } })
    if (request.method !== 'GET' || url.pathname !== '/graph') return new Response(renderErrorSvg('Use GET /graph?username=...'), { status: 200, headers: responseHeaders('no-store') })

    const username = url.searchParams.get('username')?.trim() || ''
    if (!isValidUsername(username)) return new Response(renderErrorSvg('A valid GitHub username is required.'), { status: 200, headers: responseHeaders('no-store') })

    try {
      const result = await snapshotFor(username, env, context)
      const theme = resolveTheme(url.searchParams.get('club'))
      const svg = renderSvg(username, result.snapshot.attackSummary, theme)
      const headers = responseHeaders(result.stale ? 'public, max-age=60, s-maxage=60, stale-while-revalidate=43200' : undefined)
      return new Response(svg, { status: 200, headers })
    } catch (error) {
      return new Response(renderErrorSvg(error instanceof Error ? error.message : 'GitHub activity could not be loaded.'), { status: 200, headers: responseHeaders('no-store') })
    }
  }
}

export { attackSummary }
