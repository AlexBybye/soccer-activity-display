import { attackSummary } from '../src/activity'
import { renderSvg } from '../src/svg'
import { resolveTheme } from '../src/themes'
import { describe, expect, it } from 'vitest'

describe('SVG renderer', () => {
  it('escapes user-controlled labels and keeps the output self-contained', () => {
    const summary = attackSummary([], new Date('2026-09-02T12:00:00Z'))
    const svg = renderSvg('<username>', summary, resolveTheme('unknown'))
    expect(svg).toContain('&lt;username&gt;')
    expect(svg).not.toContain('<script')
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).not.toContain('Peak activity marker')
  })
})
