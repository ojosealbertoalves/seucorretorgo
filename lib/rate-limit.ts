const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  identifier: string,
  options: {
    requests: number // máximo de requests
    window: number // janela em ms
  },
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = requests.get(identifier)

  if (!record || now > record.resetAt) {
    requests.set(identifier, { count: 1, resetAt: now + options.window })
    return { success: true, remaining: options.requests - 1 }
  }

  if (record.count >= options.requests) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: options.requests - record.count }
}

// Limpa entradas antigas a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of requests.entries()) {
    if (now > value.resetAt) requests.delete(key)
  }
}, 5 * 60 * 1000)
