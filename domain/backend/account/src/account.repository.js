import { DatabaseRequestFailures, handleDatabaseError } from "@ems/database";
import { createEnum, failure, ok, tryCatchAsync } from "@ems/utils";

/**
 * @import { PrismaClient, Account, AccountCreateInput, AccountUpdateInput, AccountListInput, AccountListPage } from '@ems/database'
 * @import { ResultOk, ResultFailure, ResultError } from '@ems/utils'
 */

export const AccountRepositoryFailuresEnum = createEnum({
  NOT_FOUND: "NOT_FOUND",
});

/**
 * @typedef {typeof AccountRepositoryFailuresEnum} AccountRepositoryFailures
 */

/**
 * @exports @typedef AccountRepository
 * @property {(data: AccountCreateInput & { balance: number }) => Promise<ResultOk<Account> | ResultError>} create
 * @property {(input: AccountListInput) => Promise<ResultOk<AccountListPage> | ResultError>} findAllByUserId
 * @property {(id: string) => Promise<ResultOk<Account> | ResultFailure<AccountRepositoryFailures['NOT_FOUND']> | ResultError>} findById
 * @property {(id: string, data: AccountUpdateInput) => Promise<ResultOk<Account> | ResultFailure<AccountRepositoryFailures['NOT_FOUND']> | ResultError>} update
 * @property {(id: string) => Promise<ResultOk<Account> | ResultFailure<AccountRepositoryFailures['NOT_FOUND']> | ResultError>} softDelete
 * @property {() => Promise<ResultOk<boolean> | ResultError>} hasTransactions
 */

/**
 * Creates an account repository
 * @param {PrismaClient} db
 * @returns {AccountRepository}
 */
export function createAccountRepository(db) {
  return {
    /**
     * Create an account with initial balance via Prisma transaction
     * @param {AccountCreateInput & { balance: number }} data
     */
    create(data) {
      return tryCatchAsync(async () => {
        const account = await db.account.create({ data });
        return ok(account);
      });
    },

    /**
     * Find all accounts by user ID with cursor-based pagination (excluding soft-deleted)
     * @param {AccountListInput} input
     */
    findAllByUserId({
      filter: { userId },
      page: { size = 10, cursor = null } = {},
    }) {
      return tryCatchAsync(async () => {
        const accounts = await db.account.findMany({
          where: {
            userId,
            deletedAt: null,
          },
          take: size,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          orderBy: { createdAt: "desc" },
        });
        return ok({
          items: accounts,
          nextCursor: accounts.at(-1)?.id ?? null,
        });
      });
    },

    /**
     * Find account by ID (excluding soft-deleted)
     * @param {string} id
     */
    findById(id) {
      return tryCatchAsync(async () => {
        const account = await db.account.findFirst({
          where: { id, deletedAt: null },
        });
        if (!account) {
          return failure(AccountRepositoryFailuresEnum.NOT_FOUND);
        }
        return ok(account);
      });
    },

    /**
     * Update account name
     * @param {string} id
     * @param {AccountUpdateInput} data
     */
    update(id, data) {
      return tryCatchAsync(
        async () => {
          const account = await db.account.update({
            where: { id },
            data,
          });
          return ok(account);
        },
        async (err) => {
          return handleDatabaseError(err, (code) => {
            if (code === DatabaseRequestFailures.REQUIRED_RECORDS_NOT_FOUND)
              return failure(AccountRepositoryFailuresEnum.NOT_FOUND);
          });
        },
      );
    },

    /**
     * Soft delete account (set deletedAt)
     * @param {string} id
     */
    softDelete(id) {
      return tryCatchAsync(
        async () => {
          const account = await db.account.update({
            where: { id },
            data: { deletedAt: new Date() },
          });
          return ok(account);
        },
        async (err) => {
          return handleDatabaseError(err, (code) => {
            if (code === DatabaseRequestFailures.REQUIRED_RECORDS_NOT_FOUND)
              return failure(AccountRepositoryFailuresEnum.NOT_FOUND);
          });
        },
      );
    },

    /**
     * Check if account has transactions (placeholder — returns false until Transaction model exists)
     */
    hasTransactions() {
      return tryCatchAsync(async () => {
        return ok(false);
      });
    },
  };
}
