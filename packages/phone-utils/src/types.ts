export interface NormalizedPhone {
  e164: string        // e.g. "+996700123456"
  countryCode: string // e.g. "996"
  national: string    // e.g. "700123456"
}

export interface Carrier {
  name: string
  shortName: string
}
