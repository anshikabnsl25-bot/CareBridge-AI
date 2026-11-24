import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PRIORITY_COLOR: Record<string, string> = {
  'Urgent review': 'bg-red-100 text-red-700 border-red-200',
  'Priority review': 'bg-orange-100 text-orange-700 border-orange-200',
  'Routine review': 'bg-green-100 text-green-700 border-green-200',
  'Insufficient information': 'bg-gray-100 text-gray-700 border-gray-200',
}

export const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  redirected: 'bg-purple-100 text-purple-700',
  matched: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  suspicious: 'bg-orange-100 text-orange-700',
  not_found: 'bg-gray-100 text-gray-600',
  waiting: 'bg-blue-100 text-blue-700',
  serving: 'bg-teal-100 text-teal-700',
  confirmed: 'bg-green-100 text-green-700',
}

export function formatDate(d?: string): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function speak(text: string, lang = 'en') {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    window.speechSynthesis.speak(u)
  }
}

