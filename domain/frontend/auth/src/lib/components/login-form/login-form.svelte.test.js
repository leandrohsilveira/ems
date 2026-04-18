import { describe, it, expect, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import LoginForm from './login-form.svelte'
import { createEnhanceMock } from '@ems/ui/testing'
import { defaultLiterals } from './login-form.i18n.js'

describe('LoginForm', () => {
    describe('Component Props & Structure', () => {
        it('renders with empty errors prop', async () => {
            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors: { fields: {} },
                    enhance: createEnhanceMock(),
                    signupHref: '/signup'
                }
            })

            // Form should be visible
            const form = screen.getByRole('form')
            await expect.element(form).toBeVisible()

            // Check for each input field individually
            await expect.element(screen.getByLabelText('Username')).toBeVisible()
            await expect.element(screen.getByLabelText('Password')).toBeVisible()
            await expect.element(screen.getByLabelText('Remember me')).toBeVisible()
        })

        it('renders all form fields with correct labels', async () => {
            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors: { fields: {} },
                    enhance: createEnhanceMock(),
                    signupHref: '/signup'
                }
            })

            // Check all field labels
            const labels = ['Username', 'Password', 'Remember me']

            for (const labelText of labels) {
                const label = screen.getByText(labelText, { exact: true })
                await expect.element(label).toBeVisible()
            }
        })

        it('renders submit button with "Sign In" text', async () => {
            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors: { fields: {} },
                    enhance: createEnhanceMock(),
                    signupHref: '/signup'
                }
            })

            const button = screen.getByRole('button', { hasText: /sign in/i })
            await expect.element(button).toBeVisible()
        })

        it('renders signup link with correct text and href', async () => {
            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors: { fields: {} },
                    enhance: createEnhanceMock(),
                    signupHref: '/signup'
                }
            })

            const linkText = screen.getByText("Don't have an account?")
            const link = screen.getByText('Create Account')

            await expect.element(linkText).toBeVisible()
            await expect.element(link).toBeVisible()
            await expect.element(link).toHaveAttribute('href', '/signup')
        })
    })

    describe('Error Display', () => {
        it('displays field-specific errors from errors prop', async () => {
            const errors = {
                fields: {
                    username: ['Username is required'],
                    password: ['Password is required']
                }
            }

            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors,
                    enhance: createEnhanceMock(),
                    signupHref: '/signup'
                }
            })

            // Check error messages are displayed
            const usernameError = screen.getByText('Username is required')
            const passwordError = screen.getByText('Password is required')

            await expect.element(usernameError).toBeVisible()
            await expect.element(passwordError).toBeVisible()
        })

        it('displays general error from errorMessage prop', async () => {
            const errorMessage = 'Invalid username or password'

            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errorMessage,
                    enhance: createEnhanceMock(),
                    signupHref: '/signup'
                }
            })

            const generalError = screen.getByText('Invalid username or password')
            await expect.element(generalError).toBeVisible()
        })

        it('sets aria-invalid="true" on fields with errors', async () => {
            const errors = {
                fields: {
                    username: ['Invalid username'],
                    password: ['Invalid password']
                }
            }

            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors,
                    enhance: createEnhanceMock(),
                    signupHref: '/signup'
                }
            })

            // Check username input
            const usernameInput = screen.getByLabelText('Username')
            await expect.element(usernameInput).toHaveAttribute('aria-invalid', 'true')

            // Check password input
            const passwordInput = screen.getByLabelText('Password')
            await expect.element(passwordInput).toHaveAttribute('aria-invalid', 'true')
        })
    })

    describe('Enhance Integration & Loading State', () => {
        it('manages loading state internally via enhance callback', async () => {
            const update$ = Promise.withResolvers()

            const update = vi.fn().mockReturnValue(update$.promise)
            const onSubmit = vi.fn().mockReturnValue({ type: 'success', status: 200 })
            const enhance = createEnhanceMock({ onSubmit, update })

            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors: { fields: {} },
                    enhance,
                    signupHref: '/signup'
                }
            })

            const usernameInput = screen.getByLabelText('Username')
            const passwordInput = screen.getByLabelText('Password')
            const rememberMeCheckbox = screen.getByLabelText('Remember me')
            const button = screen.getByRole('button', { hasText: /sign in/i })

            // Initially not loading
            await expect.element(button).not.toBeDisabled()
            await expect.element(usernameInput).not.toBeDisabled()
            await expect.element(passwordInput).not.toBeDisabled()
            await expect.element(rememberMeCheckbox).not.toBeDisabled()

            // fill the form to be valid
            await usernameInput.fill('testuser')
            await passwordInput.fill('password123')

            // Submit form
            await button.click()

            // Should be in loading state
            await expect.element(button).toBeDisabled()
            await expect.element(usernameInput).toBeDisabled()
            await expect.element(passwordInput).toBeDisabled()
            await expect.element(rememberMeCheckbox).toBeDisabled()

            // Resolve the update promise
            update$.resolve(undefined)

            // Should no longer be loading
            await expect.element(button).not.toBeDisabled()
            await expect.element(usernameInput).not.toBeDisabled()
        })

        it('calls onSubmit with form data when form is submitted', async () => {
            const onSubmit = vi.fn().mockImplementation(
                /**
                 * @param {FormData} formData
                 * @return {import('@sveltejs/kit').ActionResult}
                 */
                (formData) => {
                    expect(formData).toBeInstanceOf(FormData)
                    expect(formData.get('username')).toBe('testuser')
                    expect(formData.get('password')).toBe('password123')
                    expect(formData.get('rememberMe')).toBe('on')

                    return {
                        type: 'success',
                        status: 200
                    }
                }
            )
            const enhance = createEnhanceMock({ onSubmit })

            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors: { fields: {} },
                    enhance,
                    signupHref: '/signup'
                }
            })

            // Fill form
            const usernameInput = screen.getByLabelText('Username')
            const passwordInput = screen.getByLabelText('Password')
            const rememberMeCheckbox = screen.getByLabelText('Remember me')
            const button = screen.getByRole('button', { hasText: /sign in/i })

            await usernameInput.fill('testuser')
            await passwordInput.fill('password123')
            await rememberMeCheckbox.click()

            // Submit form
            await button.click()

            // Verify onSubmit was called with form data
            expect(onSubmit).toHaveBeenCalledOnce()
        })
    })

    describe('Form Attributes', () => {
        it('input elements have correct name attributes', async () => {
            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors: { fields: {} },
                    enhance: createEnhanceMock(),
                    signupHref: '/signup'
                }
            })

            // Check each field has correct name attribute
            await expect
                .element(screen.getByLabelText('Username'))
                .toHaveAttribute('name', 'username')
            await expect
                .element(screen.getByLabelText('Password'))
                .toHaveAttribute('name', 'password')
            await expect
                .element(screen.getByLabelText('Remember me'))
                .toHaveAttribute('name', 'rememberMe')
        })

        it('password field has type="password"', async () => {
            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors: { fields: {} },
                    enhance: createEnhanceMock(),
                    signupHref: '/signup'
                }
            })

            const passwordInput = screen.getByLabelText('Password')
            await expect.element(passwordInput).toHaveAttribute('type', 'password')
        })

        it('form has correct action attribute', async () => {
            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors: { fields: {} },
                    enhance: createEnhanceMock(),
                    action: '/custom-login',
                    signupHref: '/signup'
                }
            })

            const form = screen.getByRole('form')
            await expect.element(form).toHaveAttribute('action', '/custom-login')
        })

        it('form has default action attribute when not provided', async () => {
            const screen = render(LoginForm, {
                props: {
                    literals: defaultLiterals,
                    errors: { fields: {} },
                    enhance: createEnhanceMock(),
                    signupHref: '/signup'
                }
            })

            const form = screen.getByRole('form')
            await expect.element(form).toHaveAttribute('action', '/login')
        })
    })
})
