import { prisma } from '@/lib/prisma'

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { publicado: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titulo: true,
      slug: true,
      resumo: true,
      capa: true,
      categoria: true,
      createdAt: true,
    },
  })
  return Response.json(posts)
}
