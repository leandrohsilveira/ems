import logger from 'pino'
import { Prisma } from '@ems/database'
import { getErrorMessage } from '../utils/error.js'
import { parseUser } from './user.js'

/**
 * @import { UserRepository } from './user.repository.js'
 * @import { TokenService } from '../token/index.js'
 * @import { UserCreateDTO, UserDTO, SignupRequestDTO } from '@ems/domain-shared-auth'
 */

/**
 * @exports @typedef UserService
 * @property {(data: UserCreateDTO) => Promise<UserDTO>} createUser
 * @property {(data: SignupRequestDTO) => Promise<UserDTO>} signup
 * @property {(username: string, email: string) => Promise<UserDTO | null>} findByUsernameOrEmail
 */

/**
 * Creates a user service
 * @param {UserRepository} userRepository
 * @param {TokenService} tokenService
 * @returns {UserService}
 */
export function createUserService(userRepository, tokenService) {
    const log = logger({ name: 'UserService' })

    return {
        /** @param {UserCreateDTO} data */
        async createUser(data) {
            log.info({ username: data.username, email: data.email }, 'Creating user')

            // Check for existing user
            const existing = await userRepository.findByUsernameOrEmail(data.username, data.email)
            if (existing) {
                log.error(
                    { username: data.username, email: data.email },
                    'User creation failed: duplicate user'
                )
                throw new Error('User with this username or email already exists')
            }

            try {
                // Hash password
                const hashedPassword = await tokenService.hashPassword(data.password)

                // Create user in database
                const user = await userRepository.create({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    username: data.username,
                    password: hashedPassword,
                    role: data.role
                })

                log.info({ userId: user.id, username: user.username }, 'User created successfully')

                // Return UserDTO (without password)
                return parseUser(user)
            } catch (error) {
                // Handle Prisma unique constraint errors
                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2002'
                ) {
                    log.error(
                        { username: data.username, email: data.email, code: error.code },
                        'User creation failed: database constraint violation'
                    )
                    throw new Error('User with this username or email already exists')
                }

                // Re-throw other errors with logging
                const errorMessage = getErrorMessage(error)
                log.error({ username: data.username, error: errorMessage }, 'User creation failed')
                throw error
            }
        },

        /** @param {SignupRequestDTO} data */
        async signup(data) {
            log.info({ username: data.username, email: data.email }, 'User signup attempt')

            // Check for existing user (same logic as createUser)
            const existing = await userRepository.findByUsernameOrEmail(data.username, data.email)
            if (existing) {
                log.error(
                    { username: data.username, email: data.email },
                    'User signup failed: duplicate user'
                )
                throw new Error('User with this username or email already exists')
            }

            try {
                // Hash password
                const hashedPassword = await tokenService.hashPassword(data.password)

                // Create user in database with default USER role
                const user = await userRepository.create({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    username: data.username,
                    password: hashedPassword,
                    role: 'USER' // Default role for self-signup
                })

                log.info(
                    { userId: user.id, username: user.username },
                    'User signed up successfully'
                )

                // Return UserDTO (without password)
                return parseUser(user)
            } catch (error) {
                // Handle Prisma unique constraint errors
                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2002'
                ) {
                    log.error(
                        { username: data.username, email: data.email, code: error.code },
                        'User signup failed: database constraint violation'
                    )
                    throw new Error('User with this username or email already exists')
                }

                // Re-throw other errors with logging
                const errorMessage = getErrorMessage(error)
                log.error({ username: data.username, error: errorMessage }, 'User signup failed')
                throw error
            }
        },

        /** @param {string} username */
        /** @param {string} email */
        async findByUsernameOrEmail(username, email) {
            const user = await userRepository.findByUsernameOrEmail(username, email)
            return user ? parseUser(user) : null
        }
    }
}
