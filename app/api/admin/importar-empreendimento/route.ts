import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é um especialista em análise de materiais de vendas de empreendimentos imobiliários. Analise o material enviado e extraia TODOS os dados disponíveis. Retorne APENAS um JSON válido, sem markdown, sem explicação, com esta estrutura exata:

{
  "nome": "string",
  "incorporadora": "string",
  "construtora": "string ou null",
  "bairro": "string",
  "cidade": "string",
  "endereco": "string ou null",
  "status": "LANCAMENTO ou EM_OBRAS ou PRONTO",
  "entregaPrevista": "string ou null",
  "tipologias": [
    {
      "quartos": 0,
      "suites": 0,
      "banheiros": 0,
      "areaPrivativa": 0,
      "areaTotal": 0,
      "vagas": 0,
      "preco": 0
    }
  ],
  "aceitaFgts": false,
  "aceitaFinanciamento": true,
  "programaMcmv": false,
  "diferenciais": ["string"],
  "destaqueIa": "string",
  "descricaoCompleta": "string",
  "latitude": null,
  "longitude": null
}

Regras:
- tipologias: crie uma entrada para cada tipo de planta mencionada
- diferenciais: liste os pontos positivos como array de strings curtas
- destaqueIa: crie uma frase de impacto de até 15 palavras sobre o empreendimento
- descricaoCompleta: texto vendedor completo com base no material
- Se um dado não estiver disponível, use null
- Nunca invente dados que não estão no material
- Para precos, use apenas números sem R$ ou pontos (ex: 450000)`

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { base64, mimeType } = await req.json() as { base64: string; mimeType: string }

    if (!base64 || !mimeType) {
      return Response.json({ error: 'Arquivo inválido' }, { status: 400 })
    }

    const isImage = mimeType.startsWith('image/')
    const isPdf = mimeType === 'application/pdf'

    if (!isImage && !isPdf) {
      return Response.json({ error: 'Formato não suportado. Use PDF, JPG ou PNG.' }, { status: 400 })
    }

    type ContentBlock =
      | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
      | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }
      | { type: 'text'; text: string }

    const content: ContentBlock[] = isPdf
      ? [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          { type: 'text', text: 'Analise este documento e extraia os dados do empreendimento.' },
        ]
      : [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64 },
          },
          { type: 'text', text: 'Analise esta imagem e extraia os dados do empreendimento.' },
        ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: content as Anthropic.MessageParam['content'] }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Strip markdown code fences if Claude wrapped the JSON
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

    let extracted: unknown
    try {
      extracted = JSON.parse(cleaned)
    } catch {
      // Try to extract the first {...} block from the response
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) {
        console.error('[importar] no JSON in response:', text.slice(0, 500))
        return Response.json({ error: 'A IA não retornou dados estruturados. Tente com outro arquivo.' }, { status: 422 })
      }
      extracted = JSON.parse(match[0])
    }

    return Response.json(extracted)
  } catch (err) {
    console.error('[importar] error:', err)
    return Response.json({ error: 'Erro ao processar arquivo com a IA.' }, { status: 500 })
  }
}
