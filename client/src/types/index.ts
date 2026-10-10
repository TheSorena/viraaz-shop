export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
}

export interface Book {
  id: string
  slug: string
  title: string
  author: string
  translator: string | null
  publisher: string
  categoryId: string
  shortDescription: string
  fullDescription: string
  cover: string
  price: number
  discountPrice: number | null
  pages: number
  year: number
  binding: string
  stock: number
  rating: number
  salesCount: number
  isbn: string
  featured: boolean
  isNew: boolean
  tags: string[]
}

export type ArticleContentBlock =
  | { type: 'intro'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'link'; text: string; href: string }

export interface Article {
  id: string
  slug: string
  title: string
  summary: string
  categoryId: string
  author: string
  cover: string
  readMinutes: number
  publishedAt: string
  status: 'published' | 'draft'
  featured: boolean
  tags: string[]
  relatedBookIds: string[]
  content: ArticleContentBlock[]
}

export interface OrderItem {
  bookId: string
  title: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface OrderCustomer {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  orderNumber: string
  customer: OrderCustomer
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  status: OrderStatus
  createdAt: string
  note?: string
}

export interface Review {
  id: string
  bookId: string
  author: string
  rating: number
  title: string
  body: string
  createdAt: string
}

export interface SiteSettings {
  siteName: string
  siteNameEn: string
  tagline: string
  description: string
  baseUrl: string
  currency: string
  currencyCode: string
  freeShippingThreshold: number
  shippingFee: number
  taxRate: number
  social: Record<string, string>
  contact: { email: string; phone: string; address: string }
  demoNotice: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface Paginated<T> {
  data: T[]
  pagination: Pagination
}

export interface ApiResponse<T> {
  ok: boolean
  data?: T
  error?: { code: string; message: string; details?: unknown }
}
