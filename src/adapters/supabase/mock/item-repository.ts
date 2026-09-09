import type { ItemRepository } from '@/ports'
import { matchesFilters } from '@/domain'
import type { Category, CampusLocation, ItemFilters, ItemId, LostFoundItem } from '@/domain'
import { MOCK_CATEGORIES, MOCK_LOCATIONS, MOCK_ITEMS } from '@/mocks/data'

/** Espera artificial para simular latencia de red mientras no hay backend real. */
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockItemRepository implements ItemRepository {
  async list(filters: ItemFilters = {}): Promise<LostFoundItem[]> {
    await delay()
    return MOCK_ITEMS.filter((item) => matchesFilters(item, filters)).sort(
      (a, b) => b.reportDate.getTime() - a.reportDate.getTime(),
    )
  }

  async getById(id: ItemId): Promise<LostFoundItem | null> {
    await delay(250)
    return MOCK_ITEMS.find((item) => item.id === id) ?? null
  }

  async listCategories(): Promise<Category[]> {
    await delay(150)
    return MOCK_CATEGORIES
  }

  async listLocations(): Promise<CampusLocation[]> {
    await delay(150)
    return MOCK_LOCATIONS
  }
}

/**
 * Instancia lista para usar en las pantallas. Cuando exista la tabla `objects`
 * en Supabase, crea `SupabaseItemRepository implements ItemRepository` en
 * `src/adapters/supabase/item-repository.ts` y cambia solo esta línea.
 */
export const itemRepository: ItemRepository = new MockItemRepository()