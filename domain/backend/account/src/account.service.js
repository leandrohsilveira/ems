import logger from "pino";
import { parseAccount } from "./account.js";
import { AccountRepositoryFailuresEnum } from "./account.repository.js";
import {
  createEnum,
  error,
  failure,
  ok,
  ResultStatus,
  tryCatchAsync,
} from "@ems/utils";

/**
 * @import { CreateAccountDTO, AccountDTO, AccountListDTO, UpdateAccountDTO } from '@ems/domain-shared-account'
 * @import { AccountListInput } from '@ems/database'
 * @import { ResultOk, ResultFailure, ResultError } from '@ems/utils'
 * @import { AccountRepository } from './account.repository.js'
 */

export const AccountServiceFailures = createEnum({
  NOT_FOUND: "NOT_FOUND",
  NOT_OWNED: "NOT_OWNED",
  HAS_TRANSACTIONS: "HAS_TRANSACTIONS",
});

/**
 * @exports @typedef AccountService
 * @property {(userId: string, data: CreateAccountDTO) => Promise<ResultOk<AccountDTO> | ResultError>} create
 * @property {(userId: string, input: AccountListInput) => Promise<ResultOk<AccountListDTO> | ResultError>} list
 * @property {(userId: string, id: string) => Promise<ResultOk<AccountDTO> | ResultFailure<typeof AccountServiceFailures.NOT_FOUND | typeof AccountServiceFailures.NOT_OWNED> | ResultError>} getById
 * @property {(userId: string, id: string, data: UpdateAccountDTO) => Promise<ResultOk<AccountDTO> | ResultFailure<typeof AccountServiceFailures.NOT_FOUND | typeof AccountServiceFailures.NOT_OWNED> | ResultError>} update
 * @property {(userId: string, id: string) => Promise<ResultOk<{ message: string }> | ResultFailure<typeof AccountServiceFailures.NOT_FOUND | typeof AccountServiceFailures.NOT_OWNED | typeof AccountServiceFailures.HAS_TRANSACTIONS> | ResultError>} delete
 */

/**
 * @param {AccountRepository} accountRepository
 * @returns {AccountService}
 */
export function createAccountService(accountRepository) {
  const log = logger({ name: "AccountService" });

  return {
    /** @param {string} userId @param {CreateAccountDTO} data */
    create(userId, data) {
      return tryCatchAsync(async () => {
        log.info({ userId, name: data.name }, "Creating account");

        const {
          status: createStatus,
          data: account,
          error: createErr,
        } = await accountRepository.create({
          userId,
          name: data.name,
          type: "BANK",
          currency: data.currency,
          balance: data.initialBalance,
        });

        switch (createStatus) {
          case ResultStatus.OK:
            break;
          case ResultStatus.ERROR:
            return error(createErr);
        }

        log.info({ accountId: account.id }, "Account created successfully");

        return ok(parseAccount(account));
      });
    },

    /** @param {string} userId @param {AccountListInput} input */
    list(userId, input) {
      return tryCatchAsync(async () => {
        log.info({ userId }, "Listing accounts");

        const {
          status: findStatus,
          data: result,
          error: findErr,
        } = await accountRepository.findAllByUserId({
          filter: { userId },
          page: input.page,
        });

        switch (findStatus) {
          case ResultStatus.OK:
            break;
          case ResultStatus.ERROR:
            return error(findErr);
        }

        return ok({
          items: result.items.map(parseAccount),
          size: input.page?.size ?? 10,
          nextPageCursor: result.nextCursor,
        });
      });
    },

    /** @param {string} userId @param {string} id */
    getById(userId, id) {
      return tryCatchAsync(async () => {
        log.info({ userId, accountId: id }, "Getting account by ID");

        const {
          status: findStatus,
          data: account,
          error: findErr,
        } = await accountRepository.findById(id);

        switch (findStatus) {
          case ResultStatus.OK:
            break;
          case ResultStatus.ERROR:
            return error(findErr);
          case AccountRepositoryFailuresEnum.NOT_FOUND:
            return failure(AccountServiceFailures.NOT_FOUND);
        }

        if (account.userId !== userId) {
          log.warn(
            { userId, accountId: id, ownerId: account.userId },
            "Account does not belong to user",
          );
          return failure(AccountServiceFailures.NOT_OWNED);
        }

        return ok(parseAccount(account));
      });
    },

    /** @param {string} userId @param {string} id @param {UpdateAccountDTO} data */
    update(userId, id, data) {
      return tryCatchAsync(async () => {
        log.info({ userId, accountId: id }, "Updating account");

        const {
          status: getStatus,
          data: account,
          error: getErr,
        } = await accountRepository.findById(id);

        switch (getStatus) {
          case ResultStatus.OK:
            break;
          case ResultStatus.ERROR:
            return error(getErr);
          case AccountRepositoryFailuresEnum.NOT_FOUND:
            return failure(AccountServiceFailures.NOT_FOUND);
        }

        if (account.userId !== userId) {
          return failure(AccountServiceFailures.NOT_OWNED);
        }

        const {
          status: updateStatus,
          data: updatedAccount,
          error: updateErr,
        } = await accountRepository.update(id, { name: data.name });

        switch (updateStatus) {
          case ResultStatus.OK:
            break;
          case ResultStatus.ERROR:
            return error(updateErr);
          case AccountRepositoryFailuresEnum.NOT_FOUND:
            return failure(AccountServiceFailures.NOT_FOUND);
        }

        log.info({ accountId: id }, "Account updated successfully");

        return ok(parseAccount(updatedAccount));
      });
    },

    /** @param {string} userId @param {string} id */
    delete(userId, id) {
      return tryCatchAsync(async () => {
        log.info({ userId, accountId: id }, "Deleting account");

        const {
          status: getStatus,
          data: account,
          error: getErr,
        } = await accountRepository.findById(id);

        switch (getStatus) {
          case ResultStatus.OK:
            break;
          case ResultStatus.ERROR:
            return error(getErr);
          case AccountRepositoryFailuresEnum.NOT_FOUND:
            return failure(AccountServiceFailures.NOT_FOUND);
        }

        if (account.userId !== userId) {
          return failure(AccountServiceFailures.NOT_OWNED);
        }

        const {
          status: txStatus,
          data: hasTransactions,
          error: txErr,
        } = await accountRepository.hasTransactions();

        switch (txStatus) {
          case ResultStatus.OK:
            break;
          case ResultStatus.ERROR:
            return error(txErr);
        }

        if (hasTransactions) {
          return failure(AccountServiceFailures.HAS_TRANSACTIONS);
        }

        const { status: deleteStatus, error: deleteErr } =
          await accountRepository.softDelete(id);

        switch (deleteStatus) {
          case ResultStatus.OK:
            break;
          case ResultStatus.ERROR:
            return error(deleteErr);
          case AccountRepositoryFailuresEnum.NOT_FOUND:
            return failure(AccountServiceFailures.NOT_FOUND);
        }

        log.info({ accountId: id }, "Account deleted successfully");

        return ok({ message: "Account deleted successfully" });
      });
    },
  };
}
