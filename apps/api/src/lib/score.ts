import type { Report, ReportCategory } from '@prisma/client'

export interface NumberScore {
  total: number
  topCategory: ReportCategory | null
  categoryBreakdown: Record<ReportCategory, number>
  confidence: 'low' | 'medium' | 'high'
}

const CONFIDENCE_THRESHOLDS = { low: 1, medium: 3, high: 10 }

export function computeScore(reports: Pick<Report, 'category' | 'createdAt'>[]): NumberScore {
  const total = reports.length

  const breakdown = {} as Record<ReportCategory, number>
  for (const r of reports) {
    breakdown[r.category] = (breakdown[r.category] ?? 0) + 1
  }

  let topCategory: ReportCategory | null = null
  let topCount = 0
  for (const [cat, count] of Object.entries(breakdown) as [ReportCategory, number][]) {
    if (count > topCount) {
      topCount = count
      topCategory = cat
    }
  }

  const confidence =
    total >= CONFIDENCE_THRESHOLDS.high
      ? 'high'
      : total >= CONFIDENCE_THRESHOLDS.medium
        ? 'medium'
        : 'low'

  return { total, topCategory, categoryBreakdown: breakdown, confidence }
}
