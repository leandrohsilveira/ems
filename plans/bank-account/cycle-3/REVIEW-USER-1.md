# Cycle 3 Implementation Issues

Veredict: Rejected.

## Requested changes

- At cycle 2, we completely missed the `createEnum` function from `@ems/utils` and used `Object.freeze` directly at `domain/shared/account/src/account-type.js`.
  Rename variable `ACCOUNT_TYPE` to `AccountType` and use `createEnum` function for better type inference. By using it, you don't need `getAllAccountTypes` anymore as `createEnum` return object already includes `values()` function that does the same, but with better type inference.

- `domain/backend/account/src/account.service.js`:
  - Pagination cursor is being dealt at service level. It should be at repository level. I myself have updated the repository implementation of `findAllByUserId` to do the cursor properly, just finish the work and update tests as necessary.

- `domain/backend/account/src/auth.middleware.js`: this is duplicated code. `@ems/domain-backend-auth` already register it at global level. Remove this file.

- `domain/backend/account/src/plugin.js`:
  - Should not register authMiddleware, as it should be removed.
  - It uses `app.addHook("preHandler", app.authenticate)`, we should not do that and use permissions instead.
    Create permissions for account management at `domain/shared/auth/src/permissions/permissions.js` (don't forget to update test if necessary).
    Use `app.allowOneOf` with the proper permission on each endpoint instead.
