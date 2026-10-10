/**
 * Vercel Serverless entry for the Viraaz Express API.
 *
 * vercel.json rewrites every `/api/*` request here as
 * `/api/handler?oripath=<original-subpath>&<original-query>`.
 * We reconstruct the original `/api/...` URL so the Express
 * router matches exactly like it does locally.
 */
import app from '../server/dist/index.js'

export default function handler(req, res) {
  try {
    const host = req.headers?.host ?? 'localhost'
    const raw = typeof req.url === 'string' ? req.url : '/'
    const u = new URL(raw, `https://${host}`)
    const orig = u.searchParams.get('oripath')
    if (orig != null) {
      u.searchParams.delete('oripath')
      const qs = u.searchParams.toString()
      req.url = `/api/${orig}${qs ? `?${qs}` : ''}`
    }
  } catch {
    // fall through with the URL untouched
  }
  return app(req, res)
}
