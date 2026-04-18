import { i18n } from '../i18n.js'

const defaultLiterals = {
    invalid: 'This field is invalid',
    'invalid.string': 'Should enter a text value',
    'invalid.number': 'Should enter a number value',
    'invalid.boolean': 'Should enter a flag value',
    'invalid.array': 'Should be an list',
    'invalid.object': 'Should be an object',
    'invalid.enum': 'Should be one of the allowed values',
    'format.invalid': 'This field has an invalid format',
    'format.email': 'Should be a valid email address',
    'format.url': 'Should be a valid URL',
    'format.uuid': 'Should be a valid UUID',
    'format.date': 'Should be a valid date',
    'format.datetime': 'Should be a valid datetime',
    'format.time': 'Should be a valid time'
}

export const validationI18n = i18n(defaultLiterals, {
    pt_BR: {
        invalid: 'Este campo é inválido',
        'invalid.string': 'Deve ser um valor de texto',
        'invalid.number': 'Deve ser um valor numérico',
        'invalid.boolean': 'Deve ser um valor booleano',
        'invalid.array': 'Deve ser uma lista',
        'invalid.object': 'Deve ser um objeto',
        'invalid.enum': 'Deve ser um dos valores permitidos',
        'format.invalid': 'Este campo tem um formato inválido',
        'format.email': 'Deve ser um endereço de email válido',
        'format.url': 'Deve ser uma URL válida',
        'format.uuid': 'Deve ser um UUID válido',
        'format.date': 'Deve ser uma data válida',
        'format.datetime': 'Deve ser uma data e hora válidas',
        'format.time': 'Deve ser um horário válido'
    }
})
