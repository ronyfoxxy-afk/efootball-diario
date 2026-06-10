import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: string | null) {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(date))
}

export function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 60) return `Há ${mins} min`
  if (hours < 24) return `Há ${hours}h`
  if (days === 1) return 'Ontem'
  return `Há ${days} dias`
}

export const CATEGORY_COLORS: Record<string, string> = {
  'noticias': '#6B7280',
  'eventos': '#10B981',
  'atualizacoes': '#3B82F6',
  'campanhas': '#F59E0B',
  'guias': '#8B5CF6',
  'vazamentos-rumores': '#EF4444',
  'analises': '#EC4899',
}

/**
 * Remove metadados de workflow que vazam no início/fim do conteúdo:
 * - **TÍTULO:** ... / **RESUMO:** ... (com ou sem negrito markdown)
 * - Linhas separadoras ━━━━━━━━━━ e o bloco de assinatura/fonte que vem depois
 */
export function cleanPostContent(raw: string): { body: string; signature: string | null } {
  if (!raw) return { body: '', signature: null }

  let text = raw

  // Remove linhas "**TÍTULO:** ..." / "TÍTULO: ..." / "**RESUMO:** ..." / "RESUMO: ..." no início
  text = text.replace(/^\s*\*{0,2}\s*(T[IÍ]TULO|TITL|RESUMO)\s*:\s*\*{0,2}\s*.*$/gim, '')

  // Separa o bloco de assinatura/fonte (a partir da linha de separadores ━)
  let signature: string | null = null
  const sepIndex = text.search(/━{3,}/)
  if (sepIndex !== -1) {
    signature = text.slice(sepIndex).replace(/━{3,}/g, '').trim()
    text = text.slice(0, sepIndex)
  }

  // Limpa linhas vazias extras
  text = text.replace(/\n{3,}/g, '\n\n').trim()

  return { body: text, signature }
}

/** Estima tempo de leitura em minutos (200 palavras/min) */
export function readingTime(text: string): number {
  if (!text) return 1
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

/** Extrai links únicos mencionados no texto, para a seção "Fontes e referências" */
export function extractSources(text: string): string[] {
  if (!text) return []
  const urls = text.match(/https?:\/\/[^\s)]+/g) || []
  return Array.from(new Set(urls))
}
