import { i18n } from '@ems/domain-shared-schema'

const defaultLiterals = {
    title: 'Delete Account',
    description: 'Are you sure you want to delete "{accountName}"? This action cannot be undone.',
    deleteButton: 'Delete',
    cancelButton: 'Cancel'
}

export const deleteDialogI18n = i18n(defaultLiterals, {
    pt_BR: {
        title: 'Excluir Conta',
        description:
            'Tem certeza que deseja excluir "{accountName}"? Esta ação não pode ser desfeita.',
        deleteButton: 'Excluir',
        cancelButton: 'Cancelar'
    }
})

/** @exports @typedef {import('@ems/i18n').InferLiterals<typeof deleteDialogI18n>} DeleteDialogLiterals */
