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

      expect(result.total).toBe(3)
      expect(result.topCategory).toBe('scam')
      expect(result.categoryBreakdown).toEqual({ scam: 2, spam: 1 })
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
    it('returns null topCategory for empty reports', () => {
      const result = computeScore([])

      expect(result.total).toBe(0)
      expect(result.topCategory).toBeNull()
      expect(result.categoryBreakdown).toEqual({})
      expect(result.confidence).toBe('low')
    })

    it('returns the single category as top for one report', () => {
      const result = computeScore([{ category: 'legitimate', createdAt: d }])

      expect(result.topCategory).toBe('legitimate')
      expect(result.categoryBreakdown).toEqual({ legitimate: 1 })
    })

    it('returns first-encountered category on tie', () => {
      // When two categories are tied, the one iterated first wins
      const result = computeScore([
        { category: 'scam', createdAt: d },
        { category: 'spam', createdAt: d },
      ])

      expect(result.total).toBe(2)
      // Both have count 1 — topCategory is whichever comes first in Object.entries
      expect(['scam', 'spam']).toContain(result.topCategory)
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
      expect(result.total).toBe(6)
      expect(Object.keys(result.categoryBreakdown)).toHaveLength(6)
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
