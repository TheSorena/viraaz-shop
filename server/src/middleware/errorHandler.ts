import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    })
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      ok: false,
      error: { code: 'INVALID_JSON', message: 'بدنه‌ی درخواست JSON نامعتبر است' },
    })
  }

  console.error('[unhandled]', err)
  return res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'خطای داخلی سرور. لطفاً بعداً تلاش کنید.',
    },
  })
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    ok: false,
    error: { code: 'ROUTE_NOT_FOUND', message: 'مسیر یافت نشد' },
  })
}
