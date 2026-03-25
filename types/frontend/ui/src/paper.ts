import type { Snippet } from "svelte";

/**
 * Props for the Paper component.
 */
export type PaperProps = {
  /** The content to render inside the paper */
  children?: Snippet;
  /** Optional header content */
  header?: Snippet;
  /** Optional footer content */
  footer?: Snippet;
  /** Additional CSS classes */
  class?: string;
};
