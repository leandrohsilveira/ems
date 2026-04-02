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

export type SignUpRequestDTO = {
    username: string
    email: string
    password: string
    firstName: string | null
    lastName: string | null
    // NO role field - defaults to "USER"
}
