import crypto from "crypto"

interface TelegramUser {
  id: number
  first_name: string
  username?: string
  photo_url?: string
}

/**
 * Verify Telegram Web App Init Data
 * This validates that the data came from Telegram
 */
export function verifyTelegramInitData(initData: string, botToken: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get("hash")

    if (!hash) return null

    // Remove hash from params
    params.delete("hash")

    // Sort remaining parameters
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")

    // Create HMAC
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest()
    const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

    // Compare hashes
    if (computedHash !== hash) {
      return null
    }

    // Get user data
    const userData = params.get("user")
    if (!userData) return null

    return JSON.parse(userData) as TelegramUser
  } catch (error) {
    console.error("Error verifying Telegram init data:", error)
    return null
  }
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string, secret: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(
    JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    }),
  )
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/[+/=]/g, (char) => ({ "+": "-", "/": "_", "=": "" })[char] || char)

  return `${header}.${payload}.${signature}`
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string, secret: string): { userId: string } | null {
  try {
    const [header, payload, signature] = token.split(".")

    const computedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64")
      .replace(/[+/=]/g, (char) => ({ "+": "-", "/": "_", "=": "" })[char] || char)

    if (computedSignature !== signature) {
      return null
    }

    const decoded = JSON.parse(atob(payload))
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return { userId: decoded.userId }
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}
