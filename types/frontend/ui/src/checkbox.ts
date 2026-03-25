import type { HTMLInputAttributes } from "svelte/elements";

/**
 * Props for the Checkbox component.
 * Extends HTMLInputAttributes with additional custom props.
 */
export type CheckboxProps = Omit<HTMLInputAttributes, "type"> & {
  /** Label text displayed next to the checkbox */
  label?: string;
  /** Helper text displayed below the checkbox */
  description?: string;
};
