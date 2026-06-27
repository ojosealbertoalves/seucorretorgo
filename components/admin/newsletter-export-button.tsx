'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

type Lead = { nome: string; email: string; whatsapp: string; createdAt: Date; ativo: boolean }

export function NewsletterExportButton({ leads }: { leads: Lead[] }) {
  function handleExport() {
    const header = 'Nome,Email,WhatsApp,Cadastrado em,Status'
    const rows = leads.map((l) =>
      [
        `"${l.nome}"`,
        `"${l.email}"`,
        `"${l.whatsapp}"`,
        `"${new Date(l.createdAt).toLocaleDateString('pt-BR')}"`,
        l.ativo ? 'Ativo' : 'Inativo',
      ].join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  )
}
