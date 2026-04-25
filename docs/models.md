# Models

```mermaid
erDiagram
  User {
    string id PK "UUID"
    string firstName "nullable"
    string lastName "nullable"
    string email UK
    string username UK
    string password
    enum role "USER | MANAGER | ADMIN"
  }

  Session {
    string id PK "UUID"
    string userId FK
    string jti UK
    datetime lastRefresh
    datetime expiresAt
  }

  Role {
    string USER
    string MANAGER
    string ADMIN
  }

  User ||--o{ Session : "has"
```

## Relationships

- **User (1) ――――→ Session (N)**: A user can have multiple sessions. Each session belongs to exactly one user.
- **Session.jti**: Unique JWT identifier used for token validation.
- **Role**: Defines authorization levels — `USER` (basic), `MANAGER` (read/write users), `ADMIN` (full access including delete and session revocation).

---

## Future State

```mermaid
erDiagram
  User {
    string id PK "UUID"
    string firstName "nullable"
    string lastName "nullable"
    string email UK
    string username UK
    string password
    enum role "USER | MANAGER | ADMIN"
  }

  Session {
    string id PK "UUID"
    string userId FK
    string jti UK
    datetime lastRefresh
    datetime expiresAt
  }

  Account {
    string id PK "UUID"
    string userId FK
    string name
    enum type "BANK | CREDIT_CARD"
    string currency "BRL"
    decimal balance
    datetime createdAt
    datetime updatedAt
  }

  Transaction {
    string id PK "UUID"
    string accountId FK
    string categoryId FK "nullable"
    enum type "INCOME | EXPENSE | TRANSFER | MANUAL_BALANCE"
    decimal amount
    string description
    datetime date
    string note "nullable"
    string transferId "nullable, links transfer pairs"
    datetime createdAt
  }

  Category {
    string id PK "UUID"
    string name
    enum type "INCOME | EXPENSE"
    string icon "nullable"
    string color "nullable"
  }

  Invoice {
    string id PK "UUID"
    string accountId FK "credit card"
    date dueDate
    date closingDate
    decimal totalAmount
    enum status "OPEN | CLOSED | PAID"
    datetime paidAt "nullable"
    datetime createdAt
  }

  InvoiceTransaction {
    string id PK "UUID"
    string invoiceId FK
    string transactionId FK
  }

  Transfer {
    string id PK "UUID"
    string fromTransactionId FK
    string toTransactionId FK
  }

  User ||--o{ Session : "has sessions"
  User ||--o{ Account : "owns"
  Account ||--o{ Transaction : "contains"
  Account ||--o{ Invoice : "generates"
  Category ||--o{ Transaction : "classifies"
  Invoice ||--o{ InvoiceTransaction : "includes"
  Transaction ||--o{ InvoiceTransaction : "linked from"
  Transaction ||--o{ Transfer : "outgoing leg"
  Transaction ||--o{ Transfer : "incoming leg"
```

## Future Relationships

- **User (1) ――→ Account (N)**: A user can own multiple bank accounts and credit cards.
- **Account (1) ――→ Transaction (N)**: All financial activity (income, expense, transfers, manual adjustments) is recorded as transactions against an account.
- **Account (1) ――→ Invoice (N)**: Credit card accounts generate recurring invoices with due dates.
- **Category (1) ――→ Transaction (N)**: Transactions are optionally classified under a category (income or expense type).
- **Invoice (1) ――→ InvoiceTransaction (N)**: An invoice groups multiple purchases.
- **Transaction (1) ――→ InvoiceTransaction (N)**: A transaction can be linked to an invoice item.
- **Transaction (1) ――→ Transfer (1)**: A transfer is modeled as two linked transactions — a debit from one account and a credit to another — connected via the `Transfer` entity. The `Transaction.transferId` field also serves as a lightweight grouping key for transfer pairs.
