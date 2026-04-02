import type { TokenResponseDTO } from './token.js'
import type { UserResponseDTO } from './user.js'
import type { MessageResponseDTO } from './message.js'

export type LoginResponseDTO = TokenResponseDTO
export type RefreshResponseDTO = TokenResponseDTO
export type LogoutResponseDTO = MessageResponseDTO
export type RevokeAllResponseDTO = MessageResponseDTO
export type MeResponseDTO = UserResponseDTO
export type SignUpResponseDTO = UserResponseDTO
