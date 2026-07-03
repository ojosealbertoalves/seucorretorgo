'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, X, Loader2 } from 'lucide-react'
import { useR2Upload } from '@/components/R2Upload'
import { cn } from '@/lib/utils'

/* ─── Types ──────────────────────────────────────────────────────── */
export type FormPreset = {
  titulo?: string
  slug?: string
  descricao?: string | null
  bairro?: string
  cidade?: string
  area?: number | null
  frente?: number | null
  preco?: number | null
  loteamentoId?: string | null
  ativo?: boolean
  fotos?: Array<{
    url: string
    legenda?: string | null
  }>
}

type FotoItem = {
  _id: string
  url: string
  legenda: string
  preview: string
  uploading: boolean
  error?: string
}

type LoteamentoOption = {
  id: string
  nome: string
  ativo: boolean
  tipoNegocio: 'IMOVEL' | 'LOTE'
}

function toSlug(titulo: string) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 border-b pb-2">{title}</h2>
      {children}
    </section>
  )
}

/* ─── Component ─────────────────────────────────────────────────── */
export function LoteForm({
  editId,
  preset,
}: {
  editId?: string
  preset?: FormPreset
}) {
  const router = useRouter()
  const { startUpload } = useR2Upload()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [titulo, setTitulo] = useState(preset?.titulo ?? '')
  const [slug, setSlug] = useState(preset?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!preset?.slug)
  const [area, setArea] = useState(preset?.area != null ? String(preset.area) : '')
  const [frente, setFrente] = useState(preset?.frente != null ? String(preset.frente) : '')
  const [preco, setPreco] = useState(preset?.preco != null ? String(preset.preco) : '')
  const [bairro, setBairro] = useState(preset?.bairro ?? '')
  const [cidade, setCidade] = useState(preset?.cidade ?? 'Goiânia')

  const [loteamentos, setLoteamentos] = useState<LoteamentoOption[]>([])
  const [loteamentosLoading, setLoteamentosLoading] = useState(true)
  const [loteamentoId, setLoteamentoId] = useState(preset?.loteamentoId ?? '')

  const [descricao, setDescricao] = useState(preset?.descricao ?? '')
  const [ativo, setAtivo] = useState(preset?.ativo ?? false)

  const [fotos, setFotos] = useState<FotoItem[]>(() => {
    if (preset?.fotos?.length) {
      return preset.fotos.map((f) => ({
        _id: `existing-${Math.random().toString(36).slice(2)}`,
        url: f.url,
        legenda: f.legenda ?? '',
        preview: f.url,
        uploading: false,
      }))
    }
    return []
  })
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ─── Load loteamentos ativos ──────────────────────────────────── */
  useEffect(() => {
    fetch('/api/admin/empreendimentos')
      .then((r) => r.json())
      .then((data: LoteamentoOption[]) => {
        setLoteamentos(data.filter((e) => e.ativo && e.tipoNegocio === 'LOTE'))
        setLoteamentosLoading(false)
      })
      .catch(() => setLoteamentosLoading(false))
  }, [])

  /* ─── Slug auto-sync ──────────────────────────────────────────── */
  function handleTituloChange(v: string) {
    setTitulo(v)
    if (!slugTouched) setSlug(toSlug(v))
  }

  function handleSlugChange(v: string) {
    setSlugTouched(true)
    setSlug(v)
  }

  /* ─── Foto handlers ───────────────────────────────────────────── */
  async function handleFotoFiles(files: FileList | File[]) {
    const accepted = Array.from(files).filter(
      (f) => f.type === 'image/png' || f.type === 'image/jpeg'
    )
    if (!accepted.length) return

    const ids = accepted.map(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`)

    const newItems: FotoItem[] = accepted.map((f, idx) => ({
      _id: ids[idx],
      url: '',
      legenda: '',
      preview: URL.createObjectURL(f),
      uploading: true,
    }))

    setFotos((prev) => [...prev, ...newItems])

    try {
      const uploaded = await startUpload(accepted)
      setFotos((prev) =>
        prev.map((f) => {
          const idx = ids.indexOf(f._id)
          if (idx === -1) return f
          const url = uploaded?.[idx]?.url ?? ''
          return { ...f, url, uploading: false, error: url ? undefined : 'Falha no upload' }
        })
      )
    } catch {
      setFotos((prev) =>
        prev.map((f) =>
          ids.includes(f._id) ? { ...f, uploading: false, error: 'Falha no upload' } : f
        )
      )
    }
  }

  function updateFotoLegenda(id: string, legenda: string) {
    setFotos((prev) => prev.map((f) => (f._id === id ? { ...f, legenda } : f)))
  }

  function removeFoto(id: string) {
    setFotos((prev) => prev.filter((f) => f._id !== id))
  }

  /* ─── Submit ──────────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!titulo.trim()) { setError('Título do anúncio é obrigatório.'); return }
    if (!area || parseFloat(area) <= 0) { setError('Área do terreno é obrigatória.'); return }
    if (!preco || parseFloat(preco) <= 0) { setError('Preço é obrigatório.'); return }
    if (!bairro.trim()) { setError('Bairro é obrigatório.'); return }
    if (fotos.some((f) => f.uploading)) { setError('Aguarde o upload das fotos terminar.'); return }

    setSaving(true)

    const fotosUpload = fotos.filter((f) => f.url).map((f, ordem) => ({
      url: f.url,
      legenda: f.legenda || null,
      ordem,
    }))

    const payload = {
      titulo: titulo.trim(),
      slug: slug.trim() || undefined,
      descricao: descricao.trim() || null,
      bairro: bairro.trim(),
      cidade: cidade.trim() || 'Goiânia',
      area: parseFloat(area) || 0,
      frente: frente ? parseFloat(frente) : null,
      preco: parseFloat(preco) || 0,
      loteamentoId: loteamentoId || null,
      ativo,
      fotos: fotosUpload,
    }

    const url = editId ? `/api/admin/lotes/${editId}` : '/api/admin/lotes'
    const method = editId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/lotes')
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      setError(err.error || 'Erro ao salvar.')
      setSaving(false)
    }
  }

  /* ─── Render ──────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 1 — Dados do lote */}
      <Section title="Dados do lote">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Título do anúncio *</Label>
            <Input
              value={titulo}
              onChange={(e) => handleTituloChange(e.target.value)}
              placeholder='Ex: Lote 300m² no Jardins Viena'
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="gerado-automaticamente" />
          </div>

          <div className="space-y-1.5">
            <Label>Área do terreno (m²) *</Label>
            <Input type="number" min="0" step="0.01" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ex: 300" />
          </div>
          <div className="space-y-1.5">
            <Label>Frente (m)</Label>
            <Input type="number" min="0" step="0.01" value={frente} onChange={(e) => setFrente(e.target.value)} placeholder="Opcional" />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label>Preço (R$) *</Label>
            <Input type="number" min="0" step="1000" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Ex: 180000" />
          </div>

          <div className="space-y-1.5">
            <Label>Bairro *</Label>
            <Input value={bairro} onChange={(e) => setBairro(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cidade</Label>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </div>
        </div>
      </Section>

      {/* 2 — Loteamento associado */}
      <Section title="Loteamento associado (opcional)">
        <p className="text-xs text-muted-foreground">
          Se este lote pertence a um loteamento já cadastrado, selecione aqui.
        </p>
        <Select
          value={loteamentoId || 'none'}
          onValueChange={(v) => setLoteamentoId(v === 'none' ? '' : v)}
          disabled={loteamentosLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={loteamentosLoading ? 'Carregando...' : 'Selecionar loteamento'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum — lote avulso</SelectItem>
            {loteamentos.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Section>

      {/* 3 — Descrição */}
      <Section title="Descrição">
        <Textarea
          rows={5}
          value={descricao ?? ''}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição livre do lote..."
        />
      </Section>

      {/* 4 — Fotos */}
      <Section title="Fotos">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFotoFiles(e.target.files)}
        />

        <div
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors',
            dragging ? 'border-orange-400 bg-orange-50' : 'border-border hover:border-muted-foreground/50'
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFotoFiles(e.dataTransfer.files) }}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Arraste fotos aqui ou <span className="text-orange-500 font-medium">clique para selecionar</span>
          </p>
          <p className="text-xs text-muted-foreground">PNG ou JPEG</p>
        </div>

        {fotos.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fotos.map((foto, i) => (
              <div key={foto._id} className="rounded-lg border bg-white overflow-hidden shadow-sm">
                <div className="relative aspect-video bg-gray-100">
                  <img src={foto.preview} alt="" className="w-full h-full object-cover" />
                  {foto.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  {foto.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/70">
                      <span className="text-white text-xs font-semibold">Erro no upload</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                    Ordem {i + 1}
                  </span>
                  <button type="button" onClick={() => removeFoto(foto._id)} className="absolute top-2 right-2 rounded-full bg-black/60 p-1 hover:bg-black/80 transition-colors">
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
                <div className="p-3 space-y-1">
                  <Label className="text-xs font-medium">Legenda</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="Ex: Vista frontal do lote"
                    value={foto.legenda}
                    onChange={(e) => updateFotoLegenda(foto._id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 5 — Publicação */}
      <Section title="Publicação">
        <div className="flex items-center justify-between">
          <div>
            <Label>Publicar no site</Label>
            <p className="text-xs text-muted-foreground mt-0.5">O lote ficará visível para os usuários</p>
          </div>
          <Switch checked={ativo} onCheckedChange={setAtivo} />
        </div>
      </Section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pb-8">
        <Button type="submit" disabled={saving} className="text-white" style={{ backgroundColor: '#E07B3A' }}>
          {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Salvar lote'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
