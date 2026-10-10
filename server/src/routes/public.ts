import { Router } from 'express'
import type { CategoryService } from '../services/categoryService.js'
import type { ReviewService } from '../services/reviewService.js'
import type { SearchService } from '../services/searchService.js'
import type { SettingsService } from '../services/settingsService.js'
import { categoryController, reviewController, searchController, settingsController } from '../controllers/index.js'

export function publicRoutes(
  categoryService: CategoryService,
  reviewService: ReviewService,
  searchService: SearchService,
  settingsService: SettingsService
): Router {
  const router = Router()
  const cats = categoryController(categoryService)
  const reviews = reviewController(reviewService)
  const search = searchController(searchService)
  const settings = settingsController(settingsService)

  router.get('/categories', cats.list)
  router.get('/categories/:slug', cats.getBySlug)
  router.get('/reviews/:bookId', reviews.listByBook)
  router.post('/reviews/:bookId', reviews.create)
  router.get('/search', search.search)
  router.get('/settings', settings.get)

  return router
}
