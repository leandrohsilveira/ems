/**
 * @import { ClassValue } from "clsx"
 */

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines and merges Tailwind CSS class names, resolving conflicts
 * using tailwind-merge.
 * @param  {...ClassValue} classNames - Individual class names to merge
 * @returns {string} Merged class string with conflicts resolved
 */
export function cn(...classNames) {
    return twMerge(clsx(classNames))
}
