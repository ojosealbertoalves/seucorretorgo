'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MultiSelectFiltro, type FiltroOption } from './multiselect-filtro'

const TIPO_OPTIONS: FiltroOption[] = [
  { value: 'LOTE', label: 'Loteamento' },
  { value: 'IMOVEL', label: 'Imóvel' },
  { value: 'AVULSO', label: 'Lote avulso' },
]

const STATUS_OPTIONS: FiltroOption[] = [
  { value: 'LANCAMENTO', label: 'Lançamento' },
  { value: 'EM_OBRAS', label: 'Em obras' },
  { value: 'PRONTO', label: 'Pronto' },
]

export type CidadeOption = { id: string; nome: string }
export type BairroOption = { id: string; nome: string; cidadeId: string }
export type IncorporadoraOption = { id: string; nome: string }

function parseParam(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : []
}

export function FiltrosCatalogo({
  incorporadoras,
  cidades,
  bairros,
}: {
  incorporadoras: IncorporadoraOption[]
  cidades: CidadeOption[]
  bairros: BairroOption[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tipo = parseParam(searchParams.get('tipo'))
  const incorporadora = parseParam(searchParams.get('incorporadora'))
  const cidade = parseParam(searchParams.get('cidade'))
  const bairro = parseParam(searchParams.get('bairro'))
  const status = parseParam(searchParams.get('status'))

  const bairroOptions: FiltroOption[] = (
    cidade.length > 0 ? bairros.filter((b) => cidade.includes(b.cidadeId)) : bairros
  ).map((b) => ({ value: b.id, label: b.nome }))

  function updateParams(next: Record<string, string[]>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, values] of Object.entries(next)) {
      if (values.length > 0) params.set(key, values.join(','))
      else params.delete(key)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function setCidade(values: string[]) {
    const bairrosValidos = values.length > 0
      ? bairro.filter((id) => bairros.find((b) => b.id === id && values.includes(b.cidadeId)))
      : bairro
    updateParams({ cidade: values, bairro: bairrosValidos })
  }

  const temFiltroAtivo = tipo.length + incorporadora.length + cidade.length + bairro.length + status.length > 0

  return (
    <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1 -mx-1 px-1">
      <MultiSelectFiltro
        label="Tipo"
        options={TIPO_OPTIONS}
        selected={tipo}
        onChange={(values) => updateParams({ tipo: values })}
      />
      <MultiSelectFiltro
        label="Incorporadora"
        options={incorporadoras.map((i) => ({ value: i.id, label: i.nome }))}
        selected={incorporadora}
        onChange={(values) => updateParams({ incorporadora: values })}
        searchable
        emptyMessage="Nenhuma incorporadora encontrada."
      />
      <MultiSelectFiltro
        label="Cidade"
        options={cidades.map((c) => ({ value: c.id, label: c.nome }))}
        selected={cidade}
        onChange={setCidade}
      />
      <MultiSelectFiltro
        label="Bairro"
        options={bairroOptions}
        selected={bairro}
        onChange={(values) => updateParams({ bairro: values })}
        searchable
        emptyMessage="Nenhum bairro encontrado."
      />
      <MultiSelectFiltro
        label="Status"
        options={STATUS_OPTIONS}
        selected={status}
        onChange={(values) => updateParams({ status: values })}
      />

      {temFiltroAtivo && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="shrink-0 text-sm text-white/40 hover:text-white/70 transition-colors px-2"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
