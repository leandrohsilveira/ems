import type { UserDTO } from '@ems/types-shared-auth'

export interface UserCreateDTO {
    firstName: string | null
    lastName: string | null
    email: string
    username: string
    password: string // Plaintext password
    role: 'USER' | 'MANAGER' | 'ADMIN'
}

export interface UserService {
    createUser(data: UserCreateDTO): Promise<UserDTO>
    findByUsernameOrEmail(username: string, email: string): Promise<UserDTO | null>
}
