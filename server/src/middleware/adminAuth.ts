import type { Request, Response, NextFunction } from 'express'
import crypto from 'node:crypto'

/**
 * Development-only admin authentication.
 *
 * The admin password is read from the ADMIN_PASSWORD environment variable.
 * A session token is issued on login and stored in-memory (per process).
 *
 * WARNING: This is NOT production security. It provides basic protection
 * for a local development demo only. Before any public deployment you must
 * implement: persistent auth (sessions/JWT), password hashing (bcrypt/argon2),
 * rate limiting, CSRF protection, and HTTPS.
 */

const sessions = new Map<string, { createdAt: number }>()
const SESSION_TTL_MS = 1000 * 60 * 60 * 8 // 8 hours

function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw || pw.length < 6) {
    throw new Error(
      'ADMIN_PASSWORD is not set or too short. Set it in server/.env (development only).'
    )
  }
  return pw
}

export function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'ابتدا وارد پنل مدیریت شوید' },
    })
  }
  const token = auth.slice(7)
  const session = sessions.get(token)
  if (!session) {
    return res.status(401).json({
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'نشست نامعتبر یا منقضی شده' },
    })
  }
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token)
    return res.status(401).json({
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'نشست منقضی شده است' },
    })
  }
  next()
}

export function handleAdminLogin(req: Request, res: Response) {
  const { password } = req.body ?? {}
  if (typeof password !== 'string') {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION', message: 'رمز عبور الزامی است' },
    })
  }
  // Constant-time comparison to avoid trivial timing attacks
  const expected = getAdminPassword()
  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b)
  if (!ok) {
    return res.status(401).json({
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'رمز عبور نادرست است' },
    })
  }
  const token = crypto.randomBytes(32).toString('hex')
  sessions.set(token, { createdAt: Date.now() })
  res.json({ ok: true, data: { token, expiresInHours: 8 } })
}

export function handleAdminLogout(req: Request, res: Response) {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    sessions.delete(auth.slice(7))
  }
  res.json({ ok: true, message: 'از پنل خارج شدید' })
}
