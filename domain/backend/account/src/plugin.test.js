import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import Fastify from "fastify";
import schemaPlugin from "@ems/domain-backend-schema";
import { resolveErrorLiterals } from "@ems/domain-shared-schema";
import { accountErrorsI18n } from "@ems/domain-shared-account";
import { ok, failure, error as resultError } from "@ems/utils";
import { registerMockAuth } from "@ems/domain-backend-auth/testing";

import accountPlugin from "./plugin.js";
import { AccountServiceFailures } from "./account.service.js";
import { createMockAccountDTO } from "./testing/account.js";

/**
 * @import { AccountService } from './account.service.js'
 */

const errorsLiterals = resolveErrorLiterals("en_US", accountErrorsI18n);

describe("Account Plugin", () => {
  /** @type {import('vitest-mock-extended').DeepMockProxy<AccountService>} */
  let mockAccountService;

  beforeEach(() => {
    mockAccountService = mockDeep();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /", () => {
    it("should return 201 on successful account creation", async () => {
      const mockAccount = createMockAccountDTO({ id: "account-1" });
      mockAccountService.create.mockResolvedValue(ok(mockAccount));

      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "POST",
        url: "/",
        headers: { authorization: "Bearer valid-token" },
        payload: {
          name: "New Account",
          initialBalance: 500,
          currency: "BRL",
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual({ account: mockAccount });
      expect(mockAccountService.create).toHaveBeenCalledWith("user-1", {
        name: "New Account",
        initialBalance: 500,
        currency: "BRL",
      });
    });

    it("should return 401 when not authenticated", async () => {
      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "POST",
        url: "/",
        payload: {
          name: "New Account",
          initialBalance: 500,
          currency: "BRL",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 500 on unexpected error", async () => {
      mockAccountService.create.mockResolvedValue(
        resultError(new Error("Unexpected error")),
      );

      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "POST",
        url: "/",
        headers: { authorization: "Bearer valid-token" },
        payload: {
          name: "New Account",
          initialBalance: 500,
          currency: "BRL",
        },
      });

      expect(response.statusCode).toBe(500);
    });
  });

  describe("GET /", () => {
    it("should return paginated accounts list", async () => {
      const mockList = {
        items: [createMockAccountDTO({ id: "account-1" })],
        size: 10,
        nextPageCursor: null,
      };
      mockAccountService.list.mockResolvedValue(ok(mockList));

      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "GET",
        url: "/",
        headers: { authorization: "Bearer valid-token" },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(mockList);
    });

    it("should return 401 when not authenticated", async () => {
      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "GET",
        url: "/",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /:id", () => {
    it("should return account by ID", async () => {
      const mockAccount = createMockAccountDTO({ id: "account-1" });
      mockAccountService.getById.mockResolvedValue(ok(mockAccount));

      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "GET",
        url: "/account-1",
        headers: { authorization: "Bearer valid-token" },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ account: mockAccount });
      expect(mockAccountService.getById).toHaveBeenCalledWith(
        "user-1",
        "account-1",
      );
    });

    it("should return 404 when account not found", async () => {
      mockAccountService.getById.mockResolvedValue(
        failure(AccountServiceFailures.NOT_FOUND),
      );

      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "GET",
        url: "/nonexistent-id",
        headers: { authorization: "Bearer valid-token" },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        code: "HTTP",
        message: errorsLiterals.accountNotFound,
      });
    });
  });

  describe("PATCH /:id", () => {
    it("should update account name", async () => {
      const mockAccount = createMockAccountDTO({
        id: "account-1",
        name: "Updated Name",
      });
      mockAccountService.update.mockResolvedValue(ok(mockAccount));

      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "PATCH",
        url: "/account-1",
        headers: { authorization: "Bearer valid-token" },
        payload: { name: "Updated Name" },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ account: mockAccount });
      expect(mockAccountService.update).toHaveBeenCalledWith(
        "user-1",
        "account-1",
        { name: "Updated Name" },
      );
    });

    it("should return 404 when account not found", async () => {
      mockAccountService.update.mockResolvedValue(
        failure(AccountServiceFailures.NOT_FOUND),
      );

      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "PATCH",
        url: "/nonexistent-id",
        headers: { authorization: "Bearer valid-token" },
        payload: { name: "Updated Name" },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 401 when not authenticated", async () => {
      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "PATCH",
        url: "/account-1",
        payload: { name: "Updated Name" },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /:id", () => {
    it("should delete account successfully", async () => {
      mockAccountService.delete.mockResolvedValue(
        ok({ message: "Account deleted successfully" }),
      );

      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "DELETE",
        url: "/account-1",
        headers: { authorization: "Bearer valid-token" },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        message: "Account deleted successfully",
      });
      expect(mockAccountService.delete).toHaveBeenCalledWith(
        "user-1",
        "account-1",
      );
    });

    it("should return 404 when account not found", async () => {
      mockAccountService.delete.mockResolvedValue(
        failure(AccountServiceFailures.NOT_FOUND),
      );

      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "DELETE",
        url: "/nonexistent-id",
        headers: { authorization: "Bearer valid-token" },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 409 when account has transactions", async () => {
      mockAccountService.delete.mockResolvedValue(
        failure(AccountServiceFailures.HAS_TRANSACTIONS),
      );

      const app = Fastify();
      await app.register(schemaPlugin);
      await registerMockAuth(app);
      await app.register(accountPlugin, {
        accountService: mockAccountService,
      });

      const response = await app.inject({
        method: "DELETE",
        url: "/account-1",
        headers: { authorization: "Bearer valid-token" },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toEqual({
        code: "HTTP",
        message: errorsLiterals.accountHasTransactions,
      });
    });
  });
});
