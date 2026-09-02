import type { Theme } from './types'

export const DEFAULT_THEME = 'bayern'

export const THEMES: Record<string, Theme> = {
  bayern: { key: 'bayern', background: '#09090b', panel: '#18181b', grid: '#f4f4f51f', text: '#f4f4f5', muted: '#a1a1aa', accent: '#e30613', accentStrong: '#ff3340', area: '#e3061352' },
  realmadrid: { key: 'realmadrid', background: '#09090b', panel: '#18181b', grid: '#f4f4f51f', text: '#f4f4f5', muted: '#a1a1aa', accent: '#2563eb', accentStrong: '#60a5fa', area: '#2563eb52' },
  intermilan: { key: 'intermilan', background: '#09090b', panel: '#18181b', grid: '#f4f4f51f', text: '#f4f4f5', muted: '#a1a1aa', accent: '#00529f', accentStrong: '#2da8ff', area: '#00529f52' },
  barcelona: { key: 'barcelona', background: '#09090b', panel: '#18181b', grid: '#f4f4f51f', text: '#f4f4f5', muted: '#a1a1aa', accent: '#a50044', accentStrong: '#fcbf00', area: '#a5004452' },
  dortmund: { key: 'dortmund', background: '#09090b', panel: '#18181b', grid: '#f4f4f51f', text: '#f4f4f5', muted: '#a1a1aa', accent: '#f9d71c', accentStrong: '#ffe66d', area: '#f9d71c52' },

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
