import type { Carrier } from './types'

// Maps 3-digit national prefix to carrier
// Source: https://en.wikipedia.org/wiki/Telephone_numbers_in_Kyrgyzstan
const PREFIX_MAP: Record<string, Carrier> = {}

const CARRIERS: Array<{ carrier: Carrier; prefixes: string[] }> = [
  {
    carrier: { name: 'Sky Mobile (Beeline KG)', shortName: 'Beeline' },
    prefixes: ['220', '221', '222', '223', '224', '225', '226', '227', '228', '229',
               '770', '771', '772', '773', '774', '775', '776', '777', '778', '779'],
  },
  {
    carrier: { name: 'Alfa Telecom (MEGA)', shortName: 'MEGA' },
    prefixes: ['550', '551', '552', '553', '554', '555', '556', '557', '558', '559',
               '990', '991', '992', '993', '994', '995', '997', '998', '999'],
  },
  {
    carrier: { name: 'Nur Telecom (O!)', shortName: 'O!' },
    prefixes: ['500', '501', '502', '503', '504', '505', '506', '507', '508', '509',
               '700', '701', '702', '703', '704', '705', '706', '707', '708', '709'],
  },
  {
    carrier: { name: 'Katel', shortName: 'Katel' },
    prefixes: ['510', '511', '512', '513', '514', '515', '516', '517', '518', '519'],
  },
  {
    carrier: { name: 'AkTel (Fonex)', shortName: 'Fonex' },
    prefixes: ['540', '541', '542', '543', '544', '545', '546', '547', '548', '549'],
  },
  {
    carrier: { name: 'Winline', shortName: 'Winline' },
    prefixes: ['560', '561', '562', '563', '564', '565', '566', '567', '568', '569'],
  },
  {
    carrier: { name: 'Sotel', shortName: 'Sotel' },
    prefixes: ['570', '571', '572', '573', '574', '575', '576', '577', '578', '579'],
  },
]

for (const { carrier, prefixes } of CARRIERS) {
  for (const prefix of prefixes) {
    PREFIX_MAP[prefix] = carrier
  }
}

/**
 * Returns the carrier for a given national number (9 digits) or E.164.
 * Returns null if carrier is unknown.
 */
export function detectCarrier(national: string): Carrier | null {
  const digits = national.replace(/\D/g, '')
  const prefix = digits.startsWith('996') ? digits.slice(3, 6) : digits.slice(0, 3)
  return PREFIX_MAP[prefix] ?? null
}
