import createAppConfig from '@ems/domain-backend-config'
import {
    createUserRepository,
    createSessionRepository,
    createTokenService,
    createAuthService,
    createUserService
} from '@ems/domain-backend-auth'
import appPlugin from './plugin'
import { createDatabaseClient } from '@ems/database'

/**
 * Starts the API Server
 * @param {import('fastify').FastifyInstance} fastify
 * @param {boolean} isProd
 */
export default async function start(fastify, isProd) {
    try {
        const config = createAppConfig(process.env)
        const db = createDatabaseClient(config.db)
        const userRepository = createUserRepository(db)
        const sessionRepository = createSessionRepository(db)
        const tokenService = createTokenService(config.auth)
        const authService = createAuthService(
            userRepository,
            sessionRepository,
            tokenService,
            config.auth
        )

        const userService = createUserService(userRepository, tokenService)

        // Seed users if SEED_USER_PASSWORD is set
        if (process.env.SEED_USER_PASSWORD) {
            try {
                const { seedUsers } = await import('./seeds/seed-users.js')
                await seedUsers(userService, process.env.SEED_USER_PASSWORD)
                fastify.log.info('User seed completed successfully')
            } catch (error) {
                fastify.log.warn(`Seed execution failed: ${String(error)}`)
                // Don't fail startup
            }
        }

        await fastify.register(appPlugin, { authService })

        if (isProd)
            await fastify.listen({
                host: process.env.HOST || 'localhost',
                port: Number(process.env.PORT || '3000')
            })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
