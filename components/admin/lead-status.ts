export const STATUS_ORDER = [
  'novo',
  'em_contato',
  'qualificado',
  'visita_agendada',
  'proposta',
  'fechado',
  'descartado',
] as const

export type LeadStatus = (typeof STATUS_ORDER)[number]

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_contato: 'Em Contato',
  qualificado: 'Qualificado',
  visita_agendada: 'Visita Agendada',
  proposta: 'Proposta',
  fechado: 'Fechado',
  descartado: 'Descartado',
}

export const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string; border: string }> = {
  novo: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.4)' },
  em_contato: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', border: 'rgba(234,179,8,0.4)' },
  qualificado: { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: 'rgba(249,115,22,0.4)' },
  visita_agendada: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', border: 'rgba(168,85,247,0.4)' },
  proposta: { bg: 'rgba(6,182,212,0.15)', text: '#22d3ee', border: 'rgba(6,182,212,0.4)' },
  fechado: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.4)' },
  descartado: { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', border: 'rgba(148,163,184,0.4)' },
}

/** Colunas do kanban — "descartado" fica de fora para não poluir o board. */
export const KANBAN_STATUSES: LeadStatus[] = STATUS_ORDER.filter((s) => s !== 'descartado')

export function statusLabel(status: string) {
  return STATUS_LABELS[status as LeadStatus] ?? status
}

export function statusColor(status: string) {
  return STATUS_COLORS[status as LeadStatus] ?? STATUS_COLORS.descartado
}
