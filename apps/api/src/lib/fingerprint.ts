import { createHash } from 'crypto'

export function hashIp(ip: string): string {
  return createHash('sha256').update(ip + process.env.HASH_SALT ?? 'dev-salt').digest('hex')
}

export function hashAuthor(ip: string, userAgent: string): string {
  return createHash('sha256')
    .update(ip + userAgent + (process.env.HASH_SALT ?? 'dev-salt'))
    .digest('hex')
}
