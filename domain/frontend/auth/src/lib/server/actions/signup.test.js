import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { submitSignupAction } from './signup.js'
import { createHttpClientStub, createJsonResponse, createNetworkError } from '@ems/http/testing'
import { defaultLanguage, resolveErrorLiterals } from '@ems/domain-shared-schema'
import { signupErrorsI18n } from '@ems/domain-shared-auth'

const literals = resolveErrorLiterals('en_US', signupErrorsI18n)

describe('submitSignupAction', () => {
    /** @type {ReturnType<typeof createHttpClientStub>} */
    let httpStub

    beforeEach(() => {
        httpStub = createHttpClientStub({ baseUrl: 'http://api.example.com' })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('successful signup', () => {
        it('returns { isSuccess: true, status: 201 } when API call succeeds with required fields', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('email', 'test@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/auth/signup',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.arrayContaining([['Content-Type', 'application/json']]),
                    body: expect.stringContaining('"email":"test@example.com"')
                })
            )
        })

        it('includes firstName and lastName from FormData when provided', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('email', 'test@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')
            formData.set('firstName', 'John')
            formData.set('lastName', 'Doe')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/auth/signup',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"firstName":"John","lastName":"Doe"')
                })
            )
        })

        it('ignores extra fields in FormData', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('email', 'test@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')
            formData.set('extraField', 'should be ignored')
            formData.set('anotherExtra', 'also ignored')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/auth/signup',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"email":"test@example.com"')
                })
            )
        })
    })

    describe('API errors with JSON responses (function returns error)', () => {
        beforeEach(() => vi.spyOn(console, 'error').mockImplementation(vi.fn()))

        it('returns validation error for invalid email format before API call', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(
                createJsonResponse({
                    body: { message: 'Invalid email format' },
                    status: 400,
                    statusText: 'Bad Request'
                })
            )
            const formData = new FormData()
            formData.set('email', 'invalid-email')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        email: expect.arrayContaining([
                            expect.stringContaining('Must enter a valid e-mail address')
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('returns error when API returns 409 Conflict with JSON message', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(
                createJsonResponse({
                    body: { message: 'Email already exists' },
                    status: 409,
                    statusText: 'Conflict'
                })
            )
            const formData = new FormData()
            formData.set('email', 'existing@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act & Assert
            await expect(
                submitSignupAction({
                    client: httpStub.client,
                    form: formData,
                    locale: defaultLanguage
                })
            ).resolves.toMatchObject({
                isSuccess: false,
                status: 409,
                errorMessage: literals.usernameOrEmailAlreadyExists
            })
        })

        it('returns error when API returns 500 Server Error with JSON message', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(
                createJsonResponse({
                    body: { message: 'Internal server error' },
                    status: 500,
                    statusText: 'Server Error'
                })
            )
            const formData = new FormData()
            formData.set('email', 'test@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act & Assert
            await expect(
                submitSignupAction({
                    client: httpStub.client,
                    form: formData,
                    locale: defaultLanguage
                })
            ).resolves.toMatchObject({
                isSuccess: false,
                status: 500,
                errorMessage: literals.somethingWentWrongError
            })
        })
    })

    describe('Network and generic errors (function returns error)', () => {
        beforeEach(() => vi.spyOn(console, 'error').mockImplementation(vi.fn()))

        it('returns error when network fails', async () => {
            // Arrange
            httpStub.fetch.mockRejectedValue(createNetworkError('ECONNREFUSED'))
            const formData = new FormData()
            formData.set('email', 'test@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act & Assert
            await expect(
                submitSignupAction({
                    client: httpStub.client,
                    form: formData,
                    locale: defaultLanguage
                })
            ).resolves.toMatchObject({
                isSuccess: false,
                errorMessage: literals.serviceUnavailableError
            })
        })

        it('returns error when fetch throws unexpected error', async () => {
            // Arrange
            httpStub.fetch.mockRejectedValue(new Error('Unexpected error occurred'))
            const formData = new FormData()
            formData.set('email', 'test@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act & Assert
            await expect(
                submitSignupAction({
                    client: httpStub.client,
                    form: formData,
                    locale: defaultLanguage
                })
            ).resolves.toMatchObject({
                isSuccess: false,
                errorMessage: literals.somethingWentWrongError
            })
        })
    })

    describe('FormData handling and string conversion', () => {
        it('converts FormData values to strings using String()', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('email', 'test@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/auth/signup',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"email":"test@example.com"')
                })
            )
        })

        it('returns validation error when required fields are missing', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            // Only set email, username, password and confirmPassword missing
            formData.set('email', 'test@example.com')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        username: expect.arrayContaining([
                            expect.stringContaining('Must enter a valid username')
                        ]),
                        password: expect.arrayContaining([
                            expect.stringContaining('Must enter a valid password')
                        ]),
                        confirmPassword: expect.arrayContaining([
                            expect.stringContaining('Must enter the password confirmation')
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('returns validation error when FormData has empty values', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('email', '')
            formData.set('username', '')
            formData.set('password', '')
            formData.set('confirmPassword', '')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        email: expect.arrayContaining([
                            expect.stringContaining('Must enter a valid e-mail address')
                        ]),
                        username: expect.arrayContaining([
                            expect.stringContaining('Username must be at least 3 characters')
                        ]),
                        password: expect.arrayContaining([
                            expect.stringContaining('Password must be at least 8 characters')
                        ]),
                        confirmPassword: expect.arrayContaining([
                            expect.stringContaining('Must enter the password confirmation')
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('uses first value when FormData has multiple values for same field', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.append('email', 'first@example.com')
            formData.append('email', 'second@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            // form.get('email') returns first value
            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/auth/signup',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"email":"first@example.com"')
                })
            )
        })

        it('returns validation error when password and confirmPassword do not match', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('email', 'test@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'differentpassword')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: {
                        confirmPassword: expect.arrayContaining([
                            expect.stringContaining('Must match the password')
                        ])
                    }
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('returns validation error for username less than 3 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'ab') // 2 chars
            formData.set('email', 'test@example.com')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        username: expect.arrayContaining([
                            expect.stringContaining('Username must be at least 3 characters')
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('returns validation error for username exceeding 30 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'a'.repeat(31)) // 31 chars
            formData.set('email', 'test@example.com')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        username: expect.arrayContaining([
                            expect.stringContaining('Username cannot exceed 30 characters')
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('returns validation error for username with invalid characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'user@name') // @ not allowed
            formData.set('email', 'test@example.com')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        username: expect.arrayContaining([
                            expect.stringContaining(
                                'Username can only contain letters, numbers, underscores, and dashes'
                            )
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('returns validation error for email exceeding 255 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'testuser')
            formData.set('email', 'a'.repeat(250) + '@example.com') // > 255 chars
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        email: expect.arrayContaining([
                            expect.stringContaining('Email cannot exceed 255 characters')
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('returns validation error for password exceeding 128 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'testuser')
            formData.set('email', 'test@example.com')
            formData.set('password', 'a'.repeat(129)) // 129 chars
            formData.set('confirmPassword', 'a'.repeat(129))

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        password: expect.arrayContaining([
                            expect.stringContaining('Password cannot exceed 128 characters')
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('returns validation error for firstName exceeding 100 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'testuser')
            formData.set('email', 'test@example.com')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')
            formData.set('firstName', 'a'.repeat(101)) // 101 chars

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        firstName: expect.arrayContaining([
                            expect.stringContaining('First name cannot exceed 100 characters')
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('returns validation error for lastName exceeding 100 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'testuser')
            formData.set('email', 'test@example.com')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')
            formData.set('lastName', 'a'.repeat(101)) // 101 chars

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        lastName: expect.arrayContaining([
                            expect.stringContaining('Last name cannot exceed 100 characters')
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('accepts username with exactly 3 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'abc') // 3 chars
            formData.set('email', 'test@example.com')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalled()
        })

        it('accepts username with exactly 30 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'a'.repeat(30)) // 30 chars
            formData.set('email', 'test@example.com')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalled()
        })

        it('accepts password with exactly 128 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'testuser')
            formData.set('email', 'test@example.com')
            formData.set('password', 'a'.repeat(128)) // 128 chars
            formData.set('confirmPassword', 'a'.repeat(128))

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalled()
        })

        it('accepts firstName with exactly 100 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'testuser')
            formData.set('email', 'test@example.com')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')
            formData.set('firstName', 'a'.repeat(100)) // 100 chars

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalled()
        })

        it('accepts lastName with exactly 100 characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'testuser')
            formData.set('email', 'test@example.com')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')
            formData.set('lastName', 'a'.repeat(100)) // 100 chars

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalled()
        })

        it('accepts valid username with underscores and dashes', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('username', 'user_name-123') // valid chars
            formData.set('email', 'test@example.com')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalled()
        })
    })

    describe('data structure and API interaction', () => {
        it('creates correct SignUpRequestDTO structure', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('email', 'test@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/auth/signup',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"email":"test@example.com"')
                })
            )
        })

        it('calls correct API endpoint with POST method', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('email', 'test@example.com')
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/auth/signup',
                expect.objectContaining({
                    method: 'POST'
                })
            )
        })
    })

    describe('edge cases', () => {
        it('returns validation error for File objects in email field', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            const file = new File(['content'], 'test.txt', { type: 'text/plain' })
            formData.set('email', file) // File object
            formData.set('username', 'testuser')
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toMatchObject({
                isSuccess: false,
                status: 400,
                errors: expect.objectContaining({
                    fields: expect.objectContaining({
                        email: expect.arrayContaining([
                            expect.stringContaining('Must enter a valid e-mail address')
                        ])
                    })
                })
            })
            // Should not call API when validation fails
            expect(httpStub.fetch).not.toHaveBeenCalled()
        })

        it('handles valid email with special characters', async () => {
            // Arrange
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: {}, status: 201 }))
            const formData = new FormData()
            formData.set('email', 'test+unicode@example.com')
            formData.set('username', 'user_123-test') // Valid username with underscores and dashes
            formData.set('password', 'password123')
            formData.set('confirmPassword', 'password123')

            // Act
            const result = await submitSignupAction({
                client: httpStub.client,
                form: formData,
                locale: defaultLanguage
            })

            // Assert
            expect(result).toEqual({ isSuccess: true, status: 201 })
            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/auth/signup',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"email":"test+unicode@example.com"')
                })
            )
        })
    })

    it('uses pt_BR locale for validation messages', async () => {
        // Arrange
        const formData = new FormData()
        // Empty form data
        formData.set('email', '')
        formData.set('username', '')
        formData.set('password', '')
        formData.set('confirmPassword', '')

        // Act
        const result = await submitSignupAction({
            client: httpStub.client,
            form: formData,
            locale: 'pt_BR'
        })

        // Assert
        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(400)
        expect(result.errors).toBeDefined()
        // Test that validation errors contain actual Portuguese messages
        expect(result.errors).toMatchObject({
            fields: expect.objectContaining({
                email: expect.arrayContaining([
                    'É necessário informar um endereço de e-mail válido'
                ]),
                username: expect.arrayContaining([
                    'O nome de usuário deve ter pelo menos 3 caracteres'
                ]),
                password: expect.arrayContaining(['A senha deve ter pelo menos 8 caracteres']),
                confirmPassword: expect.arrayContaining([
                    'É necessário informar a confirmação da senha'
                ])
            })
        })
    })
})
