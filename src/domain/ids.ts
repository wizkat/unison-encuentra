declare const brand: unique symbol

type Branded<T, B> = T & { readonly [brand]: B }

export type UserId = Branded<string, 'UserId'>
export type ItemId = Branded<string, 'ItemId'>
export type ClaimId = Branded<string, 'ClaimId'>

export const userId = (value: string) => value as UserId
export const itemId = (value: string) => value as ItemId
export const claimId = (value: string) => value as ClaimId