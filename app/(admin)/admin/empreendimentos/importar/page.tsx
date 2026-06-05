'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Image, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { EmpreendimentoForm, type FormPreset } from '@/components/admin/empreendimento-form'
import { cn } from '@/lib/utils'

type ExtractedData = FormPreset & { incorporadora?: string }

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data URL prefix: "data:<mime>;base64,"
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ImportarEmpreendimentoPage() {
  const [phase, setPhase] = useState<'upload' | 'form'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const ACCEPTED = 'application/pdf,image/jpeg,image/jpg,image/png'

  function handleFileChange(selected: File | null) {
    if (!selected) return
    const ok = selected.type === 'application/pdf' || selected.type.startsWith('image/')
    if (!ok) {
      setAnalyzeError('Formato inválido. Use PDF, JPG ou PNG.')
      return
    }
    setFile(selected)
    setAnalyzeError('')
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileChange(dropped)
  }, [])

  async function handleAnalyze() {
    if (!file) return
    setAnalyzing(true)
    setAnalyzeError('')

    try {
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/admin/importar-empreendimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mimeType: file.type }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Erro ao analisar arquivo.')
      }

      const data: ExtractedData = await res.json()
      setExtracted(data)
      setPhase('form')
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Erro desconhecido.')
    } finally {
      setAnalyzing(false)
    }
  }

  /* ─── Build FormPreset from extracted data ─────────────────────── */
  function buildPreset(data: ExtractedData): FormPreset {
    return {
      nome: data.nome,
      construtora: data.construtora,
      bairro: data.bairro,
      endereco: data.endereco,
      status: data.status ?? 'LANCAMENTO',
      entregaPrevista: data.entregaPrevista,
      tipologias: (data.tipologias ?? []).map((t) => ({
        quartos: t.quartos ?? 0,
        suites: t.suites ?? 0,
        banheiros: t.banheiros ?? 1,
        areaPrivativa: t.areaPrivativa ?? 0,
        areaTotal: t.areaTotal,
        vagas: t.vagas ?? 1,
        preco: t.preco ?? null,
      })),
      aceitaFgts: data.aceitaFgts ?? false,
      aceitaFinanciamento: data.aceitaFinanciamento ?? true,
      programaMcmv: data.programaMcmv ?? false,
      diferenciais: data.diferenciais ?? [],
      destaqueIa: data.destaqueIa ?? '',
      descricaoCompleta: data.descricaoCompleta,
      latitude: data.latitude,
      longitude: data.longitude,
      ativo: false,
    }
  }

  /* ─── Upload phase ──────────────────────────────────────────────── */
  if (phase === 'upload') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/empreendimentos" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Importar via PDF ou Imagem</h1>
        </div>

        <div className="rounded-lg border bg-white p-8 space-y-6">
          <p className="text-sm text-muted-foreground">
            Envie o material de vendas do empreendimento (PDF, JPG ou PNG) e a IA vai extrair automaticamente os dados e preencher o formulário de cadastro.
          </p>

          {/* Drop zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 cursor-pointer transition-colors select-none',
              dragging ? 'border-orange-400 bg-orange-50' : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <div className="flex items-center gap-4 text-muted-foreground">
              <FileText className="h-10 w-10" />
              <Image className="h-10 w-10" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Arraste o arquivo aqui ou <span className="text-orange-500">clique para selecionar</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG ou PNG · Máximo 10 MB</p>
            </div>
          </div>

          {/* Selected file */}
          {file && (
            <div className="flex items-center gap-3 rounded-lg border bg-gray-50 px-4 py-3">
              {file.type === 'application/pdf' ? (
                <FileText className="h-5 w-5 text-orange-500 shrink-0" />
              ) : (
                <Image className="h-5 w-5 text-orange-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
              >
                Remover
              </Button>
            </div>
          )}

          {analyzeError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {analyzeError}
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!file || analyzing}
            className="w-full text-white"
            style={{ backgroundColor: '#f97316' }}
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Analisar com IA
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  /* ─── Form phase ────────────────────────────────────────────────── */
  if (!extracted) return null

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setPhase('upload')}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Importar via PDF ou Imagem</h1>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 mb-6">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">Dados extraídos com sucesso!</p>
          <p className="text-sm text-green-700 mt-0.5">
            Revise os campos abaixo, selecione a incorporadora e salve o empreendimento.
          </p>
        </div>
      </div>

      <EmpreendimentoForm
        preset={buildPreset(extracted)}
        incorporadoraHint={extracted.incorporadora}
      />
    </div>
  )
}
