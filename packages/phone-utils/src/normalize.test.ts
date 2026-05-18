import { describe, it, expect } from 'vitest'
import { normalizePhone, isValidPhone } from './normalize'

describe('normalizePhone', () => {
  describe('happy path', () => {
    it('normalizes local format with leading zero', () => {
      const result = normalizePhone('0700123456')
      expect(result).toEqual({ e164: '+996700123456', countryCode: '996', national: '700123456' })
    })

    it('normalizes 9-digit national format', () => {
      const result = normalizePhone('700123456')
      expect(result).toEqual({ e164: '+996700123456', countryCode: '996', national: '700123456' })
    })

    it('normalizes with country code prefix (no +)', () => {
      const result = normalizePhone('996700123456')
      expect(result).toEqual({ e164: '+996700123456', countryCode: '996', national: '700123456' })
    })

    it('normalizes E.164 format with +', () => {
      const result = normalizePhone('+996700123456')
      expect(result).toEqual({ e164: '+996700123456', countryCode: '996', national: '700123456' })
    })

    it('strips spaces and dashes', () => {
      const result = normalizePhone('+996 700 123 456')
      expect(result).toEqual({ e164: '+996700123456', countryCode: '996', national: '700123456' })
    })

    it('strips parentheses and dashes', () => {
      const result = normalizePhone('0700-12-34-56')
      expect(result).toEqual({ e164: '+996700123456', countryCode: '996', national: '700123456' })
    })

    it('trims whitespace', () => {
      const result = normalizePhone('  0700123456  ')
      expect(result).toEqual({ e164: '+996700123456', countryCode: '996', national: '700123456' })
    })
  })

  describe('edge cases', () => {
    it('returns null for empty string', () => {
      expect(normalizePhone('')).toBeNull()
    })

    it('returns null for too short number', () => {
      expect(normalizePhone('07001234')).toBeNull()
    })

    it('returns null for too long number', () => {
      expect(normalizePhone('07001234567')).toBeNull()
    })

    it('returns null for non-numeric input', () => {
      expect(normalizePhone('not-a-number')).toBeNull()
    })

    it('returns null for wrong country code', () => {
      expect(normalizePhone('+7700123456')).toBeNull()
    })

    it('accepts all zeros (format is valid, semantic validation is not normalizer\'s job)', () => {
      expect(normalizePhone('000000000')).toEqual({
        e164: '+996000000000',
        countryCode: '996',
        national: '000000000',
      })
    })
  })
})

describe('isValidPhone', () => {
  it('returns true for valid number', () => {
    expect(isValidPhone('0700123456')).toBe(true)
  })

  it('returns false for invalid number', () => {
    expect(isValidPhone('123')).toBe(false)
  })
})
