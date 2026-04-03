import prettier from 'eslint-config-prettier'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import svelteConfig from './svelte.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

export default defineConfig(
    [
        includeIgnoreFile(gitignorePath),
        js.configs.recommended,
        svelte.configs.recommended,
        {
            rules: {
                'svelte/no-navigation-without-resolve': 'off'
            }
        },
        {
            languageOptions: { globals: { ...globals.browser, ...globals.node } }
        },
        {
            files: ['**/*.svelte', '**/*.svelte.js'],
            languageOptions: { parserOptions: { svelteConfig } }
        }
    ],
    prettier,
    svelte.configs.prettier
)
