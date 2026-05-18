export interface CountryConfig {
  name: string
  country_code: string
  languages: string[]
  default_language: string
  phone_formats: {
    mobile: string
    landline?: string
  }
}
