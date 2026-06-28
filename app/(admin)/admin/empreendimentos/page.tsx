export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Building2, Sparkles } from 'lucide-react'
import { EmpreendimentoActions } from '@/components/admin/empreendimento-actions'

const STATUS_LABEL: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto',
}

const TIPO_LABEL: Record<string, string> = {
  IMOVEL: 'Imóvel',
  LOTE: 'Lote',
}

function fmt(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function EmpreendimentosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const { tipo } = await searchParams
  const empreendimentos = await prisma.empreendimento.findMany({
    orderBy: { createdAt: 'desc' },
    where: tipo === 'IMOVEL' || tipo === 'LOTE' ? { tipoNegocio: tipo } : undefined,
    select: {
      id: true,
      nome: true,
      bairro: true,
      status: true,
      precoMin: true,
      precoMax: true,
      ativo: true,
      tipoNegocio: true,
      incorporadora: { select: { nome: true, logo: true } },
    },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Empreendimentos</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/empreendimentos/importar">
              <Sparkles className="mr-2 h-4 w-4" />
              Importar via IA
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/empreendimentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo empreendimento
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['', 'IMOVEL', 'LOTE'] as const).map((t) => (
          <Button
            key={t}
            asChild
            variant={tipo === t || (!tipo && t === '') ? 'default' : 'outline'}
            size="sm"
          >
            <Link href={t ? `/admin/empreendimentos?tipo=${t}` : '/admin/empreendimentos'}>
              {t === '' ? 'Todos' : TIPO_LABEL[t]}
            </Link>
          </Button>
        ))}
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Incorporadora</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Publicado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empreendimentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  Nenhum empreendimento cadastrado.{' '}
                  <Link href="/admin/empreendimentos/novo" className="underline">
                    Adicionar o primeiro.
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              empreendimentos.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.nome}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {e.incorporadora.logo ? (
                        <img
                          src={e.incorporadora.logo}
                          alt={e.incorporadora.nome}
                          className="w-6 h-6 rounded object-contain bg-gray-50"
                        />
                      ) : (
                        <Building2 className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-muted-foreground">{e.incorporadora.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.bairro}</TableCell>
                  <TableCell>
                    <Badge variant={e.tipoNegocio === 'LOTE' ? 'outline' : 'secondary'}>
                      {TIPO_LABEL[e.tipoNegocio] ?? e.tipoNegocio}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{STATUS_LABEL[e.status] ?? e.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {fmt(e.precoMin)}
                    {e.precoMin !== e.precoMax && ` – ${fmt(e.precoMax)}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={e.ativo ? 'default' : 'outline'}>
                      {e.ativo ? 'Sim' : 'Não'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <EmpreendimentoActions id={e.id} />
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
