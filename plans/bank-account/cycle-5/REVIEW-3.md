# Cycle 5 Review 3 — `@ems/domain-frontend-account`

## Review Summary

**Verdict:** APPROVE

**Overview:** This third review verifies that all REVIEW-2 fixes have been properly applied and checks for remaining issues. All previously requested fixes are confirmed working. The code is clean, well-tested (63 frontend-account tests + 99 UI tests, all passing), and follows project conventions. Two accessibility/safety observations remain, but neither is a blocker.

---

### REVIEW-2 Fix Verification

| #   | Issue                                         | Status    | Notes                                                                                                                                                                                                 |
| --- | --------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `account-list.js` API errors silently ignored | **Fixed** | Now calls `mapError(locale, error)` on failure, returns `isSuccess: false` with proper error message. Tests cover HTTP 500 and network error paths.                                                   |
| 2   | Modal focus trap                              | **Fixed** | `autoFocus` action created in `packages/ui/src/lib/actions/auto-focus.js`. Used on dialog container with `focusTrap: true`. Tests validate initial focus, Tab to first child, and Shift+Tab trapping. |
| 3   | `href` present on disabled anchor             | **Fixed** | Button now uses `href: !(disabled \|\| loading) && 'href' in restProps ? restProps.href : undefined` in `elementProps['a']`. Tests added for disabled and loading states omitting `href`.             |
| 4   | Network error tests for delete/update actions | **Fixed** | Both `delete-account.test.js` (line 89) and `update-account.test.js` (line 115) now have `'handles network errors'` tests matching the `create-account.test.js` pattern.                              |
| 5   | `autoFocus` action implementation             | **Fixed** | File exists at `packages/ui/src/lib/actions/auto-focus.js`. Implements focus trapping via `blur` capture-phase listener and focus restoration on destroy.                                             |

All 5 accepted fixes from REVIEW-2 are confirmed applied and verified.

---

### New Issues

- **`packages/ui/src/lib/components/button/button.svelte:55-56` — Disabled anchor remains keyboard-focusable**

  When `Button` renders as `element="a"` with `disabled={true}`, the anchor receives `aria-disabled="true"` and `pointer-events: none` (via CSS classes), but `tabindex` defaults to `0` for `<a>` elements. The anchor is still reachable via keyboard Tab, which creates a confusing experience — the user can focus the element but cannot activate it.

  For `<button>` elements, native `disabled` attribute removes them from tab order automatically. For `<a>` elements with `aria-disabled`, `tabindex="-1"` must be explicitly set to match this behavior.

  The current `elementProps` derivation only overrides `href` for anchors:

  ```js
  a: {
    href: !(disabled || loading) && "href" in restProps
      ? restProps.href
      : undefined;
  }
  ```

  But `tabindex` (if passed via `restProps`) or the implicit `tabindex=0` remain. The `{...restProps}` spread at line 55 may also include `tabindex`, and since `elementProps[element]` doesn't override it for the `a` case, there is no fix applied.

  **Fix:** Add `tabindex: disabled || loading ? -1 : restProps.tabindex` to the `a` elementProps, similar to the commented-out line that was removed. Also handle the `button` case for consistency with custom `tabindex` values passed via `restProps`:

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

  **Affected consumers:** `AccountCard` (edit/delete icon buttons), `AccountFormModal` (cancel button), `DeleteDialog` (cancel button), `AccountList` (new account button in empty state) all use `<Button element="a" disabled={loading}>` — making this a broadly relevant fix.

  **Severity:** Important — accessibility concern for keyboard users.

  Answer: Rejected. Just ommiting href is enough to make it not focusable/interactive.

---

### Suggestions

- **`domain/frontend/account/src/lib/components/account-form-modal/account-form-modal.svelte:11` — `open` not bindable, `onclose` not forwarded**

  The `AccountFormModal` receives `open` as a regular prop and passes it to `<Modal {open}>` without `onclose`. Modal has `open = $bindable(false)` and an `onclose` callback, but since AccountFormModal doesn't declare `open` as `$bindable` and doesn't forward/implement `onclose`, the parent component cannot react when the modal is dismissed via overlay click or Escape key.

  In practice this may be harmless — form submissions typically navigate away via redirect — but it creates a state-inconsistency gap: the parent's `open` state stays `true` even though the modal is no longer rendered.

  **Consider:** Making `open` a `$bindable` prop (or forwarding a separate `onclose` callback) so the parent can react to dismissal:

  ```svelte
  let {
      open = $bindable(false),
      onclose,
      ...
  } = $props()
  ```

  ```svelte
  <Modal {open} {onclose} class={cn('w-full', className)}>
  ```

  This also matches the pattern used by `DeleteDialog` which already forwards cancellation via `cancelHref` (anchor navigation) — a welcomed pattern worth extending to overlay/Escape dismissal.

  Answer: Rejected. Not necessary.

- **`domain/frontend/account/src/lib/components/delete-dialog/delete-dialog.svelte:20` vs `account-form-modal/account-form-modal.svelte:23` — Inconsistent `loading` state management**

  `DeleteDialog` declares `loading` as `$bindable(false)` (bindable prop), while `AccountFormModal` declares `loading = $state(false)` (local state). Both are managed via the `use:enhance` callback. The inconsistency is minor, but a developer maintaining both components will wonder if the difference is intentional.
  - `DeleteDialog` pattern (bindable): lets the parent reset `loading` on error or customize behavior
  - `AccountFormModal` pattern (local): self-contained, no external control

  **Consider:** Using one pattern consistently, or documenting why each component chose differently. The `AccountFormModal` already calls `loading = false` in the enhance callback (`await update()`), so making it `$bindable` would cost nothing and provide flexibility.

  Answer: Fix. Use `$bindable`.

- **`packages/ui/src/lib/actions/auto-focus.js:20-28` — Blur-based focus trapping may miss edge cases**

  The `autoFocus` action traps focus by listening to `blur` on the dialog container with `capture: true`. This works because `blur` propagates through the capture phase to ancestor elements. However, the implementation relies on `event.relatedTarget` being set correctly by the browser, which varies across browsers for certain scenarios (e.g., when focus moves to an element in a different document/iframe, or during page visibility changes).

  **Consider:** Using `focusout` instead of `blur`, since `focusout` bubbles naturally (no need for `capture: true`) and is more widely supported for focus-trap scenarios. Alternatively, implementing a `Tab`/`Shift+Tab` keydown handler on the dialog that cycles focus among focusable children would provide more deterministic behavior.

  This is a minor robustness concern — the current implementation works correctly in the tests and common browser scenarios documented in the test file.

  Answer: Manually fixed. Accepted the `focusout` suggestion, but maintained the `relatedTarget` control. I'd rather having a loose focus control and let the user leave the page, if possible, that forcing they to not being able to leave. We might revisit this subject in the future.

---

### What's Done Well

- **REVIEW-2 fixes are comprehensively verified** — Every accepted fix from the previous review was properly applied and, where applicable, covered by new tests. The fix tracking table makes the evolution of code quality visible.

- **Focus trap implementation is clean and tested** — The `autoFocus` action handles initial focus, focus trapping via capture-phase blur, and focus restoration on destroy. The Modal test suite validates three distinct focus scenarios: initial focus, Tab to first child, and Shift+Tab trapping. This is a non-trivial accessibility feature and it's implemented with clarity.

- **Button disabled-anchor fix is correct** — The `elementProps` pattern cleanly overrides `href` when disabled by relying on Svelte's prop-merging order (`...restProps` first, then `...elementProps[element]`). Tests verify no `href` attribute when disabled or loading.

- **API error handling is thorough** — Both the account list loader and server actions now properly handle HTTP and network errors with consistent error mapping. The `account-list.test.js` covers 500 errors and `ECONNREFUSED` network errors, both returning appropriate error messages and empty account arrays.

- **Test quality is high** — 10 frontend-account test files with 63 tests and 8 UI test files with 99 tests, all passing. Tests use realistic interactions (`userEvent.keyboard`, `click`) and verify actual DOM state rather than implementation details. The focus trap tests using `createRawSnippet` with multiple focusable children are particularly well-crafted.

- **Loader split from REVIEW-1 is clean** — `account-create.js` and `account-edit.js` each load only their own i18n. The `account-form.js` barrel re-export maintains backward compatibility. No fragile spread merging.

---

### Verification Story

| Check                       | Result       | Notes                                                                                                     |
| --------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| **REVIEW-2 fixes verified** | Yes          | 5/5 accepted fixes confirmed applied. All working.                                                        |
| **New issues found**        | 1 important  | Disabled anchor keyboard-focusable (tabindex not set to -1). 3 minor suggestions.                         |
| **Tests reviewed**          | Yes          | All 18 test files (10 frontend-account + 8 UI) reviewed. Coverage is thorough.                            |
| **All tests pass**          | **Verified** | `@ems/domain-frontend-account`: 63 passed. `@ems/ui`: 99 passed. Root workspace: all 21 turbo tasks pass. |
| **Lint passes**             | Not verified | Run `npm run lint` from workspace root to confirm.                                                        |
| **Svelte check**            | Not verified | Run `npm run check` from `domain/frontend/account/` to confirm.                                           |
| **Security checked**        | Yes          | No secrets, no unsanitized user input, no new dependencies with known vulnerabilities.                    |
| **Plan compliance**         | Partial      | `account-detail` deferred to Cycle 6 (as noted in REVIEW-1). The plan has been updated accordingly.       |
| **Spec compliance**         | Partial      | Account detail page/view not implemented (deferred). All other spec items are covered.                    |
