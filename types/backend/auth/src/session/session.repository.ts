import type {
    Session,
    SessionWithUser,
    SessionCreateInput,
    SessionUpdateInput
} from '@ems/database'

export interface SessionRepository {
    findByJti(jti: string): Promise<SessionWithUser | null>
    findByUserId(userId: string): Promise<SessionWithUser[]>

    create(data: SessionCreateInput): Promise<Session>
    update(id: string, data: SessionUpdateInput): Promise<Session>
    delete(id: string): Promise<void>
    deleteByJti(jti: string): Promise<void>
    deleteAllByUserId(userId: string): Promise<void>
}
