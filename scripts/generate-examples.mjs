import { mkdir, writeFile } from 'node:fs/promises'
import { renderSvg } from '../src/svg.ts'
import { THEMES } from '../src/themes.ts'

const actions = [0, 5, 0, 1, 0, 0, 2, 0, 3, 0, 1, 0, 0, 2, 4]
const start = new Date('2026-08-19T00:00:00Z')
const days = actions.map((value, index) => {
  const date = new Date(start)
  date.setUTCDate(start.getUTCDate() + index)
  return { date: date.toISOString().slice(0, 10), actions: value, events: value ? Math.max(1, Math.ceil(value / 2)) : 0 }
})

const summary = {
  days,
  totalActions: actions.reduce((sum, value) => sum + value, 0),
  eventCount: 18,
  activeDays: actions.filter(Boolean).length,
  repositories: 7,
  topEvent: 'PushEvent',
  lastActionAt: '2026-09-02T10:32:00Z'
}

await mkdir(new URL('../examples/', import.meta.url), { recursive: true })
for (const key of ['bayern', 'realmadrid', 'intermilan', 'barcelona', 'dortmund', 'mancity']) {
  await writeFile(new URL(`../examples/${key}.svg`, import.meta.url), `${renderSvg('AlexBybye', summary, THEMES[key])}\n`)
}
