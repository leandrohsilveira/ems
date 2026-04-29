/**
 * @import { MouseEventHandler } from "svelte/elements"
 * @import { TypedMouseEvent } from "$lib/events.js"
 */

/**
 * @template {EventTarget} E
 * @param {HTMLElement} node
 * @param {MouseEventHandler<E>} handler
 */
export function clickOutside(node, handler) {
    document.addEventListener('click', handleClick, { capture: true })

    return {
        destroy() {
            document.removeEventListener('click', handleClick, { capture: true })
        }
    }

    /**
     * @param {Event} event
     */
    function handleClick(event) {
        const target = event.target
        if (target !== null && target !== node && !node.contains(/** @type {Node} */ (target))) {
            handler(/** @type {TypedMouseEvent<E>} */ (event))
        }
    }
}
