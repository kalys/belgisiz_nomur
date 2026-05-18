import { readFileSync } from 'fs'
import { resolve } from 'path'
import yaml from 'js-yaml'
import type { CountryConfig } from './types'

export type { CountryConfig }

export function loadConfig(configPath?: string): CountryConfig {
  const path = configPath ?? process.env.CONFIG_PATH ?? resolve(process.cwd(), 'config/kg.yaml')
  const raw = readFileSync(path, 'utf-8')
  return yaml.load(raw) as CountryConfig
}
