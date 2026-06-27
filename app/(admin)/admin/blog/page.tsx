export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, BookOpen } from 'lucide-react'
import { PostActions } from '@/components/admin/post-actions'

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function AdminBlogPage() {
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
        <Button asChild>
          <Link href="/admin/blog/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo post
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Capa</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  Nenhum post criado.{' '}
                  <Link href="/admin/blog/novo" className="underline">
                    Criar o primeiro post.
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="w-12 h-8 rounded overflow-hidden bg-gray-100 shrink-0">
                      {post.capa ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.capa} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-3 w-3 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-gray-900 line-clamp-1">{post.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">/blog/{post.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.categoria ? (
                      <Badge variant="secondary">{post.categoria}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.publicado ? 'default' : 'outline'}>
                      {post.publicado ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtDate(post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <PostActions id={post.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
