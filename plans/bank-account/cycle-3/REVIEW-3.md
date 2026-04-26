# Cycle 3 Review 3 — Second Fix Verification

**Verdict:** APPROVE

**Overview:** The 3 remaining items from REVIEW-2 ("New Observations") have been addressed. All `@ts-nocheck` comments removed, the missing `devDependency` added, and a shared `createMockDecimal` utility created in `@ems/database/testing`. Lint, typecheck, and tests all pass across all affected packages.

---

### Fix Verification

#### Observation 1 — `@ems/domain-shared-auth` as devDependency of schema

**Status:** ✅ Fixed

- `@ems/domain-shared-auth` added as `devDependency` in `domain/backend/schema/package.json`
- This ensures the `import type { UserDTO }` in `fastify.d.ts` is properly resolved

#### Observation 2 — `@ts-nocheck` in `account.repository.test.js`

**Status:** ✅ Fixed

- `// @ts-nocheck` removed
- `accountData.type` changed from `"BANK"` string literal to `AccountType.BANK` (imported from `@ems/database`) — gives proper type narrowing to `"BANK"` literal
- Mock balance now uses `createMockDecimal(accountData.balance)` from `@ems/database/testing`

#### Observation 3 — `@ts-nocheck` in `plugin.test.js`

**Status:** ✅ Fixed

- `// @ts-nocheck` removed — the mock auth middleware (`registerMockAuth` from `@ems/domain-backend-auth/testing`) is already properly typed

---

### Additional Changes Noted

- **`@ts-nocheck` also removed from `account.service.test.js`** — Two type issues fixed:
  - `{ toString: () => "500" }` replaced with `createMockDecimal(500)`
  - `{ toString: () => "0" }` replaced with `createMockDecimal(0)`
  - `result.data` accesses use optional chaining (`?.`) instead of direct access, satisfying strict null checks

- **`domain/backend/auth/src/fastify.d.ts` deleted** — Superseded by the shared `domain/backend/schema/src/fastify.d.ts`

- **`domain/backend/auth/src/index.d.ts`** — Removed stale `export * from './fastify.js'` reference

- **`@ems/database` now exports `./testing` subpath** — Export map added to `prisma/package.json`
  - New `prisma/src/testing/decimal.js` — `createMockDecimal(balance)` factory with full JSDoc overloads for `string | number | null | undefined`
  - New `prisma/src/testing/index.ts` — barrel re-export

- **`domain/backend/account/src/testing/account.js`** — Switched from `new Prisma.Decimal("1000.00")` to `createMockDecimal("1000.00")` (cleaner, reusable abstraction)

---

### Verification Story

- Tests passing: 131 across account backend (41), auth backend (87), schema (3)
- Lint: clean across all 5 affected packages
- Typecheck: clean across all 5 affected packages
- No `@ts-nocheck` remains in any account-domain file
