import type { SettingsRepository } from '../repositories/index.js'
import type { SiteSettings } from '../types.js'
import { AppError } from '../utils/errors.js'

export class SettingsService {
  constructor(private readonly settings: SettingsRepository) {}

  get(): SiteSettings {
    return this.settings.find()
  }

  async update(input: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = this.settings.find()
    const merged = { ...current, ...input }
    if (!merged.siteName?.trim()) throw AppError.badRequest('نام سایت الزامی است', 'VALIDATION')
    await this.settings.save(merged)
    return merged
  }
}
