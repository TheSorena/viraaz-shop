import { Router } from 'express'
import type { ArticleService } from '../services/articleService.js'
import { articleController } from '../controllers/articleController.js'

export function articleRoutes(service: ArticleService): Router {
  const router = Router()
  const ctrl = articleController(service)
  router.get('/', ctrl.list)
  router.get('/:slug', ctrl.getBySlug)
  router.get('/:slug/related', ctrl.related)
  return router
}
