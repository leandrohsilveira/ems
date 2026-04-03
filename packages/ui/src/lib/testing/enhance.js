import { vi } from 'vitest'

/**
 * @import { ActionResult } from "@sveltejs/kit"
 * @import { Mock } from "vitest"
 * @import { FormEnhancerAction } from "@ems/types-frontend-ui"
 */

/**
 * @template T
 * @typedef {Promise<T> | T} MaybePromise
 */

/**
 * @template {Record<string, unknown> | undefined} [Success=Record<string, any>] Success
 * @template {Record<string, unknown> | undefined} [Failure=Record<string, any>] Failure
 * @param {object} [options]
 * @param {(data: FormData, event: Event) => MaybePromise<ActionResult<Success, Failure>>} [options.onSubmit]
 * @param {Mock} [options.update]
 * @returns {FormEnhancerAction<Success, Failure>}
 */
export function createEnhanceMock({
    onSubmit,
    update = vi.fn().mockResolvedValue(undefined)
} = {}) {
    return (formElement, submitFn) => {
        formElement.addEventListener('submit', handleSubmit)
        return {
            destroy() {
                formElement.removeEventListener('submit', handleSubmit)
            }
        }
        /**
         * @param {SubmitEvent} event
         */
        async function handleSubmit(event) {
            event.preventDefault()

            if (!onSubmit && !submitFn) return

            const submitter = /** @type {HTMLElement} */ (event.target)

            const controller = new AbortController()

            const formData = new FormData(formElement)

            const result = await onSubmit?.(formData, event)

            const action = new URL(formElement.action)

            const resultFn = await submitFn?.({
                action,
                controller,
                formData,
                formElement,
                submitter,
                cancel: () => controller.abort('Submit cancelled')
            })

            if (typeof resultFn !== 'function') return
            if (!result) {
                console.warn(
                    'createEnhanceMock: form enhancer called with submit result callback, but there is no result available. Consider providing it by returning it on onSubmit parameter.'
                )
                return
            }

            await resultFn({
                action,
                formElement,
                formData,
                result,
                update
            })
        }
    }
}
