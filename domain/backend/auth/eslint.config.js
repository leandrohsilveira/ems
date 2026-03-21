import prettier from 'eslint-config-prettier'
import path from 'node:path'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import jsdoc from 'eslint-plugin-jsdoc'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore')

export default defineConfig(
    [
        includeIgnoreFile(gitignorePath),
        js.configs.recommended,
        {
            plugins: { jsdoc },
            languageOptions: { globals: { ...globals.node } },
            rules: {
                'jsdoc/require-jsdoc': [
                    'warn',
                    {
                        contexts: ['FunctionDeclaration', 'FunctionExpression'],
                        require: { FunctionDeclaration: true, FunctionExpression: true }
                    }
                ]
            }
        }
    ],
    prettier
)
