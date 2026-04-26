# Review 1 — Cycle 2: Shared Domain Package `@ems/domain-shared-account`

**Verdict:** APPROVE

**Overview:** A well-structured new shared domain package (`@ems/domain-shared-account`) implementing DTOs, Zod schemas, i18n, and an account type enum. The code follows existing conventions closely, has 100% test coverage across 7 test files with 39 tests, and passes all lint and type checking gates.

## Critical Issues

None found.

## Important Issues

### `account-errors.i18n.test.js:22-24` — Misleading test name

Test named `'should fall back to english for unsupported locale'` actually resolves `en_US` which is a **supported** locale, not an unsupported one. No fallback behavior is actually tested.

**Recommended fix:** Either rename the test to something like `'should resolve english literals'` (which would duplicate the first test), or change it to actually test an unsupported locale (e.g., `resolve('fr_FR', ...)`) if the i18n system supports falling back to the default language.

Answer: Fix. Use an unsupported locale to actually test the fallback behavior.

## Suggestions

### Domain errors vs DTO validation i18n overlap

**File:** `account-errors.i18n.js`, `create-account.dto.js`, `update-account.dto.js`

There is semantic overlap between domain error keys (`accountNameRequired`, `accountNameMax`) and DTO validation i18n keys (`'name.invalid'`, `'name.max'`). These serve different concerns (domain logic errors vs request schema validation), but the proximity could cause drift over time.

**Consideration:** Document with a comment that the DTO-level i18n handles Zod validation messages while `accountErrorsI18n` handles service/domain error messages, or adopt a naming convention to distinguish them more clearly (e.g., prefix domain errors with `domain.`).

Answer: Fix. That was a great catch! We actually should not be concerned with user-friendly messages for accountNameRequired/accountNameMax at domain level, defer it only to the schema validation. If it somehow happens at domain boundary, let it be treated as an unexpected error.

### `account-list-input.dto.js` — Indirection without extension

**File:** `account-list-input.dto.js`

This file simply re-exports `pageInputDtoSchema` without any extension. If the plan anticipates future additions (e.g., adding a `userId` filter field), the re-export makes sense and is future-proof. If not, inlining `pageInputDtoSchema` usage directly would reduce indirection.

**Consideration:** The current approach is acceptable since the plan explicitly calls for this file. No changes needed now.

Answer: Keep as is. This is intentional, this schema might have some additional filters in near future.

### `create-account.dto.js:23` — `number` vs `coerce.number` for initialBalance

**File:** `create-account.dto.js:23`

`initialBalance: z.number().nonnegative().default(0)` uses `z.number()`, but `pageInputDtoSchema` in the same codebase uses `z.coerce.number()` for query string compatibility. For JSON request bodies (which is how Fastify receives POST data), `z.number()` is correct. No change needed.

**Consideration:** If the create account form ever sends `initialBalance` as a querystring or URL-encoded parameter, this would need `z.coerce.number()`.

Answer: Fix. Good catch! Use coerce here.

### `account-list.dto.test.js:20` — Ambiguous size in test data

**File:** `account-list.dto.test.js:20`

`size: 1` with an items array also of length 1 is coincidental. The `size` field represents the page limit, not the actual item count.

**Consideration:** For clarity, use `size: 10` with 1 item to demonstrate that `size` is the page limit request parameter, distinct from the actual count of returned items.

Answer: Fix. Apply the suggestion.

### `index.d.ts` — Maintenance risk from duplication

**File:** `index.d.ts`

This file is a direct copy of `index.js`. This follows the existing project convention, but it's a maintenance risk (the two files can drift).

**Consideration:** A `/// <reference path="..." />` approach or generated `.d.ts` would be more maintainable, though this would be a broader architectural decision beyond this cycle.

Answer: Let it be. Will be subject of future architectural revision.

## What's Done Well

1. **Excellent test coverage** — 39 tests across 7 test files covering valid input, edge cases (empty, null, max length), default values, invalids, i18n resolution in both languages, and both request + response DTOs.

2. **Proper use of shared abstractions** — Leveraging `createPageDtoSchema(accountDtoSchema)` and `pageInputDtoSchema` from `@ems/domain-shared-schema` instead of rolling custom pagination. This aligns with the approved deviations.

3. **Convention alignment** — The code perfectly mirrors existing patterns:
   - Dotted i18n keys for validation messages (`'name.invalid'`, `'name.max'`) matches `signup-request.dto.js`
   - Domain error i18n with camelCase keys matches `login-errors.i18n.js`
   - `Object.freeze` for enum constants matches `PERMISSIONS`/`ROLES`
   - Barrel exports in `index.js` + `index.d.ts` follow every other package
   - `@exports @typedef` pattern for exported types

4. **Test isolation** — Each schema has its own test file, keeping concerns separated. Tests use simple `safeParse` assertions without mocking, which is appropriate for pure schema validation.

5. **Package scaffolding** — All standard config files (`jsconfig.json`, `eslint.config.mjs`, `.prettierrc`, `.gitignore`) are present and correctly configured, matching sibling packages exactly.

## Verification Story

| Check         | Status | Details                                  |
| ------------- | ------ | ---------------------------------------- |
| Tests         | ✅     | 7 files, 39 tests — all passing          |
| Lint          | ✅     | Prettier + ESLint — clean                |
| Type checking | ✅     | `tsc --noEmit` — no errors               |
| Build         | ✅     | `npm install` — package linked correctly |
