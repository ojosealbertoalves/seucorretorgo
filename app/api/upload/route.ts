import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { r2 } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  const results = await Promise.all(
    files.map(async (file) => {
      const ext = file.name.split('.').pop() ?? 'bin'
      const key = `${randomUUID()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())

      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      )

      return { url: `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}` }
    })
  )

  return NextResponse.json(results)
}
