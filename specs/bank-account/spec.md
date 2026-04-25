# Bank Account

## Summary

Enable users to create, view, edit, and delete bank accounts within the Expense Management System. Each bank account tracks a balance and serves as the foundation for recording financial transactions (income, expense, transfers) against a user's ledger.

## Problem Statement

Users need to manage multiple bank accounts (checking, savings, etc.) to accurately track their finances. Without an account entity, all transactions would lack a meaningful grouping context, making it impossible to reconcile balances or understand where money flows between accounts. The system currently has no account management capabilities, blocking all downstream financial operations.

## User Stories

- **As a** user, **I want to** create a bank account with a name and initial balance, **so that** I can start tracking transactions for that account
- **As a** user, **I want to** view a list of all my bank accounts with their current balances, **so that** I can get a quick overview of my finances
- **As a** user, **I want to** edit an account's name, **so that** I can keep my account labels accurate (e.g., renaming "Checking" to "Joint Checking")
- **As a** user, **I want to** delete an account I no longer use, **so that** my ledger stays clean and relevant
- **As a** user, **I want to** see the details of a specific account, **so that** I can review its balance and metadata

## Requirements

### Functional Requirements

1. **Create Bank Account**
   - User provides a name and an initial balance
   - Account is created with the balance set to the initial value
   - Account is linked to the authenticated user

2. **List Bank Accounts**
   - User can view all their bank accounts in a list
   - Each item shows: account name, current balance, creation date
   - Accounts ordered by creation date (newest first)

3. **Get Bank Account by ID**
   - User can view full details of a single account
   - Only the account owner can view the account

4. **Update Bank Account**
   - User can rename the account
   - Name must be non-empty

5. **Delete Bank Account**
   - User can delete an account they own
   - Only accounts with zero balance and no transactions can be deleted (soft delete preferred — see Technical Approach)

### Non-Functional Requirements

- **Security**: All endpoints require authentication. Users can only access their own accounts.
- **Performance**: Account list loads in under 200ms for up to 100 accounts.
- **Data Integrity**: Balance must never be negative. Account deletion must prevent data loss — use soft delete or block deletion when transactions exist.

## Design

### Data Model

**Account (Prisma model)**

```
Account {
  id         String   @id @default(uuid())
  userId     String
  name       String
  type       AccountType  // enum: BANK
  currency   String       // e.g. "BRL", "USD"
  balance    Decimal      // current balance
  createdAt  DateTime
  updatedAt  DateTime
  deletedAt  DateTime?    // soft delete nullable
}
```

Notes:
- `type` is set to `BANK` initially; `CREDIT_CARD` will be added in a future iteration
- `currency` defaults to the locale's currency (BRL for initial market)
- `balance` uses `Decimal` for precision (no floating-point errors)
- Soft delete via `deletedAt` preserves referential integrity for future transaction models

### User Interface

#### Account List Page (`/accounts`)
- Page header: "Accounts" with a "New Account" button
- List of account cards/rows showing:
  - Account name
  - Current balance (formatted, e.g. "R$ 1.234,56")
  - Created date
- Clicking an account navigates to the detail page
- Empty state: "No accounts yet. Create your first account."

#### Account Detail Page (`/accounts/:id`)
- Account name (editable via inline edit or dedicated edit action)
- Current balance (display only — balance changes happen through transactions)
- Account metadata (type, currency, creation date)
- Edit and Delete action buttons

#### Create Account Form
- Modal or inline form with fields:
  - Name (text input, required, max 100 chars)
  - Initial balance (currency input, optional, defaults to 0)
- Form validation with inline errors
- On success, redirect to the account detail page

### API Endpoints

| Method | Endpoint              | Description                            |
|--------|-----------------------|----------------------------------------|
| POST   | /accounts             | Create a new bank account              |
| GET    | /accounts             | List all accounts for the current user |
| GET    | /accounts/:id         | Get account details by ID              |
| PATCH  | /accounts/:id         | Update account name                    |
| DELETE | /accounts/:id         | Delete an account (soft delete)        |

#### POST /accounts

Request:
```json
{
  "name": "Nubank Checking",
  "initialBalance": 1000.00,
  "currency": "BRL"
}
```

Response (201):
```json
{
  "account": {
    "id": "uuid",
    "name": "Nubank Checking",
    "type": "BANK",
    "currency": "BRL",
    "balance": 1000.00,
    "createdAt": "2026-04-25T00:00:00Z",
    "updatedAt": "2026-04-25T00:00:00Z"
  }
}
```

#### GET /accounts

Response (200):
```json
{
  "accounts": [
    {
      "id": "uuid",
      "name": "Nubank Checking",
      "type": "BANK",
      "currency": "BRL",
      "balance": 1000.00,
      "createdAt": "2026-04-25T00:00:00Z",
      "updatedAt": "2026-04-25T00:00:00Z"
    }
  ]
}
```

#### GET /accounts/:id

Response (200):
```json
{
  "account": {
    "id": "uuid",
    "name": "Nubank Checking",
    "type": "BANK",
    "currency": "BRL",
    "balance": 1000.00,
    "createdAt": "2026-04-25T00:00:00Z",
    "updatedAt": "2026-04-25T00:00:00Z"
  }
}
```

#### PATCH /accounts/:id

Request:
```json
{
  "name": "Nubank Joint Checking"
}
```

Response (200):
```json
{
  "account": {
    "id": "uuid",
    "name": "Nubank Joint Checking",
    "type": "BANK",
    "currency": "BRL",
    "balance": 1000.00,
    "createdAt": "2026-04-25T00:00:00Z",
    "updatedAt": "2026-04-26T00:00:00Z"
  }
}
```

#### DELETE /accounts/:id

Response (200):
```json
{
  "message": "Account deleted successfully"
}
```

Error (409) when account has transactions:
```json
{
  "code": "HTTP",
  "message": "Cannot delete account with existing transactions. Remove all transactions first."
}
```

## Technical Approach

### Backend

- **Package**: `domain/backend/account/` — new domain backend package `@ems/domain-backend-account`
- Follow existing patterns from `@ems/domain-backend-auth`:
  - Plugin file exports default Fastify plugin function
  - Service layer with `ResultStatus` pattern for error handling
  - Factory functions for dependency injection
  - Zod schemas for request/response validation via `fastify-type-provider-zod`
- Route prefix: `/accounts`
- Prisma model `Account` added in `prisma/schema/account.prisma`
- Auth middleware from `@ems/domain-backend-auth` protects all endpoints
- On account creation with `initialBalance > 0`, a `MANUAL_BALANCE` transaction is created to seed the balance (preparing the ground for the Transaction feature)

### Frontend

- **Package**: `domain/frontend/account/` — new domain frontend package `@ems/domain-frontend-account`
- Svelte 5 components with SvelteKit routes:
  - `/accounts/+page.svelte` — Account list page
  - `/accounts/[id]/+page.svelte` — Account detail page
  - `/accounts/new/+page.svelte` — Create account page (or modal)
- Components follow `ARCHITECTURE.md` patterns:
  - Pages receive data via SvelteKit load functions (BFF pattern)
  - API calls go through the Web App server, not directly from client
- Tailwind CSS for styling
- cn() utility for class merging

### Data Flow

```
[Browser] ←→ [SvelteKit BFF (apps/web)] ←→ [Fastify API (apps/api)]
                        ↕
            [domain/frontend/account] (UI components, page components)
            [domain/backend/account]  (Fastify plugin, services)
                        ↕
                    [Prisma ORM]
                        ↕
                    [SQLite DB]
```

## Dependencies

- `@ems/domain-backend-auth` — Auth middleware for protecting endpoints
- `@ems/domain-backend-schema` — Schema utilities (errorHandling, withTypeProvider)
- `@ems/domain-shared-schema` — Shared DTO schemas, i18n patterns
- `@ems/domain-shared-account` — Shared account types and DTOs (new package)
- `@ems/utils` — assert, ResultStatus utilities
- `@ems/database` — Prisma client access
- `@prisma/client` — Database ORM
- `zod` — Schema validation

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Deleting an account with existing transactions breaks financial history | Soft delete via `deletedAt`; block deletion if transactions exist |
| Initial balance race condition if account creation and manual balance transaction are not atomic | Wrap both operations in a Prisma transaction |
| Currency formatting varies by locale | Frontend formats currency based on account's currency field |

## Acceptance Criteria

- [ ] Authenticated user can create a bank account with name, optional initial balance, and currency
- [ ] Creating an account with initial balance > 0 seeds the balance via a MANUAL_BALANCE transaction
- [ ] Account list returns only accounts owned by the authenticated user
- [ ] Account list does not return soft-deleted accounts
- [ ] Account detail returns full account info for the owner
- [ ] Non-owner receives 404 (not 403, to avoid leaking account existence)
- [ ] Account name can be updated via PATCH
- [ ] Account with zero balance and no transactions can be soft-deleted
- [ ] Account with non-zero balance or existing transactions returns 409 on delete
- [ ] Soft-deleted accounts are excluded from all API responses
- [ ] All endpoints return 401 when no valid access token is provided
- [ ] Invalid input returns 400 with validation error details
- [ ] Frontend account list page renders account cards with name, balance, and date
- [ ] Frontend account detail page shows full account info with edit/delete actions
- [ ] Frontend create account form validates input inline and submits successfully

## Out of Scope

- Transaction recording (income, expense, transfer) — to be covered in a separate spec
- Credit Card account type — to be covered in a separate spec (Q3 2026)
- Balance reconciliation features (Q4 2026)
- Account archival / restore from soft-delete
- Multi-currency support (currency is set at creation, not converted)
- CSV/OFX import of account data
- Account balance history graph
