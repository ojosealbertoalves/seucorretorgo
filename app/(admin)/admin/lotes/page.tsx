export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { LoteActions } from '@/components/admin/lote-actions'

function fmt(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(value)
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR')
}

export default async function LotesPage() {
  const lotes = await prisma.loteAnuncio.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titulo: true,
      bairro: true,
      area: true,
      preco: true,
      ativo: true,
      createdAt: true,
      loteamento: { select: { nome: true } },
    },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Lotes Avulsos/Associados</h1>
        <Button asChild>
          <Link href="/admin/lotes/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo lote
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Loteamento associado</TableHead>
              <TableHead>Publicado</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  Nenhum lote cadastrado.{' '}
                  <Link href="/admin/lotes/novo" className="underline">
                    Adicionar o primeiro.
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              lotes.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.titulo}</TableCell>
                  <TableCell className="text-muted-foreground">{l.bairro}</TableCell>
                  <TableCell className="text-sm">{l.area.toLocaleString('pt-BR')}m²</TableCell>
                  <TableCell className="text-sm">{fmt(l.preco)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {l.loteamento?.nome ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={l.ativo ? 'default' : 'outline'}>
                      {l.ativo ? 'Sim' : 'Não'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(l.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <LoteActions id={l.id} />
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
