import type { PhoneNumber, Category } from './api.js'

const SITE_URL = process.env.SITE_URL ?? 'https://bn.osmonov.com'

export const CATEGORY_LABELS: Record<Category, string> = {
  scam: 'Алдамчылык',
  spam: 'Спам',
  telemarketer: 'Телемаркетинг',
  debt_collector: 'Карыз чогултуучу',
  legitimate: 'Легитимдүү',
  unknown: 'Белгисиз',
}

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

export function formatNumber(data: PhoneNumber): string {
  const { e164, carrier, score } = data
  const { report_count, confidence, spam_ratio } = score

  let text = `📞 <b>${e164}</b>`
  if (carrier) text += `\n📡 ${carrier}`

  if (report_count === 0) {
    text += '\n\n✅ Арыздар жок'
  } else {
    const dot = confidence === 'high' ? '🔴' : confidence === 'medium' ? '🟡' : '🟠'
    text += `\n\n${dot} <b>${report_count} арыз`
    if (spam_ratio > 0) text += ` · ${Math.round(spam_ratio * 100)}% алдамчылык`
    text += '</b>'
  }

  const encoded = encodeURIComponent(e164.replace(/^\+/, ''))
  text += `\n\n<a href="${SITE_URL}/ky/number/${encoded}">Толук маалымат →</a>`
  return text
}
