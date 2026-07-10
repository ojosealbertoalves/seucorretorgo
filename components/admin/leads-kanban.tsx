'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { KANBAN_STATUSES, STATUS_ORDER, statusColor, statusLabel } from './lead-status'
import type { LeadRow } from './leads-view'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function LeadCard({
  lead,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  lead: LeadRow
  onEdit: (lead: LeadRow) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}) {
  return (
    <div
      className="rounded-xl p-3 space-y-2"
      style={{ background: '#080F08', border: '1px solid #1E3A1E' }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-white font-medium text-sm leading-tight truncate">{lead.nome}</p>
        <span
          className="shrink-0 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          style={{ background: 'rgba(224,123,58,0.15)', color: '#E07B3A' }}
        >
          {lead.score}
        </span>
      </div>

      <p className="text-white/40 text-xs">{fmtDate(lead.createdAt)}</p>
      <p className="text-white/50 text-xs truncate">{lead.email}</p>
      {lead.whatsapp && <p className="text-white/50 text-xs">{lead.whatsapp}</p>}

      <select
        value={lead.status}
        onChange={(e) => onStatusChange(lead.id, e.target.value)}
        className="w-full text-xs rounded-lg px-2 py-1.5 text-white/80 outline-none"
        style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s} style={{ background: '#0F1F0F' }}>
            Mover para {statusLabel(s)}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1 pt-1">
        <button
          onClick={() => onEdit(lead)}
          className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <Pencil size={12} /> Editar
        </button>
        <button
          onClick={() => onDelete(lead.id)}
          className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors"
          style={{ background: 'rgba(239,68,68,0.08)' }}
        >
          <Trash2 size={12} /> Excluir
        </button>
      </div>
    </div>
  )
}

export function LeadsKanban({
  leads,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  leads: LeadRow[]
  onEdit: (lead: LeadRow) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {KANBAN_STATUSES.map((status) => {
        const col = leads.filter((l) => l.status === status)
        const c = statusColor(status)
        return (
          <div
            key={status}
            className="rounded-xl flex flex-col min-w-0"
            style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
          >
            <div
              className="px-3 py-2.5 flex items-center justify-between rounded-t-xl"
              style={{ background: c.bg, borderBottom: `1px solid ${c.border}` }}
            >
              <span className="text-sm font-semibold" style={{ color: c.text }}>
                {statusLabel(status)}
              </span>
              <span
                className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                style={{ background: c.border, color: c.text }}
              >
                {col.length}
              </span>
            </div>

            <div className="p-2 space-y-2 flex-1 min-h-24">
              {col.length === 0 ? (
                <p className="text-white/25 text-xs text-center py-6">Nenhum lead</p>
              ) : (
                col.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
