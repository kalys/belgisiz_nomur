import { describe, it, expect } from 'vitest'
import { computeScore } from './score.js'

const d = new Date()

describe('computeScore', () => {
  describe('happy path', () => {
    it('returns correct score for mixed categories', () => {
      const result = computeScore([
        { category: 'scam', createdAt: d },
        { category: 'scam', createdAt: d },
        { category: 'spam', createdAt: d },
      ])

      expect(result.report_count).toBe(3)
      // all three are SCAM_LIKE → spam_ratio = 1.0, score = 0
      expect(result.spam_ratio).toBe(1)
      expect(result.score).toBe(0)
      expect(result.confidence).toBe('medium')
    })

    it('returns high confidence for 10+ reports', () => {
      const reports = Array.from({ length: 10 }, () => ({ category: 'scam' as const, createdAt: d }))

      expect(computeScore(reports).confidence).toBe('high')
    })

    it('returns medium confidence for 3–9 reports', () => {
      const reports = Array.from({ length: 5 }, () => ({ category: 'spam' as const, createdAt: d }))

      expect(computeScore(reports).confidence).toBe('medium')
    })

    it('returns low confidence for 1–2 reports', () => {
      const result = computeScore([{ category: 'scam', createdAt: d }])

      expect(result.confidence).toBe('low')
    })
  })

  describe('edge cases', () => {
    it('returns zero score for empty reports', () => {
      const result = computeScore([])

      expect(result.report_count).toBe(0)
      expect(result.score).toBe(0)
      expect(result.spam_ratio).toBe(0)
      expect(result.confidence).toBe('low')
    })

    it('returns score=100 for a single legitimate report', () => {
      const result = computeScore([{ category: 'legitimate', createdAt: d }])

      // legitimate is not SCAM_LIKE → spam_ratio = 0, score = 100
      expect(result.spam_ratio).toBe(0)
      expect(result.score).toBe(100)
      expect(result.report_count).toBe(1)
    })

    it('returns score=0 for scam + spam tie', () => {
      const result = computeScore([
        { category: 'scam', createdAt: d },
        { category: 'spam', createdAt: d },
      ])

      // both SCAM_LIKE → spam_ratio = 1.0
      expect(result.report_count).toBe(2)
      expect(result.spam_ratio).toBe(1)
      expect(result.score).toBe(0)
    })

    it('handles all report categories', () => {
      const reports = [
        { category: 'scam' as const, createdAt: d },
        { category: 'spam' as const, createdAt: d },
        { category: 'telemarketer' as const, createdAt: d },
        { category: 'debt_collector' as const, createdAt: d },
        { category: 'legitimate' as const, createdAt: d },
        { category: 'unknown' as const, createdAt: d },
      ]

      const result = computeScore(reports)
      // scam, spam, debt_collector are SCAM_LIKE → 3/6 = 0.5
      expect(result.report_count).toBe(6)
      expect(result.spam_ratio).toBe(0.5)
      expect(result.score).toBe(50)
    })

    it('confidence boundary: exactly 3 reports is medium', () => {
      const reports = Array.from({ length: 3 }, () => ({ category: 'scam' as const, createdAt: d }))
      expect(computeScore(reports).confidence).toBe('medium')
    })

    it('confidence boundary: exactly 10 reports is high', () => {
      const reports = Array.from({ length: 10 }, () => ({ category: 'scam' as const, createdAt: d }))
      expect(computeScore(reports).confidence).toBe('high')
    })
  })
})
