import type { NormalizedPhone } from './types'

// Strips all non-digit characters
function digitsOnly(input: string): string {
  return input.replace(/\D/g, '')
}

/**
 * Normalizes a Kyrgyzstan phone number to E.164 format (+996XXXXXXXXX).
 * Accepts formats: 0700123456, 700123456, 996700123456, +996700123456
 */
export function normalizePhone(input: string): NormalizedPhone | null {
  const digits = digitsOnly(input.trim())

  let national: string

  if (digits.startsWith('996') && digits.length === 12) {
    national = digits.slice(3)
  } else if (digits.startsWith('0') && digits.length === 10) {
    national = digits.slice(1)
  } else if (digits.length === 9) {
    national = digits
  } else {
    return null
  }

  if (national.length !== 9) return null

  return {
    e164: `+996${national}`,
    countryCode: '996',
    national,
  }
}

export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null
}
