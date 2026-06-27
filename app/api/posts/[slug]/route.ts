import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.post.findFirst({
    where: { slug, publicado: true },
  })
  if (!post) return Response.json({ error: 'Post não encontrado.' }, { status: 404 })
  return Response.json(post)
}
