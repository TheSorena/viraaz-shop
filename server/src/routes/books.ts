import { Router } from 'express'
import type { BookService } from '../services/bookService.js'
import { bookController } from '../controllers/bookController.js'

export function bookRoutes(service: BookService): Router {
  const router = Router()
  const ctrl = bookController(service)
  router.get('/', ctrl.list)
  router.get('/featured', ctrl.list) // featured handled via ?featured=true
  router.get('/:slug', ctrl.getBySlug)
  router.get('/:slug/related', ctrl.related)
  router.get('/:slug/same-author', ctrl.sameAuthor)
  return router
}
