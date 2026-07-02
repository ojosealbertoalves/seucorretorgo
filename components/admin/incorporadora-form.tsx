'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { X, ImagePlus, Loader2 } from 'lucide-react'
import { useR2Upload } from '@/components/R2Upload'

type IncorporadoraData = {
  id: string
  nome: string
  construtora: string | null
  logo: string | null
  site: string | null
  telefone: string | null
  email: string | null
  descricao: string | null
  ativo: boolean
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 border-b pb-2">{title}</h2>
      {children}
    </section>
  )
}

export function IncorporadoraForm({ initialData }: { initialData?: IncorporadoraData }) {
  const router = useRouter()
  const { startUpload } = useR2Upload()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [nome, setNome] = useState(initialData?.nome ?? '')
  const [construtora, setConstrutora] = useState(initialData?.construtora ?? '')
  const [logo, setLogo] = useState(initialData?.logo ?? '')
  const [logoPreview, setLogoPreview] = useState(initialData?.logo ?? '')
  const [logoUploading, setLogoUploading] = useState(false)
  const [site, setSite] = useState(initialData?.site ?? '')
  const [telefone, setTelefone] = useState(initialData?.telefone ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [descricao, setDescricao] = useState(initialData?.descricao ?? '')
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true)

  const logoInputRef = useRef<HTMLInputElement>(null)

  async function handleLogoFile(file: File) {
    setLogoPreview(URL.createObjectURL(file))
    setLogoUploading(true)
    try {
      const uploaded = await startUpload([file])
      const url = uploaded?.[0]?.url ?? ''
      if (!url) throw new Error('No URL')
      setLogo(url)
    } catch {
      setLogoPreview(logo)
      alert('Erro ao fazer upload da logo. Tente novamente.')
    } finally {
      setLogoUploading(false)
    }
  }

  function removeLogo() {
    setLogo('')
    setLogoPreview('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!nome.trim()) {
      setError('Nome é obrigatório.')
      return
    }
    if (logoUploading) {
      setError('Aguarde o upload da logo terminar.')
      return
    }

    setSaving(true)

    const payload = {
      nome: nome.trim(),
      construtora: construtora.trim() || null,
      logo: logo || null,
      site: site.trim() || null,
      telefone: telefone.trim() || null,
      email: email.trim() || null,
      descricao: descricao.trim() || null,
      ativo,
    }

    const url = initialData
      ? `/api/admin/incorporadoras/${initialData.id}`
      : '/api/admin/incorporadoras'
    const method = initialData ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/incorporadoras')
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      setError(err.error || 'Erro ao salvar.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Logo */}
      <Section title="Logo">
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleLogoFile(e.target.files[0])}
        />

        {logoPreview || logo ? (
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-lg border overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center">
              <img
                src={logoPreview || logo}
                alt="Logo"
                className="w-full h-full object-contain p-2"
              />
              {logoUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
              >
                Alterar logo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={removeLogo}
              >
                <X className="h-4 w-4 mr-1" /> Remover logo
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onClick={() => logoInputRef.current?.click()}
          >
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Clique para adicionar a logo</p>
            <p className="text-xs text-muted-foreground">PNG, JPEG, WebP ou SVG</p>
          </div>
        )}
      </Section>

      {/* Dados */}
      <Section title="Dados da Incorporadora">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Nome *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: MRV Engenharia"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Construtora</Label>
            <Input
              value={construtora}
              onChange={(e) => setConstrutora(e.target.value)}
              placeholder="Se diferente do nome da incorporadora"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(62) 9 9999-9999"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@empresa.com.br"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Site</Label>
            <Input
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="https://www.empresa.com.br"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição da incorporadora..."
            />
          </div>
        </div>
      </Section>

      {/* Publicação */}
      <Section title="Status">
        <div className="flex items-center justify-between">
          <div>
            <Label>Ativa</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Disponível para vincular a empreendimentos
            </p>
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
        <Button
          type="submit"
          disabled={saving}
          className="text-white"
          style={{ backgroundColor: '#C4622D' }}
        >
          {saving ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Criar incorporadora'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
