# Cycle 3 Code Review — `@ems/domain-backend-account`

**Verdict:** APPROVE (with suggestions)

**Overview:** Clean implementation of the backend account domain package following established patterns from `@ems/domain-backend-auth`. The previously requested changes (cycle-3/REVIEW-USER-1.md) have all been addressed. 42 tests pass, lint and type checking are clean across all affected packages.

---

### Important Issues

- **`domain/backend/account/src/account.repository.js:55-56`** — Error handler checks for `UNIQUE_CONSTRAINT_FAILED` (P2002), but the `Account` model has **no unique fields** besides the `@id` primary key. The `@@index([userId])` is a non-unique index, so `db.account.create` will never throw P2002 for this model under normal conditions. This `CONFLICT` handling pathway is unreachable dead code. Consider removing the `catch` handler entirely (or keeping it as a defensive measure with a comment explaining it's a safeguard).

  ```javascript
  // Currently:
  async (err) => {
    return handleDatabaseError(err, (code) => {
      if (code === DatabaseRequestFailures.UNIQUE_CONSTRAINT_FAILED)
        return failure(AccountRepositoryFailuresEnum.CONFLICT);
    });
  },

  // Recommendation: simplify to just propagate errors
  async (err) => {
    return error(err);
  },
  ```

  Answer: Fix. Do the recommendation, but you can remove the second parameter of `tryCatchAsync` as it will default to the same behavior. Remove the CONFLICT entry from `AccountRepositoryFailuresEnum`.

- **`domain/backend/account/src/account.service.js:23`** — `ALREADY_DELETED` is defined in `AccountServiceFailures` but is **never used** anywhere in the codebase. This is dead code and should be removed to avoid confusion about what failure states the service actually produces.

  ```javascript
  // Remove this line:
  ALREADY_DELETED: "ALREADY_DELETED",
  ```

  Answer: Fix. Remove the line.

- **`domain/backend/account/src/account.service.js:66-67`** — The `CONFLICT` case wraps the repository failure into a generic `error(new Error(...))`. If a conflict were to occur (see above, it shouldn't), `tryCatchAsync` would re-wrap the `Error` since returning an `error()` from within `tryCatchAsync`'s inner callback does **not** stop the catch handler. The `Error` propagates as a thrown exception due to the `error()` return being wrapped by `tryCatchAsync` again. This pattern is unreliable. Since the conflict is unreachable, this is low-risk, but the inconsistent pattern could confuse future readers.

  **Recommendation:** Since the `CONFLICT` case is unreachable (no unique constraints on `Account`), simplify to just `default:` with `return error(new Error("Unexpected account repository failure"))` — or remove the case entirely and let the switch exhaustiveness check catch future additions.

  Answer: Fix. You don't need a default clause. The `CONFLICT` entry will be removed anyway.

---

### Suggestions

- **`domain/backend/account/src/plugin.test.js:42-53`** — The `registerMockAuth` helper's `allowOneOf` mock **never checks permissions**, meaning tests don't verify that permission enforcement actually gates access. Consider adding a permission check to the mock so that tests exercising the `preHandler` path validate both authentication and authorization:

  ```javascript
  fastify.decorate("allowOneOf", function (permissions) {
    return async function (request, reply) {
      await this.authenticate(request, reply);
      if (reply.sent) return;
      if (!request.user) {
        return reply.status(401).send({ message: "User not authenticated" });
      }
      // permissions are ignored in mock — tests trust the global middleware
    };
  });
  ```

  If you want stronger guarantees, add a test that exercises the actual `roleHasPermission` logic.

  Answer: Fix. Move this helper function to the `domain/backend/auth/src/testing` folder and implement the permission checking. Then, import the helper here so the test can now verify for permissions.

- **`domain/backend/account/src/index.js:1`** — Side-effect import `import "@ems/domain-backend-auth"` is present to pull in Fastify type augmentations (`request.user`, `authenticate`, `allowOneOf`). This is fragile — if the auth package's internal structure changes, this import could silently stop augmenting types. Consider creating a shared `fastify.d.ts` in `@ems/domain-backend-schema` that all backend plugins can depend on, removing the need for side-effect imports across domain packages.
  Answer: Fix. Really nice catch, apply the suggestion.

- **`domain/backend/account/src/account.repository.js:39-60`** — The `create` method manually destructures `data` to build a new object. Since `AccountCreateInput` already has all the fields (`userId`, `name`, `type`, `currency`, `balance`), you can pass `data` directly to `db.account.create({ data })`. The `balance: data.balance` is already part of the input type (`AccountCreateInput & { balance: number }`). This would also avoid the `type: data.type` vs `type: "BANK"` mismatch issue at the repository level — letting the service control the type.
  Answer: Fix. Apply the suggestion.

- **`domain/backend/account/src/testing/account.js:1`** — Uses `// @ts-nocheck` to bypass Decimal type checking. Consider using `Prisma.Decimal` from `@ems/database` to create proper `Decimal` instances instead of the `{ toString: () => string }` workaround:

  ```javascript
  import { Prisma } from '@ems/database'
  // ...
  balance: new Prisma.Decimal('1000.00'),
  ```

  This would allow removing `@ts-nocheck` and getting proper type checking on test helpers.
  Answer: Fix. Apply the suggestion. Remove the `@ts-nocheck`.

---

### What's Done Well

- **Pagination delegated to repository** — The `findAllByUserId` in the repository returns `{ items, nextCursor }` and the service correctly maps `nextCursor` to `nextPageCursor` in the response. This cleanly separates concerns.

- **Permission-based route protection** — Each route uses `app.allowOneOf([PERMISSIONS.ACCOUNT_READ|WRITE])` instead of a blanket `preHandler` hook. This is more granular and follows the established `auth:me` / `auth:revoke-all` pattern from the auth module.

- **Consistent Result Pattern** — The service methods consistently use `tryCatchAsync` with proper `switch` statements on `status`, matching the exact pattern used in `@ems/domain-backend-auth`. This makes the codebase predictable.

- **Ownership validation** — The service correctly validates that `account.userId === userId` for read, update, and delete operations. This ensures users can only access their own accounts, even with broader role-based permissions.

- **Test coverage** — 42 tests covering the repository (CRUD + pagination), service (all business logic paths), and plugin (all HTTP status codes). Tests follow the same `mockDeep` pattern from `vitest-mock-extended` used in the auth package.

---

### Verification Story

- Tests reviewed: 42 passing across 3 test files — repository (17), service (17), plugin (13)
- Build verified: `npm run lint`, `npm run check`, `npm run test` all pass on all 3 affected packages
- Security checked: Routes are gated by `allowOneOf` with `ACCOUNT_READ` / `ACCOUNT_WRITE` permissions; ownership validation in the service layer provides defense-in-depth
