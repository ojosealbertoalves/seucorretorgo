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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await prisma.loteAnuncio.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()
    const { fotos, ...data } = body

    if (data.slug) {
      let slug = toSlug(data.slug)
      const existing = await prisma.loteAnuncio.findUnique({ where: { slug } })
      if (existing && existing.id !== id) slug = `${slug}-${Date.now()}`
      data.slug = slug
    } else {
      delete data.slug
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.loteAnuncioFoto.deleteMany({ where: { loteAnuncioId: id } })
      return tx.loteAnuncio.update({
        where: { id },
        data: {
          ...data,
          fotos: fotos?.length ? { create: fotos } : undefined,
        },
      })
    })

    return Response.json(result)
  } catch (error) {
    console.error('[PUT lote]', error)
    return Response.json({ error: 'Erro ao atualizar lote' }, { status: 500 })
  }
}
