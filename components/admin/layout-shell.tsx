'use client'

import { usePathname } from 'next/navigation'
import { AdminSidebar } from './sidebar'

export function AdminLayoutShell({
  children,
  newLeadsCount,
}: {
  children: React.ReactNode
  newLeadsCount: number
}) {
  const pathname = usePathname()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar newLeadsCount={newLeadsCount} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
