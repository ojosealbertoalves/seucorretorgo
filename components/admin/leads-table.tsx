'use client'

import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2 } from 'lucide-react'
import { LeadStatusBadge } from './lead-status-badge'
import type { LeadRow } from './leads-view'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function LeadsTable({
  leads,
  onEdit,
  onDelete,
}: {
  leads: LeadRow[]
  onEdit: (lead: LeadRow) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                Nenhum lead captado ainda.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.nome}</TableCell>
                <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                <TableCell className="text-muted-foreground">{lead.whatsapp ?? '—'}</TableCell>
                <TableCell>
                  <span
                    className={
                      lead.score >= 7
                        ? 'font-bold text-green-600'
                        : lead.score >= 4
                          ? 'font-medium text-yellow-600'
                          : 'text-muted-foreground'
                    }
                  >
                    {lead.score}
                  </span>
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {fmtDate(lead.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(lead)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(lead.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
