export const dynamic = 'force-dynamic'

import { AdminLayoutShell } from '@/components/admin/layout-shell'
import { prisma } from '@/lib/prisma'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const newLeadsCount = await prisma.lead.count({ where: { status: 'novo' } })

  return <AdminLayoutShell newLeadsCount={newLeadsCount}>{children}</AdminLayoutShell>
}
