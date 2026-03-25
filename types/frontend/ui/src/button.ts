import type { HTMLButtonAttributes } from "svelte/elements";

/**
 * Button visual variants
 */
export type ButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";

/**
 * Button sizes
 */
export type ButtonSize = "default" | "large" | "icon";

/**
 * Props for the Button component.
 * Extends HTMLButtonAttributes with additional custom props.
 */
export type ButtonProps = HTMLButtonAttributes & {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button is in loading state */
  loading?: boolean;
};
