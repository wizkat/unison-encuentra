import type { ClaimId, ItemId, UserId } from './ids'

export const CLAIM_STATUSES = ['pending', 'approved', 'rejected'] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

export interface Claim {
  id: ClaimId
  itemId: ItemId
  applicantId: UserId
  message: string
  status: ClaimStatus
  requestDate: Date
  resolutionDate: Date | null
}