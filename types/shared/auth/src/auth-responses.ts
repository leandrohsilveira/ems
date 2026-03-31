import type { TokenResponseDTO } from './token'
import type { UserResponseDTO } from './user'
import type { MessageResponseDTO } from './message'

export type LoginResponseDTO = TokenResponseDTO
export type RefreshResponseDTO = TokenResponseDTO
export type LogoutResponseDTO = MessageResponseDTO
export type RevokeAllResponseDTO = MessageResponseDTO
export type MeResponseDTO = UserResponseDTO
