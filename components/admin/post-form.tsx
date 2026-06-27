'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'

type PostData = {
  titulo: string
  slug: string
  resumo: string
  conteudo: string
  capa: string
  categoria: string
  publicado: boolean
}

type Props = {
  initial?: Partial<PostData> & { id?: string }
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export function PostForm({ initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial?.id

  const [form, setForm] = useState<PostData>({
    titulo: initial?.titulo ?? '',
    slug: initial?.slug ?? '',
    resumo: initial?.resumo ?? '',
    conteudo: initial?.conteudo ?? '',
    capa: initial?.capa ?? '',
    categoria: initial?.categoria ?? '',
    publicado: initial?.publicado ?? false,
  })
  const [slugEdited, setSlugEdited] = useState(isEdit)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slugEdited) {
      setForm((f) => ({ ...f, slug: toSlug(f.titulo) }))
    }
  }, [form.titulo, slugEdited])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo || !form.resumo || !form.conteudo) {
      setError('Título, resumo e conteúdo são obrigatórios.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/posts/${initial!.id}` : '/api/admin/posts'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erro ao salvar.')
        return
      }
      router.push('/admin/blog')
      router.refresh()
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  function set(key: keyof PostData, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className={labelClass}>Título *</label>
        <input
          type="text"
          value={form.titulo}
          onChange={(e) => set('titulo', e.target.value)}
          placeholder="Título do post"
          className={inputClass}
        />
      </div>

      {/* Slug */}
      <div>
        <label className={labelClass}>Slug (URL)</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => { setSlugEdited(true); set('slug', e.target.value) }}
          placeholder="meu-post-url"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          Gerado automaticamente do título. Editável.
        </p>
      </div>

      {/* Categoria */}
      <div>
        <label className={labelClass}>Categoria</label>
        <input
          type="text"
          value={form.categoria}
          onChange={(e) => set('categoria', e.target.value)}
          placeholder="Ex: Financiamento, Lançamentos, Dicas..."
          className={inputClass}
        />
      </div>

      {/* Capa */}
      <div>
        <label className={labelClass}>URL da capa</label>
        <input
          type="url"
          value={form.capa}
          onChange={(e) => set('capa', e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      {/* Resumo */}
      <div>
        <label className={labelClass}>Resumo *</label>
        <textarea
          value={form.resumo}
          onChange={(e) => set('resumo', e.target.value)}
          placeholder="Breve descrição do post (exibida nos cards)"
          rows={3}
          className={inputClass + ' resize-none'}
        />
      </div>

      {/* Conteúdo */}
      <div>
        <label className={labelClass}>Conteúdo * (suporta Markdown)</label>
        <textarea
          value={form.conteudo}
          onChange={(e) => set('conteudo', e.target.value)}
          placeholder={`## Título da seção\n\nEscreva o conteúdo aqui em Markdown...\n\n- Item 1\n- Item 2`}
          rows={20}
          className={inputClass + ' resize-y font-mono text-xs leading-relaxed'}
        />
      </div>

      {/* Publicado */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <input
          type="checkbox"
          id="publicado"
          checked={form.publicado}
          onChange={(e) => set('publicado', e.target.checked)}
          className="w-4 h-4 accent-orange-500 rounded"
        />
        <label htmlFor="publicado" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
          Publicar agora
        </label>
        <span className="text-xs text-gray-400 ml-1">
          {form.publicado ? 'Post visível no blog' : 'Salvar como rascunho'}
        </span>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar post'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/blog')}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
