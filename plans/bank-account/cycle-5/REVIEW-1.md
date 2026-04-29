# Cycle 5 Review 1 — `@ems/domain-frontend-account`

## Review Summary

**Verdict:** REQUEST CHANGES

**Overview:** This cycle creates the frontend domain package (`@ems/domain-frontend-account`) with UI components (AccountCard, AccountList, AccountFormModal, DeleteDialog), BFF server actions (create, update, delete), BFF loaders (account-list, account-form), and an API client. The Button component in `@ems/ui` is also refactored to support `<a>` elements. The overall structure is solid and follows existing patterns, but there are several issues that should be fixed before merge, including an inactive Cancel button in the form modal, a duplicated test, a missing `account-detail` implementation from the plan, and a fragile literal merge in the form loader.

---

### Critical Issues

_None._ No security vulnerabilities, data loss risks, or completely broken functionality were identified.

---

### Important Issues

- **`domain/frontend/account/src/lib/components/account-form-modal/account-form-modal.svelte:96-104` — Cancel button has no effect**

  The Cancel button is `<Button type="button">` with no click handler, no `href`, and no `ontoggle` or callback to close the modal. The `open` prop on `<Modal>` is **not** `$bindable()`, so the parent's `open` state cannot be modified from within the component. Pressing Cancel currently does nothing. This breaks user expectations for a form modal.

  **Fix:** Either make the Cancel button navigate away (like DeleteDialog does with `element="a"` + `href`), or add a `onclose`/`oncancel` callback prop to the component, or make `open` bindable on the parent. The simplest approach consistent with existing patterns:

  ```svelte
  <!-- Add a cancelHref prop and use element="a" like DeleteDialog -->
  <Button
      element="a"
      variant="secondary"
      size="large"
      class="w-full"
      disabled={loading}
      href={cancelHref}
      aria-label={literals.cancelButton}
  >
      {literals.cancelButton}
  </Button>
  ```

  This requires adding `cancelHref` to `AccountFormModalProps` and passing it from the consumer.

  Answer: Fix. Add cancelHref prop and apply the suggested change (add element="a" and href).

- **`domain/frontend/account/src/lib/components/account-list/account-list.svelte.test.js:139-153` — Duplicate test case**

  The test `'delete link has correct href'` at line 139 is an exact duplicate of the test starting at line 123 (same name, same assertions). This silently passes but wastes CI time and indicates a copy-paste error.

  **Fix:** Remove the duplicate test (lines 139-153).

  Answer: Fix. Remove.

- **`plans/bank-account/PLAN.md:186-194` — Missing `account-detail` implementation**

  The plan specifies two items that are not present in the staged changes:
  - `server/loaders/account-detail.js` — loader for single account data + i18n
  - `components/account-detail/` — account detail view component with edit/delete actions

  The corresponding acceptance criteria from the spec ("Frontend account detail page shows full account info with edit/delete actions" and "User can view full details of a single account") cannot be fulfilled without these. The feature is incomplete.

  **Fix:** Implement the `account-detail` loader and component, or explicitly defer them to Cycle 6 and update the plan. If deferring, at minimum add the loader (`account-detail.js`) since the API client's `getAccountById` already exists, leaving only the component for Cycle 6.

  Answer: Rejected. Will rework loaders/account-form splitting into loaders/account-create.js and loaders/account-edit.js.

- **`domain/frontend/account/src/lib/server/loaders/account-form.js:28-37` — Fragile literal key collision via spread order**

  The `accountFormLoader` merges three i18n objects via spread in this order:

  ```js
  {
      createTitle: createLiterals.title,
      createSubtitle: createLiterals.subtitle,
      editTitle: editLiterals.title,
      editSubtitle: editLiterals.subtitle,
      ...createLiterals,  // overrides createTitle/editTitle with title
      ...editLiterals,     // overrides title with edit title
      ...dialogLiterals   // overrides title/cancelButton with dialog values
  }
  ```

  Keys like `title`, `subtitle`, `nameLabel`, `cancelButton` appear in multiple literal sets. The final value depends on spread order. Currently `dialogLiterals` (spread last) wins for `title` and `cancelButton`, which happens to be "Delete Account" / "Cancel" — likely correct. But `nameLabel` comes from `editLiterals` (spread second-to-last), which is correct only because create and edit share the same `nameLabel`. This is fragile: any future addition of a shared key will silently shadow the expected value with no type error.

  The explicit extraction of `createTitle` / `createSubtitle` / `editTitle` / `editSubtitle` before the spreads shows the author was aware of the collision problem, but the fix is incomplete.

  **Fix:** Either (a) remove the spreads and be fully explicit about returned keys, or (b) use separate namespaced properties (e.g., `createLiterals`, `editLiterals`, `dialogLiterals`) instead of one flat object:

  ```js
  return {
    literals: {
      create: createLiterals,
      edit: editLiterals,
      dialog: dialogLiterals,
    },
  };
  ```

  This also improves the return type from the vague `Record<string, string>` to something structured.

  Answer: Fix. Split this loader into two: `createAccountLoader` and `editAccountLoader`. Each loader loads its own literal.
  Both loaders should return literals with type `AccountFormModalLiterals`.

- **`domain/frontend/account/src/lib/api/account.api.js:33-43` — Empty query parameters sent when no pagination provided**

  When `listAccounts()` is called with no arguments (the default), the query object is `{ size: undefined, cursor: undefined }`. Depending on how `httpClient.get` serializes query parameters, this may send `?size=undefined&cursor=undefined` or include empty-valued params in the URL. Neither the API test nor the loader test verifies the URL when no pagination is provided.

  **Fix:** Filter out `undefined` values before passing to the query:

  ```js
  listAccounts({ size, cursor } = {}) {
      const query = Object.fromEntries(
          Object.entries({ size, cursor }).filter(([_, v]) => v != null)
      )
      return httpClient.get('/accounts', {
          request: { query },
          response: jsonResponse()
      })
  },
  ```

  Add a test verifying that calling `listAccounts()` with no args produces a clean `/accounts` URL with no query string.

  Answer: Reject. This is duplicate work, `HttpClient` already filter out null and undefined.

- **`packages/i18n/src/types.ts:17` — Type safety loosened from recursive constraint to `any`**

  ```ts
  - export type Imports<L extends string = string> = Record<string, I18n<L, I18nInput, Imports<L>>>
  + export type Imports<L extends string = string> = Record<string, I18n<L, any, any>>
  ```

  The change was likely needed to support the nested `accountCard` import in `account-list.i18n.js`. However, replacing the recursive `Imports<L>` constraint with `any` eliminates type checking on imported nested literal shapes.

  **Fix:** Instead of `any`, define a more flexible but still constrained type. If the recursive type was causing issues with deeply nested literal resolution, consider:

  ```ts
  export type Imports<L extends string = string> = Record<
    string,
    I18n<L, I18nInput, Imports<L> | never>
  >;
  ```

  Or document the tradeoff explicitly. At minimum, keep the third parameter constrained rather than using bare `any`.

  Answer: Rejected. By restricting the type in this case causes the typechecker to fail to infer types in many other cases. The way it is, the typesafety of literals are working.

- **`domain/frontend/account/src/lib/server/actions/delete-account.js:38-39` — Network errors not handled**

  The `submitDeleteAccountAction` calls `makeHttpErrorMapper` with custom handlers for 403, 404, 409, but does not handle network errors (e.g., `ECONNREFUSED`, timeout). The `create-account.js` action handles this via `mapError` which has a fallback. The delete and update actions should be consistent.

  **Fix:** Verify that `makeHttpErrorMapper` provides a fallback for non-HTTP errors (network failures). If it does, add a test for the network error case (as `create-account.test.js` does at line 115). If it doesn't, add a catch-all handler.

  Answer: Reject. `makeHttpErrorMapper` handles unexpected errors and network errors.

---

### Suggestions

- **`domain/frontend/account/src/lib/components/account-card/account-card.svelte:83-91` — Delete icon button uses class override instead of `variant="destructive"`**

  The delete button adds `class="text-destructive hover:text-destructive"` but keeps the default `variant` (which sets `bg-primary text-primary-foreground`). The `bg-primary` background is overridden by icon-size constraints but the approach is inconsistent with the design spec's "Icon Button/Destructive". Consider passing `variant="destructive"` which provides correct hover/active/focus styling for destructive icon buttons.

  Answer: Fix. Add variant destructive and remove these classes.

- **`packages/ui/src/lib/components/modal/modal.svelte` — No Escape key or overlay click dismissal**

  The Modal component has no keyboard event listener for Escape and no click handler on the overlay. This affects accessibility (ARIA `dialog` pattern requires Escape to close). Consider adding keyboard and overlay-click dismissal with a bindable `open` prop or an `onclose` callback. This would also help resolve the Cancel button issue in AccountFormModal.

  Answer: Fix. Apply suggestions.

- **`domain/frontend/account/src/lib/components/account-form-modal/account-form-modal.i18n.js:32-33` — Unused i18n keys in edit literals**

  The `editAccountFormModalI18n` object includes `balanceLabel: 'Initial Balance'` and `balancePlaceholder: '0,00'` even though the initial balance field is only shown in create mode (conditional on `{#if mode === 'create'}`). These keys are dead code in edit mode.

  **Fix:** Remove `balanceLabel` and `balancePlaceholder` from `defaultEditLiterals` and `editAccountFormModalI18n.pt_BR`.

  Answer: Reject. both literals are used on create account mode, and we need to keep them to maintain type compatibility between create and edit literals.

- **`domain/frontend/account/src/lib/server/loaders/account-form.js:8-9` — Loader imports from `../../components/` (inside `src/lib/`)**

  The loader imports i18n modules from the components directory using relative paths (`../../components/...`). This is valid since both are within `src/lib/`, but it creates a coupling between the `server/` layer and the `components/` layer within the same package. Consider whether the i18n module should be colocated or whether a barrel export from the component's `index.js` would be more maintainable.

  Answer: Reject. The i18n is defined along to the component that uses to reduce drift and coginitive load. But it is the server/loader responsibility to load it. Just keep it.

- **`domain/frontend/account/src/lib/api/account.api.test.js:91-104` — `getAccountById` test doesn't verify the URL path contains the ID**

  The test verifies the HTTP method is GET but does not assert the URL contains the expected account ID. This is a minor gap — other tests (create, list, update, delete) all verify the full URL. Consider adding:

  ```js
  expect(httpStub.fetch).toHaveBeenCalledWith(
    "http://api.example.com/accounts/1",
    expect.objectContaining({ method: "GET" }),
  );
  ```

  Answer: Reject. The test literaly does that. It asserts if the fetch has been called with the URL that contains the ID.

- **`packages/ui/src/lib/components/button/button.svelte:41` — `javascript:void(0)` on disabled anchor**

  When a `<Button element="a">` is disabled, `href` is set to `'javascript:void(0)'`. This can cause issues with assistive technology and with "open in new tab" gestures. Consider removing the `href` attribute entirely when disabled.

  ```js
  a: {
      'aria-disabled': disabled || loading,
      ...(disabled || loading ? {} : { href: restProps.href }),
      role: 'button'
  }
  ```

  Answer: Fix. Apply the suggestion.

---

### What's Done Well

- **Comprehensive test coverage** — Every component, action, loader, and API method has corresponding tests covering happy paths, error states, and loading states. Tests use `vitest-browser-svelte` with realistic interactions and assertions. The `createEnhanceMock` pattern is clean and enables proper testing of SvelteKit form actions.

- **Consistent Error Handling** — Server actions follow a consistent `{ isSuccess, status, errorMessage, errors }` result shape. The `makeHttpErrorMapper` pattern is correctly applied across create, update, and delete actions with appropriate HTTP status code handling (400, 403, 404, 409, 503).

- **Component Composition** — Components compose well from UI primitives (`Modal`, `ModalHeader`, `ModalContent`, `ModalActions`, `Button`, `Input`, `InputNumeric`). The DeleteDialog and AccountFormModal reuse the same Modal sub-components from `@ems/ui`, maintaining visual consistency.

- **Responsive Design** — The AccountCard has proper responsive breakpoints (`md:flex-row`, `md:hidden` for mobile-only layout), matching the design spec's desktop and mobile variants. Tailwind classes follow project conventions with theme tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, etc.).

- **Button component refactoring** — The `element` prop (`'button'` | `'a'`) is a clean generalization that lets the same component render both `<button>` and `<a>` elements. The `elementProps` derived state correctly maps disabled state to the HTML attributes (`disabled` for button, `aria-disabled` + `href` for anchor). The union type in `types.ts` (`ButtonElementProps | AnchorElementProps`) provides proper type narrowing.

- **API client design** — The factory function pattern with HttpClient dependency injection follows the project's established DI conventions. Cursor-based pagination is correctly plumbed through `listAccounts()`.

---

### Verification Story

| Check                | Result       | Notes                                                                                        |
| -------------------- | ------------ | -------------------------------------------------------------------------------------------- |
| **Tests reviewed**   | Yes          | 13 test files across components, actions, loaders, and API client. One duplicate test found. |
| **All tests pass**   | Not verified | Run `npm run test` from `domain/frontend/account/` to confirm                                |
| **Lint passes**      | Not verified | Run `npm run lint` from `domain/frontend/account/` to confirm                                |
| **Svelte check**     | Not verified | Run `npm run check` from `domain/frontend/account/` to confirm                               |
| **Security checked** | Yes          | No secrets in code, no user input vulnerabilities, no new dependencies with known issues.    |
| **Plan compliance**  | Partial      | `account-detail` loader and component missing from implementation                            |
| **Spec compliance**  | Partial      | Account detail page/view not implemented; cancel button in form modal is non-functional      |
