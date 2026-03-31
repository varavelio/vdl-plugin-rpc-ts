/**
 * Supported inter-file import extension modes for generated TypeScript.
 */
export const IMPORT_EXTENSION_VALUES = ["none", "js", "ts"] as const;

/**
 * Supported inter-file import extension modes for generated TypeScript.
 */
export type ImportExtension = (typeof IMPORT_EXTENSION_VALUES)[number];

/**
 * Applies the configured extension policy to a relative import path.
 */
export function formatImportPath(
  path: string,
  importExtension: ImportExtension,
): string {
  if (importExtension === "none") {
    return path;
  }

  return `${path}.${importExtension}`;
}

/**
 * Returns an `export *` statement for a generated file path.
 */
export function renderExportAll(
  path: string,
  importExtension: ImportExtension,
): string {
  return `export * from ${JSON.stringify(formatImportPath(path, importExtension))};`;
}
