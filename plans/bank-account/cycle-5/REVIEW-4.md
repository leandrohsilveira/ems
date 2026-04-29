# Cycle 5 Review 4 — `@ems/domain-frontend-account`

## Review Summary

**Verdict:** APPROVE

**Overview:** This fourth review evaluates the current staged changes against all outstanding issues from REVIEW-1, REVIEW-2, and REVIEW-3. The staged changes address the remaining REVIEW-2 fixes (network error tests, API error handling, focus trap, disabled anchor `href`, autoFocus action) and partially address REVIEW-3 suggestions (loading bindable, focusout event). One accessibility issue remains unaddressed from REVIEW-3. The overall code quality is high — clean architecture, thorough tests, and consistent patterns throughout.

---

## Previous Reviews Status — Complete Accountability

### REVIEW-1 Issues (13 total)

| #   | Issue                                   | REVIEW-1 Status | Current Status  | Notes                                                                                          |
| --- | --------------------------------------- | --------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| 1   | Cancel button inactive                  | Fixed           | ✅ **Fixed**    | `cancelHref` prop added, Button uses `element="a"` + `href`.                                   |
| 2   | Duplicate test                          | Fixed           | ✅ **Fixed**    | Lines 139–153 removed from `account-list.test.js`.                                             |
| 3   | Missing account-detail                  | Rejected        | ➡️ **Deferred** | Deferred to Cycle 6. Loader split into create/edit instead.                                    |
| 4   | Fragile literal merge                   | Fixed           | ✅ **Fixed**    | Loader split into `account-create.js` / `account-edit.js`, each with typed return values.      |
| 5   | Empty query params                      | Rejected        | ✅ **Accepted** | HttpClient filters null/undefined.                                                             |
| 6   | Type safety loosened to `any`           | Rejected        | ✅ **Accepted** | `Imports<any, any>` — intentional tradeoff; recursive constraint caused inference failures.    |
| 7   | Network errors not handled              | Rejected        | ✅ **Fixed**    | Rejected in R1 (makeHttpErrorMapper handles it), tests now added in staged changes.            |
| 8   | Delete icon class override              | Fixed           | ✅ **Fixed**    | Now uses `variant="destructive"`.                                                              |
| 9   | Modal Escape/overlay dismissal          | Fixed           | ✅ **Fixed**    | Modal has `onkeydown`, `autoClose`, `onclose`, `$bindable(false)`.                             |
| 10  | Unused i18n keys in edit literals       | Rejected        | ✅ **Accepted** | Kept by design for type compatibility.                                                         |
| 11  | Loader imports from components          | Rejected        | ✅ **Accepted** | Kept by design (i18n colocated with component).                                                |
| 12  | `getAccountById` test URL               | Rejected        | ✅ **Accepted** | Reviewer was wrong — test does verify URL contains ID.                                         |
| 13  | `javascript:void(0)` on disabled anchor | Partial         | ✅ **Fixed**    | `href` now omitted via `elementProps` in staged changes. Tests verify no `href` when disabled. |

**REVIEW-1 summary:** 12/13 resolved. #3 deferred to Cycle 6.

### REVIEW-2 Issues (4 new)

| #   | Issue                                 | REVIEW-2 Status | Current Status | Notes                                                                                                 |
| --- | ------------------------------------- | --------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | `account-list.js` API errors silent   | Fixed           | ✅ **Fixed**   | Uses `mapError`, returns `isSuccess: false` + error message. Tests cover HTTP 500 and network errors. |
| 2   | Modal focus trap                      | Fixed           | ✅ **Fixed**   | `autoFocus` action with `focusTrap: true`. Tests validate focus trapping.                             |
| 3   | `href` present on disabled anchor     | Fixed           | ✅ **Fixed**   | `elementProps` overrides `href`. Tests validate omitted `href` when disabled/loading.                 |
| 4   | Network error tests for delete/update | Fixed           | ✅ **Fixed**   | Both `delete-account.test.js` and `update-account.test.js` have network error tests.                  |

**REVIEW-2 summary:** 4/4 resolved.

### REVIEW-3 Issues (1 important + 3 suggestions)

| #   | Issue                                           | REVIEW-3 Status | Current Status     | Notes                                                                                                     |
| --- | ----------------------------------------------- | --------------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| 1   | Disabled anchor keyboard-focusable (`tabindex`) | Important       | ❌ **Unaddressed** | `button.svelte` still doesn't set `tabindex="-1"` when `element="a"` and `disabled={true}`.               |
| 2   | AccountFormModal `open`/`onclose` forwarding    | Suggestion      | ❌ **Unaddressed** | `open` not `$bindable`, `onclose` not forwarded to Modal. Parent can't react to overlay/Escape dismissal. |
| 3   | Inconsistent `loading` pattern                  | Suggestion      | ✅ **Fixed**       | `AccountFormModal` now uses `loading = $bindable(false)` — matches `DeleteDialog` pattern.                |
| 4   | `blur`-based focus trapping robustness          | Suggestion      | ✅ **Fixed**       | `auto-focus.js` now uses `focusout` (bubbles naturally) instead of `blur` + `capture: true`.              |

**REVIEW-3 summary:** 2/4 resolved. #1 (important) and #2 (suggestion) remain.

---

## Staged Changes (16 files)

The staged (uncommitted) changes address the following:

| File                             | Change                                                                                 | Purpose                                               |
| -------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `button/button.svelte`           | Added `elementProps` derived state, `{...elementProps[element]}` spread                | Omit `href` when disabled/loading for anchor elements |
| `button/button.svelte.test.js`   | Added 3 tests: anchor with href, omitted href when disabled, omitted href when loading | Verify disabled anchor behavior                       |
| `modal/modal.svelte`             | Added `autoFocus` import and `use:autoFocus={{ focusTrap: true }}`                     | Implement focus trap                                  |
| `modal/modal.svelte.test.js`     | Added 3 focus trap tests: initial focus, Tab to first child, Shift+Tab trapping        | Verify focus trap behavior                            |
| `actions/auto-focus.js`          | New file with `focusout`-based focus trap + focus restoration                          | Svelte action for focus management                    |
| `actions/index.js`               | Added `autoFocus` export                                                               | Barrel export                                         |
| `loaders/account-list.js`        | Added error handling with `makeHttpErrorMapper` + `isSuccess`/`status`/`errorMessage`  | Return proper error state on API failure              |
| `loaders/account-list.test.js`   | Added HTTP error + network error tests, improved assertion consistency                 | Cover failure paths                                   |
| `actions/delete-account.test.js` | Added network error test                                                               | Coverage parity with create-account                   |
| `actions/update-account.test.js` | Added network error test                                                               | Coverage parity with create-account                   |
| `account-form-modal.svelte`      | Changed `loading` from `$state(false)` to `$bindable(false)`                           | Consistent pattern with DeleteDialog                  |
| `account-form-modal/types.ts`    | Added `loading?: boolean` to `AccountFormModalProps`                                   | Type for bindable loading prop                        |

---

## Remaining Issues

### From REVIEW-3 (unaddressed)

- **`packages/ui/src/lib/components/button/button.svelte:32-39` — Disabled anchor remains keyboard-focusable**

  **Carried forward from REVIEW-3.** When `Button` renders as `element="a"` with `disabled={true}`, the anchor is not removed from the tab order. Native `<button disabled>` is removed from tab order automatically, but `<a aria-disabled="true">` remains focusable and reachable via keyboard Tab. This affects all consumers: `AccountCard` (edit/delete), `AccountFormModal` (cancel), `DeleteDialog` (cancel), `AccountList` (new account button in empty state).

  The `elementProps` derivation currently only handles `href`:

  ```js
  const elementProps = $derived({
    button: {
      disabled: disabled || loading,
    },
    a: {
      href:
        !(disabled || loading) && "href" in restProps
          ? restProps.href
          : undefined,
    },
  });
  ```

  **Suggested fix:** Add `tabindex` handling to both `button` and `a` cases:

  ```js
  const elementProps = $derived({
    button: {
      disabled: disabled || loading,
      tabindex: disabled || loading ? -1 : restProps.tabindex,
    },
    a: {
      href:
        !(disabled || loading) && "href" in restProps
          ? restProps.href
          : undefined,
      tabindex: disabled || loading ? -1 : restProps.tabindex,
    },
  });
  ```

  **Severity:** Important — accessibility concern for keyboard users. Safe to fix post-merge but should be tracked.

  Answer: Reject. Already been rejected on previous review. Dismiss.

- **`domain/frontend/account/src/lib/components/account-form-modal/account-form-modal.svelte:11` — `open` not bindable, `onclose` not forwarded**

  **Carried forward from REVIEW-3.** `AccountFormModal` receives `open` as a regular prop (not `$bindable`) and passes it to `<Modal {open}>` without `onclose`. When the user dismisses via overlay click or Escape, Modal internally sets `open = false` and calls `onclose?.()`, but since no handler is forwarded and `open` isn't bindable, the parent's state remains `open: true`. This is a minor state-inconsistency gap.

  **Severity:** Suggestion — harmless in practice since form submissions trigger navigation, but a future enhancement would benefit from proper propagation.

  Answer: Fix. Add `onclose` property and use bindable on `open` property. Use `bind:open` and `onclose` on `Modal` element.

---

## What's Done Well

- **Comprehensive test coverage across all layers** — 63 frontend-account tests + 99 UI tests = 162 tests total across 18 test files, all passing. Every action, loader, component, and API method has tests covering happy paths, error states, edge cases, and locale variants.

- **Progressive quality improvement across 4 reviews** — The codebase has evolved visibly through each review cycle:
  - R1 → R2: Cancel button fixed, loader split, Modal overhaul
  - R2 → R3: Focus trap, API error handling, network error tests
  - R3 → current: `focusout` event, consistent `loading` pattern, button anchor `href` handling

- **Focus trap implementation is clean** — The `autoFocus` action uses `focusout` (bubbling event) for reliable focus trapping, handles initial focus, and restores focus to the trigger element on destroy. Three dedicated tests validate the behavior.

- **API error handling is consistent** — `account-list.js` now uses the same `makeHttpErrorMapper` pattern as the server actions. All three actions (create, update, delete) and the list loader return typed results with `isSuccess`, `status`, `errorMessage` and proper error mapping for HTTP and network failures.

- **Button anchor `href` removal is correct** — The `elementProps` technique with Svelte's prop-merging order (`...restProps` first, then `...elementProps[element]`) cleanly overrides `href` with `undefined` when disabled/loading, which removes it from the DOM. Tests verify the attribute is absent.

- **Consistent code style and patterns** — All components use Svelte 5 runes (`$props()`, `$state()`, `$derived`, `$bindable`, `$effect`). All tests use `vitest-browser-svelte` with realistic DOM assertions. Error handling follows the same `makeHttpErrorMapper` pattern throughout.

---

## Verification Story

| Check                       | Result       | Notes                                                                                                     |
| --------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| **REVIEW-1 issues**         | 12/13 done   | #3 (account-detail) deferred to Cycle 6.                                                                  |
| **REVIEW-2 issues**         | 4/4 done     | All fixes verified in code and tests.                                                                     |
| **REVIEW-3 issues**         | 2/4 done     | #1 (tabindex) unaddressed. #2 (open/onclose) unaddressed. #3 (loading) fixed. #4 (focusout) fixed.        |
| **Staged changes verified** | Yes          | 16 staged files add network error tests, focus trap, error handling, anchor href fix, consistent loading. |
| **All tests pass**          | **Verified** | `@ems/domain-frontend-account`: 63 passed (+4 over base). `@ems/ui`: 99 passed.                           |
| **Lint passes**             | Not verified | Run `npm run lint` from workspace root to confirm.                                                        |
| **Svelte check**            | Not verified | Run `npm run check` from `domain/frontend/account/` to confirm.                                           |
| **Security checked**        | Yes          | No secrets, no unsanitized user input, no new dependencies.                                               |
| **Plan compliance**         | Partial      | `account-detail` deferred to Cycle 6 per plan update.                                                     |
| **Spec compliance**         | Partial      | Account detail page/view deferred. All other spec items covered.                                          |
