import * as strings from "@varavel/vdl-plugin-sdk/utils/strings";

/**
 * Derives the generated type name for an inline object nested under a parent named type.
 */
export function toInlineTypeName(
  parentTypeName: string,
  fieldName: string,
): string {
  return `${parentTypeName}${strings.pascalCase(fieldName)}`;
}

/**
 * Returns the client-side flattened method name for a service operation.
 */
export function toClientOperationMethodName(
  rpcName: string,
  operationName: string,
): string {
  return `${strings.camelCase(rpcName)}${strings.pascalCase(operationName)}`;
}

/**
 * Returns the client-side response type alias name for a stream operation.
 */
export function toStreamResponseTypeName(operationTypeName: string): string {
  return `${operationTypeName}Response`;
}

/**
 * Renders a safe object property key.
 */
export function renderPropertyName(value: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(value)
    ? value
    : JSON.stringify(value);
}
