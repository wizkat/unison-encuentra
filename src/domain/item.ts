import type { ItemId, UserId } from './ids'

export const ITEM_STATUSES = ['found', 'lost', 'claimed', 'returned'] as const
export type ItemStatus = (typeof ITEM_STATUSES)[number]

export interface Category {
  id: string
  name: string
  icon: string
}

export interface CampusLocation {
  id: string
  campus: string
  building: string
  room: string
}

export interface LostFoundItem {
  id: ItemId
  title: string
  description: string
  color: string | null
  brand: string | null
  category: Category
  status: ItemStatus
  location: CampusLocation
  reportedBy: { id: UserId; displayName: string }
  eventDate: Date
  reportDate: Date
  photoUrl: string
  isActive: boolean
}

export interface ItemFilters {
  search?: string
  categoryId?: string
  status?: ItemStatus
}

export const isClaimable = (item: LostFoundItem) => item.status === 'found' && item.isActive

export const matchesFilters = (item: LostFoundItem, filters: ItemFilters): boolean => {
  if (filters.status && item.status !== filters.status) return false
  if (filters.categoryId && item.category.id !== filters.categoryId) return false

  if (filters.search) {
    const needle = filters.search.trim().toLowerCase()
    if (!needle) return true

    const haystack = `${item.title} ${item.description} ${item.brand ?? ''} ${item.location.building}`.toLowerCase()

    return haystack.includes(needle)
  }

  return true
}