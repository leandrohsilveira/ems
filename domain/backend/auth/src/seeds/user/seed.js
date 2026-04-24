import { ROLES } from '@ems/domain-shared-auth'
import logger from 'pino'
import { UserServiceFailures } from '../../user/index.js'
import { ok, ResultStatus } from '@ems/utils'

/**
 * @import { UserCreateDTO } from '@ems/domain-shared-auth'
 * @import { UserService } from '../../user/index.js'
 */

/**
 * Seed users with all roles (USER, MANAGER, ADMIN)
 * @param {UserService} userService
 * @param {string} password - Password for all seed users
 */
export async function seedUsers(userService, password) {
    const log = logger({ name: 'SeedUsers' })

    /** @type {UserCreateDTO[]} */
    const users = [
        {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            username: 'johndoe',
            role: ROLES.USER,
            password
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            username: 'janesmith',
            role: ROLES.MANAGER,
            password
        },
        {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            username: 'admin',
            role: ROLES.ADMIN,
            password
        }
    ]

    for (const userData of users) {
        const { status: findStatus, error: findErr } = await userService.findByUsernameOrEmail(
            userData.username,
            userData.email
        )

        sw: switch (findStatus) {
            case ResultStatus.OK:
                log.info({ email: userData.email }, 'User already exists, skipping')
                continue
            case ResultStatus.ERROR:
                log.warn({ email: userData.email, error: findErr }, 'Failed to seed user')
                continue
            case UserServiceFailures.NOT_FOUND:
                break sw
        }

        const { status: createStatus, error: createErr } = await userService.createUser(userData)
        switch (createStatus) {
            case ResultStatus.OK:
                log.info({ email: userData.email, role: userData.role }, 'User seeded successfully')
                continue
            case UserServiceFailures.CONFLICT:
            case ResultStatus.ERROR:
                log.warn(
                    { email: userData.email, error: createErr || createStatus },
                    'Failed to seed user'
                )
                continue
        }
    }

    return ok(undefined)
}
