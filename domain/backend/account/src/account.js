/**
 * Parse database Account to AccountDTO (Decimal to string)
 * @param {import('@ems/database').Account} accountModel
 * @returns {import('@ems/domain-shared-account').AccountDTO}
 */
export function parseAccount(accountModel) {
  return {
    id: accountModel.id,
    userId: accountModel.userId,
    name: accountModel.name,
    type: accountModel.type,
    currency: accountModel.currency,
    balance: accountModel.balance.toString(),
    createdAt: accountModel.createdAt.toISOString(),
    updatedAt: accountModel.updatedAt.toISOString(),
  };
}
