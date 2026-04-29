import { jsonRequest, jsonResponse } from '@ems/http'

/**
 * @import { HttpClient, HttpResult } from "@ems/http"
 * @import { CreateAccountDTO, UpdateAccountDTO, AccountListDTO, CreateAccountResponseDTO, UpdateAccountResponseDTO, AccountDTO } from "@ems/domain-shared-account"
 * @import { ErrorDTO } from "@ems/domain-shared-schema"
 */

/**
 * @exports @typedef AccountApi
 * @property {(data: CreateAccountDTO) => Promise<HttpResult<CreateAccountResponseDTO, ErrorDTO>>} createAccount
 * @property {(page?: { size?: string, cursor?: string }) => Promise<HttpResult<AccountListDTO, ErrorDTO>>} listAccounts
 * @property {(id: string) => Promise<HttpResult<{ account: AccountDTO }, ErrorDTO>>} getAccountById
 * @property {(id: string, data: UpdateAccountDTO) => Promise<HttpResult<UpdateAccountResponseDTO, ErrorDTO>>} updateAccount
 * @property {(id: string) => Promise<HttpResult<{ message: string }, ErrorDTO>>} deleteAccount
 */

/**
 * @param {HttpClient} httpClient
 * @returns {AccountApi}
 */
export function createAccountApi(httpClient) {
    return {
        /** @param {CreateAccountDTO} data */
        createAccount(data) {
            return httpClient.post('/accounts', {
                request: jsonRequest(data),
                response: jsonResponse()
            })
        },

        /** @param {{ size?: string, cursor?: string }} [page] */
        listAccounts({ size, cursor } = {}) {
            return httpClient.get('/accounts', {
                request: {
                    query: {
                        size,
                        cursor
                    }
                },
                response: jsonResponse()
            })
        },

        /** @param {string} id */
        getAccountById(id) {
            return httpClient.get(`/accounts/${id}`, {
                response: jsonResponse()
            })
        },

        /** @param {string} id @param {UpdateAccountDTO} data */
        updateAccount(id, data) {
            return httpClient.patch(`/accounts/${id}`, {
                request: jsonRequest(data),
                response: jsonResponse()
            })
        },

        /** @param {string} id */
        deleteAccount(id) {
            return httpClient.delete(`/accounts/${id}`, {
                response: jsonResponse()
            })
        }
    }
}
