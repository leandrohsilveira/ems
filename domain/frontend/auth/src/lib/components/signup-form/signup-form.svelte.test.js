import { describe, it, expect, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import SignupForm from './signup-form.svelte'
import { createEnhanceMock } from '@ems/ui/testing'

describe('SignupForm', () => {
    describe('Component Props & Structure', () => {
        it('renders with empty errors prop', async () => {
            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            // Form should be visible
            const form = screen.getByRole('form')
            await expect.element(form).toBeVisible()

            // Check for each input field individually
            await expect.element(screen.getByLabelText('Username')).toBeVisible()
            await expect.element(screen.getByLabelText('Email')).toBeVisible()
            await expect.element(screen.getByLabelText('First Name (Optional)')).toBeVisible()
            await expect.element(screen.getByLabelText('Last Name (Optional)')).toBeVisible()
            await expect.element(screen.getByLabelText('Password', { exact: true })).toBeVisible()
            await expect.element(screen.getByLabelText('Confirm Password')).toBeVisible()
        })

        it('accepts errors and errorMessage props', async () => {
            const errors = {
                fields: {
                    username: ['Username is required'],
                    email: ['Invalid email format']
                }
            }
            const errorMessage = 'General error occurred'

            const screen = render(SignupForm, {
                props: { errors, errorMessage, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            // Form should render without throwing
            const formElement = screen.getByRole('form')
            await expect.element(formElement).toBeVisible()
        })

        it('renders all form fields with correct labels', async () => {
            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            // Check all field labels
            const labels = [
                'Username',
                'Email',
                'First Name (Optional)',
                'Last Name (Optional)',
                'Password',
                'Confirm Password'
            ]

            for (const labelText of labels) {
                const label = screen.getByText(labelText, { exact: true })
                await expect.element(label).toBeVisible()
            }
        })

        it('renders "(Optional)" for firstName and lastName labels', async () => {
            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            const firstNameLabel = screen.getByText('First Name (Optional)')
            const lastNameLabel = screen.getByText('Last Name (Optional)')

            await expect.element(firstNameLabel).toBeVisible()
            await expect.element(lastNameLabel).toBeVisible()
        })

        it('renders submit button with "Sign Up" text', async () => {
            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            const button = screen.getByRole('button', { hasText: /sign up/i })
            await expect.element(button).toBeVisible()
        })

        it('renders login link with correct text and href', async () => {
            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            const linkText = screen.getByText('Already have an account?')
            const link = screen.getByText('Sign In')

            await expect.element(linkText).toBeVisible()
            await expect.element(link).toBeVisible()
            await expect.element(link).toHaveAttribute('href', '/login')
        })

        it('renders logo badge with "EMS" text', async () => {
            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            const logo = screen.getByText('EMS')
            await expect.element(logo).toBeVisible()
        })
    })

    describe('Error Display', () => {
        it('displays field-specific errors from errors prop', async () => {
            const errors = {
                fields: {
                    username: ['Username must be 3-30 characters'],
                    email: ['Please enter a valid email address'],
                    password: ['Password must be at least 8 characters']
                }
            }

            const screen = render(SignupForm, {
                props: { errors, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            // Check error messages are displayed
            const usernameError = screen.getByText('Username must be 3-30 characters')
            const emailError = screen.getByText('Please enter a valid email address')
            const passwordError = screen.getByText('Password must be at least 8 characters')

            await expect.element(usernameError).toBeVisible()
            await expect.element(emailError).toBeVisible()
            await expect.element(passwordError).toBeVisible()
        })

        it('displays general error from errorMessage prop', async () => {
            const errorMessage = 'Something went wrong. Please try again.'

            const screen = render(SignupForm, {
                props: { errorMessage, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            const generalError = screen.getByText('Something went wrong. Please try again.')
            await expect.element(generalError).toBeVisible()
        })

        it('sets aria-invalid="true" on fields with errors', async () => {
            const errors = {
                fields: {
                    username: ['Invalid username'],
                    email: ['Invalid email']
                }
            }

            const screen = render(SignupForm, {
                props: { errors, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            // Check username input
            const usernameInput = screen.getByLabelText('Username')
            await expect.element(usernameInput).toHaveAttribute('aria-invalid', 'true')

            // Check email input
            const emailInput = screen.getByLabelText('Email')
            await expect.element(emailInput).toHaveAttribute('aria-invalid', 'true')
        })

        it('does not set aria-invalid on fields without errors', async () => {
            const errors = {
                fields: {
                    username: ['Invalid username']
                    // email has no error
                }
            }

            const screen = render(SignupForm, {
                props: { errors, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            // Username input should have aria-invalid
            const usernameInput = screen.getByLabelText('Username')
            await expect.element(usernameInput).toHaveAttribute('aria-invalid', 'true')

            // Email input should not have aria-invalid="true"
            const emailInput = screen.getByLabelText('Email')
            await expect.element(emailInput).not.toHaveAttribute('aria-invalid', 'true')
        })
    })

    describe('Enhance Integration & Loading State', () => {
        it('manages loading state internally via enhance callback', async () => {
            const update$ = Promise.withResolvers()

            const update = vi.fn().mockReturnValue(update$.promise)
            const onSubmit = vi.fn().mockReturnValue({ type: 'success', status: 200 })
            const enhance = createEnhanceMock({ onSubmit, update })

            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance, loginHref: '/login' }
            })

            const usernameInput = screen.getByLabelText('Username')
            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password', { exact: true })
            const confirmPasswordInput = screen.getByLabelText('Confirm Password')
            const button = screen.getByRole('button', { hasText: /sign up/i })

            // Initially not loading
            await expect.element(button).not.toBeDisabled()
            await expect.element(usernameInput).not.toBeDisabled()
            await expect.element(emailInput).not.toBeDisabled()
            await expect.element(passwordInput).not.toBeDisabled()
            await expect.element(confirmPasswordInput).not.toBeDisabled()

            // fill the form to be valid
            await usernameInput.fill('testuser')
            await emailInput.fill('test@example.com')
            await passwordInput.fill('password123')
            await confirmPasswordInput.fill('password123')

            // Submit form
            await button.click()

            // Should be in loading state
            await expect.element(button).toBeDisabled()
            await expect.element(usernameInput).toBeDisabled()
            await expect.element(emailInput).toBeDisabled()
            await expect.element(passwordInput).toBeDisabled()
            await expect.element(confirmPasswordInput).toBeDisabled()

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
                    expect(formData.get('email')).toBe('test@example.com')
                    expect(formData.get('password')).toBe('password123')
                    expect(formData.get('confirmPassword')).toBe('password123')

                    return {
                        type: 'success',
                        status: 200
                    }
                }
            )
            const enhance = createEnhanceMock({ onSubmit })

            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance, loginHref: '/login' }
            })

            // Fill form
            const usernameInput = screen.getByLabelText('Username')
            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password', { exact: true })
            const confirmPasswordInput = screen.getByLabelText('Confirm Password')
            const button = screen.getByRole('button', { hasText: /sign up/i })

            await usernameInput.fill('testuser')
            await emailInput.fill('test@example.com')
            await passwordInput.fill('password123')
            await confirmPasswordInput.fill('password123')

            // Submit form
            await button.click()

            // Verify onSubmit was called with form data
            expect(onSubmit).toHaveBeenCalledOnce()
        })

        it('calls update function after form submission', async () => {
            const update = vi.fn().mockResolvedValue(undefined)
            const onSubmit = vi.fn().mockReturnValue({ type: 'success', status: 200 })
            const enhance = createEnhanceMock({ onSubmit, update })

            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance, loginHref: '/login' }
            })

            // Fill form
            const usernameInput = screen.getByLabelText('Username')
            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password', { exact: true })
            const confirmPasswordInput = screen.getByLabelText('Confirm Password')
            const button = screen.getByRole('button', { hasText: /sign up/i })

            await usernameInput.fill('testuser')
            await emailInput.fill('test@example.com')
            await passwordInput.fill('password123')
            await confirmPasswordInput.fill('password123')
            await button.click()

            // Update should be called
            expect(update).toHaveBeenCalledTimes(1)
        })

        it('disables all form fields during loading state', async () => {
            const update$ = Promise.withResolvers()
            const update = vi.fn().mockReturnValue(update$.promise)
            const onSubmit = vi.fn().mockReturnValue({ type: 'success', status: 200 })
            const enhance = createEnhanceMock({ onSubmit, update })

            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance, loginHref: '/login' }
            })

            const usernameInput = screen.getByLabelText('Username')
            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password', { exact: true })
            const confirmPasswordInput = screen.getByLabelText('Confirm Password')
            const button = screen.getByRole('button', { hasText: /sign up/i })

            await usernameInput.fill('testuser')
            await emailInput.fill('test@example.com')
            await passwordInput.fill('password123')
            await confirmPasswordInput.fill('password123')
            await button.click()

            // Check each field is disabled during loading
            await expect.element(usernameInput).toBeDisabled()
            await expect.element(emailInput).toBeDisabled()
            await expect.element(screen.getByLabelText('First Name (Optional)')).toBeDisabled()
            await expect.element(screen.getByLabelText('Last Name (Optional)')).toBeDisabled()
            await expect.element(passwordInput).toBeDisabled()
            await expect.element(confirmPasswordInput).toBeDisabled()
        })
    })

    describe('Form Attributes', () => {
        it('input elements have correct name attributes', async () => {
            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            // Check each field has correct name attribute
            await expect
                .element(screen.getByLabelText('Username'))
                .toHaveAttribute('name', 'username')
            await expect.element(screen.getByLabelText('Email')).toHaveAttribute('name', 'email')
            await expect
                .element(screen.getByLabelText('First Name (Optional)'))
                .toHaveAttribute('name', 'firstName')
            await expect
                .element(screen.getByLabelText('Last Name (Optional)'))
                .toHaveAttribute('name', 'lastName')
            await expect
                .element(screen.getByLabelText('Password', { exact: true }))
                .toHaveAttribute('name', 'password')
            await expect
                .element(screen.getByLabelText('Confirm Password'))
                .toHaveAttribute('name', 'confirmPassword')
        })

        it('password fields have type="password"', async () => {
            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            // Password field
            const passwordInput = screen.getByLabelText('Password', { exact: true })
            await expect.element(passwordInput).toHaveAttribute('type', 'password')

            // Confirm password field
            const confirmPasswordInput = screen.getByLabelText('Confirm Password')
            await expect.element(confirmPasswordInput).toHaveAttribute('type', 'password')
        })

        it('form has correct action attribute', async () => {
            const screen = render(SignupForm, {
                props: {
                    errors: { fields: {} },
                    enhance: createEnhanceMock(),
                    action: '/custom-signup',
                    loginHref: '/login'
                }
            })

            const form = screen.getByRole('form')
            await expect.element(form).toHaveAttribute('action', '/custom-signup')
        })

        it('form has default action attribute when not provided', async () => {
            const screen = render(SignupForm, {
                props: { errors: { fields: {} }, enhance: createEnhanceMock(), loginHref: '/login' }
            })

            const form = screen.getByRole('form')
            await expect.element(form).toHaveAttribute('action', '/signup')
        })
    })
})
