import type { Request, Response, NextFunction } from 'express'
import type { CategoryService } from '../services/categoryService.js'
import type { ReviewService } from '../services/reviewService.js'
import type { SearchService } from '../services/searchService.js'
import type { SettingsService } from '../services/settingsService.js'
import type { OrderService } from '../services/orderService.js'
import { param } from '../utils/helpers.js'

export function categoryController(service: CategoryService) {
  return {
    list(_req: Request, res: Response) {
      res.json({ ok: true, data: service.list() })
    },
    getBySlug(req: Request, res: Response, next: NextFunction) {
      try {
        res.json({ ok: true, data: service.getBySlug(param(req.params.slug)) })
      } catch (err) {
        next(err)
      }
    },
  }
}

export function reviewController(service: ReviewService) {
  return {
    listByBook(req: Request, res: Response, next: NextFunction) {
      try {
        res.json({ ok: true, data: service.listByBook(param(req.params.bookId)) })
      } catch (err) {
        next(err)
      }
    },
    create(req: Request, res: Response, next: NextFunction) {
      try {
        service
          .create(param(req.params.bookId), req.body)
          .then((review) => res.status(201).json({ ok: true, data: review }))
          .catch(next)
      } catch (err) {
        next(err)
      }
    },
  }
}

export function searchController(service: SearchService) {
  return {
    search(req: Request, res: Response, next: NextFunction) {
      try {
        const q = typeof req.query.q === 'string' ? req.query.q : ''
        const type =
          req.query.type === 'book' || req.query.type === 'article' ? req.query.type : undefined
        res.json({ ok: true, data: service.search(q, type) })
      } catch (err) {
        next(err)
      }
    },
  }
}

export function settingsController(service: SettingsService) {
  return {
    get(_req: Request, res: Response) {
      res.json({ ok: true, data: service.get() })
    },
    update(req: Request, res: Response, next: NextFunction) {
      try {
        service
          .update(req.body)
          .then((settings) => res.json({ ok: true, data: settings }))
          .catch(next)
      } catch (err) {
        next(err)
      }
    },
  }
}

export function adminController(orderService: OrderService) {
  return {
    dashboard(_req: Request, res: Response, next: NextFunction) {
      try {
        res.json({ ok: true, data: orderService.dashboardStats() })
      } catch (err) {
        next(err)
      }
    },
  }
}
