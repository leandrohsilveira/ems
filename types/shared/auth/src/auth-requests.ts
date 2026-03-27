export type LoginRequestDTO = {
    username: string
    password: string
}

export type RefreshRequestDTO = {
    refreshToken: string
}

export type LogoutRequestDTO = {
    refreshToken: string
}

export type RevokeAllRequestDTO = {
    userId: string
}
