import { searchEmpreendimentos, type FiltrosBusca, type EmpreendimentoResult } from '@/lib/search-empreendimentos'

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions'

function orHeaders() {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'X-Title': 'Seu Corretor GO',
  }
}

const STATUS_MAP: Record<string, string> = {
  LANCAMENTO: 'Lançamento',
  EM_OBRAS: 'Em obras',
  PRONTO: 'Pronto para morar',
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

type FiltrosExtraidos = FiltrosBusca & {
  bairros?: string[] | null
  prontoParaBuscar: boolean
}

async function extractFiltros(
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<FiltrosExtraidos> {
  try {
    const res = await fetch(OR_URL, {
      method: 'POST',
      headers: orHeaders(),
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL_FAST || 'anthropic/claude-haiku-4-5',
        messages: [
          {
            role: 'system',
            content: `Analise a conversa e extraia filtros de busca de imóveis.
Retorne APENAS JSON válido, sem markdown, sem explicação:
{
  "tipo": "apartamento" | "casa" | null,
  "quartos": number | null,
  "precoMax": number | null,
  "bairros": string[] | null,
  "diferenciais": string[] | null,
  "aceitaFgts": boolean | null,
  "programaMcmv": boolean | null,
  "prontoParaBuscar": boolean
}
prontoParaBuscar = true apenas se tiver pelo menos: tipo + quartos + precoMax. Caso contrário false.`,
          },
          ...messages,
        ],
        max_tokens: 256,
      }),
    })

    if (!res.ok) return { prontoParaBuscar: false }
    const data = await res.json()
    const text = (data.choices?.[0]?.message?.content ?? '{}').trim()
    return JSON.parse(text)
  } catch {
    return { prontoParaBuscar: false }
  }
}

function buildContextJson(empreendimentos: EmpreendimentoResult[]) {
  return empreendimentos.map((e) => ({
    slug: e.slug,
    nome: e.nome,
    bairro: e.bairro,
    bairrosProximos: e.bairrosProximos,
    cidade: e.cidade,
    endereco: e.endereco,
    status: STATUS_MAP[e.status] ?? e.status,
    precoMin: fmt(e.precoMin),
    precoMax: fmt(e.precoMax),
    aceitaFgts: e.aceitaFgts,
    aceitaFinanciamento: e.aceitaFinanciamento,
    programaMcmv: e.programaMcmv,
    entregaPrevista: e.entregaPrevista,
    percentualObra: e.percentualObra,
    diferenciais: e.diferenciais,
    destaqueIa: e.destaqueIa,
    descricaoCompleta: e.descricaoCompleta ? e.descricaoCompleta.slice(0, 400) : null,
    incorporadora: {
      nome: e.incorporadora.nome,
      descricao: e.incorporadora.descricao ? e.incorporadora.descricao.slice(0, 200) : null,
    },
    tipologias: e.tipologias.map((t) => ({
      quartos: t.quartos,
      suites: t.suites,
      banheiros: t.banheiros,
      areaPrivativa: t.areaPrivativa,
      areaTotal: t.areaTotal,
      vagas: t.vagas,
      preco: fmt(t.preco),
    })),
  }))
}

const SYSTEM_TEMPLATE = `Você é o Alberto, assistente do Seu Corretor GO em Goiânia.
Especialista em imóveis NOVOS até R$ 1,5 milhão.

PERSONALIDADE:
- Caloroso, consultivo, como um amigo especialista
- UMA pergunta por vez, nunca bombardeie
- Respostas objetivas, máximo 3 parágrafos
- Nunca pressione

ROTEIRO DE QUALIFICAÇÃO (ordem natural):
1. Apartamento ou casa?
2. Quantos quartos?
3. Vagas de garagem?
4. Orçamento máximo?
5. Bairros de preferência em Goiânia?
6. Diferenciais importantes? (piscina, academia, segurança 24h...)
7. Pagamento: à vista, FGTS ou financiamento?
8. Renda declarada ou comprovação dos últimos 6 meses?
9. Estado civil?
10. Previsão de quando quer comprar?

QUANDO APRESENTAR IMÓVEIS:
Os empreendimentos compatíveis estão no contexto abaixo como JSON.
Para cada um, VENDA o produto:
- Mencione a incorporadora e sua credibilidade
- Destaque os diferenciais do empreendimento
- Fale da localização e o que tem ao redor
- Aponte a tipologia compatível com o perfil do cliente
- Use o campo destaqueIa como frase de impacto
- Compare focando APENAS nos pontos positivos de cada um
- Use a analogia: 'é como comparar uma Ferrari com um Porsche'

SOBRE AS FOTOS:
Quando apresentar imóveis, o sistema automaticamente mostrará as fotos cadastradas. Você não precisa mencionar as fotos no texto.
Apenas descreva o empreendimento com entusiasmo.

REGRAS ABSOLUTAS:
- Use APENAS dados dos empreendimentos do contexto
- Nunca invente preços, datas ou características
- Nunca fale de imóveis usados ou fora de Goiânia
- Se não souber: 'Não tenho essa informação, mas posso conectar você com o corretor'
- Nunca pressione o cliente

CTA — só quando demonstrar interesse claro:
'Quer agendar uma visita? Me passa seu nome, WhatsApp e e-mail que o corretor entra em contato no horário que preferir.'

INSTRUÇÕES TÉCNICAS — NÃO MENCIONE NA CONVERSA:
Quando o cliente fornecer nome + email + WhatsApp voluntariamente, inclua NO FINAL da mensagem:
[LEAD:nome=NOME_COMPLETO|email=EMAIL|whatsapp=NUMERO_SEM_ESPACOS]

EMPREENDIMENTOS DISPONÍVEIS:
{EMPREENDIMENTOS_JSON}

Se EMPREENDIMENTOS_JSON estiver vazio ou "[]", ainda não há empreendimentos compatíveis com o perfil — continue qualificando ou diga que vai verificar disponibilidade.`

export async function POST(req: Request) {
  console.log('[chat] POST /api/chat — início')

  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Mensagens inválidas' }, { status: 400 })
    }

    const rawMessages = (messages as { role: string; content: string }[]).filter(
      (m) => (m.role === 'user' || m.role === 'assistant') && m.content.trim().length > 0,
    )
    const firstUserIdx = rawMessages.findIndex((m) => m.role === 'user')
    if (firstUserIdx === -1) {
      return Response.json({ error: 'Nenhuma mensagem de usuário encontrada' }, { status: 400 })
    }
    const apiMessages = rawMessages.slice(firstUserIdx).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    console.log('[chat] mensagens para API:', apiMessages.length)

    const filtros = await extractFiltros(apiMessages)
    console.log('[chat] filtros extraídos:', JSON.stringify(filtros))

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let empreendimentosJson = '[]'

          if (filtros.prontoParaBuscar) {
            const results = await searchEmpreendimentos({
              tipo: filtros.tipo,
              quartos: filtros.quartos,
              bairrosInteresse: filtros.bairros,
              precoMax: filtros.precoMax,
              diferenciais: filtros.diferenciais,
              aceitaFgts: filtros.aceitaFgts,
              programaMcmv: filtros.programaMcmv,
            })

            if (results.length > 0) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'cards', data: results })}\n\n`,
                ),
              )
              empreendimentosJson = JSON.stringify(buildContextJson(results))
              console.log('[chat] empreendimentos encontrados:', results.length)
            }
          }

          const systemPrompt = SYSTEM_TEMPLATE.replace('{EMPREENDIMENTOS_JSON}', empreendimentosJson)

          console.log('[chat] iniciando stream OpenRouter')

          const orRes = await fetch(OR_URL, {
            method: 'POST',
            headers: orHeaders(),
            body: JSON.stringify({
              model: process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4-5',
              messages: [{ role: 'system', content: systemPrompt }, ...apiMessages],
              stream: true,
              max_tokens: 1024,
            }),
          })

          if (!orRes.ok || !orRes.body) {
            throw new Error(`OpenRouter error: ${orRes.status}`)
          }

          const reader = orRes.body.getReader()
          const decoder = new TextDecoder()
          let buf = ''
          let fullText = ''
          let finished = false

          while (!finished) {
            const { done, value } = await reader.read()
            if (done) break

            buf += decoder.decode(value, { stream: true })
            const lines = buf.split('\n')
            buf = lines.pop() ?? ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const raw = line.slice(6).trim()
              if (raw === '[DONE]') { finished = true; break }

              try {
                const parsed = JSON.parse(raw)
                const content: string | undefined = parsed.choices?.[0]?.delta?.content
                if (content) {
                  fullText += content
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'text', delta: content })}\n\n`),
                  )
                }
              } catch {}
            }
          }

          console.log('[chat] stream completo —', fullText.length, 'chars')

          const leadMatch = fullText.match(/\[LEAD:([^\]]+)\]/)
          if (leadMatch) {
            const params: Record<string, string> = {}
            leadMatch[1].split('|').forEach((p) => {
              const idx = p.indexOf('=')
              if (idx > 0) params[p.slice(0, idx).trim()] = p.slice(idx + 1).trim()
            })
            if (params.nome && params.email) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'lead', data: params })}\n\n`),
              )
            }
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
          console.log('[chat] stream fechado com sucesso')
        } catch (err) {
          console.error('[chat] stream error:', err)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', message: 'Erro ao processar resposta. Tente novamente.' })}\n\n`,
            ),
          )
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[chat] request error:', err)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
