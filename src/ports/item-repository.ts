import type { Category, CampusLocation, ItemFilters, ItemId, LostFoundItem } from '@/domain'

export interface ItemRepository {
  list(filters?: ItemFilters): Promise<LostFoundItem[]>
  getById(id: ItemId): Promise<LostFoundItem | null>
  listCategories(): Promise<Category[]>
  listLocations(): Promise<CampusLocation[]>
}