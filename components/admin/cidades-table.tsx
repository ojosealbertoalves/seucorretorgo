'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Check, X, MapPin } from 'lucide-react'

export type CidadeRow = {
  id: string
  nome: string
  estado: string
  ativo: boolean
  _count: { bairros: number; empreendimentos: number }
}

export function CidadesTable({ cidades }: { cidades: CidadeRow[] }) {
  const router = useRouter()
  const [novoNome, setNovoNome] = useState('')
  const [novoEstado, setNovoEstado] = useState('GO')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editEstado, setEditEstado] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!novoNome.trim()) return
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/cidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novoNome, estado: novoEstado }),
    })
    setSaving(false)
    if (res.ok) {
      setNovoNome('')
      setNovoEstado('GO')
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      setError(err.error || 'Erro ao adicionar cidade.')
    }
  }

  function startEdit(c: CidadeRow) {
    setEditId(c.id)
    setEditNome(c.nome)
    setEditEstado(c.estado)
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/admin/cidades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: editNome, estado: editEstado }),
    })
    if (res.ok) {
      setEditId(null)
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err.error || 'Erro ao salvar.')
    }
  }

  async function toggleAtivo(c: CidadeRow) {
    const res = await fetch(`/api/admin/cidades/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !c.ativo }),
    })
    if (res.ok) router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta cidade?')) return
    const res = await fetch(`/api/admin/cidades/${id}`, { method: 'DELETE' })
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
          <label className="text-xs font-medium text-muted-foreground">Nome da cidade *</label>
          <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Ex: Anápolis" />
        </div>
        <div className="w-24 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <Input value={novoEstado} onChange={(e) => setNovoEstado(e.target.value.toUpperCase())} maxLength={2} />
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
              <TableHead className="w-20">Estado</TableHead>
              <TableHead className="w-40">Bairros vinculados</TableHead>
              <TableHead className="w-20">Ativo</TableHead>
              <TableHead className="text-right w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cidades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  Nenhuma cidade cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              cidades.map((c) => (
                <TableRow key={c.id}>
                  {editId === c.id ? (
                    <>
                      <TableCell>
                        <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} className="h-8" />
                      </TableCell>
                      <TableCell>
                        <Input value={editEstado} onChange={(e) => setEditEstado(e.target.value.toUpperCase())} maxLength={2} className="h-8" />
                      </TableCell>
                      <TableCell colSpan={2} />
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => saveEdit(c.id)}>
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{c.estado}</TableCell>
                      <TableCell>
                        <Link href={`/admin/cidades/${c.id}/bairros`} className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 underline-offset-2 hover:underline">
                          <MapPin className="h-3.5 w-3.5" />
                          {c._count.bairros} bairro{c._count.bairros !== 1 ? 's' : ''}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Switch checked={c.ativo} onCheckedChange={() => toggleAtivo(c)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
