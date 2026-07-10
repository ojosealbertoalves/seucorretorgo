import { prisma } from '@/lib/prisma'
import { enviarEmailNovoLead } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { nome, email, whatsapp, historicoJson } = await req.json()

    if (!nome || !email) {
      return Response.json({ error: 'nome e email são obrigatórios' }, { status: 400 })
    }

    const telefone = whatsapp || ''

    const existing = await prisma.lead.findUnique({ where: { email } })

    const lead = await prisma.lead.upsert({
      where: { email },
      update: { nome, telefone, whatsapp: whatsapp || null },
      create: { nome, email, telefone, whatsapp: whatsapp || null },
    })

    await prisma.conversa.create({
      data: {
        leadId: lead.id,
        historicoJson: historicoJson ?? [],
      },
    })

    if (!existing) {
      await enviarEmailNovoLead({
        nome: lead.nome,
        email: lead.email,
        whatsapp: lead.whatsapp ?? telefone,
        score: lead.score,
      })
    }

    return Response.json({ ok: true, leadId: lead.id })
  } catch (err) {
    console.error('[leads]', err)
    return Response.json({ error: 'Erro ao salvar lead' }, { status: 500 })
  }
}
