import type { ReviewRepository } from '../repositories/index.js'
import type { Review } from '../types.js'
import { AppError } from '../utils/errors.js'
import { generateId } from '../utils/helpers.js'

export class ReviewService {
  constructor(private readonly reviews: ReviewRepository) {}

  listByBook(bookId: string): Review[] {
    return this.reviews
      .findByBookId(bookId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async create(bookId: string, input: Omit<Review, 'id' | 'bookId' | 'createdAt'>): Promise<Review> {
    if (!input.author?.trim()) throw AppError.badRequest('نام الزامی است', 'VALIDATION')
    if (!Number.isFinite(input.rating) || input.rating < 1 || input.rating > 5) {
      throw AppError.badRequest('امتیاز باید بین ۱ تا ۵ باشد', 'VALIDATION')
    }
    if (!input.body?.trim() || input.body.trim().length < 5) {
      throw AppError.badRequest('متن دیدگاه باید حداقل ۵ حرف باشد', 'VALIDATION')
    }
    const review: Review = {
      ...input,
      id: generateId('rev'),
      bookId,
      createdAt: new Date().toISOString(),
    }
    await this.reviews.save(review)
    return review
  }
}
