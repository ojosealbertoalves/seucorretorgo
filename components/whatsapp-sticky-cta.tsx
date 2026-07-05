'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export function WhatsappStickyCta({
  href,
  label = 'Falar no WhatsApp',
  color = '#25D366',
}: {
  href: string
  label?: string
  color?: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  const className = 'md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-center gap-2 text-white font-semibold py-4'
  const style = { background: color }

  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        <MessageCircle size={18} />
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className={className} style={style}>
      <MessageCircle size={18} />
      {label}
    </Link>
  )
}
