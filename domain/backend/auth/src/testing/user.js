/**
 * @import { User } from '@ems/database'
 * @import { UserDTO, UserCreateDTO, SignupRequestDTO } from '@ems/domain-shared-auth'
 */

/**
 * Create mock user data for tests
 * @param {Partial<User>} overrides
 * @returns {User}
 */
export function createMockUser(overrides = {}) {
    return {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        ...overrides
    }
}

/**
 * Create mock user DTO for tests
 * @param {Partial<UserCreateDTO>} overrides
 * @returns {UserCreateDTO}
 */
export function createMockUserCreateDTO(overrides = {}) {
    return {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'plaintext-password',
        role: 'USER',
        ...overrides
    }
}

/**
 * Create mock user DTO response for tests
 * @param {Partial<UserDTO>} overrides
 * @returns {UserDTO}
 */
export function createMockUserDTO(overrides = {}) {
    return {
        userId: 'user-1',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'USER',
        ...overrides
    }
}

/**
 * Create mock signup request DTO for tests
 * @param {Partial<SignupRequestDTO>} overrides
 * @returns {SignupRequestDTO}
 */
export function createMockSignUpRequestDTO(overrides = {}) {
    return {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
        ...overrides
    }
}
