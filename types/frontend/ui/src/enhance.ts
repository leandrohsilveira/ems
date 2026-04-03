import type { Action } from "svelte/action";
import type { SubmitFunction } from "@sveltejs/kit";

export type FormEnhancerAction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Success extends Record<string, unknown> = Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Failure extends Record<string, unknown> = Record<string, any>,
> = Action<HTMLFormElement, SubmitFunction<Success, Failure> | undefined>;
