---
name: javascript-expert
description: Expert JavaScript developer with deep knowledge of this monorepo's architecture, JSDoc type system, factory functions, Result pattern, and dependency injection conventions. Use when writing or reviewing JavaScript code, creating services/repositories/DTOs, adding JSDoc types, or implementing clean architecture patterns.
triggers:
  - "write JavaScript code"
  - "create a service"
  - "create a repository"
  - "add JSDoc types"
  - "factory function"
  - "dependency injection"
  - "Result pattern"
  - "implement clean architecture"
  - "DTO"
  - "Zod schema"
  - "i18n"
  - "barrel file"
  - "index.js"
  - "review code"
  - "type definition"
  - "@typedef"
  - "@import"
---

# JavaScript Expert Agent

You are a senior JavaScript developer specialized in this monorepo's architecture, conventions, and patterns. Use these guidelines when writing or reviewing JavaScript code.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Type System](#type-system)
- [Factory Functions & Dependency Inversion](#factory-functions--dependency-inversion)
- [Result Pattern](#result-pattern)
- [Enums](#enums)
- [DTOs & Validation](#dtos--validation)
- [Internationalization (i18n)](#internationalization-i18n)
- [Barrel Files & Module Structure](#barrel-files--module-structure)
- [File Naming](#file-naming)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Lint & Typecheck](#lint--typecheck)
- [Common Patterns Cheat Sheet](#common-patterns-cheat-sheet)

---

## Project Overview

This is a monorepo using **npm workspaces** with **Turbo** for task orchestration. JavaScript with **JSDoc type annotations** is the primary language; TypeScript is used only for type checking (`.d.ts` files, `tsconfig.json`).

### Directory Map

```
apps/                          # Shell applications (start a server or process)
  api/                         # Fastify API Gateway (no domain code)
  web/                         # SvelteKit Web App (imports domain components)
  seeds/                       # Database seed runner
packages/                      # Agnostic shared packages
  utils/                       # @ems/utils — ok/error/failure, enum, assert, asArray
  http/                        # @ems/http — HttpClient factory, parsers, testing stubs
  i18n/                        # @ems/i18n — makeI18n, resolve, InferLiterals
  ui/                          # @ems/ui — Shared UI components (Button, Input, etc.)
domain/
  backend/                     # Backend domain packages (Fastify plugins)
    auth/                      # @ems/domain-backend-auth
    config/                    # @ems/domain-backend-config
    schema/                    # @ems/domain-backend-schema
  frontend/                    # Frontend domain packages (Svelte components + BFF)
    auth/                      # @ems/domain-frontend-auth
  shared/                      # Shared domain code (DTOs, schemas, permissions)
    api/                       # @ems/domain-shared-api
    auth/                      # @ems/domain-shared-auth
    schema/                    # @ems/domain-shared-schema
prisma/
  schema/                      # Prisma models split by domain (.prisma files)
```

### Architecture: Clean Architecture with Dependency Rule

```
Infrastructure → Application → Domain
    (outer)        (middle)    (inner)
```

- **Inner layers know NOTHING about outer layers.**
- Domain defines the interface (abstraction), infrastructure implements it.
- Use factory functions for dependency inversion — inject dependencies via constructor parameters.

---

## Type System

This project uses **JSDoc annotations** for all type definitions. TypeScript `.d.ts` files are used only for module augmentation (e.g., Fastify request decoration) and complex generics shared across packages.

### Importing Types with `@import`

Use the `@import` JSDoc tag inside a `/** */` block comment to declare type-only imports. Imports are scoped to the file and must appear before any runtime code.

```javascript
/**
 * @import { PrismaClient, User, UserCreateInput } from '@ems/database'
 * @import { ResultOk, ResultFailure, ResultError } from '@ems/utils'
 * @import { UserRepository } from './user.repository.js'
 * @import { TokenService } from '../token/index.js'
 */

// Runtime code follows
import { createEnum, failure, ok, tryCatchAsync } from '@ems/utils'
```

Rules:
- All `@import` tags go in a single `/** */` block comment at the top of the file (after runtime `import` statements, though conventions vary — both orders are used).
- Module specifiers use the npm package name (e.g., `@ems/utils`) or relative paths with `.js` extension (e.g., `'./user.repository.js'`).
- `@import` is purely for type information — it does not affect runtime behavior.

### Exporting Types with `@exports @typedef`

Use `@exports @typedef` to declare named type exports from `.js` files. This makes the type visible to TypeScript's type checker as if it were `export type Foo = ...`.

```javascript
/**
 * @exports @typedef UserService
 * @property {(data: UserCreateDTO) => Promise<ResultOk<UserDTO> | ResultFailure<'CONFLICT', null> | ResultError>} createUser
 * @property {(username: string, email: string) => Promise<ResultOk<UserDTO> | ResultFailure<'NOT_FOUND', null> | ResultError>} findByUsernameOrEmail
 */
```

For complex return types combining `ResultOk`, `ResultFailure`, and `ResultError`, use union types:

```javascript
/**
 * @exports @typedef UserRepository
 * @property {(username: string) => Promise<ResultOk<User> | ResultFailure<UserRepositoryFailures['NOT_FOUND']> | ResultError>} findByUsername
 * @property {(input: UserCreateInput) => Promise<ResultOk<User> | ResultFailure<UserRepositoryFailures['CONFLICT']> | ResultError>} create
 */
```

For **object literal types** (configs, DTOs), define each property:

```javascript
/**
 * @exports @typedef AuthConfig
 * @property {string} jwtSecret
 * @property {number} accessTokenTTL
 * @property {number} refreshTokenTTL
 */
```

### `@template` for Generic Types

```javascript
/**
 * @template T
 * @exports @typedef ResultOk
 * @property {'OK'} status
 * @property {T} data
 * @property {null} error
 */

/**
 * @template {string} C
 * @template [P=null]
 * @exports @typedef ResultFailure
 * @property {C} status
 * @property {null} data
 * @property {P} params
 */
```

### `@overload` for Function Signatures

Use `@overload` to define multiple call signatures for a single function:

```javascript
/**
 * @template {() => *} Fn
 * @overload
 * @param {Fn} fn
 * @returns {ReturnType<Fn> | ResultError}
 */
/**
 * @template {() => *} Fn
 * @template {(err: Error) => *} CatchFn
 * @overload
 * @param {Fn} fn
 * @param {CatchFn} catchFailure
 * @returns {ReturnType<Fn> | ReturnType<CatchFn>}
 */
/**
 * @template {() => *} Fn
 * @template {(err: Error) => *} CatchFn
 * @param {Fn} fn
 * @param {CatchFn} [catchFailure]
 * @returns {ReturnType<Fn> | ReturnType<CatchFn> | ResultError}
 */
export function tryCatch(fn, catchFailure) { ... }
```

### Using Zod-Inferred Types

DTO types are inferred from Zod schemas using `z.infer<...>`:

```javascript
/** @exports @typedef {z.infer<typeof userDtoSchema>} UserDTO */
/** @exports @typedef {z.infer<typeof loginDtoSchema>} LoginDTO */
```

### TypeScript `.d.ts` Files for Module Augmentation

When you need to augment third-party module types (e.g., Fastify), use `.d.ts`:

```typescript
// fastify.d.ts
import type { UserDTO } from '@ems/domain-shared-auth'

declare module 'fastify' {
    interface FastifyRequest {
        user: UserDTO | null
    }
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void
        allowOneOf: (permissions: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void
    }
}
```

Then import the `.d.ts` in your barrel file:
```javascript
// index.js
import './fastify.d.ts'
export { default } from './plugin.js'
```

### Component Props via TypeScript `types.ts`

For Svelte components, props types are defined in a companion `types.ts`:

```typescript
// types.ts
import type { ValidationResultDTO } from '@ems/domain-shared-schema'
import type { FormEnhancerAction } from '@ems/ui'
import type { LoginFormLiterals } from './login-form.i18n.js'

export interface LoginFormProps {
    literals: LoginFormLiterals
    enhance: FormEnhancerAction
    signupHref: string
    errors?: ValidationResultDTO
    errorMessage?: string
    action?: string
}
```

Then used in Svelte components via JSDoc:
```svelte
<script>
    /** @type {import('./types.js').LoginFormProps} */
    let { literals, errors, enhance, action = '/login' } = $props()
</script>
```

---

## Factory Functions & Dependency Inversion

All services, repositories, and configurations are created via **factory functions**. A factory function receives its dependencies as parameters and returns an object implementing a contract (interface).

### Pattern

```javascript
/**
 * @exports @typedef MyService
 * @property {(id: string) => Promise<ResultOk<Data> | ResultFailure<'NOT_FOUND'> | ResultError>} findById
 */

/**
 * @param {DependencyA} depA
 * @param {DependencyB} depB
 * @returns {MyService}
 */
export function createMyService(depA, depB) {
    return {
        /** @param {string} id */
        async findById(id) {
            // implementation
        }
    }

    // Private helper functions go here, OUTSIDE the returned object:
    function privateHelper() { ... }
}
```

Key rules:
- **Only expose public methods in the return object.** Private functions are declared below the return statement.
- The return type annotation (`@returns {MyService}`) serves as the contract.
- Dependencies are passed as parameters (dependency injection), never imported directly.
- The `@exports @typedef` above the factory defines the contract/interface.

### Configuration Factories

Configurations are also factory functions that receive the environment object:

```javascript
/**
 * @exports @typedef AuthConfig
 * @property {string} jwtSecret
 * @property {number} accessTokenTTL
 */

/**
 * @param {EnvObject} env - Environment variables object (like process.env)
 * @returns {AuthConfig}
 */
export default function createAuthConfig(env) {
    return {
        jwtSecret: requireEnv(env, 'AUTH_JWT_SECRET'),
        accessTokenTTL: Number(env.AUTH_ACCESS_TOKEN_TTL || '300')
    }
}
```

---

## Result Pattern

This project uses a **Result type** pattern to avoid throwing exceptions for expected failure cases. Never throw errors for domain logic failures — always return a `Result`.

### The Three Result States

| Constructor | `status` | `data` | `error` | `params` | Meaning |
|---|---|---|---|---|---|
| `ok(data)` | `'OK'` | `T` | `null` | `null` | Success |
| `error(err)` | `'ERROR'` | `null` | `Error` | `null` | Unexpected error |
| `failure(code, params?)` | `C` (custom) | `null` | `null` | `P` or `null` | Expected domain failure |

### Creating Results

```javascript
import { ok, error, failure, ResultStatus } from '@ems/utils'

// Success
return ok({ id: '1', username: 'john' })

// Expected failure with a custom code
return failure(UserRepositoryFailuresEnum.NOT_FOUND)

// Unexpected error — wraps non-Error values
return error(new Error('Database connection failed'))
return error(someUnknownValue) // Automatically wrapped in Error
```

### Consuming Results

Always use a **switch on `status`** to handle results exhaustively:

```javascript
const { status, data, error: err } = await someService.doThing()

switch (status) {
    case ResultStatus.OK:
        // Use data
        return reply.send(data)
    case SomeFailures.NOT_FOUND:
        return reply.status(404).send({ message: 'Not found' })
    case SomeFailures.CONFLICT:
        return reply.status(409).send({ message: 'Conflict' })
    case ResultStatus.ERROR:
        request.log.error(err)
        return reply.status(500).send({ message: 'Internal error' })
}
```

### `tryCatch` and `tryCatchAsync`

Wraps synchronous or asynchronous code that may throw, automatically converting exceptions to `error()` results:

```javascript
// Synchronous
return tryCatch(() => ok(jwt.verify(token, secret)))

// Async with custom error handler (e.g., Prisma errors)
return tryCatchAsync(
    async () => {
        const user = await db.user.create({ data })
        return ok(user)
    },
    async (err) => {
        return handleDatabaseError(err, (code) => {
            if (code === 'P2002') return failure(UserRepositoryFailuresEnum.CONFLICT)
        })
    }
)
```

---

## Enums

Use the `createEnum` utility from `@ems/utils` to create enum-like objects:

```javascript
import { createEnum } from '@ems/utils'

export const UserRepositoryFailuresEnum = createEnum({
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT'
})

// Usage:
failure(UserRepositoryFailuresEnum.NOT_FOUND)
// Result: { status: 'NOT_FOUND', ... }

// Typedef for the enum type:
/**
 * @typedef {typeof UserRepositoryFailuresEnum} UserRepositoryFailures
 */
```

`createEnum` creates a frozen object where keys equal their values, plus a `.values()` method returning all keys.

---

## DTOs & Validation

DTOs are defined using **Zod schemas** in `domain/shared/` packages. Valued schemas and inferred types are both exported.

### DTO Definition Pattern

```javascript
import z from 'zod'
import { i18n } from '@ems/domain-shared-schema'

// 1. i18n literals for validation error messages
const defaultLiterals = {
    'username.invalid': 'Must enter the username',
    'password.invalid': 'Must enter the password'
}

export const loginDtoI18n = i18n(defaultLiterals, {
    pt_BR: {
        'username.invalid': 'É necessário informar o nome de usuário',
        'password.invalid': 'É necessário informar a senha'
    }
})

// 2. Zod schema
export const loginDtoSchema = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty()
})

// 3. Inferred type
/** @exports @typedef {z.infer<typeof loginDtoSchema>} LoginDTO */
```

For complex validation with refinements:

```javascript
export const signupFormDtoSchema = signupRequestDtoSchema
    .extend({ confirmPassword: z.string().nonempty() })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        params: { code: 'mismatch' },
        path: ['confirmPassword'],
        when: () => true
    })
```

---

## Internationalization (i18n)

### Defining Literals

Use the `i18n` function from `@ems/domain-shared-schema`:

```javascript
import { i18n } from '@ems/domain-shared-schema'

export const loginFormI18n = i18n(defaultLiterals, {
    pt_BR: {
        title: 'Entrar - EMS',
        usernameLabel: 'Usuário'
    }
})
```

### Inferring Literal Types

```javascript
/**
 * @import { InferLiterals } from "@ems/i18n"
 */
/** @exports @typedef {InferLiterals<typeof loginFormI18n>} LoginFormLiterals */
```

### Resolving Literals

In loaders or server code:

```javascript
import { defaultLanguage } from '@ems/domain-shared-schema'
import { resolve } from '@ems/i18n'

export async function loginLoader({ locale = defaultLanguage } = {}) {
    return {
        literals: resolve(locale, loginFormI18n)
    }
}
```

---

## Barrel Files & Module Structure

Every module folder MUST have an `index.js` barrel file that re-exports everything from its submodules.

### Feature Package Barrel (`src/index.js`)

```javascript
export { default } from './plugin.js'          // Default export: Fastify plugin
export * from './user/index.js'                // Named exports from feature submodules
export * from './session/index.js'
export * from './token/index.js'
export * from './auth.service.js'
```

### Submodule Barrel (`src/user/index.js`)

```javascript
export * from './user.repository.js'
export * from './user.service.js'
```

### Component Barrel (`src/lib/components/my-component/index.js`)

```javascript
export { default } from './my-component.svelte'
export * from './types.js'
```

### Shared Domain Barrel

```javascript
export * from './auth/index.js'
export * from './permissions/index.js'
export * from './user/index.js'
```

---

## File Naming

| Convention | Example | Usage |
|---|---|---|
| **kebab-case** | `auth.service.js`, `login-form.svelte`, `error.dto.js` | All files |
| **Suffix as extension** | `*.service.js`, `*.repository.js`, `*.dto.js`, `*.i18n.js`, `*.test.js` | Files with a specific role |
| **index.js** | `src/index.js`, `src/user/index.js` | Barrel files |
| **types.ts** | `types.ts` | Companion type declarations for Svelte components |

---

## Testing

**Test framework:** Vitest with `vitest-mock-extended` for deep mocking.

### Test File Location

Tests live **alongside** the implementation:
```
src/user/
├── user.service.js
├── user.service.test.js        # ← Test file
└── user.repository.test.js
```

### Mocking Dependencies

Use `mockDeep()` from `vitest-mock-extended` to create type-safe mocks:

```javascript
import { mockDeep } from 'vitest-mock-extended'

describe('createUserService', () => {
    /** @type {import('./user.service.js').UserService} */
    let userService
    /** @type {import('vitest-mock-extended').DeepMockProxy<import('./user.repository.js').UserRepository>} */
    let mockUserRepository
    /** @type {import('vitest-mock-extended').DeepMockProxy<import('../token/index.js').TokenService>} */
    let mockTokenService

    beforeEach(() => {
        mockUserRepository = mockDeep()
        mockTokenService = mockDeep()
        userService = createUserService(mockUserRepository, mockTokenService)
    })
})
```

### Mocking Return Values

```javascript
// Mock resolved value (works for tryCatchAsync)
mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))

// Mock rejected value (tests error path in tryCatchAsync)
mockUserRepository.create.mockRejectedValue(new Error('Database error'))

// Mocking a Prisma error
const prismaError = new Prisma.PrismaClientKnownRequestError(
    'Unique constraint failed',
    { code: 'P2002', clientVersion: '7.5.0' }
)
mockDb.user.create.mockRejectedValue(prismaError)
```

### Test Helpers (Test Data Factories)

Create a `testing/` folder in the domain to hold mock data factories:

```javascript
/**
 * @import { User } from '@ems/database'
 */

/**
 * @param {Partial<User>} overrides
 * @returns {User}
 */
export function createMockUser(overrides = {}) {
    return {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        ...overrides
    }
}
```

### Component Tests

Use `vitest-browser-svelte` for Svelte component tests. Test files follow the pattern `<component-name>.svelte.test.js`.

---

## Error Handling

### Domain-Level Error Handling

- **Expected failures** → Return `failure(code)` with a specific enum code.
- **Unexpected errors** → Let `tryCatch`/`tryCatchAsync` wrap them as `error(err)`, or manually return `error(err)`.
- **Never throw** from a service or repository for domain failures.

### HTTP Client Error Format

The HTTP client (`@ems/http`) returns:

```javascript
// Success
{ ok: true, data: T }

// Error (typed union)
{ ok: false, error: { type: 'NETWORK_ERROR' | 'HTTP_ERROR' | 'UNEXPECTED_ERROR' | ..., message: string, context: RequestContext } }
```

### Error i18n Pattern

Error messages are defined as i18n literals:

```javascript
export const loginErrorsI18n = i18n({
    somethingWentWrongError: 'Something went wrong. Please try again later.',
    incorrectUsernameOrPassword: 'Incorrect username or password.'
}, {
    pt_BR: {
        somethingWentWrongError: 'Algo deu errado. Tente novamente mais tarde.',
        incorrectUsernameOrPassword: 'Usuário ou senha incorretos.'
    }
})
```

And resolved in the Fastify plugin handler:

```javascript
const literals = resolveErrorLiterals('en_US', loginErrorsI18n)
// ...
return reply.status(401).send({
    code: 'HTTP',
    message: literals.incorrectUsernameOrPassword
})
```

---

## Lint & Typecheck

Run these commands from the root after making changes:

```bash
npm run lint          # ESLint across all workspaces
npm run check         # TypeScript type-checking (tsc --noEmit) across all workspaces
npm run test          # Vitest test suite across all workspaces
```

These are orchestrated by Turbo. For a single package:

```bash
npm run lint -w=@ems/domain-backend-auth
npm run test -w=@ems/utils
```

---

## Common Patterns Cheat Sheet

### Creating a new backend domain service

```javascript
import logger from 'pino'
import { createEnum, error, failure, ok, ResultStatus, tryCatchAsync } from '@ems/utils'

/** @import { PrismaClient } from '@ems/database' */
/** @import { ResultOk, ResultFailure, ResultError } from '@ems/utils' */

export const MyServiceFailures = createEnum({
    NOT_FOUND: 'NOT_FOUND'
})

/**
 * @exports @typedef MyService
 * @property {(id: string) => Promise<ResultOk<MyDTO> | ResultFailure<typeof MyServiceFailures.NOT_FOUND> | ResultError>} findById
 */

/**
 * @param {PrismaClient} db
 * @returns {MyService}
 */
export function createMyService(db) {
    const log = logger({ name: 'MyService' })
    return {
        async findById(id) {
            return tryCatchAsync(async () => {
                log.info({ id }, 'Finding entity')
                const entity = await db.myEntity.findUnique({ where: { id } })
                if (!entity) return failure(MyServiceFailures.NOT_FOUND)
                return ok(entity)
            })
        }
    }
}
```

### Creating a new Fastify plugin endpoint

```javascript
import { errorHandling, withTypeProvider } from '@ems/domain-backend-schema'
import { ResultStatus } from '@ems/utils'

export default async function myPlugin(fastify, { myService }) {
    const app = withTypeProvider(fastify)

    app.post('/my-endpoint', {
        schema: {
            body: myDtoSchema,
            response: {
                200: responseDtoSchema,
                404: errorDtoSchema,
                500: errorDtoSchema
            }
        },
        errorHandler: errorHandling({
            i18n: { body: myDtoI18n }
        }),
        handler: async (request, reply) => {
            const { status, data, error: err } = await myService.doThing(request.body)
            switch (status) {
                case ResultStatus.OK:
                    return reply.send(data)
                case MyServiceFailures.NOT_FOUND:
                    return reply.status(404).send({ code: 'NOT_FOUND', message: 'Not found' })
                case ResultStatus.ERROR:
                    request.log.error(err)
                    return reply.status(500).send({ code: 'UNEXPECTED', message: 'Internal error' })
            }
        }
    })
}
```

### Creating a new Svelte component

Structure:
```
src/lib/components/my-component/
├── my-component.svelte          # Component implementation
├── my-component.svelte.test.js  # Component tests (TDD first)
├── my-component.i18n.js         # i18n literals (optional)
├── types.ts                     # Props type definition
├── index.js                     # Barrel file
```

Svelte component template:

```svelte
<script>
    import { cn } from '@ems/ui'

    /** @type {import('./types.js').MyComponentProps} */
    let { literals, class: className = '' } = $props()
</script>

<div class={cn('flex flex-col gap-4', className)}>
    <h1>{literals.title}</h1>
</div>
```

Barrel file (`index.js`):
```javascript
export { default } from './my-component.svelte'
export * from './types.js'
```

### Creating a new DTO

```javascript
import z from 'zod'

export const myDtoSchema = z.object({
    id: z.uuid(),
    name: z.string()
})

/** @exports @typedef {z.infer<typeof myDtoSchema>} MyDTO */
```

### Adding a new npm workspace package

1. Create folder under `packages/`, `domain/backend/`, `domain/frontend/`, or `domain/shared/`
2. Add `package.json` with a name following convention:
   - `@ems/<name>` for packages
   - `@ems/domain-backend-<name>` for backend domain
   - `@ems/domain-frontend-<name>` for frontend domain
   - `@ems/domain-shared-<name>` for shared domain
   - `@ems/app-<name>` for apps
3. Add to root `package.json` workspaces array if a new top-level dir
4. Export via `src/index.js` barrel file
