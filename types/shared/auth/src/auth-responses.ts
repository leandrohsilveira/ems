import type { TokenResponse } from './token.js'
import type { UserResponse } from './user.js'
import type { MessageResponse } from './message.js'

export type LoginResponse = TokenResponse
export type RefreshResponse = TokenResponse
export type LogoutResponse = MessageResponse
export type RevokeAllResponse = MessageResponse
export type MeResponse = UserResponse
