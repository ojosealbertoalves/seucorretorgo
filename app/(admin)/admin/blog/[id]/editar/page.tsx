export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PostForm } from '@/components/admin/post-form'

export default async function EditarBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) notFound()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar post</h1>
      <PostForm
        initial={{
          id: post.id,
          titulo: post.titulo,
          slug: post.slug,
          resumo: post.resumo,
          conteudo: post.conteudo,
          capa: post.capa ?? '',
          categoria: post.categoria ?? '',
          publicado: post.publicado,
        }}
      />
    </div>
  )
}
