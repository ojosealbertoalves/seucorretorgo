import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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

    // OpenAI-compatible vision format — data URL funciona para imagens e PDFs via OpenRouter/Claude
    type ContentPart =
      | { type: 'image_url'; image_url: { url: string } }
      | { type: 'text'; text: string }

    const userContent: ContentPart[] = [
      {
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64}` },
      },
      {
        type: 'text',
        text: isPdf
          ? 'Analise este documento e extraia os dados do empreendimento.'
          : 'Analise esta imagem e extraia os dados do empreendimento.',
      },
    ]

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Seu Corretor GO',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4-5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        max_tokens: 4096,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[importar] OpenRouter error:', res.status, errText)
      return Response.json({ error: 'Erro ao processar arquivo com a IA.' }, { status: 500 })
    }

    const data = await res.json()
    const text: string = data.choices?.[0]?.message?.content ?? ''

    // Strip markdown code fences if the model wrapped the JSON
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
