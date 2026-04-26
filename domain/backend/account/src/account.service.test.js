import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { failure, ok, error as resultError, ResultStatus } from "@ems/utils";
import {
  createAccountService,
  AccountServiceFailures,
} from "./account.service.js";
import { AccountRepositoryFailuresEnum } from "./account.repository.js";
import { createMockDecimal } from "@ems/database/testing";
import { createMockAccount, createMockAccountDTO } from "./testing/account.js";

describe("createAccountService", () => {
  /** @type {import('./account.service.js').AccountService} */
  let accountService;
  /** @type {import('vitest-mock-extended').DeepMockProxy<import('./account.repository.js').AccountRepository>} */
  let mockAccountRepository;

  beforeEach(() => {
    mockAccountRepository = mockDeep();
    accountService = createAccountService(mockAccountRepository);
  });

  describe("create", () => {
    it("should create an account successfully", async () => {
      const mockAccount = createMockAccount({
        id: "account-1",
        name: "New Account",
        balance: createMockDecimal(500),
        currency: "USD",
      });
      mockAccountRepository.create.mockResolvedValue(ok(mockAccount));

      const result = await accountService.create("user-1", {
        name: "New Account",
        initialBalance: 500,
        currency: "USD",
      });

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toEqual(
        createMockAccountDTO({
          id: "account-1",
          name: "New Account",
          balance: "500",
          currency: "USD",
        }),
      );
      expect(mockAccountRepository.create).toHaveBeenCalledWith({
        userId: "user-1",
        name: "New Account",
        type: "BANK",
        currency: "USD",
        balance: 500,
      });
    });

    it("should create an account with default values", async () => {
      const mockAccount = createMockAccount({
        id: "account-2",
        balance: createMockDecimal(0),
      });
      mockAccountRepository.create.mockResolvedValue(ok(mockAccount));

      const result = await accountService.create("user-1", {
        name: "Default Account",
        initialBalance: 0,
        currency: "BRL",
      });

      expect(result.status).toBe(ResultStatus.OK);
      expect(mockAccountRepository.create).toHaveBeenCalledWith({
        userId: "user-1",
        name: "Default Account",
        type: "BANK",
        currency: "BRL",
        balance: 0,
      });
    });

    it("should return error when repository fails", async () => {
      mockAccountRepository.create.mockResolvedValue(
        resultError(new Error("DB error")),
      );

      const result = await accountService.create("user-1", {
        name: "New Account",
        initialBalance: 100,
        currency: "BRL",
      });

      expect(result.status).toBe(ResultStatus.ERROR);
    });
  });

  describe("list", () => {
    it("should list accounts successfully", async () => {
      const mockAccounts = [
        createMockAccount({ id: "account-1", name: "First" }),
        createMockAccount({ id: "account-2", name: "Second" }),
      ];
      mockAccountRepository.findAllByUserId.mockResolvedValue(
        ok({ items: mockAccounts, nextCursor: "account-2" }),
      );

      const result = await accountService.list("user-1", {
        filter: { userId: "user-1" },
        page: { size: 2, cursor: null },
      });

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data?.items).toHaveLength(2);
      expect(result.data?.items[0].name).toBe("First");
      expect(result.data?.items[1].name).toBe("Second");
      expect(result.data?.size).toBe(2);
      expect(result.data?.nextPageCursor).toBe("account-2");
    });

    it("should return null nextPageCursor when repository returns null", async () => {
      const mockAccounts = [createMockAccount({ id: "account-1" })];
      mockAccountRepository.findAllByUserId.mockResolvedValue(
        ok({ items: mockAccounts, nextCursor: null }),
      );

      const result = await accountService.list("user-1", {
        filter: { userId: "user-1" },
        page: { size: 10, cursor: null },
      });

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data?.nextPageCursor).toBeNull();
    });

    it("should return empty items when no accounts exist", async () => {
      mockAccountRepository.findAllByUserId.mockResolvedValue(
        ok({ items: [], nextCursor: null }),
      );

      const result = await accountService.list("user-1", {
        filter: { userId: "user-1" },
        page: { size: 10, cursor: null },
      });

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data?.items).toHaveLength(0);
      expect(result.data?.nextPageCursor).toBeNull();
    });

    it("should return error when repository fails", async () => {
      mockAccountRepository.findAllByUserId.mockResolvedValue(
        resultError(new Error("DB error")),
      );

      const result = await accountService.list("user-1", {
        filter: { userId: "user-1" },
        page: { size: 10, cursor: null },
      });

      expect(result.status).toBe(ResultStatus.ERROR);
    });
  });

  describe("getById", () => {
    it("should return account when found and owned by user", async () => {
      const mockAccount = createMockAccount({
        id: "account-1",
        userId: "user-1",
      });
      mockAccountRepository.findById.mockResolvedValue(ok(mockAccount));

      const result = await accountService.getById("user-1", "account-1");

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toEqual(createMockAccountDTO());
    });

    it("should return NOT_FOUND when account does not exist", async () => {
      mockAccountRepository.findById.mockResolvedValue(
        failure(AccountRepositoryFailuresEnum.NOT_FOUND),
      );

      const result = await accountService.getById("user-1", "nonexistent-id");

      expect(result).toEqual(failure(AccountServiceFailures.NOT_FOUND));
    });

    it("should return NOT_OWNED when account belongs to another user", async () => {
      const mockAccount = createMockAccount({
        id: "account-1",
        userId: "other-user",
      });
      mockAccountRepository.findById.mockResolvedValue(ok(mockAccount));

      const result = await accountService.getById("user-1", "account-1");

      expect(result).toEqual(failure(AccountServiceFailures.NOT_OWNED));
    });
  });

  describe("update", () => {
    it("should update account name successfully", async () => {
      const mockAccount = createMockAccount({
        id: "account-1",
        userId: "user-1",
      });
      const updatedAccount = createMockAccount({
        id: "account-1",
        userId: "user-1",
        name: "Updated Name",
      });
      mockAccountRepository.findById.mockResolvedValue(ok(mockAccount));
      mockAccountRepository.update.mockResolvedValue(ok(updatedAccount));

      const result = await accountService.update("user-1", "account-1", {
        name: "Updated Name",
      });

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data?.name).toBe("Updated Name");
      expect(mockAccountRepository.update).toHaveBeenCalledWith("account-1", {
        name: "Updated Name",
      });
    });

    it("should return NOT_FOUND when account does not exist", async () => {
      mockAccountRepository.findById.mockResolvedValue(
        failure(AccountRepositoryFailuresEnum.NOT_FOUND),
      );

      const result = await accountService.update("user-1", "nonexistent-id", {
        name: "New Name",
      });

      expect(result).toEqual(failure(AccountServiceFailures.NOT_FOUND));
    });

    it("should return NOT_OWNED when account belongs to another user", async () => {
      const mockAccount = createMockAccount({
        id: "account-1",
        userId: "other-user",
      });
      mockAccountRepository.findById.mockResolvedValue(ok(mockAccount));

      const result = await accountService.update("user-1", "account-1", {
        name: "New Name",
      });

      expect(result).toEqual(failure(AccountServiceFailures.NOT_OWNED));
    });

    it("should return error when repository update fails", async () => {
      const mockAccount = createMockAccount({
        id: "account-1",
        userId: "user-1",
      });
      mockAccountRepository.findById.mockResolvedValue(ok(mockAccount));
      mockAccountRepository.update.mockResolvedValue(
        resultError(new Error("DB error")),
      );

      const result = await accountService.update("user-1", "account-1", {
        name: "New Name",
      });

      expect(result.status).toBe(ResultStatus.ERROR);
    });
  });

  describe("delete", () => {
    it("should soft delete account successfully", async () => {
      const mockAccount = createMockAccount({
        id: "account-1",
        userId: "user-1",
      });
      const deletedAccount = createMockAccount({
        id: "account-1",
        userId: "user-1",
        deletedAt: new Date(),
      });
      mockAccountRepository.findById.mockResolvedValue(ok(mockAccount));
      mockAccountRepository.hasTransactions.mockResolvedValue(ok(false));
      mockAccountRepository.softDelete.mockResolvedValue(ok(deletedAccount));

      const result = await accountService.delete("user-1", "account-1");

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toEqual({ message: "Account deleted successfully" });
    });

    it("should return NOT_FOUND when account does not exist", async () => {
      mockAccountRepository.findById.mockResolvedValue(
        failure(AccountRepositoryFailuresEnum.NOT_FOUND),
      );

      const result = await accountService.delete("user-1", "nonexistent-id");

      expect(result).toEqual(failure(AccountServiceFailures.NOT_FOUND));
    });

    it("should return NOT_OWNED when account belongs to another user", async () => {
      const mockAccount = createMockAccount({
        id: "account-1",
        userId: "other-user",
      });
      mockAccountRepository.findById.mockResolvedValue(ok(mockAccount));

      const result = await accountService.delete("user-1", "account-1");

      expect(result).toEqual(failure(AccountServiceFailures.NOT_OWNED));
    });
  });
});
