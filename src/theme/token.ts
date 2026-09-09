export const colors = {
  primary: '#208AEF',
  primaryDark: '#0B63C5',
  primaryDarker: '#052646',
  gold: '#F2A93B',
  background: '#F5F8FC',
  textMuted: '#64748B',
} as const

export const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  found: { bg: '#DCFCE7', text: '#15803D', label: 'Encontrado' },
  lost: { bg: '#FEE2E2', text: '#B91C1C', label: 'Perdido' },
  claimed: { bg: '#FEF3C7', text: '#B45309', label: 'En reclamo' },
  returned: { bg: '#E0E7FF', text: '#3730A3', label: 'Devuelto' },
}