import { createMockDecimal } from "@ems/database/testing";

/**
 * @import { Account } from '@ems/database'
 * @import { AccountDTO } from '@ems/domain-shared-account'
 */

/**
 * Create mock account data for tests
 * @param {Partial<Account>} overrides
 * @returns {Account}
 */
export function createMockAccount(overrides = {}) {
  return {
    id: "account-1",
    userId: "user-1",
    name: "Nubank Checking",
    type: "BANK",
    currency: "BRL",
    balance: createMockDecimal("1000.00"),
    createdAt: new Date("2026-04-25T00:00:00Z"),
    updatedAt: new Date("2026-04-25T00:00:00Z"),
    deletedAt: null,
    ...overrides,
  };
}

/**
 * Create mock account DTO response for tests
 * @param {Partial<AccountDTO>} overrides
 * @returns {AccountDTO}
 */
export function createMockAccountDTO(overrides = {}) {
  return {
    id: "account-1",
    userId: "user-1",
    name: "Nubank Checking",
    type: "BANK",
    currency: "BRL",
    balance: "1000",
    createdAt: "2026-04-25T00:00:00.000Z",
    updatedAt: "2026-04-25T00:00:00.000Z",
    ...overrides,
  };
}
