import type {
    LoginRequestDTO,
    LoginResponseDTO,
    RefreshRequestDTO,
    RefreshResponseDTO,
    LogoutResponseDTO,
    RevokeAllResponseDTO
} from '@ems/types-shared-auth'
import type { SessionDTO } from './session/session.js'

export interface AuthService {
    login(request: LoginRequestDTO): Promise<LoginResponseDTO>
    refresh(request: RefreshRequestDTO): Promise<RefreshResponseDTO>
    logout(request: RefreshRequestDTO): Promise<LogoutResponseDTO>
    revokeAll(userId: string): Promise<RevokeAllResponseDTO>
    me(accessToken: string): Promise<SessionDTO>
}
