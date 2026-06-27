export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Mail } from 'lucide-react'
import { NewsletterExportButton } from '@/components/admin/newsletter-export-button'

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function AdminNewsletterPage() {
  const leads = await prisma.newsletterLead.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {leads.length} {leads.length === 1 ? 'cadastrado' : 'cadastrados'}
          </p>
        </div>
        {leads.length > 0 && <NewsletterExportButton leads={leads} />}
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  <Mail className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  Nenhum cadastro na newsletter ainda.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.whatsapp}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{fmtDate(lead.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={lead.ativo ? 'default' : 'secondary'}>
                      {lead.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
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
