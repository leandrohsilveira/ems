export type TokenResponseDTO = {
    accessToken: string
    refreshToken: string
    expiresIn: number
    issuedAt: string
    tokenType: 'Bearer'
}
