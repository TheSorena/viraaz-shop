import { Router } from 'express'
import type { BookService } from '../services/bookService.js'
import type { ArticleService } from '../services/articleService.js'
import type { SettingsService } from '../services/settingsService.js'
import { bookController } from '../controllers/bookController.js'
import { articleController } from '../controllers/articleController.js'
import { settingsController } from '../controllers/index.js'
import { verifyAdmin } from '../middleware/adminAuth.js'

export function adminBookRoutes(service: BookService): Router {
  const router = Router()
  const ctrl = bookController(service)
  router.use(verifyAdmin)
  router.get('/', ctrl.list)
  router.post('/', ctrl.create)
  router.put('/:id', ctrl.update)
  router.delete('/:id', ctrl.remove)
  return router
}

export function adminArticleRoutes(service: ArticleService): Router {
  const router = Router()
  const ctrl = articleController(service)
  router.use(verifyAdmin)
  router.get('/', ctrl.list)
  router.post('/', ctrl.create)
  router.put('/:id', ctrl.update)
  router.delete('/:id', ctrl.remove)
  return router
}

export function adminSettingsRoutes(service: SettingsService): Router {
  const router = Router()
  const ctrl = settingsController(service)
  router.use(verifyAdmin)
  router.get('/', ctrl.get)
  router.put('/', ctrl.update)
  return router
}
