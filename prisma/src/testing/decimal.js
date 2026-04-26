import { Prisma } from '../gen/client.js'

/**
 * Creates a mock balance value, converting string/number to Prisma.Decimal.
 * @overload
 * @param {string | number} balance
 * @returns {Prisma.Decimal}
 */
/**
 * Creates a mock balance value, returning undefined when balance is undefined.
 * @overload
 * @param {string | number | undefined} balance
 * @returns {Prisma.Decimal | undefined}
 */
/**
 * Creates a mock balance value, returning null when balance is null.
 * @overload
 * @param {string | number | null} balance
 * @returns {Prisma.Decimal | null}
 */
/**
 * Creates a mock balance value, returning null or undefined when balance is null or undefined.
 * @overload
 * @param {string | number | null | undefined} balance
 * @returns {Prisma.Decimal | null | undefined}
 */
/**
 * Creates a mock balance value.
 * Converts string or number values to Prisma.Decimal, passes through null/undefined.
 * @param {string | number | null | undefined} balance
 * @returns {Prisma.Decimal | null | undefined}
 */
export function createMockDecimal(balance) {
    if (balance === null) return null
    if (balance === undefined) return undefined
    return new Prisma.Decimal(balance)
}
