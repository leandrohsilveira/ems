import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import SignupSuccess from './signup-success.svelte'
import { defaultLiterals } from './signup-success.i18n.js'

describe('SignupSuccess', () => {
    describe('Component Props & Structure', () => {
        it('renders with required loginHref prop', async () => {
            const screen = render(SignupSuccess, {
                props: { literals: defaultLiterals, loginHref: '/login' }
            })

            // Component should render without throwing
            const paperElement = screen.getByTestId('signup-success-paper-root')
            await expect.element(paperElement).toBeVisible()
        })

        it('accepts loginHref prop and uses it for link', async () => {
            const screen = render(SignupSuccess, {
                props: { literals: defaultLiterals, loginHref: '/custom-login' }
            })

            // Check login link has correct href
            const link = screen.getByText(defaultLiterals.loginLink)
            await expect.element(link).toBeVisible()
            await expect.element(link).toHaveAttribute('href', '/custom-login')
        })
    })

    describe('Content Display', () => {
        it('displays all fixed text content', async () => {
            const screen = render(SignupSuccess, {
                props: { literals: defaultLiterals, loginHref: '/login' }
            })

            // Check all text content
            await expect.element(screen.getByText(defaultLiterals.header)).toBeVisible()
            await expect.element(screen.getByText(defaultLiterals.successMessage)).toBeVisible()
            await expect
                .element(screen.getByText(defaultLiterals.emailVerificationMessage))
                .toBeVisible()
            await expect.element(screen.getByText(defaultLiterals.loginLink)).toBeVisible()
        })

        it('displays success icon', async () => {
            const screen = render(SignupSuccess, {
                props: { literals: defaultLiterals, loginHref: '/login' }
            })

            // Icon should be visible (check for SVG or icon element)
            // Since it's an SVG component, we can check for its presence
            const icon = screen.getByLabelText(defaultLiterals.successIconAria)
            await expect.element(icon).toBeVisible()
        })
    })
})
