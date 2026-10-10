import { Router } from 'express'
import type { OrderService } from '../services/orderService.js'
import { orderController } from '../controllers/orderController.js'
import { adminController } from '../controllers/index.js'
import { verifyAdmin } from '../middleware/adminAuth.js'

export function orderRoutes(service: OrderService): Router {
  const router = Router()
  const ctrl = orderController(service)
  router.post('/', ctrl.create)
  router.get('/number/:orderNumber', ctrl.getByNumber)
  router.get('/:id', ctrl.getById)
  return router
}

export function adminOrderRoutes(service: OrderService): Router {
  const router = Router()
  const ctrl = orderController(service)
  router.use(verifyAdmin)
  router.get('/', ctrl.list)
  router.patch('/:id/status', ctrl.updateStatus)
  return router
}

export function adminDashboardRoutes(service: OrderService): Router {
  const router = Router()
  const ctrl = adminController(service)
  router.use(verifyAdmin)
  router.get('/', ctrl.dashboard)
  return router
}
