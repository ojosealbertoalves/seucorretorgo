'use client'

import { useState } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type FiltroOption = { value: string; label: string }

export function MultiSelectFiltro({
  label,
  options,
  selected,
  onChange,
  searchable,
  emptyMessage = 'Nenhuma opção disponível.',
}: {
  label: string
  options: FiltroOption[]
  selected: string[]
  onChange: (values: string[]) => void
  searchable?: boolean
  emptyMessage?: string
}) {
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState('')

  const filtered = searchable && busca.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(busca.trim().toLowerCase()))
    : options

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          style={{ background: '#0F1F0F', border: '1px solid #1E3A1E', color: 'rgba(247,242,234,0.85)' }}
        >
          {label}
          {selected.length > 0 && (
            <span
              className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold text-white"
              style={{ background: '#E07B3A' }}
            >
              {selected.length}
            </span>
          )}
          <ChevronDown size={14} className="text-white/40" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 overflow-hidden"
        style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
      >
        {searchable && (
          <div className="p-2 border-b" style={{ borderColor: '#1E3A1E' }}>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                autoFocus
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-lg pl-8 pr-2 py-1.5 text-sm text-white placeholder:text-white/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E3A1E' }}
              />
            </div>
          </div>
        )}
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-6 px-3">{emptyMessage}</p>
          ) : (
            filtered.map((opt) => {
              const checked = selected.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(247,242,234,0.85)' }}
                >
                  <span
                    className="flex items-center justify-center w-4 h-4 rounded shrink-0"
                    style={{
                      background: checked ? '#E07B3A' : 'transparent',
                      border: checked ? '1px solid #E07B3A' : '1px solid #1E3A1E',
                    }}
                  >
                    {checked && <Check size={11} className="text-white" />}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
