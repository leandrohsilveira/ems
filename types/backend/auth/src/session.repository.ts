import type { Prisma, Session } from '@ems/database'

export type SessionCreateInput = Prisma.SessionUncheckedCreateInput
export type SessionUpdateInput = Prisma.SessionUncheckedUpdateInput

export interface SessionRepository {
    findByJti(jti: string, includeUser?: boolean): Promise<Session | null>
    findByUserId(userId: string, includeUser?: boolean): Promise<Session[]>
    create(data: SessionCreateInput): Promise<Session>
    update(id: string, data: SessionUpdateInput): Promise<Session>
    delete(id: string): Promise<void>
    deleteByJti(jti: string): Promise<void>
    deleteAllByUserId(userId: string): Promise<void>
}
