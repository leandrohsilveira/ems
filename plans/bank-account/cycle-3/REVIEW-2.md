# Cycle 3 Review 2 — Fix Verification

**Verdict:** APPROVE

**Overview:** All 7 items from REVIEW-1 have been addressed. The fixes are clean and correct. Lint, typecheck, and 190 tests pass across all 5 affected packages.

---

### Fix Verification

#### Item 1 — `account.repository.js: CONFLICT handler & enum`

**Status:** ✅ Fixed

- `CONFLICT` removed from `AccountRepositoryFailuresEnum` (was dead code — `Account` model has no unique constraints)
- `create()` no longer has a second `tryCatchAsync` error handler — defaults to propagation
- Destroy pattern simplified to `db.account.create({ data })` — data passed directly
- `AccountRepository` typedef updated — `create` no longer advertises `CONFLICT` in its return type

#### Item 2 — `account.service.js: ALREADY_DELETED`

**Status:** ✅ Fixed

- Line removed from `AccountServiceFailures` enum

#### Item 3 — `account.service.js: CONFLICT case in create switch`

**Status:** ✅ Fixed

- `case AccountRepositoryFailuresEnum.CONFLICT` removed from the `create` switch statement

#### Item 4 — `plugin.test.js: auth middleware helper`

**Status:** ✅ Fixed

- Local `registerMockAuth` function removed from `plugin.test.js`
- Imported `registerMockAuth` from `@ems/domain-backend-auth/testing`
- Helper moved to `domain/backend/auth/src/testing/auth-middleware.js`
- Now implements actual permission checking via `roleHasPermission` — returns 403 when permission is missing

#### Item 5 — `index.js: side-effect import`

**Status:** ✅ Fixed

- `import "@ems/domain-backend-auth"` removed from account's `index.js`
- `import './fastify.d.ts'` removed from auth's `index.js`
- Shared `fastify.d.ts` created at `domain/backend/schema/src/fastify.d.ts`
- Imported in schema's `index.js` and `index.d.ts` — cascades to all packages depending on `@ems/domain-backend-schema`

#### Item 6 — `account.repository.js: manual destructure`

**Status:** ✅ Fixed

- `create()` now passes `data` directly to `db.account.create({ data })` instead of manually destructuring

#### Item 7 — `testing/account.js: Decimal & @ts-nocheck`

**Status:** ✅ Fixed

- `@ts-nocheck` removed
- `balance` mock replaced with `new Prisma.Decimal("1000.00")`
- `createMockAccountDTO` default balance changed to `"1000"` to match `Prisma.Decimal("1000.00").toString()` output

---

### New Observations

- **`domain/backend/schema/src/fastify.d.ts`** — Imports `UserDTO` from `@ems/domain-shared-auth`, but `@ems/domain-backend-schema` does **not** declare `@ems/domain-shared-auth` as a dependency in its `package.json`. This works in the monorepo via hoisting but would break if the package were consumed independently. Consider adding `@ems/domain-shared-auth` as a `devDependency` (for type-checking) or `dependency` of the schema package.
  Answer: Fix. If it only uses types, add it to `devDependencies`.

- **`domain/backend/account/src/account.repository.test.js`** — Still has `// @ts-nocheck`. This was present before REVIEW-1 and is not part of the scope of these fixes (the `@ts-nocheck` in `testing/account.js` was the targeted one). Keeping it is consistent with how the auth package handles similar test type complexities.
  Answer: Fix. Get rid of `@ts-nocheck`! Those are code smells.

- **`domain/backend/account/src/plugin.test.js`** — Still has `// @ts-nocheck`. Same reasoning — test file type complexity with Fastify decorators and mock types.
  Answer: Fix. Get rid of `@ts-nocheck`! Those are code smells.

---

### What Still Holds From Review 1

- **Pagination delegated to repository** — Service correctly maps `nextCursor` → `nextPageCursor`
- **Permission-based route protection** — `allowOneOf` with `ACCOUNT_READ` / `ACCOUNT_WRITE` on each route
- **Consistent Result Pattern** — `tryCatchAsync` + `switch` on `status` throughout the service
- **Ownership validation** — Service validates `account.userId === userId` on read/update/delete
- **Test coverage** — 41 account backend tests covering all CRUD paths + error cases

---

### Verification Story

- Tests reviewed: 190 passing across 5 packages (account backend: 41, auth backend: 87, schema: 3, shared account: 40, shared auth: 19)
- Build verified: `npm run lint`, `npm run check` — all pass on all 5 packages
- Security checked: Mock auth middleware now validates permissions via `roleHasPermission` + returns 403 on insufficient permissions
