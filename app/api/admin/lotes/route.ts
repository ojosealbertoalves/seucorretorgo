import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function toSlug(titulo: string) {
  return titulo
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

  const lotes = await prisma.loteAnuncio.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      loteamento: { select: { nome: true, slug: true } },
      fotos: { orderBy: { ordem: 'asc' } },
    },
  })
  return Response.json(lotes)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { fotos, ...data } = body

    let slug = toSlug(data.slug || data.titulo)
    const existing = await prisma.loteAnuncio.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const lote = await prisma.loteAnuncio.create({
      data: {
        ...data,
        slug,
        fotos: fotos?.length ? { create: fotos } : undefined,
      },
    })

    return Response.json(lote, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar lote' }, { status: 500 })
  }
}
