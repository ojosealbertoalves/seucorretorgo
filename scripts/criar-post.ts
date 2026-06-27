/**
 * Cria um post no blog a partir de um arquivo HTML local.
 *
 * Uso:
 *   npx tsx scripts/criar-post.ts caminho/do/artigo.html
 *
 * Marcadores de foto no HTML:
 *   [FOTO: nome-do-arquivo.jpg]
 *   O arquivo deve estar em scripts/post-images/
 */

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import readline from 'readline'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Mesmas credenciais de lib/r2.ts
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const CATEGORIAS = ['Mercado', 'Financiamento', 'Bairros', 'Outro'] as const

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    avif: 'image/avif',
  }
  return map[ext] ?? 'application/octet-stream'
}

async function uploadToR2(filename: string): Promise<string> {
  const localPath = path.join(process.cwd(), 'scripts', 'post-images', filename)
  if (!fs.existsSync(localPath)) {
    throw new Error(`Arquivo não encontrado: scripts/post-images/${filename}`)
  }

  // Pasta blog/ com timestamp para evitar colisões
  const key = `blog/${Date.now()}-${filename}`
  const buffer = fs.readFileSync(localPath)

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: getMimeType(filename),
    })
  )

  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
}

async function processContent(content: string): Promise<string> {
  const markers = [...content.matchAll(/\[FOTO:\s*([^\]]+)\]/g)]
  if (markers.length === 0) return content

  const uniqueFiles = [...new Set(markers.map((m) => m[1].trim()))]
  const imageMap = new Map<string, string>()

  for (const filename of uniqueFiles) {
    process.stdout.write(`  → upload: "${filename}"... `)
    const url = await uploadToR2(filename)
    imageMap.set(filename, url)
    console.log('✓')
  }

  return content.replace(/\[FOTO:\s*([^\]]+)\]/g, (_, filename: string) => {
    const trimmed = filename.trim()
    const url = imageMap.get(trimmed)!
    return `<img src="${url}" alt="${trimmed}" style="max-width:100%;border-radius:8px;margin:16px 0" />`
  })
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Uso: npx tsx scripts/criar-post.ts caminho/do/artigo.html')
    process.exit(1)
  }

  const resolvedPath = path.resolve(filePath)
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Arquivo não encontrado: ${resolvedPath}`)
    process.exit(1)
  }

  console.log('\n──────────────────────────────────────')
  console.log('  Criar post · Blog Seu Corretor GO')
  console.log('──────────────────────────────────────\n')

  let content = fs.readFileSync(resolvedPath, 'utf-8')

  const markerCount = (content.match(/\[FOTO:/g) ?? []).length
  if (markerCount > 0) {
    console.log(`${markerCount} marcador(es) de foto encontrados — fazendo uploads para R2/blog/...\n`)
    content = await processContent(content)
    console.log()
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  let titulo = ''
  let slug = ''
  let resumo = ''
  let categoria: string | null = null
  let capaUrl: string | null = null

  try {
    titulo = (await ask(rl, 'Título: ')).trim()
    if (!titulo) throw new Error('Título é obrigatório.')

    const suggestedSlug = toSlug(titulo)
    const slugInput = (await ask(rl, `Slug [${suggestedSlug}]: `)).trim()
    slug = slugInput || suggestedSlug

    resumo = (await ask(rl, 'Resumo (1-2 frases): ')).trim()
    if (!resumo) throw new Error('Resumo é obrigatório.')

    console.log('\nCategoria:')
    CATEGORIAS.forEach((c, i) => console.log(`  ${i + 1}) ${c}`))
    const catInput = (await ask(rl, 'Escolha [1-4] (Enter para nenhuma): ')).trim()
    const catIdx = parseInt(catInput) - 1
    if (catIdx >= 0 && catIdx < CATEGORIAS.length) {
      categoria = CATEGORIAS[catIdx]
    }

    console.log()
    const capaFilename = (await ask(rl, 'Capa (arquivo em scripts/post-images/, Enter para nenhuma): ')).trim()
    if (capaFilename) {
      process.stdout.write(`  → upload capa: "${capaFilename}"... `)
      capaUrl = await uploadToR2(capaFilename)
      console.log('✓')
    }
  } finally {
    rl.close()
  }

  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now()}`
    console.log(`\nSlug já existia — usando: ${slug}`)
  }

  const post = await prisma.post.create({
    data: { titulo, slug, resumo, conteudo: content, capa: capaUrl, categoria, publicado: true },
  })

  console.log(`\n✓ Post publicado em: /blog/${post.slug}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('\nErro:', e.message ?? e)
  await prisma.$disconnect()
  process.exit(1)
})
