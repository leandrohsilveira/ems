# Cycle 5 Review 2 — `@ems/domain-frontend-account`

## Review Summary

**Verdict:** REQUEST CHANGES

**Overview:** This is a follow-up review of the WIP commit `e4d3c2b`, which incorporates fixes from REVIEW-1 and adds new files (account-create loader, account-edit loader, click-outside action, events module, Modal/Button rework). Most REVIEW-1 issues are properly addressed. The main remaining concern is the `accountListLoader` silently swallowing API errors and a missing focus trap on Modal.

---

### REVIEW-1 Fix Verification

| #   | Issue                                   | Status       | Notes                                                                                                                                                                                                                            |
| --- | --------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Cancel button inactive                  | **Fixed**    | `cancelHref` prop added, Cancel button uses `element="a"` + `href={cancelHref}`.                                                                                                                                                 |
| 2   | Duplicate test                          | **Fixed**    | Lines 139–153 removed. Test file is now 138 lines, no duplicate.                                                                                                                                                                 |
| 3   | Missing account-detail                  | **Deferred** | Instead of implementing account-detail, the form loader was split into `account-create.js` and `account-edit.js`. This diverges from the plan but is valid if the plan is updated.                                               |
| 4   | Fragile literal merge                   | **Fixed**    | Loader split into `createAccountLoader` and `editAccountLoader`, each returning typed `AccountFormModalLiterals`. No more spread collision.                                                                                      |
| 5   | Empty query params                      | **Rejected** | HttpClient filters null/undefined. Noted.                                                                                                                                                                                        |
| 6   | Type safety loosened to `any`           | **Rejected** | Keeping `Imports<any, any>` because strict recursive type caused inference failures.                                                                                                                                             |
| 7   | Network errors not handled              | **Rejected** | `makeHttpErrorMapper` handles unexpected errors. However, `delete-account.test.js` and `update-account.test.js` lack a network error test that `create-account.test.js` has (line 115). Consistency gap.                         |
| 8   | Delete icon class override              | **Fixed**    | Now uses `variant="destructive"`, class overrides removed.                                                                                                                                                                       |
| 9   | Modal Escape/overlay dismissal          | **Fixed**    | Modal has `onkeydown={handleKeydown}` for Escape, `use:autoClose` for overlay click, `onclose` callback, and `$bindable(false)` open state.                                                                                      |
| 10  | Unused i18n keys in edit literals       | **Rejected** | Kept for type compatibility between create/edit.                                                                                                                                                                                 |
| 11  | Loader imports from components          | **Rejected** | Kept by design.                                                                                                                                                                                                                  |
| 12  | getAccountById test URL                 | **Rejected** | Reviewer was wrong — test does verify URL contains the ID.                                                                                                                                                                       |
| 13  | `javascript:void(0)` on disabled anchor | **Partial**  | The `javascript:void(0)` was removed (Button now passes `...restProps` unconditionally). But `href` is still present when `disabled` is true — the suggestion to omit `href` when disabled was not applied. See new issue below. |

---

### New Issues

- **`domain/frontend/account/src/lib/server/loaders/account-list.js:30-33` — API errors silently produce empty state**

  When `accountApi.listAccounts()` fails (network error, 5xx), the loader returns `{ accounts: [], pagination: { size: 10, nextPageCursor: null } }` with no error signal. The component renders the "No accounts yet" empty state — indistinguishable from a successful empty response.

  ```js
  const { ok, data: response } = await accountApi.listAccounts();
  const accounts = ok ? response.items : [];
  ```

  No test covers the API failure path. The test file (`account-list.test.js`) tests success, empty, and locale scenarios, but never mocks a non-ok response.

  **Fix:** Either (a) throw on API failure and let SvelteKit's error handling surface it, or (b) return an `error` field so the page can render an error state. Add a test for the failure path.

  Answer: Manually fixed.

- **`packages/ui/src/lib/components/modal/modal.svelte` — No focus trap**

  The Modal now dismisses on Escape and overlay click, but it doesn't trap focus. When opened, focus stays on the trigger element. Tabbing past the last focusable element exits the dialog. This violates the ARIA dialog pattern which requires focus to be trapped.

  **Fix:** Add a focus trap — move focus to the dialog container on open, intercept Tab/Shift+Tab to cycle within focusable elements, and restore focus to the trigger on close. Libraries like `focus-trap` can handle this, or implement it as a Svelte action.

  Answer: Fix. Create a Svelte Action called `autoFocus` on `packages/ui/src/lib/actions/auto-focus.js` and use it here on the dialog container element.

- **`packages/ui/src/lib/components/button/button.svelte:34-47` — `href` present when `disabled` on anchor**

  When `element="a"` and `disabled` is true, the anchor gets `aria-disabled="true"` and `pointer-events: none`, but `href` is still passed via `...restProps`. This means the link can be opened in a new tab via right-click or keyboard context menu, bypassing the disabled state.

  **Fix:** Extract `href` from `restProps` and conditionally apply it:

  ```js
  let { href: maybeHref, ...otherRest } = restProps;
  ```

  Then pass `...(disabled || loading ? {} : { href: maybeHref })` to the element, and the rest via `{...otherRest}`.

  Answer: Fix. The implementation has been manually fixed. Just update tests to verify behaviors of disabled button with element="a".

- **`domain/frontend/account/src/lib/server/actions/delete-account.test.js` and `update-account.test.js` — No network error test**

  `create-account.test.js` has a test for network errors (mock rejected promise → 503 with message). Delete and update actions lack this coverage. While `makeHttpErrorMapper` does handle this case, having no test makes it possible to regress without detection.

  **Fix:** Add a network error test to `delete-account.test.js` and `update-account.test.js` matching the pattern in `create-account.test.js:115-130`.

  Answer: Manually fixed.

            // tabindex: disabled || loading ? -1 : restProps.tabindex,

---

### What's Done Well

- **REVIEW-1 fixes are thorough** — All accepted issues were properly addressed. The Cancel button fix, Modal overhaul, loader split, and destructive variant changes are cleanly implemented.

- **Modal rework is well-engineered** — The `$bindable` open state, `onclose` callback, `autoClose` action for overlay clicks, and `handleKeydown` for Escape are cleanly composed. The test coverage for overlay click, Escape key, and non-Escape keys is comprehensive.

- **Button refactoring is clean** — The `element` prop with `svelte:element` is a clean generalization. The `...restProps` pass-through avoids brittle prop enumeration. The `aria-disabled` handling is correct for anchor elements.

- **Loader split is precise** — `account-create.js` and `account-edit.js` each load only their own i18n, with properly typed return values. The barrel re-export in `account-form.js` maintains backward compatibility.

- **Click-outside action** — Clean implementation using capture phase for reliable outside-click detection. Proper cleanup via `destroy()`.

---

### Verification Story

| Check                       | Result       | Notes                                                                                                   |
| --------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| **REVIEW-1 fixes verified** | Yes          | 6/6 accepted fixes confirmed. 1 partial (href on disabled).                                             |
| **New issues found**        | 4            | API error swallowing, modal focus trap, href-on-disabled, missing network error tests.                  |
| **Tests reviewed**          | Yes          | 13 test files. API error path uncovered in account-list; network error test missing from delete/update. |
| **All tests pass**          | Not verified | Run `npm run test` to confirm.                                                                          |
| **Lint passes**             | Not verified | Run `npm run lint` to confirm.                                                                          |
| **Security checked**        | Yes          | No new concerns.                                                                                        |
| **Plan compliance**         | Partial      | `account-detail` deferred without plan update. Loader split approved in review response.                |
