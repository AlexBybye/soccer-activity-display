import type { AttackDay, AttackSummary, Theme } from './types'

const WIDTH = 1000
const HEIGHT = 360
const LEFT = 64
const RIGHT = 952
const TOP = 112
const BOTTOM = 300
const INTERVALS = 4

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;' })[character] || character)
}

export function niceMax(days: AttackDay[]): number {
  const maxActions = Math.max(0, ...days.map((day) => day.actions))
  if (maxActions <= INTERVALS) return INTERVALS
  const roughStep = maxActions / INTERVALS
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const normalized = roughStep / magnitude
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 3 ? 3 : normalized <= 4 ? 4 : normalized <= 5 ? 5 : normalized <= 8 ? 8 : 10
  return Math.ceil(factor * magnitude * INTERVALS)
}

function eventLabel(value: string): string {
  return ({ PushEvent: 'Code pushes', PullRequestEvent: 'Pull requests', PullRequestReviewEvent: 'Reviews', IssuesEvent: 'Issues', IssueCommentEvent: 'Issue comments', CreateEvent: 'Created repositories', ForkEvent: 'Forks', ReleaseEvent: 'Releases', WatchEvent: 'Stars', OtherEvent: 'Other public activity' } as Record<string, string>)[value] || 'Other public activity'
}

function dateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00Z`)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
}

function metric(label: string, value: string | number, x: number, theme: Theme): string {
  return `<text x="${x}" y="76" fill="${theme.muted}" font-size="12" letter-spacing="1.2">${escapeXml(label.toUpperCase())}</text><text x="${x}" y="98" fill="${theme.text}" font-size="20" font-weight="700">${escapeXml(String(value))}</text>`
}

export function renderSvg(username: string, summary: AttackSummary, theme: Theme): string {
  const max = niceMax(summary.days)
  const points = summary.days.map((day, index) => ({
    ...day,
    x: LEFT + index / Math.max(1, summary.days.length - 1) * (RIGHT - LEFT),
    y: BOTTOM - day.actions / max * (BOTTOM - TOP)
  }))
  const linePath = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')
  const areaPath = `${linePath} L ${RIGHT} ${BOTTOM} L ${LEFT} ${BOTTOM} Z`
  const peak = points.reduce((best, point) => point.actions > best.actions ? point : best, points[0])
  const ticks = Array.from({ length: INTERVALS + 1 }, (_, index) => ({ value: max - index * max / INTERVALS, y: TOP + index / INTERVALS * (BOTTOM - TOP) }))
  const grid = ticks.map((tick) => `<line x1="${LEFT}" y1="${tick.y}" x2="${RIGHT}" y2="${tick.y}" stroke="${theme.grid}" stroke-width="1" />`).join('') + Array.from({ length: 7 }, (_, index) => { const x = LEFT + (index + 1) / 8 * (RIGHT - LEFT); return `<line x1="${x}" y1="${TOP}" x2="${x}" y2="${BOTTOM}" stroke="${theme.grid}" stroke-width="1" />` }).join('')
  const pointsMarkup = points.map((point) => {
    const active = point.actions > 0
    return `<circle class="data-point" cx="${point.x}" cy="${point.y}" r="${active ? 4 : 2}" fill="${active ? theme.text : theme.panel}" stroke="${theme.accent}" stroke-width="${active ? 3 : 1.5}" opacity="${active ? 1 : 0.75}"><title>${escapeXml(dateLabel(point.date))}: ${point.actions} weighted actions</title></circle>`
  }).join('')
  const dateTicks = [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]].filter(Boolean).map((point) => `<text x="${point.x}" y="328" text-anchor="${point.x === LEFT ? 'start' : point.x === RIGHT ? 'end' : 'middle'}" fill="${theme.muted}" font-size="11">${escapeXml(dateLabel(point.date))}</text>`).join('')
  const hasPeak = peak.actions > 0
  const description = `${summary.totalActions} weighted actions across ${summary.activeDays} active days for ${username}${hasPeak ? '. Peak activity is marked with a soccer ball on a soccer pitch' : ''}`
  const peakMarkup = hasPeak
    ? `<g aria-label="Peak activity marker" transform="translate(${(peak.x - 14).toFixed(2)} ${(peak.y - 14).toFixed(2)}) scale(${(28 / 256).toFixed(6)})" fill="${theme.text}"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm76.52,147.42H170.9l-9.26-12.76,12.63-36.78,15-4.89,26.24,20.13A87.38,87.38,0,0,1,204.52,171.42Zm-164-34.3L66.71,117l15,4.89,12.63,36.78L85.1,171.42H51.48A87.38,87.38,0,0,1,40.47,137.12Zm10-50.64,5.51,18.6L40.71,116.77A87.33,87.33,0,0,1,50.43,86.48ZM109,152,97.54,118.65,128,97.71l30.46,20.94L147,152Zm91.07-46.92,5.51-18.6a87.33,87.33,0,0,1,9.72,30.29Zm-6.2-35.38-9.51,32.08-15.07,4.89L136,83.79V68.21l29.09-20A88.58,88.58,0,0,1,193.86,69.7ZM146.07,41.87,128,54.29,109.93,41.87a88.24,88.24,0,0,1,36.14,0ZM90.91,48.21l29.09,20V83.79L86.72,106.67l-15.07-4.89L62.14,69.7A88.58,88.58,0,0,1,90.91,48.21ZM63.15,187.42H83.52l7.17,20.27A88.4,88.4,0,0,1,63.15,187.42ZM110,214.13,98.12,180.71,107.35,168h41.3l9.23,12.71-11.83,33.42a88,88,0,0,1-36.1,0Zm55.36-6.44,7.17-20.27h20.37A88.4,88.4,0,0,1,165.31,207.69Z" /></g>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(username)} GitHub attack pulse</title>
  <desc id="desc">${escapeXml(description)}.</desc>
  <rect width="1000" height="360" rx="18" fill="${theme.background}" />
  <rect x="20" y="20" width="960" height="320" rx="14" fill="${theme.panel}" stroke="${theme.grid}" />
  <text x="44" y="49" fill="${theme.accentStrong}" font-size="12" font-weight="700" letter-spacing="2">ATTACK PULSE / GITHUB ACTIVITY</text>
  ${metric('weighted actions', summary.totalActions, 44, theme)}${metric('active days', summary.activeDays, 220, theme)}${metric('repositories', summary.repositories, 390, theme)}${metric('play style', eventLabel(summary.topEvent), 560, theme)}
  <g class="grid">${grid}<rect x="${LEFT}" y="${TOP}" width="${RIGHT - LEFT}" height="${BOTTOM - TOP}" fill="none" stroke="${theme.grid}" stroke-width="1" /><line x1="${(LEFT + RIGHT) / 2}" y1="${TOP}" x2="${(LEFT + RIGHT) / 2}" y2="${BOTTOM}" stroke="${theme.grid}" stroke-width="1" /><circle cx="${(LEFT + RIGHT) / 2}" cy="${(TOP + BOTTOM) / 2}" r="42" fill="none" stroke="${theme.grid}" stroke-width="1" /></g>
  <g fill="${theme.muted}" font-size="10" text-anchor="end">${ticks.map((tick) => `<text x="52" y="${tick.y + 4}">${Math.round(tick.value)}</text>`).join('')}</g>
  <path class="area" d="${areaPath}" fill="${theme.area}" />
  <path class="line" d="${linePath}" fill="none" stroke="${theme.accentStrong}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  ${pointsMarkup}
  ${peakMarkup}
  ${dateTicks}
  <text x="${RIGHT}" y="328" text-anchor="end" fill="${theme.muted}" font-size="10">last ${summary.days.length} days of public events · ${escapeXml(summary.lastActionAt ? `updated ${summary.lastActionAt.slice(0, 10)}` : 'no public activity')}</text>
</svg>`
}

export function renderErrorSvg(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="240" viewBox="0 0 1000 240" role="img"><rect width="1000" height="240" rx="18" fill="#f4f4f5"/><rect x="20" y="20" width="960" height="200" rx="14" fill="#ffffff" stroke="#cbd5e1"/><text x="40" y="92" fill="#b42333" font-size="16" font-weight="700">ATTACK PULSE UNAVAILABLE</text><text x="40" y="132" fill="#1f2937" font-size="15">${escapeXml(message)}</text><text x="40" y="176" fill="#64748b" font-size="12">Check the username and try again later.</text></svg>`
}
