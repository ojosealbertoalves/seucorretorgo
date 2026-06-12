'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export type R2UploadResult = { url: string }

async function uploadToR2(files: File[]): Promise<R2UploadResult[]> {
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))

  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Falha no upload')
  }
  return res.json()
}

export function useR2Upload() {
  async function startUpload(files: File[]): Promise<R2UploadResult[] | null> {
    try {
      return await uploadToR2(files)
    } catch {
      return null
    }
  }
  return { startUpload }
}

type R2UploadButtonProps = {
  onUpload?: (results: R2UploadResult[]) => void
  onError?: (err: Error) => void
  accept?: string
  multiple?: boolean
  className?: string
  children?: React.ReactNode
}

export function R2UploadButton({
  onUpload,
  onError,
  accept = 'image/png,image/jpeg,image/webp',
  multiple = true,
  className,
  children,
}: R2UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const results = await uploadToR2(files)
      onUpload?.(results)
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Upload falhou'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent disabled:opacity-50',
          className
        )}
      >
        <Upload className="h-4 w-4" />
        {uploading ? 'Enviando...' : (children ?? 'Selecionar arquivo')}
      </button>
    </>
  )
}

type R2UploadDropzoneProps = {
  onUpload?: (results: R2UploadResult[]) => void
  onError?: (err: Error) => void
  accept?: string
  multiple?: boolean
  className?: string
}

export function R2UploadDropzone({
  onUpload,
  onError,
  accept = 'image/png,image/jpeg,image/webp',
  multiple = true,
  className,
}: R2UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)

  async function handleFiles(files: File[]) {
    if (!files.length) return
    setUploading(true)
    try {
      const results = await uploadToR2(files)
      onUpload?.(results)
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Upload falhou'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
      />
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors',
          dragging ? 'border-orange-400 bg-orange-50' : 'border-border hover:border-muted-foreground/50',
          uploading && 'opacity-50 pointer-events-none',
          className
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(Array.from(e.dataTransfer.files))
        }}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          {uploading
            ? 'Enviando...'
            : <>Arraste arquivos aqui ou <span className="text-orange-500 font-medium">clique para selecionar</span></>}
        </p>
      </div>
    </>
  )
}
