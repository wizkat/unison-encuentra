import type { UserId } from './ids'

export const AFFILIATIONS = ['student', 'employee'] as const
export type Affiliation = (typeof AFFILIATIONS)[number]

export const ROLES = ['member', 'operator', 'admin'] as const
export type Role = (typeof ROLES)[number]

export interface User {
  id: UserId
  email: string
  upn: string | null
  displayName: string
  studentId: string | null
  affiliation: Affiliation
  role: Role
  tenantId: string
}

export const canManageItems = (user: User) =>
  user.role === 'operator' || user.role === 'admin'

export const canResolveClaims = canManageItems

export const canManageUsers = (user: User) => user.role === 'admin'

export const isStudent = (user: User) => user.affiliation === 'student'