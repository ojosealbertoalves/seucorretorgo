'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { STATUS_ORDER, statusLabel } from './lead-status'
import type { LeadRow } from './leads-view'

export function LeadEditModal({
  lead,
  onClose,
  onSave,
}: {
  lead: LeadRow
  onClose: () => void
  onSave: (id: string, data: Partial<LeadRow>) => Promise<void>
}) {
  const [nome, setNome] = useState(lead.nome)
  const [email, setEmail] = useState(lead.email)
  const [whatsapp, setWhatsapp] = useState(lead.whatsapp ?? '')
  const [status, setStatus] = useState(lead.status)
  const [score, setScore] = useState(lead.score)
  const [notas, setNotas] = useState(lead.notas ?? '')
  const [empreendimentosInteresse, setEmpreendimentosInteresse] = useState(
    lead.empreendimentosInteresse ?? '',
  )
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(lead.id, {
      nome,
      email,
      whatsapp: whatsapp || null,
      status,
      score,
      notas: notas || null,
      empreendimentosInteresse: empreendimentosInteresse || null,
    })
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6"
        style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Editar lead</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-white/70">Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70">Score (0-10)</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-white/70">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70">WhatsApp</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">Empreendimentos de interesse</Label>
            <Input
              value={empreendimentosInteresse}
              onChange={(e) => setEmpreendimentosInteresse(e.target.value)}
              placeholder="Ex: Jardins Grécia, Vila Real"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">Notas / Observações</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={4}
              placeholder="Observações livres sobre o lead..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
