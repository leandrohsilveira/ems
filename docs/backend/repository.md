# Repository Layer

The repository layer encapsulates data access logic. Each repository is a factory function that receives a `PrismaClient` instance and returns an object with methods for database operations.

## Core Pattern

### Structure

Every repository file follows this structure:

1. **Failures Enum** — Domain-specific failure codes using `createEnum`
2. **Type Definition** — JSDoc `@typedef` for the repository interface
3. **Factory Function** — `create<Entity>Repository(db)` returning the repository object

### Example

```js
// src/user/user.repository.js
import { DatabaseRequestFailures, handleDatabaseError } from '@ems/database'
import { createEnum, failure, ok, tryCatchAsync } from '@ems/utils'

/**
 * @import { PrismaClient, User, UserCreateInput } from '@ems/database'
 * @import { ResultOk, ResultFailure, ResultError } from '@ems/utils'
 */

export const UserRepositoryFailuresEnum = createEnum({
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT'
})

/**
 * @typedef {typeof UserRepositoryFailuresEnum} UserRepositoryFailures
 */

/**
 * @exports @typedef UserRepository
 * @property {(username: string) => Promise<ResultOk<User> | ResultFailure<UserRepositoryFailures['NOT_FOUND']> | ResultError>} findByUsername
 * @property {(input: UserCreateInput) => Promise<ResultOk<User> | ResultFailure<UserRepositoryFailures['CONFLICT']> | ResultError>} create
 */

export function createUserRepository(db) {
    return {
        findByUsername(username) {
            return tryCatchAsync(async () => {
                const user = await db.user.findUnique({ where: { username } })
                if (!user) return failure(UserRepositoryFailuresEnum.NOT_FOUND)
                return ok(user)
            })
        },

        create(data) {
            return tryCatchAsync(
                async () => {
                    const user = await db.user.create({ data })
                    return ok(user)
                },
                async (err) => {
                    return handleDatabaseError(err, (code) => {
                        if (code === DatabaseRequestFailures.UNIQUE_CONSTRAINT_FAILED)
                            return failure(UserRepositoryFailuresEnum.CONFLICT)
                    })
                }
            )
        }
    }
}
```

## Key Concepts

### 1. `tryCatchAsync(fn, catchFailure?)`

Wraps a database operation, catching any thrown errors:
- **No error** — returns whatever `fn` returns (usually `ok(data)` or `failure(Code)`)
- **Error with `catchFailure`** — delegates to `catchFailure` for domain-specific handling
- **Error without `catchFailure`** — returns `error(err)` (generic `ResultError`)

### 2. Result Types

Every repository method returns one of three result shapes:

| Type | When |
|---|---|
| `ok(data)` | Operation succeeded with data |
| `failure(CODE)` | Business-level failure (not found, conflict) |
| `error(err)` | Unexpected error (catch-all) |

### 3. Failure Codes

Define failures specific to the entity's operations. Common ones:

```js
export const EntityRepositoryFailuresEnum = createEnum({
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT'
})
```

### 4. Error Handling with `handleDatabaseError`

Maps Prisma error codes to domain failures:

| Prisma Code | Constant | Repository Mapping |
|---|---|---|
| `P2002` | `UNIQUE_CONSTRAINT_FAILED` | `failure(CONFLICT)` |
| `P2025` | `REQUIRED_RECORDS_NOT_FOUND` | `failure(NOT_FOUND)` |

```js
return handleDatabaseError(err, (code) => {
    if (code === DatabaseRequestFailures.REQUIRED_RECORDS_NOT_FOUND)
        return failure(EntityRepositoryFailuresEnum.NOT_FOUND)
})
```

Unhandled codes fall through to `error(err)`.

## Repository Method Patterns

### Read (find) — returns `ok(entity)` or `failure(NOT_FOUND)`

```js
findByEmail(email) {
    return tryCatchAsync(async () => {
        const entity = await db.entity.findUnique({ where: { email } })
        if (!entity) return failure(EntityRepositoryFailuresEnum.NOT_FOUND)
        return ok(entity)
    })
}
```

### Read Many — returns `ok([])`

```js
findByUserId(userId) {
    return tryCatchAsync(async () => {
        const results = await db.entity.findMany({ where: { userId } })
        return ok(results)
    })
}
```

### Create — returns `ok(entity)` or `failure(CONFLICT)`

```js
create(data) {
    return tryCatchAsync(
        async () => {
            const entity = await db.entity.create({ data })
            return ok(entity)
        },
        async (err) => {
            return handleDatabaseError(err, (code) => {
                if (code === DatabaseRequestFailures.UNIQUE_CONSTRAINT_FAILED)
                    return failure(EntityRepositoryFailuresEnum.CONFLICT)
            })
        }
    )
}
```

### Update — returns `ok(entity)` or `failure(CONFLICT | NOT_FOUND)`

```js
update(id, data) {
    return tryCatchAsync(
        async () => {
            const entity = await db.entity.update({ where: { id }, data })
            return ok(entity)
        },
        async (err) => {
            return handleDatabaseError(err, (code) => {
                if (code === DatabaseRequestFailures.UNIQUE_CONSTRAINT_FAILED)
                    return failure(EntityRepositoryFailuresEnum.CONFLICT)
            })
        }
    )
}
```

Note: Prisma's `update` throws `P2025` if the record does not exist, which by default falls through to `error(err)`. If you want to return `failure(NOT_FOUND)` instead, handle `REQUIRED_RECORDS_NOT_FOUND` as well.

### Delete — returns `ok(null)` or `failure(NOT_FOUND)`

```js
delete(id) {
    return tryCatchAsync(
        async () => {
            await db.entity.delete({ where: { id } })
            return ok(null)
        },
        async (err) => {
            return handleDatabaseError(err, (code) => {
                if (code === DatabaseRequestFailures.REQUIRED_RECORDS_NOT_FOUND)
                    return failure(EntityRepositoryFailuresEnum.NOT_FOUND)
            })
        }
    )
}
```

### Delete Many — returns `ok(null)`

```js
deleteAllByUserId(userId) {
    return tryCatchAsync(async () => {
        await db.entity.deleteMany({ where: { userId } })
        return ok(null)
    })
}
```

`deleteMany` does not throw when no records match, so no `catchFailure` is needed.

## Type Definitions

Use JSDoc `@exports @typedef` to define the repository interface. List every method with its full return type:

```js
/**
 * @exports @typedef EntityRepository
 * @property {(id: string) => Promise<ResultOk<Entity> | ResultFailure<EntityFailures['NOT_FOUND']> | ResultError>} findById
 * @property {(data: EntityCreateInput) => Promise<ResultOk<Entity> | ResultFailure<EntityFailures['CONFLICT']> | ResultError>} create
 */
```

Reference the failures enum type for failure codes:

```js
/** @typedef {typeof EntityFailuresEnum} EntityFailures */
```

## Testing

Use `vitest` with `vitest-mock-extended` (or manual `vi.fn()` mocks) to mock the Prisma client.

### With `vitest-mock-extended`:

```js
import { mockDeep } from 'vitest-mock-extended'

/** @type {DeepMockProxy<import('@ems/database').PrismaClient>} */
let mockDb

beforeEach(() => {
    mockDb = mockDeep()
    repository = createEntityRepository(mockDb)
})
```

### With manual `vi.fn()`:

```js
let mockFindUnique = vi.fn()
let mockCreate = vi.fn()

beforeEach(() => {
    const mockDb = /** @type {import('@ems/database').PrismaClient} */ (
        /** @type {unknown} */ ({
            entity: {
                findUnique: mockFindUnique,
                create: mockCreate
            }
        })
    )
    repository = createEntityRepository(mockDb)
})
```

### Test structure:

```js
describe('findByUsername', () => {
    it('should return ok with entity when found', async () => {
        mockDb.entity.findUnique.mockResolvedValue(mockEntity)
        const result = await repository.findByUsername('test')
        expect(result).toEqual(ok(mockEntity))
    })

    it('should return failure NOT_FOUND when entity not found', async () => {
        mockDb.entity.findUnique.mockResolvedValue(null)
        const result = await repository.findByUsername('nope')
        expect(result).toEqual(failure(EntityFailuresEnum.NOT_FOUND))
    })
})

describe('create', () => {
    it('should return ok with created entity', async () => {
        mockDb.entity.create.mockResolvedValue(mockEntity)
        const result = await repository.create(input)
        expect(result).toEqual(ok(mockEntity))
    })

    it('should return failure CONFLICT on unique constraint', async () => {
        mockDb.entity.create.mockRejectedValue(
            new Prisma.PrismaClientKnownRequestError('msg', { code: 'P2002', clientVersion: '5.0.0' })
        )
        const result = await repository.create(input)
        expect(result).toEqual(failure(EntityFailuresEnum.CONFLICT))
    })
})
```
