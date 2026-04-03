import devtoolsJson from 'vite-plugin-devtools-json'
import tailwindcss from '@tailwindcss/vite'
import svg from '@poppanator/sveltekit-svg'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { sveltekit } from '@sveltejs/kit/vite'
import { dependencies } from './package.json'

const depsExcludedFromOptimization = Object.keys(dependencies).filter((dependency) =>
    /^@ems\//.test(dependency)
)

export default defineConfig({
    clearScreen: false,
    optimizeDeps: {
        exclude: depsExcludedFromOptimization
    },
    plugins: [sveltekit(), svg(), tailwindcss(), devtoolsJson()],
    test: {
        expect: { requireAssertions: true },
        projects: [
            {
                extends: './vite.config.js',
                test: {
                    name: 'client',
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium', headless: true }]
                    },
                    include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
                    exclude: ['src/lib/server/**']
                }
            },

            {
                extends: './vite.config.js',
                test: {
                    name: 'server',
                    environment: 'node',
                    include: ['src/**/*.{test,spec}.{js,ts}'],
                    exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
                }
            }
        ]
    }
})
