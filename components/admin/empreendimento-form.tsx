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
import { Plus, Trash2, X, Upload, ImagePlus, Loader2, ChevronDown, Building2 } from 'lucide-react'
import { useR2Upload } from '@/components/R2Upload'
import { cn } from '@/lib/utils'

/* ─── Types ──────────────────────────────────────────────────────── */
export type TipoFoto = 'FACHADA' | 'PERSPECTIVA' | 'AREA_LAZER' | 'PLANTA' | 'DECORADO' | 'OUTRO'

export type FormPreset = {
  nome?: string
  incorporadoraId?: string
  construtora?: string | null
  bairro?: string
  bairrosProximos?: string[]
  endereco?: string | null
  status?: 'LANCAMENTO' | 'EM_OBRAS' | 'PRONTO'
  entregaPrevista?: string | null
  percentualObra?: number | null
  tipoNegocio?: 'IMOVEL' | 'LOTE'
  infraestrutura?: string | null
  areaTotalLoteamento?: number | null
  tipologias?: Array<{
    quartos: number
    suites: number
    banheiros: number
    areaPrivativa: number
    areaTotal?: number | null
    vagas: number
    preco?: number | null
    plantaUrl?: string | null
  }>
  lotes?: Array<{
    quadra?: string | null
    numero?: string | null
    areaTerreno: number
    frente?: number | null
    preco: number
    disponivel?: boolean
  }>
  aceitaFgts?: boolean
  aceitaFinanciamento?: boolean
  programaMcmv?: boolean
  diferenciais?: string[]
  destaqueIa?: string
  descricaoCompleta?: string | null
  latitude?: number | null
  longitude?: number | null
  ativo?: boolean
  fotos?: Array<{
    url: string
    tipo: TipoFoto
    legenda?: string | null
  }>
}

const TIPO_FOTO_LABELS: Record<TipoFoto, string> = {
  FACHADA: 'Fachada',
  PERSPECTIVA: 'Perspectiva',
  AREA_LAZER: 'Área de Lazer',
  PLANTA: 'Planta',
  DECORADO: 'Decorado',
  OUTRO: 'Outro',
}

const TIPO_FOTO_PLACEHOLDERS: Record<TipoFoto, string> = {
  FACHADA: 'Ex: Vista frontal, Vista noturna',
  PERSPECTIVA: 'Ex: Vista aérea, Perspectiva lateral',
  AREA_LAZER: 'Ex: Piscina adulto, Academia, Salão de festas',
  PLANTA: 'Ex: Tipologia 2 quartos 65m², Tipologia 3 quartos com suíte 90m²',
  DECORADO: 'Ex: Sala de estar decorada, Cozinha americana',
  OUTRO: 'Ex: Localização, Mapa do bairro',
}

type FotoItem = {
  _id: string
  url: string
  tipo: TipoFoto
  legenda: string
  preview: string
  uploading: boolean
  error?: string
}

type Tipologia = {
  quartos: number
  suites: number
  banheiros: number
  areaPrivativa: string
  areaTotal: string
  vagas: number
  preco: string
  plantaUrl: string
  plantaPreview: string
  plantaUploading: boolean
  plantaTag: string
}

type LoteItem = {
  quadra: string
  numero: string
  areaTerreno: string
  frente: string
  preco: string
  disponivel: boolean
}

type IncOption = {
  id: string
  nome: string
  logo: string | null
  ativo: boolean
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function emptyTipologia(): Tipologia {
  return {
    quartos: 2, suites: 1, banheiros: 2,
    areaPrivativa: '', areaTotal: '', vagas: 1, preco: '',
    plantaUrl: '', plantaPreview: '', plantaUploading: false, plantaTag: '',
  }
}

function emptyLote(): LoteItem {
  return { quadra: '', numero: '', areaTerreno: '', frente: '', preco: '', disponivel: true }
}

function presetToLote(l: NonNullable<FormPreset['lotes']>[number]): LoteItem {
  return {
    quadra: l.quadra ?? '',
    numero: l.numero ?? '',
    areaTerreno: l.areaTerreno?.toString() ?? '',
    frente: l.frente?.toString() ?? '',
    preco: l.preco?.toString() ?? '',
    disponivel: l.disponivel ?? true,
  }
}

function presetToTipologia(t: NonNullable<FormPreset['tipologias']>[number]): Tipologia {
  return {
    quartos: t.quartos,
    suites: t.suites,
    banheiros: t.banheiros,
    areaPrivativa: t.areaPrivativa?.toString() ?? '',
    areaTotal: t.areaTotal?.toString() ?? '',
    vagas: t.vagas,
    preco: (t.preco ?? '')?.toString(),
    plantaUrl: t.plantaUrl ?? '',
    plantaPreview: t.plantaUrl ?? '',
    plantaUploading: false,
    plantaTag: '',
  }
}

function plantaTagDefault(t: Tipologia): string {
  const area = t.areaPrivativa ? ` ${t.areaPrivativa}m²` : ''
  const q = t.quartos === 1 ? '1 quarto' : `${t.quartos} quartos`
  return `Planta - ${q}${area}`
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 border-b pb-2">{title}</h2>
      {children}
    </section>
  )
}

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')
  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (!value.includes(input.trim())) onChange([...value, input.trim()])
      setInput('')
    }
  }
  return (
    <div className="flex flex-wrap gap-1.5 min-h-10 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded bg-secondary text-secondary-foreground text-xs px-2 py-0.5">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="opacity-60 hover:opacity-100">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addTag}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-28 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

/* ─── Component ─────────────────────────────────────────────────── */
export function EmpreendimentoForm({
  editId,
  preset,
  incorporadoraHint,
}: {
  editId?: string
  preset?: FormPreset
  incorporadoraHint?: string
}) {
  const router = useRouter()
  const { startUpload } = useR2Upload()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Incorporadora
  const [incorporadoras, setIncorporadoras] = useState<IncOption[]>([])
  const [incLoading, setIncLoading] = useState(true)
  const [incorporadoraId, setIncorporadoraId] = useState(preset?.incorporadoraId ?? '')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Dados gerais
  const [nome, setNome] = useState(preset?.nome ?? '')
  const [construtora, setConstrutora] = useState(preset?.construtora ?? '')
  const [bairro, setBairro] = useState(preset?.bairro ?? '')
  const [bairrosProximos, setBairrosProximos] = useState<string[]>(preset?.bairrosProximos ?? [])
  const [endereco, setEndereco] = useState(preset?.endereco ?? '')

  // Status
  const [status, setStatus] = useState<'LANCAMENTO' | 'EM_OBRAS' | 'PRONTO'>(
    preset?.status ?? 'LANCAMENTO'
  )
  const [entregaPrevista, setEntregaPrevista] = useState(preset?.entregaPrevista ?? '')
  const [percentualObra, setPercentualObra] = useState(
    preset?.percentualObra != null ? String(preset.percentualObra) : ''
  )

  // Tipo de negócio
  const [tipoNegocio, setTipoNegocio] = useState<'IMOVEL' | 'LOTE'>(preset?.tipoNegocio ?? 'IMOVEL')
  const [infraestrutura, setInfraestrutura] = useState(preset?.infraestrutura ?? '')
  const [areaTotalLoteamento, setAreaTotalLoteamento] = useState(
    preset?.areaTotalLoteamento != null ? String(preset.areaTotalLoteamento) : ''
  )

  // Tipologias
  const [tipologias, setTipologias] = useState<Tipologia[]>(() => {
    if (preset?.tipologias?.length) return preset.tipologias.map(presetToTipologia)
    return [emptyTipologia()]
  })

  // Lotes
  const [lotes, setLotes] = useState<LoteItem[]>(() => {
    if (preset?.lotes?.length) return preset.lotes.map(presetToLote)
    return [emptyLote()]
  })

  // Financeiro
  const [aceitaFgts, setAceitaFgts] = useState(preset?.aceitaFgts ?? false)
  const [aceitaFinanciamento, setAceitaFinanciamento] = useState(preset?.aceitaFinanciamento ?? true)
  const [programaMcmv, setProgramaMcmv] = useState(preset?.programaMcmv ?? false)

  // IA
  const [diferenciais, setDiferenciais] = useState<string[]>(preset?.diferenciais ?? [])
  const [destaqueIa, setDestaqueIa] = useState(preset?.destaqueIa ?? '')
  const [descricaoCompleta, setDescricaoCompleta] = useState(preset?.descricaoCompleta ?? '')

  // Localização
  const [latitude, setLatitude] = useState(
    preset?.latitude != null ? String(preset.latitude) : ''
  )
  const [longitude, setLongitude] = useState(
    preset?.longitude != null ? String(preset.longitude) : ''
  )

  // Publicação
  const [ativo, setAtivo] = useState(preset?.ativo ?? false)

  // Fotos
  const [fotos, setFotos] = useState<FotoItem[]>(() => {
    if (preset?.fotos?.length) {
      return preset.fotos.map((f) => ({
        _id: `existing-${Math.random().toString(36).slice(2)}`,
        url: f.url,
        tipo: f.tipo,
        legenda: f.legenda ?? '',
        preview: f.url,
        uploading: false,
      }))
    }
    return []
  })
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const plantaInputRefs = useRef<(HTMLInputElement | null)[]>([])

  /* ─── Load incorporadoras ─────────────────────────────────────── */
  useEffect(() => {
    fetch('/api/admin/incorporadoras')
      .then((r) => r.json())
      .then((data: IncOption[]) => {
        setIncorporadoras(data.filter((i) => i.ativo))
        setIncLoading(false)
      })
      .catch(() => setIncLoading(false))
  }, [])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const selectedInc = incorporadoras.find((i) => i.id === incorporadoraId)

  /* ─── Tipologia handlers ──────────────────────────────────────── */
  function updateTipologia(i: number, field: keyof Tipologia, val: string | number) {
    setTipologias((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)))
  }

  async function handlePlantaFile(i: number, file: File) {
    const preview = URL.createObjectURL(file)
    setTipologias((prev) =>
      prev.map((t, idx) => {
        if (idx !== i) return t
        return { ...t, plantaPreview: preview, plantaUploading: true, plantaUrl: '', plantaTag: t.plantaTag || plantaTagDefault(t) }
      })
    )
    try {
      const uploaded = await startUpload([file])
      const url = uploaded?.[0]?.url ?? ''
      if (!url) throw new Error('No URL')
      setTipologias((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, plantaUrl: url, plantaUploading: false } : t))
      )
    } catch {
      setTipologias((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, plantaPreview: '', plantaUploading: false } : t))
      )
      alert('Erro ao fazer upload da planta. Tente novamente.')
    }
  }

  function removePlanta(i: number) {
    setTipologias((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, plantaUrl: '', plantaPreview: '', plantaTag: '' } : t))
    )
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
      tipo: 'FACHADA' as TipoFoto,
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

  function updateFoto(id: string, field: 'tipo' | 'legenda', val: string) {
    setFotos((prev) => prev.map((f) => (f._id === id ? { ...f, [field]: val } : f)))
  }

  function removeFoto(id: string) {
    setFotos((prev) => prev.filter((f) => f._id !== id))
  }

  /* ─── Lote handlers ──────────────────────────────────────────── */
  function updateLote(i: number, field: keyof LoteItem, val: string | boolean) {
    setLotes((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)))
  }

  /* ─── Computed ────────────────────────────────────────────────── */
  const precosImovel = tipologias.map((t) => parseFloat(t.preco) || 0).filter((p) => p > 0)
  const precosLote = lotes.map((l) => parseFloat(l.preco) || 0).filter((p) => p > 0)
  const precos = tipoNegocio === 'LOTE' ? precosLote : precosImovel
  const precoMin = precos.length ? Math.min(...precos) : 0
  const precoMax = precos.length ? Math.max(...precos) : 0
  const brl = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  /* ─── Submit ──────────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!nome.trim()) { setError('Nome do empreendimento é obrigatório.'); return }
    if (!incorporadoraId) { setError('Selecione uma incorporadora.'); return }
    if (fotos.some((f) => f.uploading)) { setError('Aguarde o upload das fotos terminar.'); return }
    if (tipologias.some((t) => t.plantaUploading)) { setError('Aguarde o upload das plantas terminar.'); return }

    setSaving(true)

    const fotosUpload = fotos.filter((f) => f.url).map((f, ordem) => ({
      url: f.url,
      tipo: f.tipo,
      legenda: f.legenda || null,
      ordem,
    }))
    const plantasUpload = tipologias
      .filter((t) => t.plantaUrl)
      .map((t, i) => ({
        url: t.plantaUrl,
        tipo: 'PLANTA' as TipoFoto,
        legenda: t.plantaTag || null,
        ordem: fotosUpload.length + i,
      }))

    const payload = {
      nome: nome.trim(),
      incorporadoraId,
      construtora: construtora.trim() || null,
      bairro: bairro.trim(),
      bairrosProximos,
      endereco: endereco.trim() || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      precoMin,
      precoMax,
      aceitaFgts,
      aceitaFinanciamento,
      programaMcmv,
      status,
      entregaPrevista: entregaPrevista.trim() || null,
      percentualObra: status === 'EM_OBRAS' && percentualObra ? parseInt(percentualObra) : null,
      tipoNegocio,
      infraestrutura: infraestrutura.trim() || null,
      areaTotalLoteamento: areaTotalLoteamento ? parseFloat(areaTotalLoteamento) : null,
      diferenciais,
      destaqueIa: destaqueIa.trim(),
      descricaoCompleta: descricaoCompleta.trim() || null,
      ativo,
      tipologias: tipoNegocio === 'IMOVEL' ? tipologias.map((t) => ({
        quartos: Number(t.quartos),
        suites: Number(t.suites),
        banheiros: Number(t.banheiros),
        areaPrivativa: parseFloat(t.areaPrivativa) || 0,
        areaTotal: t.areaTotal ? parseFloat(t.areaTotal) : null,
        vagas: Number(t.vagas),
        preco: parseFloat(t.preco) || 0,
        plantaUrl: t.plantaUrl || null,
      })) : [],
      lotes: tipoNegocio === 'LOTE' ? lotes.map((l) => ({
        quadra: l.quadra.trim() || null,
        numero: l.numero.trim() || null,
        areaTerreno: parseFloat(l.areaTerreno) || 0,
        frente: l.frente ? parseFloat(l.frente) : null,
        preco: parseFloat(l.preco) || 0,
        disponivel: l.disponivel,
      })) : [],
      fotos: [...fotosUpload, ...plantasUpload],
    }

    const url = editId ? `/api/admin/empreendimentos/${editId}` : '/api/admin/empreendimentos'
    const method = editId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/empreendimentos')
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

      {/* 1 — Dados Gerais */}
      <Section title="Dados Gerais">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Nome *</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Residencial das Flores" />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label>Tipo de negócio</Label>
            <Select value={tipoNegocio} onValueChange={(v: 'IMOVEL' | 'LOTE') => setTipoNegocio(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IMOVEL">Imóvel (apartamento / casa)</SelectItem>
                <SelectItem value="LOTE">Lote / Loteamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Incorporadora dropdown */}
          <div className="col-span-2 space-y-1.5">
            <Label>Incorporadora *</Label>
            {incorporadoraHint && !incorporadoraId && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                💡 A IA identificou: <strong>{incorporadoraHint}</strong> — selecione abaixo.
              </p>
            )}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                disabled={incLoading}
                onClick={() => setDropdownOpen((o) => !o)}
                className={cn(
                  'w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  !incorporadoraId && 'text-muted-foreground'
                )}
              >
                {incLoading ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                  </span>
                ) : selectedInc ? (
                  <span className="flex items-center gap-2">
                    {selectedInc.logo ? (
                      <img src={selectedInc.logo} alt="" className="w-6 h-6 rounded object-contain bg-gray-100" />
                    ) : (
                      <Building2 className="h-4 w-4 text-gray-400" />
                    )}
                    {selectedInc.nome}
                  </span>
                ) : (
                  'Selecionar incorporadora...'
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 w-full mt-1 rounded-md border bg-white shadow-lg max-h-56 overflow-auto">
                  {incorporadoras.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      Nenhuma incorporadora ativa cadastrada.
                    </div>
                  ) : (
                    incorporadoras.map((inc) => (
                      <button
                        key={inc.id}
                        type="button"
                        onClick={() => { setIncorporadoraId(inc.id); setDropdownOpen(false) }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left transition-colors',
                          incorporadoraId === inc.id && 'bg-orange-50 font-medium'
                        )}
                      >
                        {inc.logo ? (
                          <img src={inc.logo} alt="" className="w-7 h-7 rounded object-contain bg-gray-100 flex-shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        {inc.nome}
                      </button>
                    ))
                  )}
                  <div className="border-t px-3 py-2">
                    <a
                      href="/admin/incorporadoras/nova"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Cadastrar nova incorporadora
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label>Construtora</Label>
            <Input value={construtora} onChange={(e) => setConstrutora(e.target.value)} placeholder="Preencha se diferente da incorporadora" />
          </div>

          <div className="space-y-1.5">
            <Label>Bairro</Label>
            <Input value={bairro} onChange={(e) => setBairro(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Endereço</Label>
            <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Bairros próximos</Label>
            <TagInput value={bairrosProximos} onChange={setBairrosProximos} placeholder="Digite e pressione Enter para adicionar" />
          </div>
        </div>
      </Section>

      {/* 2 — Status */}
      <Section title="Status da Obra">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: typeof status) => setStatus(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LANCAMENTO">Lançamento</SelectItem>
                <SelectItem value="EM_OBRAS">Em obras</SelectItem>
                <SelectItem value="PRONTO">Pronto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Entrega prevista</Label>
            <Input value={entregaPrevista} onChange={(e) => setEntregaPrevista(e.target.value)} placeholder="Ex: Dez/2026" />
          </div>
          {status === 'EM_OBRAS' && (
            <div className="space-y-1.5">
              <Label>% da obra concluída</Label>
              <Input type="number" min="0" max="100" value={percentualObra} onChange={(e) => setPercentualObra(e.target.value)} placeholder="0 a 100" />
            </div>
          )}
        </div>
      </Section>

      {/* 3 — Tipologias (apenas para IMOVEL) */}
      {tipoNegocio === 'IMOVEL' && <Section title="Tipologias">
        <div className="flex items-center justify-between">
          {precos.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Preço calculado: {brl(precoMin)}{precoMin !== precoMax ? ` – ${brl(precoMax)}` : ''}
            </p>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => setTipologias((p) => [...p, emptyTipologia()])}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar tipologia
          </Button>
        </div>

        {tipologias.map((t, i) => (
          <div key={i} className="border rounded-md p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tipologia {i + 1}</span>
              {tipologias.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => setTipologias((p) => p.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {([
                { label: 'Quartos', field: 'quartos' as const },
                { label: 'Suítes', field: 'suites' as const },
                { label: 'Banheiros', field: 'banheiros' as const },
                { label: 'Vagas', field: 'vagas' as const },
              ] as const).map(({ label, field }) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input type="number" min="0" value={t[field]} onChange={(e) => updateTipologia(i, field, parseInt(e.target.value) || 0)} />
                </div>
              ))}
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Área privativa (m²)</Label>
                <Input type="number" min="0" step="0.01" value={t.areaPrivativa} onChange={(e) => updateTipologia(i, 'areaPrivativa', e.target.value)} placeholder="Ex: 65" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Área total (m²)</Label>
                <Input type="number" min="0" step="0.01" value={t.areaTotal} onChange={(e) => updateTipologia(i, 'areaTotal', e.target.value)} placeholder="Opcional" />
              </div>
              <div className="space-y-1 col-span-4">
                <Label className="text-xs">Preço (R$)</Label>
                <Input type="number" min="0" step="1000" value={t.preco} onChange={(e) => updateTipologia(i, 'preco', e.target.value)} placeholder="Ex: 450000" />
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                ref={(el) => { plantaInputRefs.current[i] = el }}
                onChange={(e) => e.target.files?.[0] && handlePlantaFile(i, e.target.files[0])}
              />

              {t.plantaPreview || t.plantaUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded border overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={t.plantaPreview || t.plantaUrl} alt="Planta" className="w-full h-full object-cover" />
                      {t.plantaUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Tag / Identificação da planta</Label>
                      <Input
                        className="h-8 text-xs"
                        placeholder={TIPO_FOTO_PLACEHOLDERS.PLANTA}
                        value={t.plantaTag}
                        onChange={(e) => updateTipologia(i, 'plantaTag', e.target.value)}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="flex-shrink-0 text-red-500 hover:text-red-700" onClick={() => removePlanta(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => plantaInputRefs.current[i]?.click()}>
                  <ImagePlus className="h-3.5 w-3.5 mr-1" /> Adicionar planta
                </Button>
              )}
            </div>
          </div>
        ))}
      </Section>}

      {/* 3b — Lotes (apenas para LOTE) */}
      {tipoNegocio === 'LOTE' && (
        <Section title="Lotes disponíveis">
          <div className="space-y-2">
            {precos.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Preço calculado: {brl(precoMin)}{precoMin !== precoMax ? ` – ${brl(precoMax)}` : ''}
              </p>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => setLotes((p) => [...p, emptyLote()])}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar lote
            </Button>
          </div>

          {lotes.map((l, i) => (
            <div key={i} className="border rounded-md p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Lote {i + 1}</span>
                {lotes.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setLotes((p) => p.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Quadra</Label>
                  <Input value={l.quadra} onChange={(e) => updateLote(i, 'quadra', e.target.value)} placeholder="Ex: A" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Número</Label>
                  <Input value={l.numero} onChange={(e) => updateLote(i, 'numero', e.target.value)} placeholder="Ex: 12" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Área do terreno (m²) *</Label>
                  <Input type="number" min="0" step="0.01" value={l.areaTerreno} onChange={(e) => updateLote(i, 'areaTerreno', e.target.value)} placeholder="Ex: 300" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Frente (m)</Label>
                  <Input type="number" min="0" step="0.01" value={l.frente} onChange={(e) => updateLote(i, 'frente', e.target.value)} placeholder="Opcional" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Preço (R$) *</Label>
                  <Input type="number" min="0" step="1000" value={l.preco} onChange={(e) => updateLote(i, 'preco', e.target.value)} placeholder="Ex: 180000" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <Label className="text-xs">Disponível</Label>
                <Switch checked={l.disponivel} onCheckedChange={(v) => updateLote(i, 'disponivel', v)} />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Área total do loteamento (m²)</Label>
              <Input type="number" min="0" step="0.01" value={areaTotalLoteamento} onChange={(e) => setAreaTotalLoteamento(e.target.value)} placeholder="Opcional" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Infraestrutura do condomínio</Label>
              <Textarea
                rows={3}
                value={infraestrutura}
                onChange={(e) => setInfraestrutura(e.target.value)}
                placeholder="Ex: Portaria 24h, rede de água e esgoto, ruas asfaltadas, energia elétrica, área de lazer..."
              />
            </div>
          </div>
        </Section>
      )}

      {/* 4 — Financeiro */}
      <Section title="Financeiro">
        <div className="space-y-3">
          {[
            { label: 'Aceita FGTS', checked: aceitaFgts, onChange: setAceitaFgts },
            { label: 'Aceita Financiamento', checked: aceitaFinanciamento, onChange: setAceitaFinanciamento },
            { label: 'Minha Casa Minha Vida (MCMV)', checked: programaMcmv, onChange: setProgramaMcmv },
          ].map(({ label, checked, onChange }) => (
            <div key={label} className="flex items-center justify-between">
              <Label>{label}</Label>
              <Switch checked={checked} onCheckedChange={onChange} />
            </div>
          ))}
        </div>
      </Section>

      {/* 5 — Para a IA */}
      <Section title="Para a IA">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Diferenciais</Label>
            <TagInput value={diferenciais} onChange={setDiferenciais} placeholder="Ex: Piscina, Academia, Playground..." />
          </div>
          <div className="space-y-1.5">
            <Label>Destaque para IA</Label>
            <Input value={destaqueIa} onChange={(e) => setDestaqueIa(e.target.value)} placeholder="Frase curta de destaque que a IA vai usar" />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição completa</Label>
            <Textarea rows={5} value={descricaoCompleta} onChange={(e) => setDescricaoCompleta(e.target.value)} placeholder="Descrição detalhada do empreendimento..." />
          </div>
        </div>
      </Section>

      {/* 6 — Localização */}
      <Section title="Localização">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Latitude</Label>
            <Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="-16.686..." />
          </div>
          <div className="space-y-1.5">
            <Label>Longitude</Label>
            <Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-49.264..." />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Clique com botão direito no Google Maps → as coordenadas aparecem no topo do menu de contexto.
        </p>
      </Section>

      {/* 7 — Publicação */}
      <Section title="Publicação">
        <div className="flex items-center justify-between">
          <div>
            <Label>Publicar no site</Label>
            <p className="text-xs text-muted-foreground mt-0.5">O empreendimento ficará visível para os usuários</p>
          </div>
          <Switch checked={ativo} onCheckedChange={setAtivo} />
        </div>
      </Section>

      {/* 8 — Fotos */}
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
            {fotos.map((foto) => (
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
                  <button type="button" onClick={() => removeFoto(foto._id)} className="absolute top-2 right-2 rounded-full bg-black/60 p-1 hover:bg-black/80 transition-colors">
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
                <div className="p-3 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Categoria <span className="text-red-500">*</span></Label>
                    <Select value={foto.tipo} onValueChange={(v) => updateFoto(foto._id, 'tipo', v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.entries(TIPO_FOTO_LABELS) as [TipoFoto, string][]).map(([val, label]) => (
                          <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Tag / Identificação</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder={TIPO_FOTO_PLACEHOLDERS[foto.tipo]}
                      value={foto.legenda}
                      onChange={(e) => updateFoto(foto._id, 'legenda', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pb-8">
        <Button type="submit" disabled={saving} className="text-white" style={{ backgroundColor: '#f97316' }}>
          {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Salvar empreendimento'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
