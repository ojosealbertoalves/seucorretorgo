export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { LeadsView } from '@/components/admin/leads-view'

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })

  const data = leads.map((l) => ({
    id: l.id,
    nome: l.nome,
    email: l.email,
    whatsapp: l.whatsapp ?? l.telefone,
    status: l.status,
    score: l.score,
    notas: l.notas,
    empreendimentosInteresse: l.empreendimentosInteresse,
    createdAt: l.createdAt.toISOString(),
  }))

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Leads</h1>
      <LeadsView leads={data} />
    </div>
  )
}
