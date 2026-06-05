'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

export function EmpreendimentoActions({ id }: { id: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Confirma a exclusão deste empreendimento? Esta ação não pode ser desfeita.')) return
    setDeleting(true)
    await fetch(`/api/admin/empreendimentos/${id}`, { method: 'DELETE' })
    router.refresh()
    setDeleting(false)
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
      >
        <Link href={`/admin/empreendimentos/${id}/editar`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={deleting}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
