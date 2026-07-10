'use client'

import { useSyncExternalStore } from 'react'
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Pencil, Trash2, GripVertical } from 'lucide-react'
import { KANBAN_STATUSES, STATUS_ORDER, statusColor, statusLabel } from './lead-status'
import type { LeadRow } from './leads-view'

type CardActions = {
  onEdit: (lead: LeadRow) => void
  onDelete: (id: string) => void
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

/** Desktop com ponteiro fino (mouse) usa drag and drop; touch/mobile usa o select de fallback. */
const DESKTOP_QUERY = '(min-width: 768px) and (pointer: fine)'

function subscribeDesktopQuery(callback: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getIsDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches
}

function getIsDesktopServerSnapshot() {
  return false
}

function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktopQuery, getIsDesktopSnapshot, getIsDesktopServerSnapshot)
}

function CardBody({ lead }: { lead: LeadRow }) {
  return (
    <>
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
    </>
  )
}

function CardButtons({ lead, onEdit, onDelete }: { lead: LeadRow } & CardActions) {
  return (
    <div className="flex items-center gap-1 pt-1">
      <button
        onClick={() => onEdit(lead)}
        onPointerDown={(e) => e.stopPropagation()}
        className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <Pencil size={12} /> Editar
      </button>
      <button
        onClick={() => onDelete(lead.id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors"
        style={{ background: 'rgba(239,68,68,0.08)' }}
      >
        <Trash2 size={12} /> Excluir
      </button>
    </div>
  )
}

/* ─── Mobile fallback: card estático com select de status ──────────── */
function KanbanCardEstatico({
  lead,
  onEdit,
  onDelete,
  onStatusChange,
}: { lead: LeadRow; onStatusChange: (id: string, status: string) => void } & CardActions) {
  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: '#080F08', border: '1px solid #1E3A1E' }}>
      <CardBody lead={lead} />

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

      <CardButtons lead={lead} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

function KanbanColunaEstatica({
  status,
  leads,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  status: (typeof KANBAN_STATUSES)[number]
  leads: LeadRow[]
  onStatusChange: (id: string, status: string) => void
} & CardActions) {
  const col = leads.filter((l) => l.status === status)
  const c = statusColor(status)
  return (
    <div className="rounded-xl flex flex-col min-w-0" style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}>
      <div
        className="px-3 py-2.5 flex items-center justify-between rounded-t-xl"
        style={{ background: c.bg, borderBottom: `1px solid ${c.border}` }}
      >
        <span className="text-sm font-semibold" style={{ color: c.text }}>{statusLabel(status)}</span>
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
            <KanbanCardEstatico
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
}

/* ─── Desktop: drag and drop com @dnd-kit ───────────────────────────── */
function KanbanCard({ lead, onEdit, onDelete }: { lead: LeadRow } & CardActions) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  })

  const style: React.CSSProperties = {
    background: '#080F08',
    border: '1px solid #1E3A1E',
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 30 : undefined,
    position: isDragging ? 'relative' : undefined,
    transition: isDragging ? undefined : 'opacity 200ms ease, transform 200ms ease',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="rounded-xl p-3 space-y-2 touch-none"
    >
      <div className="flex items-center gap-1.5 text-white/25">
        <GripVertical size={12} />
        <span className="text-[10px] uppercase tracking-wide">Arraste para mover</span>
      </div>
      <CardBody lead={lead} />
      <CardButtons lead={lead} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

function KanbanColuna({
  status,
  leads,
  onEdit,
  onDelete,
}: {
  status: (typeof KANBAN_STATUSES)[number]
  leads: LeadRow[]
} & CardActions) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const col = leads.filter((l) => l.status === status)
  const c = statusColor(status)

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl flex flex-col min-w-0 transition-colors duration-150"
      style={{
        background: '#0F1F0F',
        border: isOver ? '2px solid #E07B3A' : '1px solid #1E3A1E',
      }}
    >
      <div
        className="px-3 py-2.5 flex items-center justify-between rounded-t-xl"
        style={{ background: c.bg, borderBottom: `1px solid ${c.border}` }}
      >
        <span className="text-sm font-semibold" style={{ color: c.text }}>{statusLabel(status)}</span>
        <span
          className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          style={{ background: c.border, color: c.text }}
        >
          {col.length}
        </span>
      </div>
      <div className="p-2 space-y-2 flex-1 min-h-24">
        {col.length === 0 ? (
          <p className="text-white/25 text-xs text-center py-6">
            {isOver ? 'Solte aqui' : 'Nenhum lead'}
          </p>
        ) : (
          col.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  )
}

function KanbanBoard({
  leads,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  leads: LeadRow[]
  onStatusChange: (id: string, status: string) => void
} & CardActions) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over) return
    const leadId = String(active.id)
    const newStatus = String(over.id)
    const lead = leads.find((l) => l.id === leadId)
    if (lead && lead.status !== newStatus) {
      onStatusChange(leadId, newStatus)
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {KANBAN_STATUSES.map((status) => (
          <KanbanColuna
            key={status}
            status={status}
            leads={leads}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  )
}

/* ─── Entry point: escolhe drag and drop (desktop) ou select (mobile) ── */
export function LeadsKanban({
  leads,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  leads: LeadRow[]
  onStatusChange: (id: string, status: string) => void
} & CardActions) {
  const isDesktop = useIsDesktop()

  if (!isDesktop) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {KANBAN_STATUSES.map((status) => (
          <KanbanColunaEstatica
            key={status}
            status={status}
            leads={leads}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    )
  }

  return <KanbanBoard leads={leads} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
}
