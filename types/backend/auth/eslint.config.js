import prettier from 'eslint-config-prettier'
import path from 'node:path'
import { includeIgnoreFile } from '@eslint/compat'
import ts from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore')

export default defineConfig([includeIgnoreFile(gitignorePath), ...ts.configs.recommended], prettier)
