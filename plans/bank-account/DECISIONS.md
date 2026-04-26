# Deviation Log — Bank Account

## Purpose

This document tracks all deviations from the approved implementation plan. Each deviation requires user approval before implementation.

## Deviation Log

| Date | Cycle | Original Plan | Problem Identified | Proposed Solution | Impact | Approval | Implemented |
|------|-------|---------------|-------------------|-------------------|--------|----------|-------------|

## Approved Deviations

| Date | Cycle | Original Plan | Problem Identified | Proposed Solution | Impact | Approval | Implemented |
|------|-------|---------------|-------------------|-------------------|--------|----------|-------------|
| 2026-04-26 | 2 | Create `account-list.dto.js` with custom paginated shape `{ items, pageSize, nextPageToken }` | A shared `pagination.dto.js` was already created ahead of schedule in `@ems/domain-shared-schema` with `createPageDtoSchema()` factory | Use `createPageDtoSchema(accountDtoSchema)` from the shared package instead. Response shape becomes `{ items, size, nextPageCursor }` (field names differ from spec but align with shared convention). | Low — reduces duplication and aligns with shared patterns | Approved | Done |
| 2026-04-26 | 2 | No `account-list-input.dto.js` planned | Shared `pagination.dto.js` provides `pageInputDtoSchema` for paginated list requests | Add step to create `account-list-input.dto.js` leveraging `pageInputDtoSchema` from shared package | Low — new step that adds needed input validation | Approved | Done |
| 2026-04-26 | 3 | Repository input types would be defined during implementation | `AccountListInput`, `AccountListFilterInput`, `PaginationCursor` already defined in `prisma/src/alias.ts` | Reference existing Prisma alias types in repository implementation | Low — types already available, no extra work needed | Approved | Done |
| 2026-04-26 | 3 | All routes protected by blanket auth middleware hook | Blanket `preHandler` blocks public endpoints; granular permissions needed for future flexibility | Use `app.allowOneOf([PERMISSIONS.ACCOUNT_READ|WRITE])` on each route instead of `app.addHook("preHandler", app.authenticate)` | Low — more granular, follows established auth pattern | Approved | Done |
| 2026-04-26 | 3 | Auth middleware registered locally in `auth.middleware.js` | Duplicated code — `@ems/domain-backend-auth` already registers the same middleware | Remove local `auth.middleware.js`; rely on globally registered middleware from auth package | Low — removes duplication | Approved | Done |
| 2026-04-26 | 3 | Pagination cursor computed at service level | Cursor logic is a data access concern, not business logic | Delegate cursor computation to repository (`findAllByUserId` returns `{ items, nextCursor }`); service maps to response shape | Low — clean separation of concerns | Approved | Done |
| 2026-04-26 | 3 | Fastify type augmentations in `@ems/domain-backend-auth` | Side-effect import `import "@ems/domain-backend-auth"` needed in account package to pull types | Move `fastify.d.ts` to `@ems/domain-backend-schema` — shared by all backend plugins | Low — removes fragile side-effect imports | Approved | Done |
| 2026-04-26 | 3 | Account model has no unique constraints | Repository `create()` had unreachable `UNIQUE_CONSTRAINT_FAILED` handler | Remove error handler from `create()` and `CONFLICT` entry from `AccountRepositoryFailuresEnum` | Low — dead code removal | Approved | Done |
| 2026-04-26 | 3 | `Prisma.Decimal` constructor used directly in test helpers | `Prisma.Decimal` is a proper class with many methods; mock objects like `{ toString }` cause type errors | Create `createMockDecimal(balance)` in `@ems/database/testing` with full JSDoc overloads for `string|number|null|undefined` | Low — reusable utility, improves test type safety | Approved | Done |

## Rejected Deviations

*No rejected deviations yet.*
