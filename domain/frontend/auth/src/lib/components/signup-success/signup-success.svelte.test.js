import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import SignupSuccess from './signup-success.svelte'

describe('SignupSuccess', () => {
    describe('Component Props & Structure', () => {
        it('renders with required loginHref prop', async () => {
            const screen = render(SignupSuccess, {
                props: { loginHref: '/login' }
            })

            // Component should render without throwing
            const paperElement = screen.getByTestId('signup-success-paper-root')
            await expect.element(paperElement).toBeVisible()
        })

        it('accepts loginHref prop and uses it for link', async () => {
            const screen = render(SignupSuccess, {
                props: { loginHref: '/custom-login' }
            })

            // Check login link has correct href
            const link = screen.getByText('Go to Login')
            await expect.element(link).toBeVisible()
            await expect.element(link).toHaveAttribute('href', '/custom-login')
        })
    })

    describe('Content Display', () => {
        it('displays all fixed text content', async () => {
            const screen = render(SignupSuccess, {
                props: { loginHref: '/login' }
            })

            // Check all text content
            await expect.element(screen.getByText('Sign Up Successful')).toBeVisible()
            await expect
                .element(screen.getByText('Your account has been created successfully.'))
                .toBeVisible()
            await expect
                .element(
                    screen.getByText('Please check your email to click the verification link.')
                )
                .toBeVisible()
            await expect.element(screen.getByText('Go to Login')).toBeVisible()
        })

        it('displays success icon', async () => {
            const screen = render(SignupSuccess, {
                props: { loginHref: '/login' }
            })

            // Icon should be visible (check for SVG or icon element)
            // Since it's an SVG component, we can check for its presence
            const icon = screen.getByLabelText('Success icon')
            await expect.element(icon).toBeVisible()
        })
    })
})
