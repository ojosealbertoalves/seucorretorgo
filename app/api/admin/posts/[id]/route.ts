import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return Response.json({ error: 'Post não encontrado.' }, { status: 404 })
  return Response.json(post)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const body = await request.json()
    const post = await prisma.post.update({
      where: { id },
      data: {
        titulo: body.titulo,
        slug: body.slug,
        resumo: body.resumo,
        conteudo: body.conteudo,
        capa: body.capa,
        categoria: body.categoria,
        publicado: body.publicado,
      },
    })
    return Response.json(post)
  } catch {
    return Response.json({ error: 'Erro ao atualizar post.' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await prisma.post.delete({ where: { id } })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Erro ao excluir post.' }, { status: 500 })
  }
}
