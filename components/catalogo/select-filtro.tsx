'use client'

import { useState } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type FiltroOption = { value: string; label: string }

export function SelectFiltro({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: FiltroOption[]
  selected: string | null
  onChange: (value: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  const selectedOption = options.find((o) => o.value === selected) ?? null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          style={
            selectedOption
              ? { background: 'rgba(224,123,58,0.12)', border: '1px solid #E07B3A', color: '#E07B3A' }
              : { background: '#0F1F0F', border: '1px solid #1E3A1E', color: 'rgba(247,242,234,0.85)' }
          }
        >
          {selectedOption ? selectedOption.label : label}
          {selectedOption ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  onChange(null)
                }
              }}
              className="inline-flex items-center justify-center rounded-full hover:bg-white/10 -mr-1"
            >
              <X size={14} />
            </span>
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-0 overflow-hidden"
        style={{ background: '#0F1F0F', border: '1px solid #1E3A1E' }}
      >
        <div className="max-h-72 overflow-y-auto py-1">
          {options.map((opt) => {
            const checked = selected === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-white/5"
                style={{ color: 'rgba(247,242,234,0.85)' }}
              >
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-full shrink-0"
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
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
