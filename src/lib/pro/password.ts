import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { MIN_PASSWORD_LENGTH } from './config'

const scryptAsync = promisify(scrypt)
const KEY_LEN = 64

export { MIN_PASSWORD_LENGTH }

export function passwordError(password: string, confirm?: string): string | null {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (confirm !== undefined && password !== confirm) {
    return 'Passwords do not match.'
  }
  return null
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer
  const expected = Buffer.from(hash, 'hex')
  if (expected.length !== derived.length) return false
  return timingSafeEqual(expected, derived)
}
