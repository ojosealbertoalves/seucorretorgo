import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function toSlug(nome: string) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const empreendimentos = await prisma.empreendimento.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      incorporadora: true,
      tipologias: true,
      fotos: { orderBy: { ordem: 'asc' } },
    },
  })
  return Response.json(empreendimentos)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { tipologias, fotos, ...data } = body

    let slug = toSlug(data.nome)
    const existing = await prisma.empreendimento.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const empreendimento = await prisma.empreendimento.create({
      data: {
        ...data,
        slug,
        tipologias: { create: tipologias },
        fotos: fotos?.length ? { create: fotos } : undefined,
      },
    })

    return Response.json(empreendimento, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar empreendimento' }, { status: 500 })
  }
}
