'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'

export function WhatsappStickyCta({ href, label = 'Falar no WhatsApp' }: { href: string; label?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-center gap-2 text-white font-semibold py-4"
      style={{ background: '#25D366' }}
    >
      <MessageCircle size={18} />
      {label}
    </a>
  )
}
