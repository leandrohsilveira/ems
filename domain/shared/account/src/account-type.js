/**
 * Account type constants
 *
 * @type {Readonly<Record<string, string>>}
 */
export const ACCOUNT_TYPE = Object.freeze({
    BANK: 'BANK'
})

/**
 * Get all available account types
 * @returns {readonly string[]}
 */
export function getAllAccountTypes() {
    return Object.freeze(Object.values(ACCOUNT_TYPE))
}
