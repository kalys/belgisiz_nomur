'use server'

import { api, type Category } from '@/lib/api'

export async function submitReport(
  number: string,
  category: Category,
  comment: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await api.submitReport(number, { category, comment: comment || undefined })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
