import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { nome, email, whatsapp } = await request.json()

    if (!nome || !email || !whatsapp) {
      return Response.json({ error: 'Nome, email e WhatsApp são obrigatórios.' }, { status: 400 })
    }

    const lead = await prisma.newsletterLead.upsert({
      where: { email },
      update: { nome, whatsapp, ativo: true },
      create: { nome, email, whatsapp },
    })

    return Response.json(lead, { status: 201 })
  } catch {
    return Response.json({ error: 'Erro ao cadastrar.' }, { status: 500 })
  }
}
