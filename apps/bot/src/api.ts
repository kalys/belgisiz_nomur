const API_URL = process.env.API_URL ?? 'http://localhost:3001'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export type Confidence = 'low' | 'medium' | 'high'
export type Category =
  | 'scam'
  | 'spam'
  | 'telemarketer'
  | 'debt_collector'
  | 'legitimate'
  | 'unknown'

export interface Score {
  score: number
  confidence: Confidence
  report_count: number
  spam_ratio: number
}

export interface PhoneNumber {
  e164: string
  carrier: string | null
  score: Score
}

export interface Report {
  id: string
  category: Category
  comment: string | null
  created_at: string
}

function phoneSegment(number: string) {
  return encodeURIComponent(number.replace(/^\+/, ''))
}

export const api = {
  getNumber: (number: string) =>
    apiFetch<PhoneNumber>(`/numbers/${phoneSegment(number)}`),

  submitReport: (number: string, body: { category: Category; comment?: string }) =>
    apiFetch<Report>(`/numbers/${phoneSegment(number)}/reports`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
