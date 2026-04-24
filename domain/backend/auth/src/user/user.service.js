import logger from 'pino'
import { parseUser } from './user.js'
import { createEnum, error, failure, ok, ResultStatus, tryCatchAsync } from '@ems/utils'
import { UserRepositoryFailuresEnum } from './user.repository.js'

export const UserServiceFailures = createEnum({
    CONFLICT: 'CONFLICT',
    NOT_FOUND: 'NOT_FOUND'
})

/**
 * @import { UserCreateDTO, UserDTO, SignupRequestDTO } from '@ems/domain-shared-auth'
 * @import { ResultOk, ResultFailure, ResultError } from '@ems/utils'
 *
 * @import { UserRepository } from './user.repository.js'
 * @import { TokenService } from '../token/index.js'
 */

/**
 * @exports @typedef UserService
 * @property {(data: UserCreateDTO) => Promise<ResultOk<UserDTO> | ResultFailure<typeof UserServiceFailures.CONFLICT, null> | ResultError>} createUser
 * @property {(data: SignupRequestDTO) => Promise<ResultOk<UserDTO> | ResultFailure<typeof UserServiceFailures.CONFLICT, null> | ResultError>} signup
 * @property {(username: string, email: string) => Promise<ResultOk<UserDTO> | ResultFailure<typeof UserServiceFailures.NOT_FOUND, null> | ResultError>} findByUsernameOrEmail
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
        createUser(data) {
            return tryCatchAsync(async () => {
                log.info({ username: data.username, email: data.email }, 'Creating user')

                const {
                    status: hashStatus,
                    data: hashedPassword,
                    error: hashErr
                } = await tokenService.hashPassword(data.password)

                switch (hashStatus) {
                    case ResultStatus.OK:
                        break
                    case ResultStatus.ERROR:
                        return error(hashErr)
                }

                const {
                    status: createStatus,
                    data: user,
                    error: createErr
                } = await userRepository.create({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    username: data.username,
                    password: hashedPassword,
                    role: data.role
                })

                switch (createStatus) {
                    case ResultStatus.OK:
                        break
                    case ResultStatus.ERROR:
                        return error(createErr)
                    case UserRepositoryFailuresEnum.CONFLICT:
                        log.error(
                            { username: data.username, email: data.email },
                            'User creation failed: database constraint violation'
                        )
                        return failure(UserServiceFailures.CONFLICT)
                }

                log.info({ userId: user.id, username: user.username }, 'User created successfully')

                return ok(parseUser(user))
            })
        },

        /** @param {SignupRequestDTO} data */
        signup(data) {
            return tryCatchAsync(async () => {
                log.info({ username: data.username, email: data.email }, 'User signup attempt')

                const {
                    status: hashStatus,
                    data: hashedPassword,
                    error: hashErr
                } = await tokenService.hashPassword(data.password)

                switch (hashStatus) {
                    case ResultStatus.OK:
                        break
                    case ResultStatus.ERROR:
                        return error(hashErr)
                }

                const {
                    status: createStatus,
                    data: user,
                    error: createErr
                } = await userRepository.create({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    username: data.username,
                    password: hashedPassword,
                    role: 'USER'
                })

                switch (createStatus) {
                    case ResultStatus.OK:
                        break
                    case ResultStatus.ERROR:
                        return error(createErr)
                    case UserRepositoryFailuresEnum.CONFLICT:
                        log.error(
                            { username: data.username, email: data.email },
                            'User signup failed: database constraint violation'
                        )
                        return failure(UserServiceFailures.CONFLICT)
                }

                log.info(
                    { userId: user.id, username: user.username },
                    'User signed up successfully'
                )

                return ok(parseUser(user))
            })
        },

        /** @param {string} username */
        /** @param {string} email */
        async findByUsernameOrEmail(username, email) {
            return tryCatchAsync(async () => {
                const {
                    status: findStatus,
                    data: user,
                    error: findErr
                } = await userRepository.findByUsernameOrEmail(username, email)

                switch (findStatus) {
                    case ResultStatus.OK:
                        break
                    case ResultStatus.ERROR:
                        return error(findErr)
                    case UserRepositoryFailuresEnum.NOT_FOUND:
                        return failure(UserServiceFailures.NOT_FOUND)
                }
                return ok(parseUser(user))
            })
        }
    }
}
