import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const SYSTEM_PROMPT = `Você é um especialista em marketing imobiliário. Organize e melhore o texto recebido sobre um loteamento/empreendimento imobiliário. Mantenha todas as informações originais. Corrija erros de português. Melhore o estilo para ser mais profissional e atrativo. Use formatação HTML simples: <p>, <ul>, <li>, <strong>. Retorne APENAS o HTML organizado, sem explicações.`

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { texto, contexto } = await req.json() as { texto?: string; contexto?: string }

    if (!texto || !texto.trim()) {
      return Response.json({ error: 'Texto vazio' }, { status: 400 })
    }

    const rotulo = contexto === 'infraestrutura' ? 'infraestrutura do condomínio' : 'descrição completa do empreendimento'

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
          { role: 'user', content: `Texto (${rotulo}):\n\n${texto}` },
        ],
        max_tokens: 2048,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[organizar-texto] OpenRouter error:', res.status, errText)
      return Response.json({ error: 'Erro ao organizar texto com a IA.' }, { status: 500 })
    }

    const data = await res.json()
    const texto_organizado: string = (data.choices?.[0]?.message?.content ?? '').trim()

    if (!texto_organizado) {
      return Response.json({ error: 'A IA não retornou conteúdo.' }, { status: 422 })
    }

    const cleaned = texto_organizado.replace(/^```(?:html)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

    return Response.json({ texto: cleaned })
  } catch (err) {
    console.error('[organizar-texto] error:', err)
    return Response.json({ error: 'Erro ao organizar texto com a IA.' }, { status: 500 })
  }
}
