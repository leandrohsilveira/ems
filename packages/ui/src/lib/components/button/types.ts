import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'

/**
 * Button visual variants
 */
export type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'

/**
 * Button sizes
 */
export type ButtonSize = 'default' | 'large' | 'icon'

interface AbstractButtonProps {
    element?: 'button' | 'a'
}

interface ButtonElementProps extends AbstractButtonProps, HTMLButtonAttributes {
    element?: 'button'
}

interface AnchorElementProps extends AbstractButtonProps, HTMLAnchorAttributes {
    element: 'a'
}

/**
 * Props for the Button component.
 * Extends HTMLButtonAttributes with additional custom props.
 */
export type ButtonProps = (ButtonElementProps | AnchorElementProps) & {
    /** Visual variant of the button */
    variant?: ButtonVariant
    /** Size of the button */
    size?: ButtonSize
    /** Whether the button is in loading state */
    loading?: boolean

    disabled?: boolean
}
