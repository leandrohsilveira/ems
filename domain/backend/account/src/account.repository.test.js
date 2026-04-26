import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { AccountType, Prisma } from "@ems/database";
import { failure, ResultStatus } from "@ems/utils";
import {
  createAccountRepository,
  AccountRepositoryFailuresEnum,
} from "./account.repository.js";
import { createMockAccount } from "./testing/account.js";
import { createMockDecimal } from "@ems/database/testing";

describe("createAccountRepository", () => {
  /** @type {import('./account.repository.js').AccountRepository} */
  let accountRepository;
  /** @type {import('vitest-mock-extended').DeepMockProxy<import('@ems/database').PrismaClient>} */
  let mockDb;

  beforeEach(() => {
    mockDb = mockDeep();
    accountRepository = createAccountRepository(mockDb);
  });

  describe("create", () => {
    it("should create an account with valid data", async () => {
      const accountData = {
        userId: "user-1",
        name: "Nubank Checking",
        type: AccountType.BANK,
        currency: "BRL",
        balance: 1000,
      };

      const mockAccount = createMockAccount({
        ...accountData,
        id: "account-123",
        balance: createMockDecimal(accountData.balance),
      });

      mockDb.account.create.mockResolvedValue(mockAccount);

      const result = await accountRepository.create(accountData);

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toEqual(mockAccount);
      expect(mockDb.account.create).toHaveBeenCalledWith({ data: accountData });
    });
  });

  describe("findAllByUserId", () => {
    it("should return accounts for a user with pagination", async () => {
      const mockAccounts = [
        createMockAccount({ id: "account-1", name: "First" }),
        createMockAccount({ id: "account-2", name: "Second" }),
      ];
      mockDb.account.findMany.mockResolvedValue(mockAccounts);

      const result = await accountRepository.findAllByUserId({
        filter: { userId: "user-1" },
        page: { size: 10, cursor: null },
      });

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toEqual({
        items: mockAccounts,
        nextCursor: "account-2",
      });
      expect(mockDb.account.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1", deletedAt: null },
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should use cursor for pagination when provided", async () => {
      const mockAccounts = [createMockAccount({ id: "account-3" })];
      mockDb.account.findMany.mockResolvedValue(mockAccounts);

      const result = await accountRepository.findAllByUserId({
        filter: { userId: "user-1" },
        page: { size: 5, cursor: "account-2" },
      });

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toEqual({
        items: mockAccounts,
        nextCursor: "account-3",
      });
      expect(mockDb.account.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1", deletedAt: null },
        take: 5,
        skip: 1,
        cursor: { id: "account-2" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return null nextCursor when no results", async () => {
      mockDb.account.findMany.mockResolvedValue([]);

      const result = await accountRepository.findAllByUserId({
        filter: { userId: "user-1" },
        page: { size: 10, cursor: null },
      });

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toEqual({
        items: [],
        nextCursor: null,
      });
    });
  });

  describe("findById", () => {
    it("should return account when found and not soft-deleted", async () => {
      const mockAccount = createMockAccount({ id: "account-1" });
      mockDb.account.findFirst.mockResolvedValue(mockAccount);

      const result = await accountRepository.findById("account-1");

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toEqual(mockAccount);
      expect(mockDb.account.findFirst).toHaveBeenCalledWith({
        where: { id: "account-1", deletedAt: null },
      });
    });

    it("should return failure when account not found", async () => {
      mockDb.account.findFirst.mockResolvedValue(null);

      const result = await accountRepository.findById("nonexistent-id");

      expect(result).toEqual(failure(AccountRepositoryFailuresEnum.NOT_FOUND));
    });
  });

  describe("update", () => {
    it("should update account name", async () => {
      const mockAccount = createMockAccount({
        id: "account-1",
        name: "Updated Name",
      });
      mockDb.account.update.mockResolvedValue(mockAccount);

      const result = await accountRepository.update("account-1", {
        name: "Updated Name",
      });

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toEqual(mockAccount);
      expect(mockDb.account.update).toHaveBeenCalledWith({
        where: { id: "account-1" },
        data: { name: "Updated Name" },
      });
    });

    it("should return failure when account not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record to update not found",
        { code: "P2025", clientVersion: "7.5.0" },
      );
      mockDb.account.update.mockRejectedValue(prismaError);

      const result = await accountRepository.update("nonexistent-id", {
        name: "New Name",
      });

      expect(result).toEqual(failure(AccountRepositoryFailuresEnum.NOT_FOUND));
    });
  });

  describe("softDelete", () => {
    it("should set deletedAt on the account", async () => {
      const mockAccount = createMockAccount({
        id: "account-1",
        deletedAt: new Date(),
      });
      mockDb.account.update.mockResolvedValue(mockAccount);

      const result = await accountRepository.softDelete("account-1");

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toEqual(mockAccount);
      expect(mockDb.account.update).toHaveBeenCalledWith({
        where: { id: "account-1" },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it("should return failure when account not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record to update not found",
        { code: "P2025", clientVersion: "7.5.0" },
      );
      mockDb.account.update.mockRejectedValue(prismaError);

      const result = await accountRepository.softDelete("nonexistent-id");

      expect(result).toEqual(failure(AccountRepositoryFailuresEnum.NOT_FOUND));
    });
  });

  describe("hasTransactions", () => {
    it("should return false (placeholder until Transaction model exists)", async () => {
      const result = await accountRepository.hasTransactions();

      expect(result.status).toBe(ResultStatus.OK);
      expect(result.data).toBe(false);
    });
  });
});
