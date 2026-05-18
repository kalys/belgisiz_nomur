const API_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:3001')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001')

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
  country_code: string
  score: Score
  created_at: string
}

export interface Report {
  id: string
  category: Category
  comment: string | null
  created_at: string
  vote_count: number
  helpful_count: number
}

export interface PaginatedReports {
  data: Report[]
  total: number
  page: number
  limit: number
}

export interface Stats {
  total_numbers: number
  total_reports: number
  total_votes: number
}

export interface SearchResult {
  data: PhoneNumber[]
}

// Fastify doesn't decode %2B in path params; strip leading + since the API
// normalizes both +996... and 996... to the same E.164 internally.
function phoneSegment(number: string) {
  return encodeURIComponent(number.replace(/^\+/, ''))
}

export const api = {
  getNumber: (number: string) =>
    apiFetch<PhoneNumber>(`/numbers/${phoneSegment(number)}`),

  getReports: (number: string, page = 1, limit = 20) =>
    apiFetch<PaginatedReports>(
      `/numbers/${phoneSegment(number)}/reports?page=${page}&limit=${limit}`,
    ),

  submitReport: (number: string, body: { category: Category; comment?: string }) =>
    apiFetch<Report>(`/numbers/${phoneSegment(number)}/reports`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  vote: (reportId: string, helpful: boolean) =>
    apiFetch(`/reports/${reportId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    }),

  search: (q: string) =>
    apiFetch<SearchResult>(`/search?q=${encodeURIComponent(q)}`),

  stats: () => apiFetch<Stats>('/stats'),

  topScammers: (limit = 20) =>
    apiFetch<SearchResult>(`/search?q=&limit=${limit}`),
}
