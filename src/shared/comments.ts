import type { Generator } from "@varavel/gen";
import type { Annotation } from "@varavel/vdl-plugin-sdk";
import * as ir from "@varavel/vdl-plugin-sdk/utils/ir";

const DEFAULT_DEPRECATED_MESSAGE =
  "This symbol is deprecated and should not be used in new code.";

/**
 * Extracts the effective deprecation message from an annotation list.
 */
function getDeprecatedMessage(
  annotations: Annotation[] | undefined,
): string | undefined {
  const deprecated = ir.getAnnotation(annotations, "deprecated");
  if (!deprecated) {
    return undefined;
  }

  const argument = ir.getAnnotationArg(annotations, "deprecated");
  const unwrapped = argument ? ir.unwrapLiteral<unknown>(argument) : undefined;

  if (typeof unwrapped === "string" && unwrapped.trim().length > 0) {
    return unwrapped;
  }

  return DEFAULT_DEPRECATED_MESSAGE;
}

/**
 * Writes a JSDoc block from documentation text, fallback text, and deprecations.
 */
export function writeDocComment(
  g: Generator,
  options: {
    doc?: string;
    annotations?: Annotation[];
    fallback?: string;
  },
): void {
  const lines = buildDocCommentLines(options);
  writeDocCommentLines(g, lines);
}

/**
 * Builds JSDoc lines from documentation text and annotations.
 */
function buildDocCommentLines(options: {
  doc?: string;
  annotations?: Annotation[];
  fallback?: string;
}): string[] {
  const lines = (options.doc ?? options.fallback)?.split("\n") ?? [];
  const deprecatedMessage = getDeprecatedMessage(options.annotations);

  if (!deprecatedMessage) {
    return lines;
  }

  if (lines.length === 0) {
    return [`@deprecated ${deprecatedMessage}`];
  }

  return [...lines, "", `@deprecated ${deprecatedMessage}`];
}

/**
 * Writes a JSDoc block when at least one line is available.
 */
function writeDocCommentLines(g: Generator, lines: string[]): void {
  if (lines.length === 0) {
    return;
  }

  g.line("/**");
  for (const line of lines) {
    g.line(` * ${line}`.replace(/[\t ]+$/u, ""));
  }
  g.line(" */");
}
