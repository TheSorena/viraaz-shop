import { Router } from 'express'
import { handleAdminLogin, handleAdminLogout } from '../middleware/adminAuth.js'

export function authRoutes(): Router {
  const router = Router()
  router.post('/login', handleAdminLogin)
  router.post('/logout', handleAdminLogout)
  return router
}
