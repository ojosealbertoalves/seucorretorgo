import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function toSlug(text: string) {
  return text
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

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titulo: true,
      slug: true,
      categoria: true,
      publicado: true,
      capa: true,
      createdAt: true,
    },
  })
  return Response.json(posts)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { titulo, resumo, conteudo, capa, categoria, publicado, slug: rawSlug } = body

    if (!titulo || !resumo || !conteudo) {
      return Response.json({ error: 'Título, resumo e conteúdo são obrigatórios.' }, { status: 400 })
    }

    let slug = rawSlug ? rawSlug.trim() : toSlug(titulo)
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const post = await prisma.post.create({
      data: { titulo, slug, resumo, conteudo, capa, categoria, publicado: publicado ?? false },
    })
    return Response.json(post, { status: 201 })
  } catch {
    return Response.json({ error: 'Erro ao criar post.' }, { status: 500 })
  }
}
