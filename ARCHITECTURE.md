# Project Architecture

## Table of Contents

- [The Goal of Architecture](#the-goal-of-architecture)
- [Applications](#applications)
  - [API Gateway Application](#api-gateway-application)
  - [Web Application](#web-application)
- [Domain Packages](#domain-packages)
  - [Backend](#backend)
    - [Architectural Principles](#architectural-principles)
      - [1. Vertical Boundaries (Features/Slices)](#1-vertical-boundaries-featuresslices)
      - [2. Horizontal Boundaries (Layers)](#2-horizontal-boundaries-layers)
      - [3. The Dependency Rule](#3-the-dependency-rule)
      - [4. Contracts](#4-contracts)
  - [Frontend](#frontend)
- [Types Packages](#types-packages)
  - [Backend](#backend-1)
  - [Frontend](#frontend-1)
  - [Shared](#shared)
- [Packages](#packages)
- [Prisma](#prisma)

## The Goal of Architecture

Enable the development team to:

1. **Add** features with minimal friction
2. **Change** existing features safely
3. **Remove** features cleanly
4. **Test** features in isolation
5. **Deploy** independently when possible

## Applications

### API Gateway Application

The backend APIs shell application. It should not contain any domain code; instead, it imports Fastify plugins from backend domain packages and registers them under its path namespace. All APIs are meant to be frontend-agnostic, meaning their responses should not contain frontend formatting.

- **Folder:** `apps/api`
- **Technologies:** JavaScript, JSDoc, Fastify
- **Tools:** Prettier, ESLint, TSC (typechecking)

### Web Application

The frontend shell application. It should not contain detailed components; instead, it imports page components from domain frontend packages. The application integrates with the API Gateway through API Clients imported from domain frontend packages.

Server actions and loaders act as a Backend for Frontend (BFF) and execute calls using the API Clients mentioned earlier. It is the BFF's responsibility to format API responses to a suitable format for display.

The frontend client should never make calls directly to API Gateway—all calls must be handled by BFF. In cases where the UI needs to make a client-side API call, use Svelte server endpoints (`+server.js`) to receive the call and implement the API client in the domain frontend package.

- **Folder:** `apps/web`
- **Technologies:** JavaScript, JSDoc, Svelte 5, SvelteKit, TailwindCSS
- **Tools:** Prettier, ESLint, SvelteCheck, Vite

## Domain Packages

All packages that contain business domain code.

### Backend

Business domain code related to the backend. These packages export, as a default module, a Fastify plugin that sets up the APIs related to the domain. These packages might also export middlewares and other utility functions specific to the given domain. The plugin receives `PrismaClient` by dependency inversion through Fastify Plugin Options.

- **Folder:** `domain/backend/<domain-name>`
- **Technologies:** JavaScript, JSDoc, Fastify, Prisma ORM
- **Tools:** Prettier, ESLint, TSC (typechecking)

#### Architectural Principles

##### 1. Vertical Boundaries (Features/Slices)

Organize by **feature**, not by technical layer.

```
BAD: Layer-first
src/
  controllers/
    user.controller.ts
    order.controller.ts
  services/
    user.service.ts
    order.service.ts
  repositories/
    user.repository.ts
    order.repository.ts

GOOD: Feature-first
src/
  users/
    user.controller.js
    user.service.js
    user.repository.js
  orders/
    order.controller.js
    order.service.js
    order.repository.js
```

**Why:** Changes to the "users" feature stay in `users/`. This provides high cohesion within features.

##### 2. Horizontal Boundaries (Layers)

Separate concerns into layers with clear dependencies.

```
┌──────────────────────────────────────┐
│           Presentation               │  UI, Controllers, CLI
├──────────────────────────────────────┤
│           Application                │  Use Cases, Orchestration
├──────────────────────────────────────┤
│             Domain                   │  Business Logic, Entities
├──────────────────────────────────────┤
│          Infrastructure              │  Database, APIs, External
└──────────────────────────────────────┘
```

##### 3. The Dependency Rule

**Dependencies point INWARD.**

```
Infrastructure → Application → Domain
      ↓               ↓            ↓
   (outer)        (middle)      (inner)
```

- Inner layers know NOTHING about outer layers
- Domain has zero dependencies on infrastructure
- Use interfaces to invert dependencies

Domain defines the interface (inner):

```typescript
interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
}
```

Infrastructure implements it (outer):

```javascript
/**
 * @param {PrismaClient} db
 * @returns {UserRepository}
 */
function createSQLiteUserRepository(db) {
  return {
    save(user) {
      // SQL Insert here
    },
    findById(id) {
      // SQL Query here
    },
  };
}
```

Domain service uses the interface:

```javascript
/**
 * @param {UserRepository} repository
 * @returns {UserService}
 */
function createUserService(repository) { // Depends on abstraction
    return { ... }
}
```

##### 4. Contracts

Interfaces define boundaries between components.

```typescript
// The contract. Types live in types workspaces.
interface PaymentGateway {
  charge(amount: Money, card: CardDetails): Promise<ChargeResult>;
  refund(chargeId: string): Promise<RefundResult>;
}
```

Multiple implementations are possible—always use factory functions.

```javascript
/**
 * @params {StripeClient} client
 * @returns {PaymentGateway}
 */
function createStripeGateway(client) { return { ... } }
/**
 * @params {PaypalClient} client
 * @returns {PaymentGateway}
 */
function createPayPalGateway(client) { return { ... } }
/**
 * @returns {PaymentGateway}
 */
function createMockGateway() { return { ... } }
```

Factory functions only return what is specified in contracts. Declare private functions outside the return object.

```javascript
/**
 * @params {StripeClient} client
 * @returns {PaymentGateway}
 */
function createStripeGateway(client) {
  return {
    async charge(amount, card) {
      // implementation
    },
    async refund(chargeId) {
      // implementation
    },
  };

  // private functions
  /**
   * @param {StripeChargeResult}
   * @returns {ChargeResult}
   */
  function parseChargeResult(result) {
    // private function implementation
  }
}
```

### Frontend

Domain components, such as UI pages, go here. These components should not handle form submissions or data loading that can be handled by BFF server loaders in the [Web Application](#web-application).

If a component needs to run async API calls (like an autocomplete component), it should receive the function that executes the API call via a property. This function comes from the Web application.

- **Folder:** `domain/frontend/<domain-name>`
- **Technologies:** JavaScript, JSDoc, Svelte 5, TailwindCSS
- **Tools:** Prettier, ESLint, SvelteCheck, Vite

#### Component implementation

When a package have components they will be placed in `src/lib/components/` folder and must follow TDD.

**1. Create component folder and files:**

```
src/lib/components/<component-name>/
├── <component-name>.stories.svelte  # Component storybook stories
├── <component-name>.svelte          # Component implementation
├── <component-name>.svelte.test.js  # Component tests
└── index.js                         # Barrel file
```

**2. Write tests first** (TDD approach):

- Create test file alongside component: `<component-name>.svelte.test.ts`
- Use Vitest with `vi.fn()`, `vi.mock()`, `vi.spyOn()` for mocking
- Use `vitest-browser-svelte`
- Test component behavior, props, and interactions

**3. Implement the component**:

- Use `pencil_open_document` to open `design-system.pen` for design tokens and patterns
- Use `skill` tool to load `svelte-code-writer` skill for Svelte 5 patterns
- Use `skill` tool to load `svelte-core-bestpractices` skill for best practices
- **Tailwind CSS is mandatory** for styling
- Follow existing patterns:
  - Use `$props()` rune for props
  - Use `cn()` utility from `packages/ui/src/utils/css.js` (relative imports for `packages/ui` changes or from `@ems/ui` package) for class merging.
  - Add JSDoc type hints for props
- Keep component focused and reusable

**4. Create Storybook story**:

- Use the `storybook-story-creator` skill to create stories
- Create `*.stories.svelte` file in the component folder (same folder as component)
- Document all component states and variants

**5. Export from barrel file** (`index.js`):

```js
export { default } from "./<component-name>.svelte";
```

## Types Packages

All TypeScript packages must be here. Avoid creating types using JSDoc in other packages and applications. On the other hand, implementations are forbidden—only types are allowed.

### Backend

All types intended for use only on the backend layer.

- **Folder:** `types/backend/<package-name>`
- **Technologies:** TypeScript
- **Tools:** Prettier, ESLint, TSC (typechecking)

### Frontend

All types intended for use only on the frontend layer.

- **Folder:** `types/frontend/<package-name>`
- **Technologies:** TypeScript
- **Tools:** Prettier, ESLint, TSC (typechecking)

### Shared

All types allowed to be shared between frontend and backend layers.

- **Folder:** `types/shared/<package-name>`
- **Technologies:** TypeScript
- **Tools:** Prettier, ESLint, TSC (typechecking)

## Packages

Packages that are neither domain nor application packages. This includes things like UI component packages.

- **Folder:** `packages/<package-name>`
- **Technologies:** JavaScript, JSDoc
- **Tools:** Prettier, ESLint, TSC (typechecking)

\*Can vary depending on the purpose of the package.

## Prisma

Database models, seeds, and configuration using Prisma ORM with SQLite.

- **Folder:** `prisma/schema/`
- **Schema files:** Split by domain (e.g., `user.prisma`) for modular organization
- **Generator:** Outputs to `.prisma/` at project root
- **Datasource:** SQLite (via `@prisma/adapter-better-sqlite3`)
- **Dependencies:**
  - `@prisma/client` - Runtime client imported by backend packages
  - `@prisma/adapter-better-sqlite3` - SQLite driver adapter
  - `prisma` - CLI (devDependency in root package.json)

**Models:**

- `User` - Core user entity (id, firstName, lastName, email, username, password)
- `UserRole` - Junction table for many-to-many relationship
- `Role` - Enum (USER, MANAGER, ADMIN)

**Seeds:** Currently none (seed files would go in `prisma/seeds/`)
