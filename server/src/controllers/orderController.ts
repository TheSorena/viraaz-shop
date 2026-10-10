import type { Request, Response, NextFunction } from 'express'
import type { OrderService, CheckoutInput } from '../services/orderService.js'
import type { OrderStatus } from '../types.js'
import { AppError } from '../utils/errors.js'
import { param } from '../utils/helpers.js'

export function orderController(service: OrderService) {
  return {
    create(req: Request, res: Response, next: NextFunction) {
      try {
        const input: CheckoutInput = req.body
        service
          .create(input)
          .then((order) => res.status(201).json({ ok: true, data: order }))
          .catch(next)
      } catch (err) {
        next(err)
      }
    },

    list(req: Request, res: Response, next: NextFunction) {
      try {
        const { status, q, page, limit } = req.query
        const query: { status?: OrderStatus; q?: string; page?: number; limit?: number } = {}
        if (typeof status === 'string') query.status = status as OrderStatus
        if (typeof q === 'string') query.q = q
        if (page !== undefined) {
          const v = Number(page)
          if (!Number.isInteger(v) || v < 1) throw AppError.badRequest('page نامعتبر است', 'INVALID_PARAM')
          query.page = v
        }
        if (limit !== undefined) {
          const v = Number(limit)
          if (!Number.isInteger(v) || v < 1 || v > 100) throw AppError.badRequest('limit نامعتبر است', 'INVALID_PARAM')
          query.limit = v
        }
        res.json({ ok: true, data: service.list(query) })
      } catch (err) {
        next(err)
      }
    },

    getById(req: Request, res: Response, next: NextFunction) {
      try {
        res.json({ ok: true, data: service.getById(param(req.params.id)) })
      } catch (err) {
        next(err)
      }
    },

    getByNumber(req: Request, res: Response, next: NextFunction) {
      try {
        res.json({ ok: true, data: service.getByNumber(param(req.params.orderNumber)) })
      } catch (err) {
        next(err)
      }
    },

    updateStatus(req: Request, res: Response, next: NextFunction) {
      try {
        const { status } = req.body
        if (!status) throw AppError.badRequest('وضعیت الزامی است', 'VALIDATION')
        service
          .updateStatus(param(req.params.id), status as OrderStatus)
          .then((order) => res.json({ ok: true, data: order }))
          .catch(next)
      } catch (err) {
        next(err)
      }
    },
  }
}
