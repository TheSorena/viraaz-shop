import express, { Router } from 'express'
import cors from 'cors'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

// Load .env (development convenience; production should set env vars directly)
config()

import { createJsonDataStore } from './repositories/dataStore.js'
import {
  BookRepository,
  ArticleRepository,
  CategoryRepository,
  OrderRepository,
  ReviewRepository,
  SettingsRepository,
} from './repositories/index.js'
import { BookService } from './services/bookService.js'
import { ArticleService } from './services/articleService.js'
import { CategoryService } from './services/categoryService.js'
import { OrderService } from './services/orderService.js'
import { ReviewService } from './services/reviewService.js'
import { SettingsService } from './services/settingsService.js'
import { SearchService } from './services/searchService.js'

import { bookRoutes } from './routes/books.js'
import { articleRoutes } from './routes/articles.js'
import { publicRoutes } from './routes/public.js'
import { orderRoutes, adminOrderRoutes, adminDashboardRoutes } from './routes/orders.js'
import { adminBookRoutes, adminArticleRoutes, adminSettingsRoutes } from './routes/admin.js'
import { authRoutes } from './routes/auth.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = Number(process.env.PORT) || 4000

// CORS: only allowed origins (+ same-origin on Vercel deployments)
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

// On Vercel, same-domain requests carry the deployment URL as Origin — allow it automatically
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`)
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, mobile)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(requestLogger)

// --- Dependency wiring (repository -> service -> route) ---
const store = createJsonDataStore()
const bookRepo = new BookRepository(store)
const articleRepo = new ArticleRepository(store)
const categoryRepo = new CategoryRepository(store)
const orderRepo = new OrderRepository(store)
const reviewRepo = new ReviewRepository(store)
const settingsRepo = new SettingsRepository(store)

const bookService = new BookService(bookRepo, categoryRepo)
const articleService = new ArticleService(articleRepo, categoryRepo, bookRepo)
const categoryService = new CategoryService(categoryRepo)
const orderService = new OrderService(orderRepo, bookRepo, settingsRepo, articleRepo)
const reviewService = new ReviewService(reviewRepo)
const settingsService = new SettingsService(settingsRepo)
const searchService = new SearchService(bookRepo, articleRepo)

// --- API v1 routes ---
const api = Router()
api.use('/books', bookRoutes(bookService))
api.use('/articles', articleRoutes(articleService))
api.use('/', publicRoutes(categoryService, reviewService, searchService, settingsService))
api.use('/orders', orderRoutes(orderService))
api.use('/auth', authRoutes())

// Admin routes (protected)
api.use('/admin/dashboard', adminDashboardRoutes(orderService))
api.use('/admin/books', adminBookRoutes(bookService))
api.use('/admin/articles', adminArticleRoutes(articleService))
api.use('/admin/orders', adminOrderRoutes(orderService))
api.use('/admin/settings', adminSettingsRoutes(settingsService))

app.use('/api/v1', api)

// Serve client build in production (if present)
const clientDist = path.resolve(__dirname, '../../client/dist')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.use(notFoundHandler)
app.use(errorHandler)

// On serverless (Vercel) the platform invokes the exported app — do not listen.
// Locally / on VPS this starts the HTTP server as usual.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Viraaz API running on http://localhost:${PORT}/api/v1`)
    console.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`)
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`)
  })
}

export default app
