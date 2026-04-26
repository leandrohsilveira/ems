import type { Prisma, Session, User } from './gen/client.js'

export interface PaginationCursor {
    size?: number
    cursor?: string | null
}

export type SessionWithUser = Session & { user: User }

export type SessionCreateInput = Prisma.SessionUncheckedCreateInput
export type SessionUpdateInput = Prisma.SessionUncheckedUpdateInput

export type UserCreateInput = Prisma.UserUncheckedCreateInput
export type UserUpdateInput = Prisma.UserUncheckedUpdateInput

export type AccountCreateInput = Prisma.AccountUncheckedCreateInput
export type AccountUpdateInput = Prisma.AccountUncheckedUpdateInput
export interface AccountListFilterInput {
    userId?: string
}
export interface AccountListInput {
    filter?: AccountListFilterInput
    page?: PaginationCursor
}
