# Bank Account Implementation Plan

## Overview

Enable users to create, view, edit, and delete bank accounts within the Expense Management System. Each bank account tracks a balance and serves as the foundation for recording financial transactions.

## Prerequisites

- [x] Read and understand feature specification at `specs/bank-account/spec.md`
- [x] Review existing architecture and dependencies
- [x] Understand design requirements at `specs/bank-account/design.md`

## Cycles

### Cycle 1: Prisma Schema — Account model

**Objective:** Add the Account database model and AccountType enum to Prisma schema.

**Steps:**

- [x] Create `prisma/schema/account.prisma` with `AccountType` enum and `Account` model
- [x] Add `deletedAt` (nullable), `balance` as Decimal, relation to User
- [x] Run `npm run db:generate` to generate Prisma client
- [x] Write tests verifying the generated model types

**Dependencies:** None (innermost layer)

**Quality Gates:**

- [x] Lint passes
- [x] Prisma generates successfully
- [x] Type checking passes

### Cycle 2: Shared Domain Package — `@ems/domain-shared-account`

**Objective:** Create shared DTOs, Zod schemas, and i18n for the account domain.

**Pre-condition:** A shared `pagination.dto.js` already exists in `@ems/domain-shared-schema` providing `createPageDtoSchema(items)` factory, `pageInputDtoSchema`, `PageInputDTO` and `PageDTO` types. This was created ahead of schedule and must be reused instead of rolling custom pagination.

**Steps:**

- [x] Create `domain/shared/account/` package structure with `package.json`
- [x] Create `create-account.dto.js` — Zod schema with i18n (name, initialBalance, currency)
- [x] Create `update-account.dto.js` — Zod schema with i18n (name)
- [x] Create `account.dto.js` — response DTO with all account fields
- [x] Create `account-list.dto.js` — paginated list response using `createPageDtoSchema(accountDtoSchema)` from `@ems/domain-shared-schema` (yields `{ items, size, nextPageCursor }`; note that field names differ from the spec's `pageSize`/`nextPageToken`)
- [x] Create `account-list-input.dto.js` — input DTO using `pageInputDtoSchema` for cursor-based list requests (filter by userId, optional pagination)
- [x] Create `account-errors.i18n.js` — error literals for account operations
- [x] Create `account-type.js` — enum-like constants for AccountType (BANK)
- [x] Create `index.js` barrel export
- [x] Write tests for all schemas

**Dependencies:** None (shared layer)

**Quality Gates:**

- [x] Lint passes
- [x] Tests pass (39 tests, 7 test files)
- [x] Type checking passes

### Cycle 3: Backend Domain Package — `@ems/domain-backend-account`

**Objective:** Implement the backend business logic and Fastify plugin for account CRUD.

**Steps:**

- [x] Create `domain/backend/account/` package structure with `package.json`

- [x] **Account Repository** (`account.repository.js`):
  - Factory function receiving PrismaClient
  - Create account (with initial balance via Prisma transaction)
  - Find all by user ID with cursor-based pagination (excluding soft-deleted); input type `AccountListInput` already defined in `prisma/src/alias.ts` (filter: `{ userId? }`, page: `{ size?, cursor? }`)
  - Find by ID (excluding soft-deleted)
  - Update account name
  - Soft delete account (set `deletedAt`)
  - Check if account has transactions (returns false initially — placeholder for future Transaction model)
  - Test file with mocked PrismaClient

- [x] **Account Service** (`account.service.js`):
  - Factory function receiving repository
  - `create` — validates user ownership, creates account with MANUAL_BALANCE transaction seed
  - `list` — returns paginated result: `{ items, size, nextPageCursor }` ordered by newest first
  - `getById` — returns single account, 404 for non-owner
  - `update` — rename account
  - `delete` — soft delete, 409 if has transactions
  - Test file with mocked repository

- [x] **Account Plugin** (`plugin.js`):
  - Fastify plugin registered under `/accounts` prefix
  - All routes protected via `app.allowOneOf` with `ACCOUNT_READ`/`ACCOUNT_WRITE` permissions
  - POST `/` — create, response schema: `{ account: AccountDTO }`
  - GET `/` — list, response schema: `{ items: AccountDTO[], size: number, nextPageCursor: string | null }`
  - GET `/:id` — get by ID, response schema: `{ account: AccountDTO }`
  - PATCH `/:id` — update, response schema: `{ account: AccountDTO }`
  - DELETE `/:id` — delete, response schema: `{ message: string }`
  - Test file with mocked Fastify

- [x] Create `index.js` barrel export

**Dependencies:** Cycle 1, Cycle 2

**Quality Gates:**

- [x] Lint passes
- [x] Tests pass (41 tests)
- [x] Type checking passes

### Cycle 4: UI Primitives — Modal & Sidebar in `@ems/ui`

**Objective:** Implement Modal (centered overlay) and Sidebar components in the shared UI package, with Storybook stories. These are required by the account pages and will be reusable across the app.

**Steps:**

- [x] **Modal component** (`packages/ui/src/lib/components/modal/`):
  - Overlay (fixed inset, `bg-black/40`, centered content)
  - Uses component composition: `<ModalHeader>`, `<ModalContent>`, `<ModalActions>` as section sub-components
  - `Modal` is the **default export** — no snippet props, just `children`
  - `ModalHeader`, `ModalContent`, `ModalActions` are **named exports** — each accepts `children`, `class`, `testId`
  - TDD: write tests first with vitest-browser-svelte
  - Create `index.js` barrel export re-exporting `Modal` (default), `ModalHeader`, `ModalContent`, `ModalActions` (named)

- [x] **Modal Storybook stories** (`modal.stories.svelte`):
  - Default modal with sample content via `<ModalHeader>`/`<ModalContent>`/`<ModalActions>` composition
  - Form layout scenario

- [x] **Paper refactoring** (`packages/ui/src/lib/components/paper/`):
  - Paper no longer has `header`/`footer` snippets — only renders `children` inside card container
  - Create `PaperHeader`, `PaperContent`, `PaperFooter` as standalone sub-components (each with `children`, `class`, `testId`)
  - Consumers compose sections declaratively and control padding via `class` instead of hardcoded values
  - TDD: update existing tests, add tests for sub-components
  - Update Storybook stories to use composition pattern
  - Update all Paper consumers (login-form, signup-form, signup-success)

- [x] **Sidebar component** (`packages/ui/src/lib/components/sidebar/`):
  - Uses component composition: `<Sidebar>` renders children inside a Paper container, `<SidebarHeader>`, `<SidebarContent>`, `<SidebarFooter>` as section sub-components, `<SidebarItem>` for each nav entry
  - `Sidebar` is the **default export** — no snippet props, just `children`
  - `SidebarHeader`, `SidebarContent`, `SidebarFooter` are **named exports** — delegate to `PaperHeader`/`PaperContent`/`PaperFooter` internally
  - `SidebarItem` is a **named export** — handles individual nav item (icon, label, active state, onclick, href)
  - TDD: write tests first
  - Create `index.js` barrel export re-exporting `Sidebar` (default), `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarItem` (named)
  - Note: Uses existing Tailwind theme tokens (`bg-accent`, `text-foreground`, `text-muted-foreground`, `border-border`) since `sidebar-*` tokens are not defined in `packages/ui/src/lib/index.css`

- [x] **Sidebar Storybook stories** (`sidebar.stories.svelte`):
  - Default sidebar with nav items via `<SidebarHeader>`/`<SidebarContent>`/`<SidebarFooter>` composition
  - With active item highlighted

- [x] **InputNumeric component** (`packages/ui/src/lib/components/input-numeric/`):
  - Wraps Input with auto-formatting for numeric values (unit, decimal, currency, percent)
  - Uses `Intl.NumberFormat.formatToParts` to separate value from unit/symbol (unit stored but not displayed in input)
  - `format` prop accepts `Intl.NumberFormatOptions`; `locale` defaults to `'en'`
  - `value` is `$bindable('')` via `normalizeFormatterOptions`
  - TDD: tests cover unit (no digits), decimal, currency, percent (with/without digits), non-digit stripping, empty value, and default behavior
  - Created `index.js`, `format.js`, `types.ts`, `input-numeric.stories.svelte`, `input-numeric.svelte.test.js`

- [x] Export both from `packages/ui/src/lib/index.js`

**Dependencies:** None (standalone UI package)

**Quality Gates:**

- [x] Lint passes
- [x] Tests pass
- [x] Svelte check passes
- [x] Storybook stories render correctly
- [x] Components match design spec tokens (using existing theme tokens)

### Cycle 5: Frontend Domain Package — `@ems/domain-frontend-account`

**Objective:** Create Svelte components, BFF loaders, and BFF actions for the account UI.

**Steps:**

- [ ] Create `domain/frontend/account/` package structure with `package.json`

- [ ] **API Client** (`api/account.api.js`):
  - Factory function receiving HttpClient
  - `createAccount`, `listAccounts`, `getAccountById`, `updateAccount`, `deleteAccount`

- [ ] **Server Actions** (`server/actions/`):
  - `create-account.js` — form validation, API call, return result
  - `update-account.js` — form validation, API call, return result
  - `delete-account.js` — API call, return result

- [ ] **Server Loaders** (`server/loaders/`):
  - `account-list.js` — loads accounts list data + i18n
  - `account-detail.js` — loads single account data + i18n
  - `account-form.js` — loads i18n for create/edit form

- [ ] **UI Components** (`components/`):
  - `account-card/` — Single account row/card for desktop + mobile
  - `account-list/` — List of account cards (empty state, loading, populated)
  - `account-form/` — Create/Edit account form modal with validation
  - `account-detail/` — Account detail view with actions
  - `delete-dialog/` — Delete confirmation dialog
  - Tests for each component (no Storybook — domain packages don't have it)

- [ ] Create `index.js` barrel export

**Dependencies:** Cycle 2 (shared schemas), Cycle 3 (API endpoints), Cycle 4 (UI primitives)

**Quality Gates:**

- [ ] Lint passes
- [ ] Tests pass
- [ ] Svelte check passes

### Cycle 6: Application Integration

**Objective:** Wire everything together — register backend plugin in API gateway, add routes in web app.

**Steps:**

- [ ] **API Gateway** (`apps/api/src/plugin.js`):
  - Add `@ems/domain-backend-account` to dependencies
  - Import account plugin
  - Register under `/accounts` prefix with PrismaClient and auth service

- [ ] **Web App routes** (`apps/web/src/routes/`):
  - Create `(authenticated)/+layout.svelte` — authenticated layout with Sidebar component
  - Create `(authenticated)/+layout.server.js` — auth guard (redirect to login if no session)
  - Create `(authenticated)/accounts/+page.svelte` (+page.server.js)
  - Create `(authenticated)/accounts/[id]/+page.svelte` (+page.server.js)
  - Wire loaders and actions from domain package

**Dependencies:** Cycle 3, Cycle 5

**Quality Gates:**

- [ ] Lint passes
- [ ] All tests pass (run tests from workspace root)
- [ ] Type checking passes
- [ ] Manual verification of full flow

## Dependencies Graph

```
Cycle 1 (Prisma) → Cycle 2 (Shared) → Cycle 3 (Backend) ──────────────────┐
                                        ↓                                 ↓
                                    Cycle 4 (UI Primitives) → Cycle 5 (Frontend Domain)
                                                                           ↓
                                                                  Cycle 6 (Integration)
```

## Testing Strategy

- **Unit Tests:** Vitest with `vi.fn()`, `vi.mock()`, `vi.spyOn()`
- **Repository Tests:** Mock PrismaClient using `vitest-mock-extended`
- **Service Tests:** Mock repository and database error handling
- **Plugin Tests:** Fastify `inject()` for API endpoint testing
- **Component Tests:** Vitest with `vitest-browser-svelte`
- **Coverage Goal:** 100% for new code, maintain existing coverage

## Design Compliance (Frontend)

- [ ] Follow design tokens from `specs/bank-account/design.md` (match to Tailwind classes)
- [ ] Use `cn()` utility from `@ems/ui` for class merging
- [ ] Implement responsive design for both desktop and mobile views
- [ ] Use Existing UI components (Button, Input, Paper, Card etc.) from `@ems/ui`
- [ ] Verify against screenshots: `create-account-modal.png`, `edit-account-modal.png`, `delete-account-modal.png`, `accounts-list-desktop.png`, `accounts-list-mobile.png`

## Risk Assessment

| Risk                                                        | Mitigation                                                     |
| ----------------------------------------------------------- | -------------------------------------------------------------- |
| Soft delete and initial balance transaction atomicity       | Wrap in Prisma transaction                                     |
| Missing Transaction model means delete check is placeholder | Return `hasTransactions: false` until Transaction model exists |
| Currency formatting varies                                  | Format based on account's currency field in frontend           |

## Success Criteria

- [ ] All user stories from spec are implemented
- [ ] All tests pass with required coverage
- [ ] Code follows project conventions and architecture
- [ ] Design matches specifications
- [ ] Performance meets requirements
