import type { PluginOutputError, Position } from "@varavel/vdl-plugin-sdk";
import * as misc from "@varavel/vdl-plugin-sdk/utils/misc";

/**
 * Error used for generation failures that should surface as structured plugin diagnostics.
 */
export class GenerationError extends Error {
  readonly position?: Position;

  constructor(message: string, position?: Position) {
    super(message);
    this.name = "GenerationError";
    this.position = position;
  }
}

/**
 * Throws a positioned generation error immediately.
 */
export function fail(message: string, position?: Position): never {
  throw new GenerationError(message, position);
}

/**
 * Ensures a condition holds while preserving source position when it does not.
 */
export function expectCondition(
  condition: unknown,
  message: string,
  position?: Position,
): void {
  misc.invariant(condition, new GenerationError(message, position));
}

/**
 * Returns a non-null value or throws a positioned generation error.
 */
export function expectValue<T>(
  value: T | null | undefined,
  message: string,
  position?: Position,
): T {
  expectCondition(value !== null && value !== undefined, message, position);
  return value as T;
}

/**
 * Converts unknown failures into the plugin error contract.
 */
export function toPluginOutputError(error: unknown): PluginOutputError {
  if (error instanceof GenerationError) {
    return {
      message: error.message,
      position: error.position,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "An unknown generation error occurred.",
  };
}
