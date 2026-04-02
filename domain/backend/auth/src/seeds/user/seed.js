import logger from 'pino'

/**
 * Seed users with all roles (USER, MANAGER, ADMIN)
 * @param {import('@ems/types-backend-auth').UserService} userService
 * @param {string} password - Password for all seed users
 * @returns {Promise<void>}
 */
export async function seedUsers(userService, password) {
    const log = logger({ name: 'SeedUsers' })

    /** @type {import('@ems/types-backend-auth').UserCreateDTO[]} */
    const users = [
        {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            username: 'johndoe',
            role: 'USER',
            password
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            username: 'janesmith',
            role: 'MANAGER',
            password
        },
        {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            username: 'admin',
            role: 'ADMIN',
            password
        }
    ]

    for (const userData of users) {
        try {
            const existing = await userService.findByUsernameOrEmail(
                userData.username,
                userData.email
            )
            if (!existing) {
                await userService.createUser(userData)
                log.info({ email: userData.email, role: userData.role }, 'User seeded successfully')
            } else {
                log.info({ email: userData.email }, 'User already exists, skipping')
            }
        } catch (error) {
            log.warn({ email: userData.email, error: String(error) }, 'Failed to seed user')
            // Continue with other users
        }
    }
}
