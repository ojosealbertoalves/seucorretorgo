import { statusColor, statusLabel } from './lead-status'

export function LeadStatusBadge({ status }: { status: string }) {
  const c = statusColor(status)
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {statusLabel(status)}
    </span>
  )
}
