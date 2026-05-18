import type { Report, ReportCategory } from '@prisma/client'

export interface NumberScore {
  score: number
  confidence: 'low' | 'medium' | 'high'
  report_count: number
  spam_ratio: number
}

const SCAM_LIKE: ReportCategory[] = ['scam', 'spam', 'debt_collector']

export function computeScore(reports: Pick<Report, 'category' | 'createdAt'>[]): NumberScore {
  const report_count = reports.length

  if (report_count === 0) {
    return { score: 0, confidence: 'low', report_count: 0, spam_ratio: 0 }
  }

  const scamCount = reports.filter((r) => SCAM_LIKE.includes(r.category)).length
  const spam_ratio = scamCount / report_count
  const score = Math.round(100 - spam_ratio * 100)

  const confidence: NumberScore['confidence'] =
    report_count >= 10 ? 'high' : report_count >= 3 ? 'medium' : 'low'

  return { score, confidence, report_count, spam_ratio }
}
