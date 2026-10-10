import type { Request, Response, NextFunction } from 'express'
import type { ArticleService, ArticleQuery } from '../services/articleService.js'
import { AppError } from '../utils/errors.js'
import { param } from '../utils/helpers.js'

export function articleController(service: ArticleService) {
  return {
    list(req: Request, res: Response, next: NextFunction) {
      try {
        const query: ArticleQuery = {}
        const { q, category, sort, page, limit, featured } = req.query
        if (typeof q === 'string') query.q = q
        if (typeof category === 'string') query.category = category
        if (typeof sort === 'string' && ['newest', 'oldest', 'popular'].includes(sort)) {
          query.sort = sort as ArticleQuery['sort']
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

        res.json({ ok: true, data: service.list(query) })
      } catch (err) {
        next(err)
      }
    },

    getBySlug(req: Request, res: Response, next: NextFunction) {
      try {
        const article = service.getBySlug(param(req.params.slug))
        res.json({
          ok: true,
          data: { data: article, relatedBooks: service.relatedBooks(article) },
        })
      } catch (err) {
        next(err)
      }
    },

    related(req: Request, res: Response, next: NextFunction) {
      try {
        const article = service.getBySlug(param(req.params.slug))
        res.json({ ok: true, data: service.related(article) })
      } catch (err) {
        next(err)
      }
    },

    create(req: Request, res: Response, next: NextFunction) {
      try {
        service
          .create(req.body)
          .then((article) => res.status(201).json({ ok: true, data: article }))
          .catch(next)
      } catch (err) {
        next(err)
      }
    },

    update(req: Request, res: Response, next: NextFunction) {
      try {
        service
          .update(param(req.params.id), req.body)
          .then((article) => res.json({ ok: true, data: article }))
          .catch(next)
      } catch (err) {
        next(err)
      }
    },

    remove(req: Request, res: Response, next: NextFunction) {
      try {
        service
          .remove(param(req.params.id))
          .then(() => res.json({ ok: true, message: 'مقاله با موفقیت حذف شد' }))
          .catch(next)
      } catch (err) {
        next(err)
      }
    },
  }
}
