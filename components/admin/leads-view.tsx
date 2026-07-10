'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { List, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LeadsTable } from './leads-table'
import { LeadsKanban } from './leads-kanban'
import { LeadEditModal } from './lead-edit-modal'

export type LeadRow = {
  id: string
  nome: string
  email: string
  whatsapp: string | null
  status: string
  score: number
  notas: string | null
  empreendimentosInteresse: string | null
  createdAt: string
}

export function LeadsView({ leads: initialLeads }: { leads: LeadRow[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [view, setView] = useState<'lista' | 'kanban'>('lista')
  const [editing, setEditing] = useState<LeadRow | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Confirma a exclusão deste lead? Esta ação não pode ser desfeita.')) return
    const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id))
      router.refresh()
    }
  }

  async function handleStatusChange(id: string, status: string) {
    const previous = leads
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    const res = await fetch(`/api/admin/leads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) setLeads(previous)
    else router.refresh()
  }

  async function handleSave(id: string, data: Partial<LeadRow>) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)))
      setEditing(null)
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant={view === 'lista' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('lista')}
        >
          <List className="mr-2 h-4 w-4" />
          Lista
        </Button>
        <Button
          variant={view === 'kanban' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('kanban')}
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          Kanban
        </Button>
      </div>

      {view === 'lista' ? (
        <LeadsTable leads={leads} onEdit={setEditing} onDelete={handleDelete} />
      ) : (
        <LeadsKanban
          leads={leads}
          onEdit={setEditing}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {editing && (
        <LeadEditModal lead={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
    </div>
  )
}
