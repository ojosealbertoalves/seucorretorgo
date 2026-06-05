import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  novo: { label: 'Novo', variant: 'default' },
  qualificado: { label: 'Qualificado', variant: 'secondary' },
  convertido: { label: 'Convertido', variant: 'outline' },
  descartado: { label: 'Descartado', variant: 'destructive' },
}

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Leads</h1>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp / Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Cadastrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  Nenhum lead captado ainda.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                const cfg = STATUS_CONFIG[lead.status] ?? { label: lead.status, variant: 'secondary' as const }
                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.whatsapp ?? lead.telefone}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          lead.score >= 70
                            ? 'font-bold text-green-600'
                            : lead.score >= 40
                              ? 'font-medium text-yellow-600'
                              : 'text-muted-foreground'
                        }
                      >
                        {lead.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
