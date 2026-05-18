import { describe, it, expect } from 'vitest'
import { detectCarrier } from './carriers'

describe('detectCarrier', () => {
  describe('happy path', () => {
    it('detects Beeline from 770 prefix (national)', () => {
      const result = detectCarrier('770123456')
      expect(result).toEqual({ name: 'Sky Mobile (Beeline KG)', shortName: 'Beeline' })
    })

    it('detects MEGA from 550 prefix (national)', () => {
      const result = detectCarrier('550123456')
      expect(result).toEqual({ name: 'Alfa Telecom (MEGA)', shortName: 'MEGA' })
    })

    it('detects O! from 700 prefix (national)', () => {
      const result = detectCarrier('700123456')
      expect(result).toEqual({ name: 'Nur Telecom (O!)', shortName: 'O!' })
    })

    it('detects carrier from E.164 format', () => {
      const result = detectCarrier('+996770123456')
      expect(result).toEqual({ name: 'Sky Mobile (Beeline KG)', shortName: 'Beeline' })
    })

    it('detects carrier from country-code-prefixed digits', () => {
      const result = detectCarrier('996770123456')
      expect(result).toEqual({ name: 'Sky Mobile (Beeline KG)', shortName: 'Beeline' })
    })

    it('detects Katel from 510 prefix', () => {
      expect(detectCarrier('510123456')).toEqual({ name: 'Katel', shortName: 'Katel' })
    })

    it('detects Fonex from 540 prefix', () => {
      expect(detectCarrier('540123456')).toEqual({ name: 'AkTel (Fonex)', shortName: 'Fonex' })
    })

    it('detects Winline from 560 prefix', () => {
      expect(detectCarrier('560123456')).toEqual({ name: 'Winline', shortName: 'Winline' })
    })

    it('detects Sotel from 570 prefix', () => {
      expect(detectCarrier('570123456')).toEqual({ name: 'Sotel', shortName: 'Sotel' })
    })
  })

  describe('edge cases', () => {
    it('returns null for unknown prefix', () => {
      expect(detectCarrier('100123456')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(detectCarrier('')).toBeNull()
    })

    it('strips formatting before detecting', () => {
      const result = detectCarrier('+996 770 123 456')
      expect(result).toEqual({ name: 'Sky Mobile (Beeline KG)', shortName: 'Beeline' })
    })
  })
})
