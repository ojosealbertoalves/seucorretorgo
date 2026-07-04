import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmpreendimentoForm, type FormPreset, type TipoFoto } from '@/components/admin/empreendimento-form'

export default async function EditarEmpreendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const { id } = await params

  const emp = await prisma.empreendimento.findUnique({
    where: { id },
    include: {
      tipologias: true,
      lotes: { orderBy: { preco: 'asc' } },
      fotos: { orderBy: { ordem: 'asc' } },
    },
  })

  if (!emp) notFound()

  // Split plantas (per-tipologia) from regular fotos
  const plantas = emp.fotos.filter((f) => f.tipo === 'PLANTA')
  const fotosSemPlanta = emp.fotos.filter((f) => f.tipo !== 'PLANTA')

  const preset: FormPreset = {
    nome: emp.nome,
    incorporadoraId: emp.incorporadoraId,
    construtora: emp.construtora,
    bairro: emp.bairro,
    bairrosProximos: emp.bairrosProximos,
    endereco: emp.endereco,
    status: emp.status,
    entregaPrevista: emp.entregaPrevista,
    percentualObra: emp.percentualObra,
    tipoNegocio: emp.tipoNegocio,
    infraestrutura: emp.infraestrutura,
    areaTotalLoteamento: emp.areaTotalLoteamento,
    loteAreaMin: emp.loteAreaMin,
    loteAreaMax: emp.loteAreaMax,
    lotePrecoMin: emp.lotePrecoMin,
    tipologias: emp.tipologias.map((t, i) => ({
      quartos: t.quartos,
      suites: t.suites,
      banheiros: t.banheiros,
      areaPrivativa: t.areaPrivativa,
      areaTotal: t.areaTotal,
      vagas: t.vagas,
      preco: t.preco,
      plantaUrl: plantas[i]?.url ?? null,
    })),
    lotes: emp.lotes.map((l) => ({
      quadra: l.quadra,
      numero: l.numero,
      areaTerreno: l.areaTerreno,
      frente: l.frente,
      preco: l.preco,
      disponivel: l.disponivel,
    })),
    aceitaFgts: emp.aceitaFgts,
    aceitaFinanciamento: emp.aceitaFinanciamento,
    programaMcmv: emp.programaMcmv,
    diferenciais: emp.diferenciais,
    destaqueIa: emp.destaqueIa,
    descricaoCompleta: emp.descricaoCompleta,
    latitude: emp.latitude,
    longitude: emp.longitude,
    ativo: emp.ativo,
    fotos: fotosSemPlanta.map((f) => ({
      url: f.url,
      tipo: f.tipo as TipoFoto,
      legenda: f.legenda,
    })),
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Empreendimento</h1>
      <EmpreendimentoForm editId={id} preset={preset} />
    </div>
  )
}
