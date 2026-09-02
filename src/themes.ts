import type { Theme } from './types'

export const DEFAULT_THEME = 'bayern'

export const THEMES: Record<string, Theme> = {
  bayern: { key: 'bayern', background: '#f4f4f5', panel: '#ffffff', grid: '#9f162433', text: '#1f2937', muted: '#64748b', accent: '#e30613', accentStrong: '#9f1624', area: '#e3061330' },
  realmadrid: { key: 'realmadrid', background: '#f4f4f5', panel: '#ffffff', grid: '#d2a90055', text: '#1f2937', muted: '#64748b', accent: '#00529f', accentStrong: '#d2a900', area: '#00529f2e' },
  intermilan: { key: 'intermilan', background: '#f4f4f5', panel: '#ffffff', grid: '#00529f38', text: '#1f2937', muted: '#64748b', accent: '#00529f', accentStrong: '#168bd0', area: '#00529f2e' },
  barcelona: { key: 'barcelona', background: '#f4f4f5', panel: '#ffffff', grid: '#a5004450', text: '#1f2937', muted: '#64748b', accent: '#a50044', accentStrong: '#d6a800', area: '#a500442b' },
  dortmund: { key: 'dortmund', background: '#f4f4f5', panel: '#ffffff', grid: '#b18a003d', text: '#1f2937', muted: '#64748b', accent: '#d4a900', accentStrong: '#2f2f2f', area: '#d4a90035' },
  mancity: { key: 'mancity', background: '#f4f4f5', panel: '#ffffff', grid: '#2aa7d644', text: '#1f2937', muted: '#64748b', accent: '#6cabdd', accentStrong: '#2f8fc2', area: '#6cabdd38' },
  manchestercity: { key: 'mancity', background: '#f4f4f5', panel: '#ffffff', grid: '#2aa7d644', text: '#1f2937', muted: '#64748b', accent: '#6cabdd', accentStrong: '#2f8fc2', area: '#6cabdd38' },

  // Legacy palette keys remain accepted for existing embeds. New embeds should
  // use one of the club presets above.
  sky: { key: 'sky', background: '#07131f', panel: '#0d2435', grid: '#e0f2fe2b', text: '#f0f9ff', muted: '#9cc7df', accent: '#38bdf8', accentStrong: '#7dd3fc', area: '#38bdf852' },
  royal: { key: 'royal', background: '#0b1026', panel: '#151d45', grid: '#e0e7ff2b', text: '#eef2ff', muted: '#a5b4fc', accent: '#6366f1', accentStrong: '#818cf8', area: '#6366f152' },
  green: { key: 'green', background: '#07170f', panel: '#0d2b1b', grid: '#dcfce72b', text: '#f0fdf4', muted: '#9ad0ad', accent: '#22c55e', accentStrong: '#4ade80', area: '#22c55e52' },
  black: { key: 'black', background: '#09090b', panel: '#18181b', grid: '#f4f4f51f', text: '#f4f4f5', muted: '#a1a1aa', accent: '#71717a', accentStrong: '#d4d4d8', area: '#71717a52' },
  violet: { key: 'violet', background: '#160d22', panel: '#28143b', grid: '#fae8ff2b', text: '#fdf4ff', muted: '#d0a7dc', accent: '#c026d3', accentStrong: '#e879f9', area: '#c026d352' }
}

export function resolveTheme(value: string | null): Theme {
  return THEMES[value?.toLowerCase() || DEFAULT_THEME] || THEMES[DEFAULT_THEME]
}
