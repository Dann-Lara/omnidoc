import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const DEFAULT_KEY = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    return DEFAULT_KEY
  }
  return Buffer.from(key, 'hex')
}

export function encrypt(text: string): string {
  if (!text) return text

  const key = getEncryptionKey()
  console.log('[encrypt] key length:', key.length, 'key env:', !!process.env.ENCRYPTION_KEY)
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const tag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText

  try {
    const [ivHex, tagHex, encrypted] = encryptedText.split(':')

    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const key = getEncryptionKey()

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch {
    return encryptedText
  }
}

export function generateSignature(doctorId: string): string {
  const timestamp = Date.now()
  const data = `${doctorId}:${timestamp}`
  return createHash('sha256').update(data).digest('hex')
}