export type UserDTO = {
    userId: string
    username: string
    firstName: string | null
    lastName: string | null
    email: string
    role: string
}

export type UserResponseDTO = {
    user: UserDTO
}
