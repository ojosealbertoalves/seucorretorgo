'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'

export type BairroRow = {
  id: string
  nome: string
  ativo: boolean
  _count: { empreendimentos: number }
}

export function BairrosTable({ cidadeId, bairros }: { cidadeId: string; bairros: BairroRow[] }) {
  const router = useRouter()
  const [novoNome, setNovoNome] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!novoNome.trim()) return
    setSaving(true)
    setError('')
    const res = await fetch(`/api/admin/cidades/${cidadeId}/bairros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novoNome }),
    })
    setSaving(false)
    if (res.ok) {
      setNovoNome('')
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      setError(err.error || 'Erro ao adicionar bairro.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este bairro?')) return
    const res = await fetch(`/api/admin/bairros/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err.error || 'Erro ao excluir.')
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex items-end gap-2 rounded-lg border bg-white p-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Nome do bairro *</label>
          <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Ex: Jardim Goiás" />
        </div>
        <Button type="submit" disabled={saving}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-2 text-sm">{error}</div>
      )}

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-40">Empreendimentos</TableHead>
              <TableHead className="text-right w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bairros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                  Nenhum bairro cadastrado nesta cidade.
                </TableCell>
              </TableRow>
            ) : (
              bairros.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.nome}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{b._count.empreendimentos}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
