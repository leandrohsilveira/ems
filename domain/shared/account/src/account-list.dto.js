import { createPageDtoSchema } from '@ems/domain-shared-schema'
import { accountDtoSchema } from './account.dto.js'

export const accountListDtoSchema = createPageDtoSchema(accountDtoSchema)

/** @exports @typedef {import('@ems/domain-shared-schema').PageDTO<import('./account.dto.js').AccountDTO>} AccountListDTO */
