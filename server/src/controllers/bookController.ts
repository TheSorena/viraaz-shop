import type { Request, Response, NextFunction } from 'express'
import type { BookService, BookQuery } from '../services/bookService.js'
import { AppError } from '../utils/errors.js'
import { param } from '../utils/helpers.js'

export function bookController(service: BookService) {
  return {
    list(req: Request, res: Response, next: NextFunction) {
      try {
        const query: BookQuery = {}
        const { q, category, sort, minPrice, maxPrice, page, limit, featured, isNew } = req.query
        if (typeof q === 'string') query.q = q
        if (typeof category === 'string') query.category = category
        if (typeof sort === 'string' && ['newest', 'price_asc', 'price_desc', 'popular', 'rating'].includes(sort)) {
          query.sort = sort as BookQuery['sort']
        }
        if (minPrice !== undefined) {
          const v = Number(minPrice)
          if (!Number.isFinite(v) || v < 0) throw AppError.badRequest('minPrice نامعتبر است', 'INVALID_PARAM')
          query.minPrice = v
        }
        if (maxPrice !== undefined) {
          const v = Number(maxPrice)
          if (!Number.isFinite(v) || v < 0) throw AppError.badRequest('maxPrice نامعتبر است', 'INVALID_PARAM')
          query.maxPrice = v
        }
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
        if (featured === 'true') query.featured = true
        if (isNew === 'true') query.isNew = true

        res.json({ ok: true, data: service.list(query) })
      } catch (err) {
        next(err)
      }
    },

    getBySlug(req: Request, res: Response, next: NextFunction) {
      try {
        const book = service.getBySlug(param(req.params.slug))
        res.json({ ok: true, data: book })
      } catch (err) {
        next(err)
      }
    },

    related(req: Request, res: Response, next: NextFunction) {
      try {
        const book = service.getBySlug(param(req.params.slug))
        res.json({ ok: true, data: service.related(book) })
      } catch (err) {
        next(err)
      }
    },

    sameAuthor(req: Request, res: Response, next: NextFunction) {
      try {
        const book = service.getBySlug(param(req.params.slug))
        res.json({ ok: true, data: service.sameAuthor(book) })
      } catch (err) {
        next(err)
      }
    },

    create(req: Request, res: Response, next: NextFunction) {
      try {
        service
          .create(req.body)
          .then((book) => res.status(201).json({ ok: true, data: book }))
          .catch(next)
      } catch (err) {
        next(err)
      }
    },

    update(req: Request, res: Response, next: NextFunction) {
      try {
        service
          .update(param(req.params.id), req.body)
          .then((book) => res.json({ ok: true, data: book }))
          .catch(next)
      } catch (err) {
        next(err)
      }
    },

    remove(req: Request, res: Response, next: NextFunction) {
      try {
        service
          .remove(param(req.params.id))
          .then(() => res.json({ ok: true, message: 'کتاب با موفقیت حذف شد' }))
          .catch(next)
      } catch (err) {
        next(err)
      }
    },
  }
}
