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
