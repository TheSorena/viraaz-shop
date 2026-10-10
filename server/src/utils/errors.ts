export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: unknown

  constructor(statusCode: number, message: string, code: string, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Object.setPrototypeOf(this, AppError.prototype)
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: unknown) {
    return new AppError(400, message, code, details)
  }

  static notFound(message: string, code = 'NOT_FOUND', details?: unknown) {
    return new AppError(404, message, code, details)
  }

  static unauthorized(message: string, code = 'UNAUTHORIZED', details?: unknown) {
    return new AppError(401, message, code, details)
  }

  static forbidden(message: string, code = 'FORBIDDEN', details?: unknown) {
    return new AppError(403, message, code, details)
  }

  static conflict(message: string, code = 'CONFLICT', details?: unknown) {
    return new AppError(409, message, code, details)
  }
}
