/**
 * Admin chart series colours: revenue = blue, volume = gold. CSS variables,
 * set per admin theme in globals.css. Kept out of charts.tsx because that is
 * a client module, and server pages can't read plain values exported from one.
 */
export const SERIES = { revenue: 'var(--adm-chart-blue)', volume: 'var(--adm-chart-gold)' } as const
