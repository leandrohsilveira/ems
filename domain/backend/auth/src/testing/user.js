/**
 * Create mock user data for tests
 * @param {Partial<import('@ems/database').User>} overrides
 * @returns {import('@ems/database').User}
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
 * @param {Partial<import('@ems/types-backend-auth').UserCreateDTO>} overrides
 * @returns {import('@ems/types-backend-auth').UserCreateDTO}
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
 * @param {Partial<import('@ems/types-shared-auth').UserDTO>} overrides
 * @returns {import('@ems/types-shared-auth').UserDTO}
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
 * @param {Partial<import('@ems/types-shared-auth').SignUpRequestDTO>} overrides
 * @returns {import('@ems/types-shared-auth').SignUpRequestDTO}
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
