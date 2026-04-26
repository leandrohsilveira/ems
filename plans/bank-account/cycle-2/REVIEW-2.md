# Review 2 — Cycle 2: Shared Domain Package `@ems/domain-shared-account` (Post-Fix)

**Verdict:** APPROVE

**Overview:** Review 1 fixes were applied correctly and completely. The package is in a clean state with no remaining critical or important issues. All four fix instructions from REVIEW-1 were addressed faithfully.

## Review 1 Fix Verification

### Fix 1: `account-errors.i18n.js` — Remove validation-level error literals

**Status:** ✅ Done correctly

Domain-level error literals `accountNameRequired`, `accountNameMax`, `initialBalanceInvalid`, and `currencyInvalid` were removed from both `defaultLiterals` and the `pt_BR` alternatives. Only the four truly domain-level errors remain: `accountNotFound`, `accountNotOwned`, `accountAlreadyDeleted`, `accountHasTransactions`. This properly defers validation messages to DTO-level i18n (`createAccountDtoI18n`, `updateAccountDtoI18n`).

### Fix 2: `account-errors.i18n.test.js` — Use unsupported locale for fallback test

**Status:** ✅ Done correctly

The fallback test now resolves `'fr_FR'` (an unsupported locale) instead of `'en_US'`, and asserts against `accountNotFound`. This actually exercises the fallback codepath instead of just repeating the first test.

### Fix 3: `create-account.dto.js` — Use `coerce.number()` for initialBalance

**Status:** ✅ Done correctly

`z.number().nonnegative().default(0)` was changed to `z.coerce.number().nonnegative().default(0)`. This allows the schema to handle string-form inputs while preserving the non-negative constraint and default value.

### Fix 4: `account-list.dto.test.js` — Disambiguate size vs item count

**Status:** ✅ Done correctly

The happy path test now uses `size: 10` with a single item array, and the assertion checks for `size: 10`. This makes it clear that `size` represents the page limit, not the actual item count.

## New Observations

### Suggestion: Add coercion test for `initialBalance`

**File:** `create-account.dto.test.js`

Now that `initialBalance` uses `z.coerce.number()`, the schema accepts both number and string inputs (e.g., `initialBalance: '1000'`). There is no test verifying this coercion works. Consider adding:

```js
it("should coerce string initial balance to number", () => {
  const result = createAccountDtoSchema.safeParse({
    name: "Nubank Checking",
    initialBalance: "1000",
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.initialBalance).toBe(1000);
  }
});
```

The existing tests still all pass with `z.coerce.number()` since `1000` (number) is trivially coercible. Adding the string case documents and locks in the coercion behavior.

Answer: Fix. Apply the suggestion.

### Suggestion: Cover negative string `initialBalance` rejection

**File:** `create-account.dto.test.js`

The negative balance test (`initialBalance: -100`) only tests the raw number path. Consider adding a test for a negative string value as well:

```js
it("should reject negative string initial balance", () => {
  const result = createAccountDtoSchema.safeParse({
    name: "Nubank Checking",
    initialBalance: "-100",
  });
  expect(result.success).toBe(false);
});
```

This ensures `z.coerce.number().nonnegative()` works end-to-end for the string-input path.

Answer: Fix. Apply the suggestion.

### Suggestion: `account-list.dto.test.js:68` — inconsistent `size` in error test

**File:** `account-list.dto.test.js:68`

The "reject invalid account items" test still uses `size: 1`, which is fine semantically (it's testing the invalid items, not the size). No change needed, but worth noting the inconsistency with the newly fixed happy path test for future cleanup.

Answer: Rejected. Good review, noted for future revision.

## What's Done Well

1. **All Review 1 fixes applied faithfully** — Every fix instruction was interpreted correctly and implemented exactly as requested. No regressions introduced.

2. **Zero open issues** — The package now has no remaining critical, important, or overlooked concerns from the previous review. All domain-level i18n responsibility boundaries are properly drawn.

3. **Coercion without breaking changes** — The switch to `z.coerce.number()` is backward-compatible with the existing tests while adding robustness for string-form inputs.

## Verification Story

| Check          | Status | Details                         |
| -------------- | ------ | ------------------------------- |
| Tests          | ✅     | 7 files, 39 tests — all passing |
| Lint           | ✅     | Prettier + ESLint — clean       |
| Type checking  | ✅     | `tsc --noEmit` — no errors      |
| Review 1 fixes | ✅     | All 4 applied correctly         |
