import type { CategoryRepository } from '../repositories/index.js'
import type { Category } from '../types.js'
import { AppError } from '../utils/errors.js'

export class CategoryService {
  constructor(private readonly categories: CategoryRepository) {}

  list(): Category[] {
    return this.categories.findAll()
  }

  getBySlug(slug: string): Category {
    const cat = this.categories.findBySlug(slug)
    if (!cat) throw AppError.notFound('دسته‌بندی یافت نشد', 'CATEGORY_NOT_FOUND')
    return cat
  }
}
