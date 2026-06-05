export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Building2 } from 'lucide-react'
import { IncorporadoraActions } from '@/components/admin/incorporadora-actions'

export default async function IncorporadorasPage() {
  const incorporadoras = await prisma.incorporadora.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { empreendimentos: true } } },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Incorporadoras</h1>
        <Button asChild>
          <Link href="/admin/incorporadoras/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova incorporadora
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Construtora</TableHead>
              <TableHead>Site</TableHead>
              <TableHead className="w-32">Empreendimentos</TableHead>
              <TableHead className="w-20">Ativo</TableHead>
              <TableHead className="text-right w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incorporadoras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  Nenhuma incorporadora cadastrada.{' '}
                  <Link href="/admin/incorporadoras/nova" className="underline">
                    Adicionar a primeira.
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              incorporadoras.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell>
                    {inc.logo ? (
                      <img
                        src={inc.logo}
                        alt={inc.nome}
                        className="w-10 h-10 rounded object-contain bg-gray-50 border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 border flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{inc.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{inc.construtora ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {inc.site ? (
                      <a
                        href={inc.site}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:no-underline"
                      >
                        {inc.site.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {inc._count.empreendimentos}
                  </TableCell>
                  <TableCell>
                    <Badge variant={inc.ativo ? 'default' : 'outline'}>
                      {inc.ativo ? 'Sim' : 'Não'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <IncorporadoraActions id={inc.id} />
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
