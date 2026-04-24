<script>
    import { cn } from '../../utils/index.js'

    /** @import { CenteredLayoutProps } from './types.js' */

    /** @type {CenteredLayoutProps} */
    let { children, class: className, testId = 'centered-layout' } = $props()
</script>

<div
    data-testid={testId}
    class={cn('flex min-h-screen items-center justify-center p-4', className)}
>
    {@render children()}
</div>
