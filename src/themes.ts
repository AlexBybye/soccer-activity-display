import type { Theme } from './types'

export const DEFAULT_THEME = 'bayern'

export const THEMES: Record<string, Theme> = {
  bayern: { key: 'bayern', background: '#f4f4f5', panel: '#ffffff', grid: '#9f162433', text: '#1f2937', muted: '#64748b', accent: '#e30613', accentStrong: '#9f1624', area: '#e3061330' },
  realmadrid: { key: 'realmadrid', background: '#f4f4f5', panel: '#ffffff', grid: '#d2a90055', text: '#1f2937', muted: '#64748b', accent: '#00529f', accentStrong: '#d2a900', area: '#00529f2e' },
  intermilan: { key: 'intermilan', background: '#f4f4f5', panel: '#ffffff', grid: '#00529f38', text: '#1f2937', muted: '#64748b', accent: '#00529f', accentStrong: '#168bd0', area: '#00529f2e' },
  barcelona: { key: 'barcelona', background: '#f4f4f5', panel: '#ffffff', grid: '#a5004450', text: '#1f2937', muted: '#64748b', accent: '#a50044', accentStrong: '#d6a800', area: '#a500442b' },
  dortmund: { key: 'dortmund', background: '#f4f4f5', panel: '#ffffff', grid: '#b18a003d', text: '#1f2937', muted: '#64748b', accent: '#d4a900', accentStrong: '#2f2f2f', area: '#d4a90035' },
  mancity: { key: 'mancity', background: '#f4f4f5', panel: '#ffffff', grid: '#2aa7d644', text: '#1f2937', muted: '#64748b', accent: '#6cabdd', accentStrong: '#2f8fc2', area: '#6cabdd38' },
  manchestercity: { key: 'mancity', background: '#f4f4f5', panel: '#ffffff', grid: '#2aa7d644', text: '#1f2937', muted: '#64748b', accent: '#6cabdd', accentStrong: '#2f8fc2', area: '#6cabdd38' }
}

export function resolveTheme(value: string | null): Theme {
  return THEMES[value?.toLowerCase() || DEFAULT_THEME] || THEMES[DEFAULT_THEME]
}
