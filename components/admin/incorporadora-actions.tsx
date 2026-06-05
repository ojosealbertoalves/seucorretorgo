'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

export function IncorporadoraActions({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Excluir esta incorporadora? A operação falhará se houver empreendimentos vinculados.')) return
    const res = await fetch(`/api/admin/incorporadoras/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err.error || 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="ghost" size="icon">
        <Link href={`/admin/incorporadoras/${id}/editar`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" onClick={handleDelete}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}
