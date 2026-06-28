/**
 * One-shot: insere o post "Por que investir em lotes em Goiânia, em 2026"
 * Execute: npx tsx scripts/seed-lotes-2026.ts
 */
import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SLUG = 'por-que-investir-em-lotes-em-goiania-em-2026'

const HTML = `
<h1>Por que investir em lotes em Goiânia, em 2026, pode ser uma boa saída?</h1>

<p>Quando pensamos em investir no mercado imobiliário, é comum imaginar apartamentos ou casas prontas. No entanto, existe um segmento que vem chamando cada vez mais a atenção de investidores e famílias que desejam construir patrimônio de forma planejada: os lotes.</p>

<p>Em Goiânia e na Região Metropolitana, o mercado de loteamentos continua aquecido em 2026, impulsionado pela expansão urbana, pelo crescimento da demanda por condomínios horizontais e pelo desenvolvimento de novas regiões.</p>

<p>Mas será que investir em um lote realmente vale a pena?</p>

<p>A resposta depende dos objetivos de cada pessoa, mas existem diversos fatores que tornam essa modalidade uma alternativa bastante interessante.</p>

<h2>Goiânia continua crescendo</h2>

<p>Nos últimos anos, Goiânia consolidou-se como uma das capitais com maior crescimento imobiliário do país. Novos bairros, melhorias na infraestrutura, expansão de vias de acesso e o fortalecimento de cidades vizinhas, como Aparecida de Goiânia, Senador Canedo e Trindade, contribuem para o desenvolvimento de novas regiões.</p>

<p>Esse crescimento faz com que áreas antes pouco valorizadas passem a despertar o interesse de moradores e investidores, criando oportunidades para quem compra terrenos antes da consolidação desses locais.</p>

<p>Como consequência, muitos lotes acabam acompanhando esse desenvolvimento e apresentam potencial de valorização ao longo dos anos.</p>

<h2>O mercado de loteamentos segue aquecido</h2>

<p>Outro fator importante é o bom momento vivido pelos loteamentos horizontais.</p>

<p>A procura por terrenos continua elevada, especialmente em condomínios fechados, impulsionada por famílias que buscam segurança, qualidade de vida, áreas verdes e espaços maiores para morar.</p>

<p>Quando existe uma demanda consistente e uma oferta limitada de bons empreendimentos, a tendência natural é que os preços acompanhem essa valorização ao longo do tempo.</p>

<p>Embora ninguém possa garantir a valorização de um imóvel específico, o cenário atual mostra um mercado bastante ativo na Região Metropolitana de Goiânia.</p>

<h2>Juros altos mudam a forma de investir</h2>

<p>Em 2026, outro aspecto merece atenção: a taxa Selic permanece em um patamar elevado.</p>

<p>Na prática, isso torna o financiamento de imóveis prontos mais caro, aumentando o valor das parcelas e o custo total da aquisição.</p>

<p>Já no mercado de lotes, principalmente quando a compra é realizada diretamente com a loteadora, muitas vezes existem condições de pagamento mais flexíveis e valores de entrada mais acessíveis.</p>

<p>Além disso, quem compra um lote não precisa assumir imediatamente o custo de uma construção. Isso permite organizar melhor o orçamento e planejar os próximos passos sem a pressão financeira de um financiamento elevado logo no início.</p>

<p>Para muitos investidores, esse fator faz bastante diferença.</p>

<h2>Um investimento que oferece liberdade</h2>

<p>Uma das maiores vantagens de um lote é a flexibilidade.</p>

<p>Ao adquirir um terreno, você não está comprando apenas um espaço vazio. Está adquirindo diversas possibilidades para o futuro.</p>

<p>Você pode simplesmente esperar a valorização da região.</p>

<p>Pode construir uma casa para morar.</p>

<p>Pode desenvolver um imóvel para vender.</p>

<p>Pode construir para gerar renda com aluguel.</p>

<p>Ou até utilizar o terreno em uma futura negociação ou permuta com uma incorporadora, dependendo da localização.</p>

<p>Poucos ativos imobiliários oferecem tantas alternativas quanto um lote.</p>

<h2>Construir no seu tempo</h2>

<p>Outro diferencial importante é que a construção acontece quando você decidir.</p>

<p>Ao contrário de um imóvel pronto, que exige um investimento completo logo na compra, o lote permite separar as etapas.</p>

<p>Primeiro você adquire o terreno.</p>

<p>Depois, quando sua situação financeira permitir ou quando o mercado apresentar uma oportunidade interessante, inicia a construção.</p>

<p>Essa liberdade ajuda no planejamento financeiro e evita que o comprador assuma compromissos maiores do que pode suportar naquele momento.</p>

<h2>Um projeto totalmente personalizado</h2>

<p>Para quem pretende morar no imóvel, existe ainda uma vantagem difícil de mensurar: a possibilidade de construir exatamente a casa que deseja.</p>

<p>É possível definir a arquitetura, o tamanho dos ambientes, a posição da garagem, a área de lazer, a iluminação natural e cada detalhe do projeto.</p>

<p>Já para quem pensa como investidor, essa personalização também faz diferença.</p>

<p>Você pode desenvolver um imóvel pensado especificamente para o perfil do público daquela região, aumentando o potencial de venda e tornando o investimento mais eficiente.</p>

<p>Em vez de adaptar um imóvel existente, você cria um produto do zero.</p>

<h2>Menor custo de manutenção</h2>

<p>Enquanto imóveis prontos exigem reformas, manutenção, pintura e outros custos recorrentes, um lote costuma gerar despesas muito menores durante o período em que permanece em carteira.</p>

<p>Na maioria dos casos, os principais custos são o IPTU e, quando se trata de um condomínio fechado, a taxa condominial.</p>

<p>Isso torna o terreno um ativo relativamente simples de manter enquanto aguarda o momento ideal para sua utilização.</p>

<h2>Um investimento para quem pensa no longo prazo</h2>

<p>É importante lembrar que lotes normalmente não são investimentos de retorno imediato.</p>

<p>Seu principal potencial está na valorização ao longo do tempo, acompanhando o crescimento da cidade e da infraestrutura ao redor.</p>

<p>Por isso, quanto maior o horizonte de investimento, maiores tendem a ser as oportunidades de capturar essa valorização.</p>

<p>Quem compra um lote pensando em cinco, dez ou quinze anos costuma enxergar o terreno como parte da construção de um patrimônio familiar.</p>

<h2>Vale a pena investir em lotes em Goiânia em 2026?</h2>

<p>Para quem busca formar patrimônio de maneira gradual, a resposta pode ser sim.</p>

<p>O crescimento urbano de Goiânia, a procura por loteamentos fechados, a flexibilidade que esse tipo de investimento oferece e o atual cenário de juros elevados criam um ambiente interessante para quem deseja investir no mercado imobiliário.</p>

<p>Naturalmente, nenhum investimento deve ser feito sem análise. Avaliar a localização, o histórico da loteadora, a infraestrutura prevista e o potencial de desenvolvimento da região continua sendo fundamental.</p>

<p>Mas, para quem enxerga o mercado com visão de médio e longo prazo, um lote pode representar muito mais do que um pedaço de terra. Pode ser o primeiro passo para construir patrimônio, desenvolver novos projetos e aproveitar as oportunidades que surgem com o crescimento da cidade.</p>
`.trim()

async function main() {
  const existing = await prisma.post.findUnique({ where: { slug: SLUG } })
  if (existing) {
    console.log(`\n⚠️  Slug "${SLUG}" já existe (id: ${existing.id}). Abortando.`)
    return
  }

  const post = await prisma.post.create({
    data: {
      titulo: 'Por que investir em lotes em Goiânia, em 2026, pode ser uma boa saída?',
      slug: SLUG,
      resumo:
        'Conheça os principais motivos pelos quais o mercado de lotes e loteamentos em Goiânia segue atrativo em 2026, da flexibilidade financeira ao potencial de valorização.',
      conteudo: HTML,
      capa: null,
      categoria: 'Micro',
      publicado: true,
    },
  })

  console.log(`\n✓ Post criado com sucesso!`)
  console.log(`  ID:  ${post.id}`)
  console.log(`  URL: /blog/${post.slug}`)
  console.log(`  Admin: /admin/blog/${post.id}/editar`)
}

main()
  .catch((e) => {
    console.error('\n✗ Erro:', e.message ?? e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
