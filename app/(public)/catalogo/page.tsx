import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const STATUS_LABEL: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 0 })
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const { tipo } = await searchParams

  const empreendimentos = await prisma.empreendimento.findMany({
    where: {
      ativo: true,
      ...(tipo === 'IMOVEL' || tipo === 'LOTE' ? { tipoNegocio: tipo } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      tipologias: { where: { disponivel: true }, orderBy: { preco: 'asc' }, take: 1 },
      lotes: { where: { disponivel: true }, orderBy: { preco: 'asc' }, take: 1 },
      fotos: { where: { tipo: 'FACHADA' }, orderBy: { ordem: 'asc' }, take: 1 },
    },
  })

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Catálogo de Empreendimentos</h1>

      {/* Filtro por tipo */}
      <div className="flex gap-2 mb-8">
        {([
          { value: '', label: 'Todos' },
          { value: 'IMOVEL', label: 'Imóveis' },
          { value: 'LOTE', label: 'Lotes e Loteamentos' },
        ] as const).map(({ value, label }) => (
          <Button
            key={value}
            asChild
            variant={(tipo ?? '') === value ? 'default' : 'outline'}
            size="sm"
          >
            <Link href={value ? `/catalogo?tipo=${value}` : '/catalogo'}>{label}</Link>
          </Button>
        ))}
      </div>

      {empreendimentos.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">Nenhum empreendimento encontrado.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {empreendimentos.map((e) => {
            const foto = e.fotos[0]
            const isLote = e.tipoNegocio === 'LOTE'
            const primeiroLote = e.lotes[0]
            const primeiraTipologia = e.tipologias[0]

            return (
              <Link
                key={e.id}
                href={`/catalogo/${e.slug}`}
                className="rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-gray-100">
                  {foto ? (
                    <img src={foto.url} alt={e.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🏘</div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge className={isLote ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-white'}>
                      {isLote ? 'Loteamento' : STATUS_LABEL[e.status] ?? e.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h2 className="font-semibold text-gray-900 truncate">{e.nome}</h2>
                  <p className="text-sm text-muted-foreground">{e.bairro} · {e.cidade}</p>
                  {isLote ? (
                    primeiroLote ? (
                      <p className="text-sm text-gray-700">
                        A partir de {primeiroLote.areaTerreno}m² · {fmt(primeiroLote.preco)}
                      </p>
                    ) : null
                  ) : (
                    primeiraTipologia ? (
                      <p className="text-sm text-gray-700">
                        {primeiraTipologia.quartos} quarto{primeiraTipologia.quartos !== 1 ? 's' : ''} · a partir de {fmt(primeiraTipologia.preco)}
                      </p>
                    ) : null
                  )}
                  <p className="text-sm font-medium text-orange-600">
                    {fmt(e.precoMin)}{e.precoMin !== e.precoMax ? ` – ${fmt(e.precoMax)}` : ''}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
