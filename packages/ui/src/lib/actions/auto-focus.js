/**
 * @exports @typedef AutoFocusOptions
 * @property {boolean} [focusTrap=false]
 * @property {boolean} [restoreFocus=true]
 */

/**
 * A Svelte action that traps focus within an element and restores focus on destroy
 * @param {HTMLElement} node
 * @param {AutoFocusOptions} [options={}]
 */
export function autoFocus(node, { focusTrap = false, restoreFocus = true } = {}) {
    const previouslyFocused = document.activeElement

    node.focus()

    /**
     * @param {FocusEvent} event
     */
    function handleFocusOut(event) {
        const relatedTarget =
            event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null

        if (focusTrap && (relatedTarget === null || !node.contains(relatedTarget))) {
            // Trapping focus inside
            node.focus()
        }
    }

    node.addEventListener('focusout', handleFocusOut)

    return {
        destroy() {
            node.removeEventListener('focusout', handleFocusOut)

            if (restoreFocus && previouslyFocused instanceof HTMLElement) {
                previouslyFocused.focus()
            }
        }
    }
}
