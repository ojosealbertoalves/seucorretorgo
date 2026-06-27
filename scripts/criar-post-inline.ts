/**
 * Uso:
 *   npx tsx scripts/criar-post-inline.ts "<conteúdo HTML>"
 *
 * No PowerShell, para colar conteúdo com múltiplas linhas use heredoc:
 *   npx tsx scripts/criar-post-inline.ts @'
 *   <p>Conteúdo aqui...</p>
 *   [FOTO: imagem.jpg]
 *   '@
 *
 * Fotos referenciadas como [FOTO: nome-do-arquivo.jpg] devem estar em scripts/post-images/
 */

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import readline from 'readline'
import { randomUUID } from 'crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

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

async function uploadImage(filename: string): Promise<string> {
  const imagePath = path.join(process.cwd(), 'scripts', 'post-images', filename)
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Imagem não encontrada: ${imagePath}`)
  }

  const ext = filename.split('.').pop() ?? 'bin'
  const key = `${randomUUID()}.${ext}`
  const buffer = fs.readFileSync(imagePath)

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
    process.stdout.write(`  Fazendo upload de "${filename}"... `)
    const url = await uploadImage(filename)
    imageMap.set(filename, url)
    console.log('✓')
  }

  return content.replace(/\[FOTO:\s*([^\]]+)\]/g, (_, filename: string) => {
    const url = imageMap.get(filename.trim())!
    return `<img src="${url}" alt="${filename.trim()}" />`
  })
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function main() {
  let content = process.argv[2]

  if (!content) {
    console.error('Uso: npx tsx scripts/criar-post-inline.ts "<conteúdo HTML>"')
    console.error('     (No PowerShell use heredoc @\'...\'@ para múltiplas linhas)')
    process.exit(1)
  }

  content = content.trim()

  const markerCount = (content.match(/\[FOTO:/g) ?? []).length
  if (markerCount > 0) {
    console.log(`\nEncontrados ${markerCount} marcador(es) de foto. Fazendo uploads para o R2...`)
    content = await processContent(content)
    console.log()
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  let titulo = ''
  let slug = ''
  let resumo = ''
  let categoria = ''

  try {
    titulo = (await ask(rl, 'Título do post: ')).trim()
    if (!titulo) throw new Error('Título é obrigatório.')

    const suggestedSlug = toSlug(titulo)
    const slugInput = (await ask(rl, `Slug [${suggestedSlug}]: `)).trim()
    slug = slugInput || suggestedSlug

    resumo = (await ask(rl, 'Resumo: ')).trim()
    if (!resumo) throw new Error('Resumo é obrigatório.')

    categoria = (await ask(rl, 'Categoria (deixe em branco para nenhuma): ')).trim()
  } finally {
    rl.close()
  }

  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now()}`
    console.log(`\nSlug já existia. Usando: ${slug}`)
  }

  const post = await prisma.post.create({
    data: {
      titulo,
      slug,
      resumo,
      conteudo: content,
      categoria: categoria || null,
      publicado: true,
    },
  })

  console.log(`\n✓ Post publicado em: /blog/${post.slug}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('\nErro:', e.message ?? e)
  await prisma.$disconnect()
  process.exit(1)
})
