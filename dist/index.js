"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  generate: () => generate2
});
module.exports = __toCommonJS(index_exports);

// node_modules/@varavel/vdl-plugin-sdk/dist/core/define-plugin.js
function definePlugin(handler) {
  return handler;
}
__name(definePlugin, "definePlugin");

// node_modules/@varavel/vdl-plugin-sdk/dist/_virtual/_@oxc-project_runtime@0.115.0/helpers/typeof.js
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
__name(_typeof, "_typeof");

// node_modules/@varavel/vdl-plugin-sdk/dist/_virtual/_@oxc-project_runtime@0.115.0/helpers/toPrimitive.js
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
__name(toPrimitive, "toPrimitive");

// node_modules/@varavel/vdl-plugin-sdk/dist/_virtual/_@oxc-project_runtime@0.115.0/helpers/toPropertyKey.js
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
__name(toPropertyKey, "toPropertyKey");

// node_modules/@varavel/vdl-plugin-sdk/dist/_virtual/_@oxc-project_runtime@0.115.0/helpers/defineProperty.js
function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
__name(_defineProperty, "_defineProperty");

// node_modules/@varavel/vdl-plugin-sdk/dist/_virtual/_@oxc-project_runtime@0.115.0/helpers/objectSpread2.js
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
__name(ownKeys, "ownKeys");
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
__name(_objectSpread2, "_objectSpread2");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/rpc/validate-ir-for-rpc.js
var RPC_ANNOTATION_NAME = "rpc";
var PROC_ANNOTATION_NAME = "proc";
var STREAM_ANNOTATION_NAME = "stream";
function validateIrForRpc(ir) {
  const rpcTypes = ir.types.filter((typeDef) => {
    return hasAnnotation(typeDef.annotations, RPC_ANNOTATION_NAME);
  });
  if (rpcTypes.length === 0) return;
  const errors = [];
  for (const rpcType of rpcTypes) validateRpcType(rpcType, errors);
  return errors.length === 0 ? void 0 : errors;
}
__name(validateIrForRpc, "validateIrForRpc");
function validateRpcType(typeDef, errors) {
  var _typeDef$typeRef$obje;
  if (typeDef.typeRef.kind !== "object") {
    errors.push({
      message: `Type ${JSON.stringify(typeDef.name)} is annotated with @rpc and must be an object type.`,
      position: typeDef.position
    });
    return;
  }
  const fields = (_typeDef$typeRef$obje = typeDef.typeRef.objectFields) !== null && _typeDef$typeRef$obje !== void 0 ? _typeDef$typeRef$obje : [];
  for (const field of fields) validateRpcOperationField(typeDef, field, errors);
}
__name(validateRpcType, "validateRpcType");
function validateRpcOperationField(rpcType, field, errors) {
  const hasProc = hasAnnotation(field.annotations, PROC_ANNOTATION_NAME);
  const hasStream = hasAnnotation(field.annotations, STREAM_ANNOTATION_NAME);
  if (!hasProc && !hasStream) return;
  if (hasProc && hasStream) {
    errors.push({
      message: `Field ${JSON.stringify(`${rpcType.name}.${field.name}`)} cannot be annotated with both @proc and @stream.`,
      position: field.position
    });
    return;
  }
  const operationAnnotation = hasProc ? PROC_ANNOTATION_NAME : STREAM_ANNOTATION_NAME;
  if (field.typeRef.kind !== "object") {
    errors.push({
      message: `Field ${JSON.stringify(`${rpcType.name}.${field.name}`)} is annotated with @${operationAnnotation} and must be an object type.`,
      position: field.position
    });
    return;
  }
  const inputField = findFieldByName(field.typeRef.objectFields, "input");
  const outputField = findFieldByName(field.typeRef.objectFields, "output");
  if (inputField && inputField.typeRef.kind !== "object") errors.push({
    message: `Field "input" in operation ${JSON.stringify(`${rpcType.name}.${field.name}`)} must be an object type when present.`,
    position: withFallbackFile(inputField.position, field.position)
  });
  if (outputField && outputField.typeRef.kind !== "object") errors.push({
    message: `Field "output" in operation ${JSON.stringify(`${rpcType.name}.${field.name}`)} must be an object type when present.`,
    position: withFallbackFile(outputField.position, field.position)
  });
}
__name(validateRpcOperationField, "validateRpcOperationField");
function hasAnnotation(annotations, name) {
  return annotations.some((annotation) => annotation.name === name);
}
__name(hasAnnotation, "hasAnnotation");
function findFieldByName(fields, name) {
  return fields === null || fields === void 0 ? void 0 : fields.find((field) => field.name === name);
}
__name(findFieldByName, "findFieldByName");
function withFallbackFile(primary, fallback) {
  if (primary.file.length > 0 || fallback.file.length === 0) return primary;
  return _objectSpread2(_objectSpread2({}, primary), {}, { file: fallback.file });
}
__name(withFallbackFile, "withFallbackFile");

// src/shared/errors.ts
var _GenerationError = class _GenerationError extends Error {
  constructor(message, position) {
    super(message);
    this.name = "GenerationError";
    this.position = position;
  }
};
__name(_GenerationError, "GenerationError");
var GenerationError = _GenerationError;
function toPluginOutputError(error) {
  if (error instanceof GenerationError) {
    return {
      message: error.message,
      position: error.position
    };
  }
  if (error instanceof Error) {
    return {
      message: error.message
    };
  }
  return {
    message: "An unknown generation error occurred."
  };
}
__name(toPluginOutputError, "toPluginOutputError");

// node_modules/@varavel/vdl-plugin-sdk/dist/node_modules/es-toolkit/dist/array/compact.js
function compact(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item) result.push(item);
  }
  return result;
}
__name(compact, "compact");

// node_modules/@varavel/gen/dist/index.js
var _a;
var Generator = (_a = class {
  constructor() {
    this.chunks = [];
    this.indentLevel = 0;
    this.indentUnit = "  ";
    this.atStartOfLine = true;
  }
  /**
  * Uses spaces for one indent level.
  *
  * Example: `withSpaces(2)` makes each level equal to two spaces.
  */
  withSpaces(spaces) {
    this.indentUnit = " ".repeat(Math.max(0, spaces));
    return this;
  }
  /**
  * Uses one tab character for each indent level.
  */
  withTabs() {
    this.indentUnit = "	";
    return this;
  }
  /**
  * Moves one indentation level deeper for future writes.
  */
  indent() {
    this.indentLevel++;
    return this;
  }
  /**
  * Moves one indentation level up for future writes.
  *
  * If already at zero, it stays at zero.
  */
  dedent() {
    if (this.indentLevel > 0) this.indentLevel--;
    return this;
  }
  /**
  * Writes text exactly as given.
  *
  * It does not add indentation or newlines.
  */
  raw(content) {
    if (content.length === 0) return this;
    this.chunks.push(content);
    this.atStartOfLine = content.endsWith("\n");
    return this;
  }
  /**
  * Writes exactly one newline character.
  */
  break() {
    this.chunks.push("\n");
    this.atStartOfLine = true;
    return this;
  }
  /**
  * Writes text on the current line.
  *
  * It adds indentation only when writing at the start of a line.
  */
  inline(content) {
    if (content.length === 0) return this;
    const sublines = content.split("\n");
    for (let index = 0; index < sublines.length; index++) {
      var _sublines$index;
      const subline = (_sublines$index = sublines[index]) !== null && _sublines$index !== void 0 ? _sublines$index : "";
      if (index > 0) {
        this.chunks.push("\n");
        this.atStartOfLine = true;
      }
      if (subline.length > 0) {
        if (this.atStartOfLine) this.chunks.push(this.indentUnit.repeat(this.indentLevel));
        this.chunks.push(subline);
        this.atStartOfLine = false;
      }
    }
    if (content.endsWith("\n")) this.atStartOfLine = true;
    return this;
  }
  /**
  * Same as `inline` but adds one newline at the end of the content.
  */
  line(content) {
    this.inline(content);
    this.break();
    return this;
  }
  /**
  * Runs a callback one level deeper, then restores the previous level.
  */
  block(run) {
    this.indent();
    try {
      run();
    } finally {
      this.dedent();
    }
    return this;
  }
  /**
  * Returns all generated content as a single string.
  */
  toString() {
    return this.chunks.join("");
  }
}, __name(_a, "Generator"), _a);
function newGenerator() {
  return new Generator();
}
__name(newGenerator, "newGenerator");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/ir/get-annotation.js
function getAnnotation(annotations, name) {
  if (!annotations) return void 0;
  return annotations.find((anno) => anno.name === name);
}
__name(getAnnotation, "getAnnotation");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/ir/get-annotation-arg.js
function getAnnotationArg(annotations, name) {
  const anno = getAnnotation(annotations, name);
  return anno === null || anno === void 0 ? void 0 : anno.argument;
}
__name(getAnnotationArg, "getAnnotationArg");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/strings/words.js
var ACRONYM_TO_CAPITALIZED_WORD_BOUNDARY_RE = /([A-Z]+)([A-Z][a-z])/g;
var LOWERCASE_OR_DIGIT_TO_UPPERCASE_BOUNDARY_RE = /([a-z0-9])([A-Z])/g;
var NON_ALPHANUMERIC_SEQUENCE_RE = /[^A-Za-z0-9]+/g;
var WHITESPACE_SEQUENCE_RE = /\s+/;
function words(str) {
  const normalized = str.replace(ACRONYM_TO_CAPITALIZED_WORD_BOUNDARY_RE, "$1 $2").replace(LOWERCASE_OR_DIGIT_TO_UPPERCASE_BOUNDARY_RE, "$1 $2").replace(NON_ALPHANUMERIC_SEQUENCE_RE, " ").trim();
  return normalized.length === 0 ? [] : normalized.split(WHITESPACE_SEQUENCE_RE);
}
__name(words, "words");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/strings/pascal-case.js
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
__name(capitalize, "capitalize");
function pascalCase(str) {
  return words(str).map(capitalize).join("");
}
__name(pascalCase, "pascalCase");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/ir/unwrap-literal.js
function unwrapLiteral(value) {
  return unwrapLiteralValue(value);
}
__name(unwrapLiteral, "unwrapLiteral");
function unwrapLiteralValue(value) {
  switch (value.kind) {
    case "string":
      return value.stringValue;
    case "int":
      return value.intValue;
    case "float":
      return value.floatValue;
    case "bool":
      return value.boolValue;
    case "object": {
      var _value$objectEntries;
      const resolvedObject = {};
      const entries = (_value$objectEntries = value.objectEntries) !== null && _value$objectEntries !== void 0 ? _value$objectEntries : [];
      for (const entry of entries) resolvedObject[entry.key] = unwrapLiteralValue(entry.value);
      return resolvedObject;
    }
    case "array":
      var _value$arrayItems;
      return ((_value$arrayItems = value.arrayItems) !== null && _value$arrayItems !== void 0 ? _value$arrayItems : []).map((item) => unwrapLiteralValue(item));
    default:
      return null;
  }
}
__name(unwrapLiteralValue, "unwrapLiteralValue");

// src/shared/comments.ts
var DEFAULT_DEPRECATED_MESSAGE = "This symbol is deprecated and should not be used in new code.";
function getDeprecatedMessage(annotations) {
  const deprecated = getAnnotation(annotations, "deprecated");
  if (!deprecated) {
    return void 0;
  }
  const argument = getAnnotationArg(annotations, "deprecated");
  const unwrapped = argument ? unwrapLiteral(argument) : void 0;
  if (typeof unwrapped === "string" && unwrapped.trim().length > 0) {
    return unwrapped;
  }
  return DEFAULT_DEPRECATED_MESSAGE;
}
__name(getDeprecatedMessage, "getDeprecatedMessage");
function writeDocComment(g, options) {
  const lines = buildDocCommentLines(options);
  writeDocCommentLines(g, lines);
}
__name(writeDocComment, "writeDocComment");
function buildDocCommentLines(options) {
  var _a2, _b, _c;
  const lines = (_c = (_b = (_a2 = options.doc) != null ? _a2 : options.fallback) == null ? void 0 : _b.split("\n")) != null ? _c : [];
  const deprecatedMessage = getDeprecatedMessage(options.annotations);
  if (!deprecatedMessage) {
    return lines;
  }
  if (lines.length === 0) {
    return [`@deprecated ${deprecatedMessage}`];
  }
  return [...lines, "", `@deprecated ${deprecatedMessage}`];
}
__name(buildDocCommentLines, "buildDocCommentLines");
function writeDocCommentLines(g, lines) {
  if (lines.length === 0) {
    return;
  }
  g.line("/**");
  for (const line of lines) {
    g.line(` * ${line}`.replace(/[\t ]+$/u, ""));
  }
  g.line(" */");
}
__name(writeDocCommentLines, "writeDocCommentLines");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/strings/camel-case.js
function capitalize2(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
__name(capitalize2, "capitalize");
function camelCase(str) {
  const parts = words(str);
  if (parts.length === 0) return "";
  return parts.map((part, index) => index === 0 ? part.toLowerCase() : capitalize2(part)).join("");
}
__name(camelCase, "camelCase");

// node_modules/@varavel/vdl-plugin-sdk/dist/node_modules/dedent/dist/dedent.js
function ownKeys2(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
__name(ownKeys2, "ownKeys");
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys2(Object(source), true).forEach(function(key) {
      _defineProperty2(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys2(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
__name(_objectSpread, "_objectSpread");
function _defineProperty2(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) Object.defineProperty(obj, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true
  });
  else obj[key] = value;
  return obj;
}
__name(_defineProperty2, "_defineProperty");
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}
__name(_toPropertyKey, "_toPropertyKey");
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
__name(_toPrimitive, "_toPrimitive");
var dedent = createDedent({});
function createDedent(options) {
  dedent3.withOptions = (newOptions) => createDedent(_objectSpread(_objectSpread({}, options), newOptions));
  return dedent3;
  function dedent3(strings, ...values) {
    const raw = typeof strings === "string" ? [strings] : strings.raw;
    const { alignValues = false, escapeSpecialCharacters = Array.isArray(strings), trimWhitespace = true } = options;
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      let next = raw[i];
      if (escapeSpecialCharacters) next = next.replace(/\\\n[ \t]*/g, "").replace(/\\`/g, "`").replace(/\\\$/g, "$").replace(/\\\{/g, "{");
      result += next;
      if (i < values.length) {
        const value = alignValues ? alignValue(values[i], result) : values[i];
        result += value;
      }
    }
    const lines = result.split("\n");
    let mindent = null;
    for (const l of lines) {
      const m = l.match(/^(\s+)\S+/);
      if (m) {
        const indent2 = m[1].length;
        if (!mindent) mindent = indent2;
        else mindent = Math.min(mindent, indent2);
      }
    }
    if (mindent !== null) {
      const m = mindent;
      result = lines.map((l) => l[0] === " " || l[0] === "	" ? l.slice(m) : l).join("\n");
    }
    if (trimWhitespace) result = result.trim();
    if (escapeSpecialCharacters) result = result.replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\\r/g, "\r").replace(/\\v/g, "\v").replace(/\\b/g, "\b").replace(/\\f/g, "\f").replace(/\\0/g, "\0").replace(/\\x([\da-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\u\{([\da-fA-F]{1,6})\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\u([\da-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    if (typeof Bun !== "undefined") result = result.replace(/\\u(?:\{([\da-fA-F]{1,6})\}|([\da-fA-F]{4}))/g, (_, braced, unbraced) => {
      var _ref;
      const hex = (_ref = braced !== null && braced !== void 0 ? braced : unbraced) !== null && _ref !== void 0 ? _ref : "";
      return String.fromCodePoint(parseInt(hex, 16));
    });
    return result;
  }
  __name(dedent3, "dedent");
}
__name(createDedent, "createDedent");
function alignValue(value, precedingText) {
  if (typeof value !== "string" || !value.includes("\n")) return value;
  const indentMatch = precedingText.slice(precedingText.lastIndexOf("\n") + 1).match(/^(\s+)/);
  if (indentMatch) {
    const indent2 = indentMatch[1];
    return value.replace(/\n/g, `
${indent2}`);
  }
  return value;
}
__name(alignValue, "alignValue");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/strings/dedent.js
function dedent2(input) {
  return dedent(input);
}
__name(dedent2, "dedent");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/strings/indent.js
function indent(input, prefix = "  ") {
  if (input.length === 0 || prefix.length === 0) return input;
  return input.split("\n").map((line) => {
    if (line.trim().length === 0) return line;
    return `${prefix}${line}`;
  }).join("\n");
}
__name(indent, "indent");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/strings/limit-blank-lines.js
var cache = /* @__PURE__ */ new Map();
function limitBlankLines(str, maxConsecutive = 0) {
  const limit = Math.max(0, maxConsecutive);
  let regex = cache.get(limit);
  if (!regex) {
    regex = new RegExp(`(\\r?\\n\\s*){${limit + 2},}`, "g");
    cache.set(limit, regex);
  }
  return str.replace(regex, "\n".repeat(limit + 1));
}
__name(limitBlankLines, "limitBlankLines");

// src/shared/render-ts-file.ts
function renderTypeScriptFile(body) {
  const g = newGenerator().withSpaces(2);
  const trimmedBody = body.trim();
  g.line("/* eslint-disable */");
  g.line("/* tslint:disable */");
  g.line("// biome-ignore-all lint: Generated by VDL");
  g.break();
  if (trimmedBody.length > 0) {
    g.raw(trimmedBody);
    g.break();
  }
  return limitBlankLines(g.toString(), 1);
}
__name(renderTypeScriptFile, "renderTypeScriptFile");

// src/stages/emit/files/shared/catalog.ts
function renderCatalogSource(context) {
  const procedures = context.procedures.map((operation) => `${renderOperationDefinitionLiteral(operation)},`).join("\n");
  const streams = context.streams.map((operation) => `${renderOperationDefinitionLiteral(operation)},`).join("\n");
  const paths = context.services.map((service) => {
    const operations = service.operations.map(
      (operation) => `    ${operation.name}: ${JSON.stringify(`/${operation.rpcName}/${operation.name}`)},`
    ).join("\n");
    return [`  ${service.name}: {`, operations, "  },"].join("\n");
  }).join("\n");
  return [
    "/**",
    " * VDLProcedures is a list of all generated procedure definitions.",
    " */",
    "export const VDLProcedures: OperationDefinition[] = [",
    procedures,
    "] as const;",
    "",
    "/**",
    " * VDLStreams is a list of all generated stream definitions.",
    " */",
    "export const VDLStreams: OperationDefinition[] = [",
    streams,
    "] as const;",
    "",
    "/**",
    " * VDLPaths holds the relative URL paths for all generated RPC operations.",
    " */",
    "export const VDLPaths = {",
    paths,
    "} as const;"
  ].join("\n");
}
__name(renderCatalogSource, "renderCatalogSource");
function renderOperationDefinitionLiteral(operation) {
  const annotations = operation.annotations.map((annotation) => __spreadValues({
    name: annotation.name
  }, annotation.argument ? { argument: unwrapLiteral(annotation.argument) } : {}));
  return indent(
    JSON.stringify(
      {
        rpcName: operation.rpcName,
        name: operation.name,
        type: operation.kind,
        path: `/${operation.rpcName}/${operation.name}`,
        annotations
      },
      null,
      2
    )
  );
}
__name(renderOperationDefinitionLiteral, "renderOperationDefinitionLiteral");

// src/stages/emit/files/shared/core.ts
function renderCoreSource() {
  return CORE_RUNTIME.trim();
}
__name(renderCoreSource, "renderCoreSource");
var CORE_RUNTIME = dedent2(
  /* ts */
  `
  /**
   * Supported RPC operation kinds.
   */
  export type OperationType = "proc" | "stream";

  /**
   * JSON-compatible value used for annotation arguments preserved in catalogs.
   */
  export type AnnotationValue =
    | string
    | number
    | boolean
    | null
    | AnnotationValue[]
    | { [key: string]: AnnotationValue };

  /**
   * Preserved annotation metadata for generated RPC operations.
   */
  export interface OperationAnnotation {
    /** Annotation name without the @ prefix. */
    name: string;
    /** Optional resolved annotation argument. */
    argument?: AnnotationValue;
  }

  /**
   * Runtime description of a generated procedure or stream.
   */
  export interface OperationDefinition {
    /** RPC service name as declared in VDL. */
    rpcName: string;
    /** Operation name as declared in VDL. */
    name: string;
    /** Operation kind. */
    type: OperationType;
    /** Stable relative path appended to the configured base URL. */
    path: string;
    /** Non-marker annotations preserved from the VDL schema. */
    annotations: OperationAnnotation[];
  }

  /**
   * Empty-object helper used for procedures or streams that omit input and/or output.
   */
  export type Void = Record<string, never>;

  /**
   * Runtime helpers for the generated Void shape.
   */
  export const Void = {
    /** Parses a JSON string into an empty object. */
    parse(json: string): Void {
      const input = JSON.parse(json) as unknown;
      const error = Void.validate(input);
      if (error !== null) {
        throw new Error(error);
      }
      return Void.hydrate(input as Void);
    },

    /** Validates that the provided value is an empty object. */
    validate(input: unknown, path = "Void"): string | null {
      if (typeof input !== "object" || input === null || Array.isArray(input)) {
        const got = input === null ? "null" : Array.isArray(input) ? "array" : typeof input;
        return path + ": expected object, got " + got;
      }

      if (Object.keys(input as Record<string, unknown>).length > 0) {
        return path + ": expected empty object, got non-empty object";
      }

      return null;
    },

    /** Hydrates an empty object into the canonical runtime representation. */
    hydrate(_input: Void): Void {
      return {};
    },
  } as const;

  /**
   * Response envelope returned by VDL procedures and yielded by VDL streams.
   * 
   * @typeParam T - The concrete type of the successful response output.
   */
  export type Response<T> =
    /** Successful response */
    | {
        /** Indicates whether the RPC call was successful. */
        ok: true;
        /** The successful output payload. */
        output: T;
        /** Not present when the call is successful. */
        error?: never;
      }
    /** Error response */
    | {
        /** Indicates whether the RPC call failed. */
        ok: false;
        /** Not present when the call fails. */
        output?: never;
        /** Structured error payload. */
        error: VdlError;
      };

  /**
   * Structured error type used throughout the VDL ecosystem.
   *
   * It provides structured information about errors that occur within the system,
   * enabling consistent error handling across servers and clients.
   *
   * Fields:
   *   - Message: A human-readable description of the error.
   *   - Category: Optional. Categorizes the error by its nature or source (e.g., "ValidationError", "DatabaseError").
   *   - Code: Optional. A machine-readable identifier for the specific error condition (e.g., "INVALID_EMAIL").
   *   - Details: Optional. Additional information about the error.
   */
  export class VdlError extends Error {
    public readonly category?: string;
    public readonly code?: string;
    public readonly details?: Record<string, unknown>;

    constructor(options: {
      /**
       * Message provides a human-readable description of the error.
       *
       * This message can be displayed to end-users or used for logging and debugging purposes.
       *
       * Use Cases:
       *   1. If localization is not implemented, Message can be directly shown to the user to inform them of the issue.
       *   2. Developers can use Message in logs to diagnose problems during development or in production.
       */
      message: string;
      /**
       * Category categorizes the error by its nature or source.
       *
       * Examples:
       *   - "ValidationError" for input validation errors.
       *   - "DatabaseError" for errors originating from database operations.
       *   - "AuthenticationError" for authentication-related issues.
       *
       * Use Cases:
       *   1. In middleware, you can use Category to determine how to handle the error.
       *      For instance, you might log "InternalError" types and return a generic message to the client.
       *   2. Clients can inspect the Category to decide whether to prompt the user for action,
       *      such as re-authentication if the Category is "AuthenticationError".
       */
      category?: string;
      /**
       * Code is a machine-readable identifier for the specific error condition.
       *
       * Examples:
       *   - "INVALID_EMAIL" when an email address fails validation.
       *   - "USER_NOT_FOUND" when a requested user does not exist.
       *   - "RATE_LIMIT_EXCEEDED" when a client has made too many requests.
       *
       * Use Cases:
       *   1. Clients can map Codes to localized error messages for internationalization (i18n),
       *      displaying appropriate messages based on the user's language settings.
       *   2. Clients or middleware can implement specific logic based on the Code,
       *      such as retry mechanisms for "TEMPORARY_FAILURE" or showing captcha for "RATE_LIMIT_EXCEEDED".
       */
      code?: string;
      /**
       * Details contains optional additional information about the error.
       *
       * This field can include any relevant data that provides more context about the error.
       * The contents should be serializable to JSON.
       *
       * Use Cases:
       *   1. Providing field-level validation errors, e.g., Details could be:
       *      {"fields": {"email": "Email is invalid", "password": "Password is too short"}}
       *   2. Including diagnostic information such as timestamps, request IDs, or stack traces
       *      (ensure sensitive information is not exposed to clients).
       */
      details?: Record<string, unknown>;
    }) {
      super(options.message);
      this.name = "VdlError"; // Easier stack-trace filtering.
      this.category = options.category;
      this.code = options.code;
      this.details = options.details;
      Object.setPrototypeOf(this, new.target.prototype); // Maintains proper prototype chain when targeting ES5.
    }

    /** Serialises the error including all optional fields. */
    toJSON(): Record<string, unknown> {
      return {
        message: this.message,
        ...(this.category ? { category: this.category } : {}),
        ...(this.code ? { code: this.code } : {}),
        ...(this.details ? { details: this.details } : {}),
      };
    }
  }

  /**
   * Normalizes arbitrary error inputs into a VdlError instance.
   */
  export function asError(err: unknown): VdlError {
    if (err instanceof VdlError) {
      return err;
    }

    if (err instanceof Error) {
      return new VdlError({ message: err.message });
    }

    return new VdlError({ message: String(err) });
  }

  /**
   * Convenience helper for missing-field validation errors.
   */
  export function errorMissingRequiredField(message: string): VdlError {
    return new VdlError({
      message,
      category: "ValidationError",
      code: "MISSING_REQUIRED_FIELD",
    });
  }

  /**
   * Sleeps for the given number of milliseconds.
   */
  export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
`
);

// src/stages/emit/files/client/runtime.ts
function renderClientRuntimeSource() {
  return CLIENT_RUNTIME.trim();
}
__name(renderClientRuntimeSource, "renderClientRuntimeSource");
var CLIENT_RUNTIME = dedent2(
  /* ts */
  `
  /**
   * Context provided to a retry decider.
   */
  export interface RetryDecisionContext {
    /** Current attempt number, starting at 1. */
    attempt: number;
    /** Maximum configured attempts. */
    maxAttempts: number;
    /** Error produced by the current attempt. */
    error: VdlError;
    /** Original input payload. */
    input: unknown;
    /** Resolved operation metadata, including annotations. */
    operation?: OperationDefinition;
    /** Whether the generated runtime would retry without custom logic. */
    defaultRetryable: boolean;
  }

  /**
   * Context provided to a reconnect decider.
   */
  export interface ReconnectDecisionContext {
    /** Current reconnect attempt number, starting at 1. */
    attempt: number;
    /** Maximum configured reconnect attempts. */
    maxAttempts: number;
    /** Error that triggered the reconnect evaluation. */
    error: VdlError;
    /** Original subscription input payload. */
    input: unknown;
    /** Resolved operation metadata, including annotations. */
    operation?: OperationDefinition;
    /** Calculated delay before the next reconnect attempt. */
    delayMs: number;
    /** Whether the generated runtime would reconnect without custom logic. */
    defaultReconnectable: boolean;
  }

  /**
   * Controls automatic retry behavior for procedure calls.
   *
   * When a request fails due to network errors, timeouts, or 5xx HTTP status codes,
   * the client can automatically retry using exponential backoff.
   */
  export interface RetryConfig {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    delayMultiplier: number;
    jitter: number;
    shouldRetry?: (context: RetryDecisionContext) => boolean | Promise<boolean>;
  }

  /**
   * Controls request timeout behavior.
   *
   * If the server does not respond within the configured timeout, the request is aborted
   * and may be retried according to the effective retry configuration.
   */
  export interface TimeoutConfig {
    timeoutMs: number;
  }

  /**
   * Controls automatic reconnection behavior for streams.
   *
   * When a stream connection is lost due to network issues or server errors,
   * the client can automatically attempt to reconnect with exponential backoff.
   */
  export interface ReconnectConfig {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    delayMultiplier: number;
    jitter: number;
    shouldReconnect?: (
      context: ReconnectDecisionContext,
    ) => boolean | Promise<boolean>;
  }

  /**
   * A function that adds or modifies headers before each request.
   *
   * Header providers are executed in this order: global, RPC-level, operation-level.
   * They run before every request attempt, including retries and reconnects.
   */
  export type HeaderProvider = (
    headers: Record<string, string>,
  ) => void | Promise<void>;

  /**
   * Metadata about the current RPC request, passed to interceptors.
   */
  export interface RequestInfo {
    rpcName: string;
    operationName: string;
    input: unknown;
    type: OperationType;
    operation?: OperationDefinition;
  }

  /** Final function invoked by the interceptor chain. */
  export type Invoker = (req: RequestInfo) => Promise<Response<unknown>>;

  /** Request interceptor used by generated clients. */
  export type Interceptor = (
    req: RequestInfo,
    next: Invoker,
  ) => Promise<Response<unknown>>;

  /**
   * Minimal interface for a fetch response.
   * Compatible with the standard Fetch API and most polyfills.
   */
  export interface FetchLikeResponse {
    ok: boolean;
    status: number;
    body?: ReadableStream<Uint8Array> | null;
    json(): Promise<any>;
    text(): Promise<string>;
  }

  /**
   * Minimal interface for a fetch function.
   * Compatible with the standard Fetch API, node-fetch, and most polyfills.
   */
  export type FetchLike = (input: any, init?: any) => Promise<FetchLikeResponse>;

  /**
   * Default retry config: no retries (single attempt).
   */
  const defaultRetryConfig: RetryConfig = {
    maxAttempts: 1,
    initialDelayMs: 0,
    maxDelayMs: 0,
    delayMultiplier: 1,
    jitter: 0.2,
  };

  /**
   * Default timeout: 30 seconds.
   */
  const defaultTimeoutConfig: TimeoutConfig = {
    timeoutMs: 30000,
  };

  /**
   * Default reconnect config for streams.
   */
  const defaultReconnectConfig: ReconnectConfig = {
    maxAttempts: 30,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    delayMultiplier: 1.5,
    jitter: 0.2,
  };

  /** Default maximum message size for streams: 4MB. */
  const defaultMaxMessageSize = 4 * 1024 * 1024;

  /**
   * Adds random jitter to a delay to prevent thundering herd effects.
   */
  function applyJitter(delayMs: number, jitterFactor: number): number {
    if (jitterFactor <= 0) {
      return delayMs;
    }

    const boundedJitter = Math.min(jitterFactor, 1);
    const delta = delayMs * boundedJitter;
    const min = Math.max(0, delayMs - delta);
    const max = delayMs + delta;
    return min + Math.random() * (max - min);
  }

  /**
   * Calculates exponential backoff delay for retry attempts.
   */
  function calculateBackoff(config: RetryConfig, attempt: number): number {
    let delay = config.initialDelayMs;
    for (let index = 1; index < attempt; index += 1) {
      delay *= config.delayMultiplier;
    }
    if (delay > config.maxDelayMs) {
      delay = config.maxDelayMs;
    }
    return applyJitter(delay, config.jitter);
  }

  /**
   * Calculates exponential backoff delay for stream reconnection attempts.
   */
  function calculateReconnectBackoff(
    config: ReconnectConfig,
    attempt: number,
  ): number {
    let delay = config.initialDelayMs;
    for (let index = 1; index < attempt; index += 1) {
      delay *= config.delayMultiplier;
    }
    if (delay > config.maxDelayMs) {
      delay = config.maxDelayMs;
    }
    return applyJitter(delay, config.jitter);
  }

  function normalizeRetryConfig(
    config: Partial<RetryConfig>,
    defaultAttempts = 1,
  ): RetryConfig {
    return {
      maxAttempts: Math.max(1, config.maxAttempts ?? defaultAttempts),
      initialDelayMs: Math.max(0, config.initialDelayMs ?? 0),
      maxDelayMs: Math.max(0, config.maxDelayMs ?? 0),
      delayMultiplier: Math.max(1, config.delayMultiplier ?? 1),
      jitter: Math.max(0, Math.min(1, config.jitter ?? 0.2)),
      ...(config.shouldRetry ? { shouldRetry: config.shouldRetry } : {}),
    };
  }

  function normalizeTimeoutConfig(config: Partial<TimeoutConfig>): TimeoutConfig {
    return {
      timeoutMs: Math.max(0, config.timeoutMs ?? defaultTimeoutConfig.timeoutMs),
    };
  }

  function normalizeReconnectConfig(
    config: Partial<ReconnectConfig>,
    defaultAttempts = 30,
  ): ReconnectConfig {
    return {
      maxAttempts: Math.max(0, config.maxAttempts ?? defaultAttempts),
      initialDelayMs: Math.max(
        0,
        config.initialDelayMs ?? defaultReconnectConfig.initialDelayMs,
      ),
      maxDelayMs: Math.max(
        0,
        config.maxDelayMs ?? defaultReconnectConfig.maxDelayMs,
      ),
      delayMultiplier: Math.max(
        1,
        config.delayMultiplier ?? defaultReconnectConfig.delayMultiplier,
      ),
      jitter: Math.max(
        0,
        Math.min(1, config.jitter ?? defaultReconnectConfig.jitter),
      ),
      ...(config.shouldReconnect
        ? { shouldReconnect: config.shouldReconnect }
        : {}),
    };
  }

  // =============================================================================
  // Internal Client
  // =============================================================================

  /**
   * Core HTTP client engine used by generated VDL client wrappers.
   *
   * This class handles request execution, retry logic, timeout handling,
   * stream connections, header providers, and interceptors.
   *
   * Do not instantiate directly. Use the generated client builder.
   *
   * @internal
   */
  class internalClient {
    /** Base URL for all requests (trailing slashes are stripped). */
    private baseURL: string;

    /** The fetch implementation used for HTTP requests. */
    private fetchFn: FetchLike;

    /**
     * Registry of valid operations.
     * Structure: rpcName \u2192 operationName \u2192 OperationType
     * Used to validate requests and fail fast on typos.
     */
    private operationDefs: Map<string, Map<string, OperationType>>;

    // ---------------------------------------------------------------------------
    // Dynamic Components
    // ---------------------------------------------------------------------------

    /** Global header providers applied to all requests. */
    private headerProviders: HeaderProvider[] = [];

    /** Interceptors applied to all requests (in registration order). */
    private interceptors: Interceptor[] = [];

    /** RPC-specific header providers. Key: rpcName. */
    private rpcHeaderProviders: Map<string, HeaderProvider[]> = new Map();

    // ---------------------------------------------------------------------------
    // Global Default Configurations
    // ---------------------------------------------------------------------------

    private globalRetryConf: RetryConfig | null = null;
    private globalTimeoutConf: TimeoutConfig | null = null;
    private globalReconnectConf: ReconnectConfig | null = null;
    private globalMaxMessageSize: number = 0;

    // ---------------------------------------------------------------------------
    // Per-RPC Default Configurations
    // ---------------------------------------------------------------------------

    private rpcRetryConf: Map<string, RetryConfig> = new Map();
    private rpcTimeoutConf: Map<string, TimeoutConfig> = new Map();
    private rpcReconnectConf: Map<string, ReconnectConfig> = new Map();
    private rpcMaxMessageSize: Map<string, number> = new Map();

    // ---------------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------------

    /**
     * Creates a new internal client.
     *
     * @throws If required runtime dependencies are missing.
     * @throws If no fetch implementation is available.
     */
    constructor(
      baseURL: string,
      procDefs: OperationDefinition[],
      streamDefs: OperationDefinition[],
      opts: internalClientOption[],
    ) {
      this.verifyRuntimeDeps();

      this.baseURL = baseURL.replace(/[/]+$/gu, "");
      this.fetchFn = (globalThis.fetch ?? null) as FetchLike;
      this.operationDefs = new Map();

      const ensureRPC = (rpcName: string) => {
        if (!this.operationDefs.has(rpcName)) {
          this.operationDefs.set(rpcName, new Map());
        }
      };

      for (const def of procDefs) {
        ensureRPC(def.rpcName);
        this.operationDefs.get(def.rpcName)?.set(def.name, def);
      }

      for (const def of streamDefs) {
        ensureRPC(def.rpcName);
        this.operationDefs.get(def.rpcName)?.set(def.name, def);
      }

      for (const applyOption of opts) {
        applyOption(this);
      }

      if (!this.fetchFn) {
        throw new Error(
          "globalThis.fetch is undefined. Provide a custom fetch with withCustomFetch().",
        );
      }
    }

    /**
     * Verifies that required runtime APIs are available.
     */
    private verifyRuntimeDeps() {
      const missing: string[] = [];

      if (typeof AbortController !== "function") {
        missing.push("AbortController");
      }
      if (typeof ReadableStream === "undefined") {
        missing.push("ReadableStream");
      }
      if (typeof TextDecoder !== "function") {
        missing.push("TextDecoder");
      }

      if (missing.length > 0) {
        throw new Error(
          "Missing required runtime dependencies: " +
            missing.join(", ") +
            ". Install the necessary polyfills or use a compatible environment.",
        );
      }
    }

    // ---------------------------------------------------------------------------
    // Configuration Setters (called by builder options)
    // ---------------------------------------------------------------------------

    /** Sets a custom fetch implementation. */
    setFetch(fetchFn: FetchLike): void {
      this.fetchFn = fetchFn;
    }

    /** Adds a global header provider. */
    addHeaderProvider(provider: HeaderProvider): void {
      this.headerProviders.push(provider);
    }

    /** Adds an interceptor to the chain. */
    addInterceptor(interceptor: Interceptor): void {
      this.interceptors.push(interceptor);
    }

    /** Sets the global default retry configuration. */
    setGlobalRetryConfig(conf: RetryConfig): void {
      this.globalRetryConf = normalizeRetryConfig(conf, conf.maxAttempts);
    }

    /** Sets the global default timeout configuration. */
    setGlobalTimeoutConfig(conf: TimeoutConfig): void {
      this.globalTimeoutConf = normalizeTimeoutConfig(conf);
    }

    /** Sets the global default reconnect configuration for streams. */
    setGlobalReconnectConfig(conf: ReconnectConfig): void {
      this.globalReconnectConf = normalizeReconnectConfig(conf, conf.maxAttempts);
    }

    /** Sets the global default maximum message size for streams. */
    setGlobalMaxMessageSize(size: number): void {
      this.globalMaxMessageSize = size;
    }

    // ---------------------------------------------------------------------------
    // Per-RPC Configuration Setters
    // ---------------------------------------------------------------------------

    /** Sets the default retry config for a specific RPC. */
    setRPCRetryConfig(rpcName: string, conf: RetryConfig) {
      this.rpcRetryConf.set(rpcName, conf);
    }

    /** Sets the default timeout config for a specific RPC. */
    setRPCTimeoutConfig(rpcName: string, conf: TimeoutConfig) {
      this.rpcTimeoutConf.set(rpcName, conf);
    }

    /** Sets the default reconnect config for a specific RPC. */
    setRPCReconnectConfig(rpcName: string, conf: ReconnectConfig) {
      this.rpcReconnectConf.set(rpcName, conf);
    }

    /** Sets the default max message size for a specific RPC. */
    setRPCMaxMessageSize(rpcName: string, size: number) {
      this.rpcMaxMessageSize.set(rpcName, size);
    }

    /** Adds a header provider for a specific RPC. */
    setRPCHeaderProvider(rpcName: string, provider: HeaderProvider) {
      if (!this.rpcHeaderProviders.has(rpcName)) {
        this.rpcHeaderProviders.set(rpcName, []);
      }
      this.rpcHeaderProviders.get(rpcName)?.push(provider);
    }

    private getOperation(
      rpcName: string,
      operationName: string,
      expectedType: OperationType,
    ): OperationDefinition | undefined {
      const operation = this.operationDefs.get(rpcName)?.get(operationName);
      if (!operation || operation.type !== expectedType) {
        return undefined;
      }
      return operation;
    }

    /**
     * Resolves the effective retry configuration for a request.
     * Priority: operation-level > RPC-level > global > built-in defaults.
     */
    private mergeRetryConfig(
      rpcName: string,
      opConf?: RetryConfig,
    ): RetryConfig {
      return {
        ...defaultRetryConfig,
        ...(this.globalRetryConf ?? {}),
        ...(this.rpcRetryConf.get(rpcName) ?? {}),
        ...(opConf ?? {}),
        ...(opConf?.shouldRetry
          ? { shouldRetry: opConf.shouldRetry }
          : this.rpcRetryConf.get(rpcName)?.shouldRetry
            ? { shouldRetry: this.rpcRetryConf.get(rpcName)?.shouldRetry }
          : this.globalRetryConf?.shouldRetry
            ? { shouldRetry: this.globalRetryConf.shouldRetry }
            : {}),
      };
    }

    /**
     * Resolves the effective timeout configuration for a request.
     * Priority: operation-level > RPC-level > global > built-in defaults.
     */
    private mergeTimeoutConfig(
      rpcName: string,
      opConf?: TimeoutConfig,
    ): TimeoutConfig {
      return {
        ...defaultTimeoutConfig,
        ...(this.globalTimeoutConf ?? {}),
        ...(this.rpcTimeoutConf.get(rpcName) ?? {}),
        ...(opConf ?? {}),
      };
    }

    /**
     * Resolves the effective reconnect configuration for a stream.
     * Priority: operation-level > RPC-level > global > built-in defaults.
     */
    private mergeReconnectConfig(
      rpcName: string,
      opConf?: ReconnectConfig,
    ): ReconnectConfig {
      return {
        ...defaultReconnectConfig,
        ...(this.globalReconnectConf ?? {}),
        ...(this.rpcReconnectConf.get(rpcName) ?? {}),
        ...(opConf ?? {}),
        ...(opConf?.shouldReconnect
          ? { shouldReconnect: opConf.shouldReconnect }
          : this.rpcReconnectConf.get(rpcName)?.shouldReconnect
            ? {
                shouldReconnect:
                  this.rpcReconnectConf.get(rpcName)?.shouldReconnect,
              }
          : this.globalReconnectConf?.shouldReconnect
            ? { shouldReconnect: this.globalReconnectConf.shouldReconnect }
            : {}),
      };
    }

    /**
     * Resolves the effective maximum message size for a stream.
     * Priority: operation-level > RPC-level > global > built-in defaults.
     */
    private mergeMaxMessageSize(rpcName: string, opSize?: number): number {
      if (opSize && opSize > 0) {
        return opSize;
      }

      if (this.rpcMaxMessageSize.has(rpcName)) {
        const rpcSize = this.rpcMaxMessageSize.get(rpcName);
        if (rpcSize && rpcSize > 0) {
          return rpcSize;
        }
      }

      if (this.globalMaxMessageSize > 0) {
        return this.globalMaxMessageSize;
      }

      return defaultMaxMessageSize;
    }

    /**
     * Applies all header providers to a request's headers.
     * Order: global providers -> RPC providers -> operation providers.
     */
    private async applyHeaders(
      rpcName: string,
      headers: Record<string, string>,
      opHeaderProviders: HeaderProvider[],
    ): Promise<void> {
      for (const provider of this.headerProviders) {
        await provider(headers);
      }

      const rpcProviders = this.rpcHeaderProviders.get(rpcName) ?? [];
      for (const provider of rpcProviders) {
        await provider(headers);
      }

      for (const provider of opHeaderProviders) {
        await provider(headers);
      }
    }

    private async executeChain(
      reqInfo: RequestInfo,
      invoker: Invoker,
    ): Promise<Response<unknown>> {
      let next = invoker;
      for (let index = this.interceptors.length - 1; index >= 0; index -= 1) {
        const current = this.interceptors[index];
        const previousNext = next;
        next = (req) => current(req, previousNext);
      }
      return next(reqInfo);
    }

    private async shouldRetry(
      config: RetryConfig,
      context: RetryDecisionContext,
    ): Promise<boolean> {
      if (!config.shouldRetry) {
        return context.defaultRetryable;
      }

      return await config.shouldRetry(context);
    }

    private async shouldReconnect(
      config: ReconnectConfig,
      context: ReconnectDecisionContext,
    ): Promise<boolean> {
      if (!config.shouldReconnect) {
        return context.defaultReconnectable;
      }

      return await config.shouldReconnect(context);
    }

    async callProc(
      rpcName: string,
      procName: string,
      input: unknown,
      opHeaderProviders: HeaderProvider[],
      opRetryConf?: RetryConfig,
      opTimeoutConf?: TimeoutConfig,
      opSignal?: AbortSignal,
    ): Promise<Response<any>> {
      if (opSignal?.aborted) {
        return {
          ok: false,
          error: new VdlError({
            message: "Request aborted",
            category: "ClientError",
            code: "ABORTED",
          }),
        };
      }

      const operation = this.getOperation(rpcName, procName, "proc");
      const reqInfo: RequestInfo = {
        rpcName,
        operationName: procName,
        input,
        type: "proc",
        operation,
      };

      const invoker: Invoker = async (req) => {
        if (!operation) {
          return {
            ok: false,
            error: new VdlError({
              message:
                req.rpcName +
                "." +
                req.operationName +
                " procedure not found in schema",
              category: "ClientError",
              code: "INVALID_PROC",
              details: { rpc: req.rpcName, procedure: req.operationName },
            }),
          };
        }

        let payload: string;
        try {
          payload = req.input == null ? "{}" : JSON.stringify(req.input);
        } catch (error) {
          return {
            ok: false,
            error: new VdlError({
              message:
                "Failed to encode input for " +
                req.rpcName +
                "." +
                req.operationName +
                ": " +
                String(error),
              category: "ClientError",
              code: "ENCODE_INPUT",
            }),
          };
        }

        const retryConf = this.mergeRetryConfig(req.rpcName, opRetryConf);
        const timeoutConf = this.mergeTimeoutConfig(req.rpcName, opTimeoutConf);
        const url = this.baseURL + "/" + req.rpcName + "/" + req.operationName;
        let lastError: VdlError | null = null;

        for (let attempt = 1; attempt <= retryConf.maxAttempts; attempt += 1) {
          if (opSignal?.aborted) {
            return {
              ok: false,
              error: new VdlError({
                message: "Request aborted",
                category: "ClientError",
                code: "ABORTED",
              }),
            };
          }

          const abortController = new AbortController();
          let timeoutId: ReturnType<typeof setTimeout> | undefined;
          const onExternalAbort = () => abortController.abort();
          opSignal?.addEventListener("abort", onExternalAbort);

          try {
            if (timeoutConf.timeoutMs > 0) {
              timeoutId = setTimeout(
                () => abortController.abort(),
                timeoutConf.timeoutMs,
              );
            }

            const headers: Record<string, string> = {
              "content-type": "application/json",
              accept: "application/json",
            };

            try {
              await this.applyHeaders(req.rpcName, headers, opHeaderProviders);
            } catch (error) {
              if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
              }
              opSignal?.removeEventListener("abort", onExternalAbort);
              return { ok: false, error: asError(error) };
            }

            const fetchResponse = await this.fetchFn(url, {
              method: "POST",
              headers,
              body: payload,
              signal: abortController.signal,
            });

            if (timeoutId !== undefined) {
              clearTimeout(timeoutId);
            }
            opSignal?.removeEventListener("abort", onExternalAbort);

            if (fetchResponse.status >= 500) {
              const error = new VdlError({
                message:
                  "Unexpected HTTP status: " + String(fetchResponse.status),
                category: "HTTPError",
                code: "BAD_STATUS",
                details: { status: fetchResponse.status },
              });
              const canRetry =
                attempt < retryConf.maxAttempts &&
                (await this.shouldRetry(retryConf, {
                  attempt,
                  maxAttempts: retryConf.maxAttempts,
                  error,
                  input,
                  operation,
                  defaultRetryable: true,
                }));

              if (canRetry) {
                lastError = error;
                await sleep(calculateBackoff(retryConf, attempt));
                continue;
              }

              return { ok: false, error };
            }

            if (!fetchResponse.ok) {
              const error = new VdlError({
                message:
                  "Unexpected HTTP status: " + String(fetchResponse.status),
                category: "HTTPError",
                code: "BAD_STATUS",
                details: { status: fetchResponse.status },
              });
              const canRetry =
                attempt < retryConf.maxAttempts &&
                (await this.shouldRetry(retryConf, {
                  attempt,
                  maxAttempts: retryConf.maxAttempts,
                  error,
                  input,
                  operation,
                  defaultRetryable: false,
                }));

              if (canRetry) {
                lastError = error;
                await sleep(calculateBackoff(retryConf, attempt));
                continue;
              }

              return { ok: false, error };
            }

            try {
              const json = (await fetchResponse.json()) as
                | Response<any>
                | {
                    ok: false;
                    error: {
                      message?: string;
                      category?: string;
                      code?: string;
                      details?: Record<string, unknown>;
                    };
                  };
              if (!json.ok) {
                const error = new VdlError({
                  message: json.error.message ?? "Unknown error",
                  category: json.error.category,
                  code: json.error.code,
                  details: json.error.details,
                });
                const canRetry =
                  attempt < retryConf.maxAttempts &&
                  (await this.shouldRetry(retryConf, {
                    attempt,
                    maxAttempts: retryConf.maxAttempts,
                    error,
                    input,
                    operation,
                    defaultRetryable: false,
                  }));

                if (canRetry) {
                  lastError = error;
                  await sleep(calculateBackoff(retryConf, attempt));
                  continue;
                }

                return { ok: false, error };
              }

              return json;
            } catch (error) {
              const decodeError = new VdlError({
                message: "Failed to decode VDL response: " + String(error),
                category: "ClientError",
                code: "DECODE_RESPONSE",
              });
              const canRetry =
                attempt < retryConf.maxAttempts &&
                (await this.shouldRetry(retryConf, {
                  attempt,
                  maxAttempts: retryConf.maxAttempts,
                  error: decodeError,
                  input,
                  operation,
                  defaultRetryable: false,
                }));

              if (canRetry) {
                lastError = decodeError;
                await sleep(calculateBackoff(retryConf, attempt));
                continue;
              }

              return { ok: false, error: decodeError };
            }
          } catch (error) {
            if (timeoutId !== undefined) {
              clearTimeout(timeoutId);
            }
            opSignal?.removeEventListener("abort", onExternalAbort);

            if (opSignal?.aborted) {
              return {
                ok: false,
                error: new VdlError({
                  message: "Request aborted",
                  category: "ClientError",
                  code: "ABORTED",
                }),
              };
            }

            const normalizedError =
              abortController.signal.aborted && timeoutConf.timeoutMs > 0
                ? new VdlError({
                    message: "Request timeout",
                    category: "TimeoutError",
                    code: "REQUEST_TIMEOUT",
                    details: { attempt },
                  })
                : asError(error);

            const canRetry =
              attempt < retryConf.maxAttempts &&
              (await this.shouldRetry(retryConf, {
                attempt,
                maxAttempts: retryConf.maxAttempts,
                error: normalizedError,
                input,
                operation,
                defaultRetryable: true,
              }));

            if (canRetry) {
              lastError = normalizedError;
              await sleep(calculateBackoff(retryConf, attempt));
              continue;
            }

            return { ok: false, error: normalizedError };
          }
        }

        return {
          ok: false,
          error:
            lastError ??
            new VdlError({
              message: "Unknown error",
              category: "ClientError",
              code: "UNKNOWN",
            }),
        };
      };

      return this.executeChain(reqInfo, invoker) as Promise<Response<any>>;
    }

    callStream(
      rpcName: string,
      streamName: string,
      input: unknown,
      opHeaderProviders: HeaderProvider[],
      opReconnectConf?: ReconnectConfig,
      opMaxMessageSize?: number,
      onConnect?: () => void,
      onDisconnect?: (error: Error | null) => void,
      onReconnect?: (attempt: number, delayMs: number) => void,
      opSignal?: AbortSignal,
    ): {
      stream: AsyncGenerator<Response<any>, void, unknown>;
      cancel: () => void;
    } {
      const operation = this.getOperation(rpcName, streamName, "stream");
      const reqInfo: RequestInfo = {
        rpcName,
        operationName: streamName,
        input,
        type: "stream",
        operation,
      };
      const self = this;
      let isCancelled = false;
      let currentAbortController: AbortController | null = null;

      const cancel = () => {
        isCancelled = true;
        currentAbortController?.abort();
      };

      const onExternalAbort = () => {
        isCancelled = true;
        currentAbortController?.abort();
      };

      if (opSignal?.aborted) {
        isCancelled = true;
      }

      async function* generator(): AsyncGenerator<Response<any>, void, unknown> {
        let finalError: VdlError | null = null;
        if (opSignal && !opSignal.aborted) {
          opSignal.addEventListener("abort", onExternalAbort);
        }

        try {
          if (!operation) {
            yield {
              ok: false,
              error: new VdlError({
                message:
                  rpcName + "." + streamName + " stream not found in schema",
                category: "ClientError",
                code: "INVALID_STREAM",
                details: { rpc: rpcName, stream: streamName },
              }),
            };
            return;
          }

          let payload: string;
          try {
            payload = input == null ? "{}" : JSON.stringify(input);
          } catch (error) {
            finalError = asError(error);
            yield { ok: false, error: asError(finalError) };
            return;
          }

          const reconnectConf = self.mergeReconnectConfig(
            rpcName,
            opReconnectConf,
          );
          const maxMessageSize = self.mergeMaxMessageSize(
            rpcName,
            opMaxMessageSize,
          );
          const url = self.baseURL + "/" + rpcName + "/" + streamName;
          let reconnectAttempt = 0;

          while (!isCancelled) {
            currentAbortController = new AbortController();

            try {
              const headers: Record<string, string> = {
                "content-type": "application/json",
                accept: "text/event-stream",
              };

              await self.applyHeaders(rpcName, headers, opHeaderProviders);

              const fetchResponse = await self.fetchFn(url, {
                method: "POST",
                headers,
                body: payload,
                signal: currentAbortController.signal,
              });

              if (fetchResponse.status >= 500) {
                const error = new VdlError({
                  message:
                    "Unexpected HTTP status: " + String(fetchResponse.status),
                  category: "HTTPError",
                  code: "BAD_STATUS",
                  details: { status: fetchResponse.status },
                });
                const delayMs = calculateReconnectBackoff(
                  reconnectConf,
                  reconnectAttempt + 1,
                );
                const canReconnect =
                  reconnectAttempt < reconnectConf.maxAttempts &&
                  (await self.shouldReconnect(reconnectConf, {
                    attempt: reconnectAttempt + 1,
                    maxAttempts: reconnectConf.maxAttempts,
                    error,
                    input,
                    operation,
                    delayMs,
                    defaultReconnectable: true,
                  }));

                if (canReconnect) {
                  onReconnect?.(reconnectAttempt + 1, delayMs);
                  reconnectAttempt += 1;
                  await sleep(delayMs);
                  continue;
                }

                finalError = error;
                yield { ok: false, error };
                return;
              }

              if (!fetchResponse.ok) {
                const error = new VdlError({
                  message:
                    "Unexpected HTTP status: " + String(fetchResponse.status),
                  category: "HTTPError",
                  code: "BAD_STATUS",
                  details: { status: fetchResponse.status },
                });
                const delayMs = calculateReconnectBackoff(
                  reconnectConf,
                  reconnectAttempt + 1,
                );
                const canReconnect =
                  reconnectAttempt < reconnectConf.maxAttempts &&
                  (await self.shouldReconnect(reconnectConf, {
                    attempt: reconnectAttempt + 1,
                    maxAttempts: reconnectConf.maxAttempts,
                    error,
                    input,
                    operation,
                    delayMs,
                    defaultReconnectable: false,
                  }));

                if (canReconnect) {
                  onReconnect?.(reconnectAttempt + 1, delayMs);
                  reconnectAttempt += 1;
                  await sleep(delayMs);
                  continue;
                }

                finalError = error;
                yield { ok: false, error };
                return;
              }

              if (!fetchResponse.body) {
                const error = new VdlError({
                  message: "Missing response body for stream",
                  category: "ConnectionError",
                  code: "STREAM_CONNECT_FAILED",
                });
                finalError = error;
                yield { ok: false, error };
                return;
              }

              onConnect?.();
              reconnectAttempt = 0;

              const reader = fetchResponse.body.getReader();
              const decoder = new TextDecoder();
              let buffer = "";

              try {
                while (!isCancelled) {
                  const { done, value } = await reader.read();
                  if (done) {
                    break;
                  }

                  buffer += decoder.decode(value, { stream: true });

                  let separatorIndex = buffer.indexOf("\\n\\n");
                  while (separatorIndex >= 0) {
                    const chunk = buffer.slice(0, separatorIndex).trim();
                    buffer = buffer.slice(separatorIndex + 2);

                    if (chunk === "" || chunk.startsWith(":")) {
                      separatorIndex = buffer.indexOf("\\n\\n");
                      continue;
                    }

                    if (chunk.startsWith("data:")) {
                      const payloadText = chunk.slice(5).trim();
                      if (payloadText.length > maxMessageSize) {
                        finalError = new VdlError({
                          message:
                            "Stream message exceeded maximum size of " +
                            String(maxMessageSize) +
                            " bytes",
                          category: "ProtocolError",
                          code: "MESSAGE_TOO_LARGE",
                        });
                        yield { ok: false, error: asError(finalError) };
                        return;
                      }

                      try {
                        const event = JSON.parse(payloadText) as
                          | Response<any>
                          | {
                              ok: false;
                              error: {
                                message?: string;
                                category?: string;
                                code?: string;
                                details?: Record<string, unknown>;
                              };
                            };
                        if (!event.ok) {
                          yield {
                            ok: false,
                            error: new VdlError({
                              message: event.error.message ?? "Unknown error",
                              category: event.error.category,
                              code: event.error.code,
                              details: event.error.details,
                            }),
                          };
                        } else {
                          yield event;
                        }
                      } catch (error) {
                        finalError = new VdlError({
                          message:
                            "Received invalid SSE payload: " + String(error),
                          category: "ProtocolError",
                          code: "INVALID_PAYLOAD",
                        });
                        yield { ok: false, error: asError(finalError) };
                        return;
                      }
                    }

                    if (buffer.length > maxMessageSize) {
                      finalError = new VdlError({
                        message:
                          "Stream message accumulation exceeded maximum size of " +
                          String(maxMessageSize) +
                          " bytes",
                        category: "ProtocolError",
                        code: "MESSAGE_TOO_LARGE",
                      });
                      yield { ok: false, error: asError(finalError) };
                      return;
                    }

                    separatorIndex = buffer.indexOf("\\n\\n");
                  }
                }

                return;
              } catch (error) {
                const normalizedError = asError(error);
                const delayMs = calculateReconnectBackoff(
                  reconnectConf,
                  reconnectAttempt + 1,
                );
                const canReconnect =
                  !isCancelled &&
                  reconnectAttempt < reconnectConf.maxAttempts &&
                  (await self.shouldReconnect(reconnectConf, {
                    attempt: reconnectAttempt + 1,
                    maxAttempts: reconnectConf.maxAttempts,
                    error: normalizedError,
                    input,
                    operation,
                    delayMs,
                    defaultReconnectable: true,
                  }));

                if (canReconnect) {
                  onReconnect?.(reconnectAttempt + 1, delayMs);
                  reconnectAttempt += 1;
                  await sleep(delayMs);
                  continue;
                }

                finalError = normalizedError;
                yield { ok: false, error: normalizedError };
                return;
              }
            } catch (error) {
              const normalizedError = asError(error);
              const delayMs = calculateReconnectBackoff(
                reconnectConf,
                reconnectAttempt + 1,
              );
              const canReconnect =
                !isCancelled &&
                reconnectAttempt < reconnectConf.maxAttempts &&
                (await self.shouldReconnect(reconnectConf, {
                  attempt: reconnectAttempt + 1,
                  maxAttempts: reconnectConf.maxAttempts,
                  error: normalizedError,
                  input,
                  operation,
                  delayMs,
                  defaultReconnectable: true,
                }));

              if (canReconnect) {
                onReconnect?.(reconnectAttempt + 1, delayMs);
                reconnectAttempt += 1;
                await sleep(delayMs);
                continue;
              }

              finalError = normalizedError;
              if (!isCancelled) {
                yield { ok: false, error: normalizedError };
              }
              return;
            }
          }
        } finally {
          opSignal?.removeEventListener("abort", onExternalAbort);
          onDisconnect?.(finalError);
        }
      }

      const wrappedGenerator = async function* () {
        const result = await self.executeChain(reqInfo, async () => ({
          ok: true,
          output: null,
        }));
        if (!result.ok) {
          yield result;
          return;
        }
        yield* generator();
      };

      return {
        stream: wrappedGenerator(),
        cancel,
      };
    }
  }

  type internalClientOption = (client: internalClient) => void;

  function withFetch(fetchFn: FetchLike): internalClientOption {
    return (client) => client.setFetch(fetchFn);
  }

  function withGlobalHeader(key: string, value: string): internalClientOption {
    return (client) =>
      client.addHeaderProvider((headers) => {
        headers[key] = value;
      });
  }

  function withHeaderProvider(provider: HeaderProvider): internalClientOption {
    return (client) => client.addHeaderProvider(provider);
  }

  function withInterceptor(interceptor: Interceptor): internalClientOption {
    return (client) => client.addInterceptor(interceptor);
  }

  function withGlobalRetryConfig(conf: RetryConfig): internalClientOption {
    return (client) => client.setGlobalRetryConfig(conf);
  }

  function withGlobalTimeoutConfig(conf: TimeoutConfig): internalClientOption {
    return (client) => client.setGlobalTimeoutConfig(conf);
  }

  function withGlobalReconnectConfig(
    conf: ReconnectConfig,
  ): internalClientOption {
    return (client) => client.setGlobalReconnectConfig(conf);
  }

  function withGlobalMaxMessageSize(size: number): internalClientOption {
    return (client) => client.setGlobalMaxMessageSize(size);
  }

  class clientBuilder {
    private readonly baseURL: string;
    private readonly procDefs: OperationDefinition[];
    private readonly streamDefs: OperationDefinition[];
    private readonly opts: internalClientOption[] = [];

    constructor(
      baseURL: string,
      procDefs: OperationDefinition[],
      streamDefs: OperationDefinition[],
    ) {
      this.baseURL = baseURL;
      this.procDefs = procDefs;
      this.streamDefs = streamDefs;
    }

    withFetch(fetchFn: FetchLike): clientBuilder {
      this.opts.push(withFetch(fetchFn));
      return this;
    }

    withGlobalHeader(key: string, value: string): clientBuilder {
      this.opts.push(withGlobalHeader(key, value));
      return this;
    }

    withHeaderProvider(provider: HeaderProvider): clientBuilder {
      this.opts.push(withHeaderProvider(provider));
      return this;
    }

    withInterceptor(interceptor: Interceptor): clientBuilder {
      this.opts.push(withInterceptor(interceptor));
      return this;
    }

    withGlobalRetryConfig(conf: RetryConfig): clientBuilder {
      this.opts.push(withGlobalRetryConfig(conf));
      return this;
    }

    withGlobalTimeoutConfig(conf: TimeoutConfig): clientBuilder {
      this.opts.push(withGlobalTimeoutConfig(conf));
      return this;
    }

    withGlobalReconnectConfig(conf: ReconnectConfig): clientBuilder {
      this.opts.push(withGlobalReconnectConfig(conf));
      return this;
    }

    withGlobalMaxMessageSize(size: number): clientBuilder {
      this.opts.push(withGlobalMaxMessageSize(size));
      return this;
    }

    build(): internalClient {
      return new internalClient(
        this.baseURL,
        this.procDefs,
        this.streamDefs,
        this.opts,
      );
    }
  }
`
);

// src/stages/emit/files/client/generate.ts
function generateClientFile(context) {
  const g = newGenerator().withSpaces(2);
  g.line(
    `import * as vdlTypes from ${JSON.stringify(context.options.typesImport)};`
  );
  g.break();
  g.raw(renderCatalogSource(context));
  g.break();
  g.raw(renderCoreSource());
  g.break();
  g.raw(renderClientRuntimeSource());
  g.break();
  renderClientFacade(g, context);
  return {
    path: "client.ts",
    content: renderTypeScriptFile(g.toString())
  };
}
__name(generateClientFile, "generateClientFile");
function renderClientFacade(g, context) {
  writeDocComment(g, {
    fallback: "Creates a new VDL RPC client builder."
  });
  g.line("export function NewClient(baseURL: string): ClientBuilder {");
  g.block(() => {
    g.line("return new ClientBuilder(baseURL);");
  });
  g.line("}");
  g.break();
  writeDocComment(g, {
    fallback: "Fluent builder for configuring a generated RPC client."
  });
  g.line("export class ClientBuilder {");
  g.block(() => {
    g.line("private readonly builder: clientBuilder;");
    g.break();
    g.line("constructor(baseURL: string) {");
    g.block(() => {
      g.line(
        "this.builder = new clientBuilder(baseURL, VDLProcedures, VDLStreams);"
      );
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Sets a custom fetch implementation for the generated client."
    });
    g.line("withCustomFetch(fetchFn: FetchLike): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withFetch(fetchFn);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Adds a static header that will be sent with every request."
    });
    g.line("withGlobalHeader(key: string, value: string): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withGlobalHeader(key, value);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Adds a dynamic header provider that runs before every request attempt."
    });
    g.line("withHeaderProvider(provider: HeaderProvider): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withHeaderProvider(provider);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Adds an interceptor around generated client execution."
    });
    g.line("withInterceptor(interceptor: Interceptor): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withInterceptor(interceptor);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Sets the global default retry policy for generated procedures."
    });
    g.line("withGlobalRetryConfig(conf: RetryConfig): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withGlobalRetryConfig(conf);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Sets the global default timeout for generated procedures."
    });
    g.line("withGlobalTimeoutConfig(conf: TimeoutConfig): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withGlobalTimeoutConfig(conf);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Sets the global default reconnect policy for generated streams."
    });
    g.line("withGlobalReconnectConfig(conf: ReconnectConfig): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withGlobalReconnectConfig(conf);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Sets the global maximum stream message size."
    });
    g.line("withGlobalMaxMessageSize(size: number): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withGlobalMaxMessageSize(size);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Builds the configured client instance."
    });
    g.line("build(): Client {");
    g.block(() => {
      g.line("return new Client(this.builder.build());");
    });
    g.line("}");
  });
  g.line("}");
  g.break();
  writeDocComment(g, {
    fallback: "Main VDL RPC client exposing typed access to generated procedures and streams."
  });
  g.line("export class Client {");
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("public readonly procs: ProcRegistry;");
    g.line("public readonly streams: StreamRegistry;");
    g.break();
    g.line("constructor(intClient: internalClient) {");
    g.block(() => {
      g.line("this.intClient = intClient;");
      g.line("this.procs = new ProcRegistry(intClient);");
      g.line("this.streams = new StreamRegistry(intClient);");
    });
    g.line("}");
  });
  g.line("}");
  g.break();
  renderProcedureRegistry(g, context);
  renderStreamRegistry(g, context);
}
__name(renderClientFacade, "renderClientFacade");
function renderProcedureRegistry(g, context) {
  writeDocComment(g, {
    fallback: "Registry exposing every generated procedure builder."
  });
  g.line("class ProcRegistry {");
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("constructor(intClient: internalClient) {");
    g.block(() => {
      g.line("this.intClient = intClient;");
    });
    g.line("}");
    g.break();
    for (const procedure of context.procedures) {
      writeDocComment(g, {
        doc: procedure.doc,
        annotations: procedure.annotations,
        fallback: `Creates a call builder for ${procedure.rpcName}.${procedure.name}.`
      });
      g.line(
        `${procedure.clientMethodName}(): Proc${procedure.rpcName}${procedure.name}Builder { return new Proc${procedure.rpcName}${procedure.name}Builder(this.intClient, ${JSON.stringify(procedure.rpcName)}, ${JSON.stringify(procedure.name)}); }`
      );
      g.break();
    }
  });
  g.line("}");
  g.break();
  for (const procedure of context.procedures) {
    renderProcedureBuilder(g, procedure);
  }
}
__name(renderProcedureRegistry, "renderProcedureRegistry");
function renderStreamRegistry(g, context) {
  writeDocComment(g, {
    fallback: "Registry exposing every generated stream builder."
  });
  g.line("class StreamRegistry {");
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("constructor(intClient: internalClient) {");
    g.block(() => {
      g.line("this.intClient = intClient;");
    });
    g.line("}");
    g.break();
    for (const stream of context.streams) {
      writeDocComment(g, {
        doc: stream.doc,
        annotations: stream.annotations,
        fallback: `Creates a stream builder for ${stream.rpcName}.${stream.name}.`
      });
      g.line(
        `${stream.clientMethodName}(): Stream${stream.rpcName}${stream.name}Builder { return new Stream${stream.rpcName}${stream.name}Builder(this.intClient, ${JSON.stringify(stream.rpcName)}, ${JSON.stringify(stream.name)}); }`
      );
      g.break();
    }
  });
  g.line("}");
  g.break();
  for (const stream of context.streams) {
    renderStreamBuilder(g, stream);
  }
}
__name(renderStreamRegistry, "renderStreamRegistry");
function renderRuntimeTypeReference(typeName) {
  return typeName ? `vdlTypes.${typeName}` : "Void";
}
__name(renderRuntimeTypeReference, "renderRuntimeTypeReference");
function renderRuntimeHelperReference(typeName) {
  return typeName ? `vdlTypes.${typeName}` : "Void";
}
__name(renderRuntimeHelperReference, "renderRuntimeHelperReference");
function renderProcedureBuilder(g, operation) {
  const inputType = renderRuntimeTypeReference(operation.inputTypeName);
  const outputType = renderRuntimeTypeReference(operation.outputTypeName);
  const inputHelper = renderRuntimeHelperReference(operation.inputTypeName);
  const outputHelper = renderRuntimeHelperReference(operation.outputTypeName);
  const executeSignature = operation.inputTypeName ? `async execute(input: ${inputType}): Promise<${outputType}>` : `async execute(input: Void = {}): Promise<${outputType}>`;
  g.line(`class Proc${operation.rpcName}${operation.name}Builder {`);
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("private readonly rpcName: string;");
    g.line("private readonly procName: string;");
    g.line("private readonly headerProviders: HeaderProvider[] = [];");
    g.line("private retryConfig?: RetryConfig;");
    g.line("private timeoutConfig?: TimeoutConfig;");
    g.line("private signal?: AbortSignal;");
    g.break();
    g.line(
      "constructor(intClient: internalClient, rpcName: string, procName: string) {"
    );
    g.block(() => {
      g.line("this.intClient = intClient;");
      g.line("this.rpcName = rpcName;");
      g.line("this.procName = procName;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Adds a static header to this procedure call."
    });
    g.line(
      `withHeader(key: string, value: string): Proc${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line(
        "this.headerProviders.push((headers) => { headers[key] = value; });"
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Adds a dynamic header provider to this procedure call. The provider runs on every attempt, including retries."
    });
    g.line(
      `withHeaderProvider(provider: HeaderProvider): Proc${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.headerProviders.push(provider);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Configures retry behavior for this procedure call. The optional shouldRetry callback receives the resolved operation metadata, including annotations."
    });
    g.line(
      `withRetries(config: Partial<RetryConfig>): Proc${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.retryConfig = normalizeRetryConfig(config, 3);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    g.line(
      `withRetryConfig(config: RetryConfig): Proc${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line(
        "this.retryConfig = normalizeRetryConfig(config, config.maxAttempts);"
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Configures timeout behavior for this procedure call."
    });
    g.line(
      `withTimeout(config: Partial<TimeoutConfig>): Proc${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.timeoutConfig = normalizeTimeoutConfig(config);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    g.line(
      `withTimeoutConfig(config: TimeoutConfig): Proc${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.timeoutConfig = normalizeTimeoutConfig(config);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Sets an external AbortSignal used to cancel this procedure call."
    });
    g.line(
      `withSignal(signal: AbortSignal): Proc${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.signal = signal;");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Executes ${operation.rpcName}.${operation.name}.`
    });
    g.line(`${executeSignature} {`);
    g.block(() => {
      g.line(`const validationError = ${inputHelper}.validate(input);`);
      g.line("if (validationError !== null) {");
      g.block(() => {
        g.line(
          'throw new VdlError({ message: validationError, code: "INVALID_INPUT", category: "ValidationError" });'
        );
      });
      g.line("}");
      g.line(
        "const rawResponse = await this.intClient.callProc(this.rpcName, this.procName, input, this.headerProviders, this.retryConfig, this.timeoutConfig, this.signal);"
      );
      g.line("if (!rawResponse.ok) {");
      g.block(() => {
        g.line("throw rawResponse.error;");
      });
      g.line("}");
      g.line(
        `return ${outputHelper}.hydrate(rawResponse.output as ${outputType});`
      );
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}
__name(renderProcedureBuilder, "renderProcedureBuilder");
function renderStreamBuilder(g, operation) {
  const inputType = renderRuntimeTypeReference(operation.inputTypeName);
  const outputType = renderRuntimeTypeReference(operation.outputTypeName);
  const inputHelper = renderRuntimeHelperReference(operation.inputTypeName);
  const outputHelper = renderRuntimeHelperReference(operation.outputTypeName);
  const responseType = operation.streamResponseTypeName;
  const executeSignature = operation.inputTypeName ? `execute(input: ${inputType})` : `execute(input: Void = {})`;
  g.line(`export type ${responseType} = Response<${outputType}>;`);
  g.break();
  g.line(`class Stream${operation.rpcName}${operation.name}Builder {`);
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("private readonly rpcName: string;");
    g.line("private readonly streamName: string;");
    g.line("private readonly headerProviders: HeaderProvider[] = [];");
    g.line("private reconnectConfig?: ReconnectConfig;");
    g.line("private maxMessageSize = 0;");
    g.line("private onConnectCb?: () => void;");
    g.line("private onDisconnectCb?: (error: Error | null) => void;");
    g.line(
      "private onReconnectCb?: (attempt: number, delayMs: number) => void;"
    );
    g.line("private signal?: AbortSignal;");
    g.break();
    g.line(
      "constructor(intClient: internalClient, rpcName: string, streamName: string) {"
    );
    g.block(() => {
      g.line("this.intClient = intClient;");
      g.line("this.rpcName = rpcName;");
      g.line("this.streamName = streamName;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Adds a static header to this stream subscription."
    });
    g.line(
      `withHeader(key: string, value: string): Stream${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line(
        "this.headerProviders.push((headers) => { headers[key] = value; });"
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Adds a dynamic header provider to this stream subscription. The provider runs again for every reconnect attempt."
    });
    g.line(
      `withHeaderProvider(provider: HeaderProvider): Stream${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.headerProviders.push(provider);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Configures reconnect behavior for this stream. The optional shouldReconnect callback receives the resolved operation metadata, including annotations."
    });
    g.line(
      `withReconnect(config: Partial<ReconnectConfig>): Stream${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.reconnectConfig = normalizeReconnectConfig(config, 5);");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    g.line(
      `withReconnectConfig(config: ReconnectConfig): Stream${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line(
        "this.reconnectConfig = normalizeReconnectConfig(config, config.maxAttempts);"
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Sets the maximum allowed stream message size in bytes."
    });
    g.line(
      `withMaxMessageSize(size: number): Stream${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.maxMessageSize = size;");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Registers a callback invoked after the stream connects."
    });
    g.line(
      `onConnect(cb: () => void): Stream${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.onConnectCb = cb;");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    g.line(
      `withOnConnect(cb: () => void): Stream${operation.rpcName}${operation.name}Builder { return this.onConnect(cb); }`
    );
    g.break();
    writeDocComment(g, {
      fallback: "Registers a callback invoked when the stream permanently disconnects."
    });
    g.line(
      `onDisconnect(cb: (error: Error | null) => void): Stream${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.onDisconnectCb = cb;");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    g.line(
      `withOnDisconnect(cb: (error: Error | null) => void): Stream${operation.rpcName}${operation.name}Builder { return this.onDisconnect(cb); }`
    );
    g.break();
    writeDocComment(g, {
      fallback: "Registers a callback invoked before each reconnect attempt."
    });
    g.line(
      `onReconnect(cb: (attempt: number, delayMs: number) => void): Stream${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.onReconnectCb = cb;");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    g.line(
      `withOnReconnect(cb: (attempt: number, delayMs: number) => void): Stream${operation.rpcName}${operation.name}Builder { return this.onReconnect(cb); }`
    );
    g.break();
    writeDocComment(g, {
      fallback: "Sets an external AbortSignal used to cancel this stream."
    });
    g.line(
      `withSignal(signal: AbortSignal): Stream${operation.rpcName}${operation.name}Builder {`
    );
    g.block(() => {
      g.line("this.signal = signal;");
      g.line("return this;");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Opens ${operation.rpcName}.${operation.name}.`
    });
    g.line(
      `${executeSignature}: { stream: AsyncGenerator<${responseType}, void, unknown>; cancel: () => void } {`
    );
    g.block(() => {
      g.line(`const validationError = ${inputHelper}.validate(input);`);
      g.line("if (validationError !== null) {");
      g.block(() => {
        g.line(
          'throw new VdlError({ message: validationError, code: "INVALID_INPUT", category: "ValidationError" });'
        );
      });
      g.line("}");
      g.line(
        "const { stream, cancel } = this.intClient.callStream(this.rpcName, this.streamName, input, this.headerProviders, this.reconnectConfig, this.maxMessageSize, this.onConnectCb, this.onDisconnectCb, this.onReconnectCb, this.signal);"
      );
      g.line(
        `const typedStream = async function* (): AsyncGenerator<${responseType}, void, unknown> {`
      );
      g.block(() => {
        g.line("for await (const event of stream) {");
        g.block(() => {
          g.line("if (!event.ok) {");
          g.block(() => {
            g.line(
              `yield { ok: false, error: event.error } as ${responseType};`
            );
          });
          g.line("continue;");
          g.line("}");
          g.line(
            `yield { ok: true, output: ${outputHelper}.hydrate(event.output as ${outputType}) } as ${responseType};`
          );
        });
        g.line("}");
      });
      g.line("};");
      g.line("return { stream: typedStream(), cancel }; ");
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}
__name(renderStreamBuilder, "renderStreamBuilder");

// src/shared/imports.ts
var IMPORT_EXTENSION_VALUES = ["none", "js", "ts"];
function formatImportPath(path, importExtension) {
  if (importExtension === "none") {
    return path;
  }
  return `${path}.${importExtension}`;
}
__name(formatImportPath, "formatImportPath");

// src/stages/emit/files/server/fetch-adapter.ts
function generateFetchAdapterFile(context) {
  const g = newGenerator().withSpaces(2);
  g.line(
    `import type { HTTPAdapter, Server } from ${JSON.stringify(formatImportPath("../server", context.options.importExtension))};`
  );
  g.break();
  g.raw(FETCH_ADAPTER.trim());
  return {
    path: "adapters/fetch.ts",
    content: renderTypeScriptFile(g.toString())
  };
}
__name(generateFetchAdapterFile, "generateFetchAdapterFile");
var FETCH_ADAPTER = dedent2(
  /* ts */
  `
  /**
   * FetchAdapter implements HTTPAdapter for Web Standards environments.
   */
  export class FetchAdapter implements HTTPAdapter {
    private readonly request: Request;
    private readonly headers: Map<string, string>;
    private readonly chunks: string[];
    private streamController: ReadableStreamDefaultController<Uint8Array> | null;
    private readonly encoder: TextEncoder;
    private readonly closeCallbacks: Array<() => void>;
    private aborted: boolean;

    constructor(request: Request) {
      this.request = request;
      this.headers = new Map();
      this.chunks = [];
      this.streamController = null;
      this.encoder = new TextEncoder();
      this.closeCallbacks = [];
      this.aborted = false;

      request.signal.addEventListener("abort", () => {
        this.aborted = true;
        for (const callback of this.closeCallbacks) {
          callback();
        }
      });
    }

    /** Returns the parsed JSON request body. */
    async json(): Promise<unknown> {
      return this.request.json();
    }

    /** Sets a response header. */
    setHeader(key: string, value: string): void {
      this.headers.set(key, value);
    }

    /** Writes data to the buffered or streaming response body. */
    write(data: string): void {
      if (this.aborted) {
        return;
      }

      if (this.streamController) {
        this.streamController.enqueue(this.encoder.encode(data));
        return;
      }

      this.chunks.push(data);
    }

    /** Flushes buffered response data. */
    flush(): void {}

    /** Ends the response. */
    end(): void {
      if (this.streamController) {
        try {
          this.streamController.close();
        } catch {
          // The controller may already be closed.
        }
      }

      for (const callback of this.closeCallbacks) {
        callback();
      }
    }

    /** Registers a callback for when the request is aborted. */
    onClose(callback: () => void): void {
      this.closeCallbacks.push(callback);
      if (this.aborted) {
        callback();
      }
    }

    /** Builds a buffered JSON response after a procedure completes. */
    toResponse(): Response {
      return new Response(this.chunks.join(""), {
        status: 200,
        headers: Object.fromEntries(this.headers),
      });
    }

    /** Builds a streaming SSE response before a stream starts writing events. */
    toStreamingResponse(): Response {
      const stream = new ReadableStream<Uint8Array>({
        start: (controller) => {
          this.streamController = controller;
        },
        cancel: () => {
          this.aborted = true;
          for (const callback of this.closeCallbacks) {
            callback();
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: Object.fromEntries(this.headers),
      });
    }
  }

  /**
   * Extracts RPC name and operation name from a URL path.
   */
  export function parseRpcPath(
    url: string | URL,
    prefix?: string,
  ): { rpcName: string; operationName: string } | null {
    const parsedUrl = typeof url === "string" ? new URL(url) : url;
    let pathname = parsedUrl.pathname;

    if (prefix) {
      const normalizedPrefix = prefix.startsWith("/") ? prefix : "/" + prefix;
      if (pathname.startsWith(normalizedPrefix)) {
        pathname = pathname.slice(normalizedPrefix.length);
      }
    }

    const segments = pathname.replace(/^\\/+|\\/+$/gu, "").split("/");
    if (segments.length < 2) {
      return null;
    }

    const operationName = segments.pop();
    const rpcName = segments.pop();
    if (!rpcName || !operationName) {
      return null;
    }

    return { rpcName, operationName };
  }

  /**
   * Options for createFetchHandler.
   */
  export interface FetchHandlerOptions {
    /**
     * URL path prefix to strip before parsing RPC/operation names.
     * Example: "/rpc" or "/api/v1"
     */
    prefix?: string;
  }

  /**
   * Creates a Fetch API compatible request handler for a VDL Server.
   *
   * This handler can be used directly with:
   * - Bun.serve()
   * - Deno.serve()
   * - Cloudflare Workers fetch handler
   * - Any Web Standards compatible runtime
   *
   * @example
   * \`\`\`typescript
   * const server = new Server<MyContext>();
   * // ... register handlers ...
   *
   * const handler = createFetchHandler(server, {
   *   prefix: "/rpc",
   * });
   *
   * // Bun
   * Bun.serve({ fetch: handler });
   *
   * // Deno
   * Deno.serve(handler);
   *
   * // Cloudflare Workers
   * export default { fetch: handler };
   * \`\`\`
   *
   * @param server - The VDL Server instance
   * @param createContext - Optional function to create the context (props) from the request
   * @param options - Handler options including path prefix
   * @returns A function that handles Fetch API requests
   */
  export function createFetchHandler<T = unknown>(
    server: Server<T>,
    createContext?: (req: Request) => T | Promise<T>,
    options?: FetchHandlerOptions,
  ): (req: Request) => Promise<Response> {
    const prefix = options?.prefix;

    return async (req: Request): Promise<Response> => {
      const parsed = parseRpcPath(req.url, prefix);
      if (!parsed) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: "NOT_FOUND",
              message:
                "Invalid RPC path. Expected: /[prefix/]rpcName/operationName",
            },
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      let props: T;
      try {
        props = createContext ? await createContext(req) : (undefined as T);
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: "CONTEXT_ERROR",
              message: "Failed to create request context",
              details: { originalError: String(error) },
            },
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const adapter = new FetchAdapter(req);
      const acceptHeader = req.headers.get("Accept") ?? "";
      const isStreamRequest = acceptHeader.includes("text/event-stream");

      if (isStreamRequest) {
        const response = adapter.toStreamingResponse();
        server
          .handleRequest(props, parsed.rpcName, parsed.operationName, adapter)
          .catch(() => {
            adapter.end();
          });
        return response;
      }

      try {
        await server.handleRequest(
          props,
          parsed.rpcName,
          parsed.operationName,
          adapter,
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: "INTERNAL_ERROR",
              message: "Internal server error",
              details: { originalError: String(error) },
            },
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return adapter.toResponse();
    };
  }
`
);

// src/stages/emit/files/server/runtime.ts
function renderServerRuntimeSource() {
  return SERVER_RUNTIME.trim();
}
__name(renderServerRuntimeSource, "renderServerRuntimeSource");
var SERVER_RUNTIME = dedent2(
  /* ts */
  `
  /**
   * HTTPAdapter defines the interface required by VDL server to handle
   * incoming HTTP requests and write responses to clients.
   *
   * This abstraction allows the server to work with different HTTP frameworks
   * (Express, Fastify, standard http, etc.) while maintaining the same core functionality.
   */
  export interface HTTPAdapter {
    /**
     * Returns the parsed JSON body of the request.
     * The server expects the body to be a JSON object containing the RPC input.
     */
    json(): Promise<unknown>;

    /**
     * Sets a response header with the specified key-value pair.
     */
    setHeader(key: string, value: string): void;

    /**
     * Writes data to the response.
     * For procedures, this is called once with the full response.
     * For streams, this is called for each chunk.
     */
    write(data: string): void;

    /**
     * Flushes any buffered response data to the client.
     * Crucial for streaming responses to ensure real-time delivery.
     * Optional if the underlying framework handles this automatically.
     */
    flush?(): void;

    /**
     * Signals that the response is complete.
     */
    end(): void;

    /**
     * Registers a callback to be invoked when the connection is closed by the client.
     * Used to stop stream processing when the client disconnects.
     */
    onClose(callback: () => void): void;
  }

  /**
   * HandlerContext is the unified container for all request information and state
   * that flows through the entire request processing pipeline.
   *
   * @typeParam T - The application context type containing dependencies and request-scoped data.
   * @typeParam I - The input payload type for this operation.
   */
  export class HandlerContext<T, I> {
    /** User-defined container for application dependencies and request data. */
    public props: T;

    /** The request input, already deserialized and typed. */
    public input: I;

    /** Signal for cancellation (client disconnects). */
    public signal: AbortSignal;

    /** Details of the RPC operation. */
    public readonly operation: OperationDefinition;

    constructor(
      props: T,
      input: I,
      signal: AbortSignal,
      operation: OperationDefinition,
    ) {
      this.props = props;
      this.input = input;
      this.signal = signal;
      this.operation = operation;
    }

    get rpcName(): string {
      return this.operation.rpcName;
    }

    get operationName(): string {
      return this.operation.name;
    }

    get operationType(): OperationDefinition["type"] {
      return this.operation.type;
    }

    get annotations(): OperationAnnotation[] {
      return this.operation.annotations;
    }
  }

  // -----------------------------------------------------------------------------
  // Middleware Types
  // -----------------------------------------------------------------------------

  /**
   * A handler function for global middleware.
   * At this level, input and output types are unknown.
   *
   * @typeParam T - The application context type (props).
   */
  export type GlobalHandlerFunc<T> = (c: HandlerContext<T, unknown>) => Promise<unknown>;

  /**
   * Middleware that applies to all requests (procedures and streams).
   * Wraps the next handler in the chain.
   *
   * @typeParam T - The application context type (props).
   */
  export type GlobalMiddlewareFunc<T> = (next: GlobalHandlerFunc<T>) => GlobalHandlerFunc<T>;

  /**
   * The core logic for a procedure.
   * Receives context with typed input and returns a Promise with typed output.
   *
   * @typeParam T - The application context type (props).
   * @typeParam I - The input payload type.
   * @typeParam O - The output payload type.
   */
  export type ProcHandlerFunc<T, I, O> = (c: HandlerContext<T, I>) => Promise<O>;

  /**
   * Middleware specific to procedures.
   * Can inspect or modify typed input and output.
   *
   * @typeParam T - The application context type (props).
   * @typeParam I - The input payload type.
   * @typeParam O - The output payload type.
   */
  export type ProcMiddlewareFunc<T, I, O> = (next: ProcHandlerFunc<T, I, O>) => ProcHandlerFunc<T, I, O>;

  /**
   * Function used to emit an event to a stream.
   *
   * @typeParam T - The application context type (props).
   * @typeParam I - The input payload type of the stream.
   * @typeParam O - The output payload type of the emitted event.
   */
  export type EmitFunc<T, I, O> = (c: HandlerContext<T, I>, output: O) => Promise<void>;

  /**
   * The core logic for a stream.
   * Receives context with typed input and an emit function to send events.
   *
   * @typeParam T - The application context type (props).
   * @typeParam I - The input payload type.
   * @typeParam O - The output event type.
   */
  export type StreamHandlerFunc<T, I, O> = (c: HandlerContext<T, I>, emit: EmitFunc<T, I, O>) => Promise<void>;

  /**
   * Middleware specific to stream handlers.
   * Wraps the execution of the stream function itself.
   *
   * @typeParam T - The application context type (props).
   * @typeParam I - The input payload type.
   * @typeParam O - The output event type.
   */
  export type StreamMiddlewareFunc<T, I, O> = (next: StreamHandlerFunc<T, I, O>) => StreamHandlerFunc<T, I, O>;

  /**
   * Middleware that wraps the emit function of a stream.
   * Can be used to transform outgoing events or handle cross-cutting concerns.
   *
   * @typeParam T - The application context type (props).
   * @typeParam I - The input payload type of the stream.
   * @typeParam O - The output payload type of the emitted event.
   */
  export type EmitMiddlewareFunc<T, I, O> = (next: EmitFunc<T, I, O>) => EmitFunc<T, I, O>;

  /**
   * Internal function used to deserialize raw JSON input into typed objects.
   */
  export type DeserializerFunc = (raw: unknown) => Promise<unknown>;

  /**
   * Custom error handler used to transform arbitrary failures into VdlError responses.
   *
   * @typeParam T - The application context type (props).
   */
  export type ErrorHandlerFunc<T> = (c: HandlerContext<T, unknown>, error: unknown) => VdlError;

  /**
   * Configuration for stream behavior.
   */
  export interface StreamConfig {
    /**
     * Interval in milliseconds at which ping comments are sent to the client.
     * Used to keep the connection alive and detect disconnected clients.
     */
    pingIntervalMs?: number;
  }

  // -----------------------------------------------------------------------------
  // Server Internal Implementation
  // -----------------------------------------------------------------------------

  /**
   * The core server engine used by generated VDL server wrappers.
   *
   * This class manages request routing, middleware execution, input deserialization,
   * error handling, and response formatting for both procedures and streams.
   *
   * Do not instantiate directly. Use the generated server facade.
   *
   * @typeParam T - The application context type (props) containing dependencies.
   */
  export class InternalServer<T> {
    private readonly operationDefs: Map<string, Map<string, OperationDefinition>>;
    private readonly procHandlers: Map<string, Map<string, ProcHandlerFunc<T, any, any>>>;
    private readonly streamHandlers: Map<string, Map<string, StreamHandlerFunc<T, any, any>>>;
    private readonly globalMiddlewares: GlobalMiddlewareFunc<T>[];
    private readonly rpcMiddlewares: Map<string, GlobalMiddlewareFunc<T>[]>;
    private readonly procMiddlewares: Map<string, Map<string, ProcMiddlewareFunc<T, any, any>[]>>;
    private readonly streamMiddlewares: Map<string, Map<string, StreamMiddlewareFunc<T, any, any>[]>>;
    private readonly streamEmitMiddlewares: Map<string, Map<string, EmitMiddlewareFunc<T, any, any>[]>>;
    private readonly procDeserializers: Map<string, Map<string, DeserializerFunc>>;
    private readonly streamDeserializers: Map<string, Map<string, DeserializerFunc>>;
    private globalStreamConfig: StreamConfig;
    private readonly rpcStreamConfigs: Map<string, StreamConfig>;
    private readonly streamConfigs: Map<string, Map<string, StreamConfig>>;
    private globalErrorHandler?: ErrorHandlerFunc<T>;
    private readonly rpcErrorHandlers: Map<string, ErrorHandlerFunc<T>>;

    /**
     * Creates a new internal server.
     *
     * @param procDefs - Procedure definitions from the schema.
     * @param streamDefs - Stream definitions from the schema.
     */
    constructor(procDefs: OperationDefinition[], streamDefs: OperationDefinition[]) {
      this.operationDefs = new Map();
      this.procHandlers = new Map();
      this.streamHandlers = new Map();
      this.globalMiddlewares = [];
      this.rpcMiddlewares = new Map();
      this.procMiddlewares = new Map();
      this.streamMiddlewares = new Map();
      this.streamEmitMiddlewares = new Map();
      this.procDeserializers = new Map();
      this.streamDeserializers = new Map();
      this.globalStreamConfig = { pingIntervalMs: 30000 };
      this.rpcStreamConfigs = new Map();
      this.streamConfigs = new Map();
      this.rpcErrorHandlers = new Map();

      const ensureRPC = (rpcName: string) => {
        if (!this.operationDefs.has(rpcName)) {
          this.operationDefs.set(rpcName, new Map());
          this.procHandlers.set(rpcName, new Map());
          this.streamHandlers.set(rpcName, new Map());
          this.rpcMiddlewares.set(rpcName, []);
          this.procMiddlewares.set(rpcName, new Map());
          this.streamMiddlewares.set(rpcName, new Map());
          this.streamEmitMiddlewares.set(rpcName, new Map());
          this.procDeserializers.set(rpcName, new Map());
          this.streamDeserializers.set(rpcName, new Map());
          this.rpcStreamConfigs.set(rpcName, {});
          this.streamConfigs.set(rpcName, new Map());
        }
      };

      for (const def of procDefs) {
        ensureRPC(def.rpcName);
        this.operationDefs.get(def.rpcName)?.set(def.name, def);
      }

      for (const def of streamDefs) {
        ensureRPC(def.rpcName);
        this.operationDefs.get(def.rpcName)?.set(def.name, def);
      }
    }

    /** Registers a global middleware. */
    addGlobalMiddleware(mw: GlobalMiddlewareFunc<T>): void {
      this.globalMiddlewares.push(mw);
    }

    /** Registers an RPC-level middleware. */
    addRPCMiddleware(rpcName: string, mw: GlobalMiddlewareFunc<T>): void {
      this.rpcMiddlewares.get(rpcName)?.push(mw);
    }

    /** Registers a procedure-specific middleware. */
    addProcMiddleware(rpcName: string, procName: string, mw: ProcMiddlewareFunc<T, any, any>): void {
      const rpcMap = this.procMiddlewares.get(rpcName);
      if (!rpcMap) {
        return;
      }

      if (!rpcMap.has(procName)) {
        rpcMap.set(procName, []);
      }

      rpcMap.get(procName)?.push(mw);
    }

    /** Registers a stream-specific middleware. */
    addStreamMiddleware(rpcName: string, streamName: string, mw: StreamMiddlewareFunc<T, any, any>): void {
      const rpcMap = this.streamMiddlewares.get(rpcName);
      if (!rpcMap) {
        return;
      }

      if (!rpcMap.has(streamName)) {
        rpcMap.set(streamName, []);
      }

      rpcMap.get(streamName)?.push(mw);
    }

    /** Registers a stream emit middleware. */
    addStreamEmitMiddleware(rpcName: string, streamName: string, mw: EmitMiddlewareFunc<T, any, any>): void {
      const rpcMap = this.streamEmitMiddlewares.get(rpcName);
      if (!rpcMap) {
        return;
      }

      if (!rpcMap.has(streamName)) {
        rpcMap.set(streamName, []);
      }

      rpcMap.get(streamName)?.push(mw);
    }

    /** Sets the global stream configuration. */
    setGlobalStreamConfig(cfg: StreamConfig): void {
      this.globalStreamConfig = { ...this.globalStreamConfig, ...cfg };
      if (!this.globalStreamConfig.pingIntervalMs || this.globalStreamConfig.pingIntervalMs <= 0) {
        this.globalStreamConfig.pingIntervalMs = 30000;
      }
    }

    /** Sets the default stream configuration for one RPC service. */
    setRPCStreamConfig(rpcName: string, cfg: StreamConfig): void {
      this.rpcStreamConfigs.set(rpcName, cfg);
    }

    /** Sets the configuration for one stream. */
    setStreamConfig(rpcName: string, streamName: string, cfg: StreamConfig): void {
      const rpcConfigs = this.streamConfigs.get(rpcName);
      rpcConfigs?.set(streamName, cfg);
    }

    /** Sets the global error handler. */
    setGlobalErrorHandler(handler: ErrorHandlerFunc<T>): void {
      this.globalErrorHandler = handler;
    }

    /** Sets an RPC-specific error handler. */
    setRPCErrorHandler(rpcName: string, handler: ErrorHandlerFunc<T>): void {
      this.rpcErrorHandlers.set(rpcName, handler);
    }

    /** Registers the implementation and deserializer for one procedure. */
    setProcHandler(rpcName: string, procName: string, handler: ProcHandlerFunc<T, any, any>, deserializer: DeserializerFunc): void {
      const rpcHandlers = this.procHandlers.get(rpcName);
      if (rpcHandlers) {
        if (rpcHandlers.has(procName)) {
          throw new Error("Procedure handler for " + rpcName + "." + procName + " is already registered");
        }
        rpcHandlers.set(procName, handler);
      }

      this.procDeserializers.get(rpcName)?.set(procName, deserializer);
    }

    /** Registers the implementation and deserializer for one stream. */
    setStreamHandler(rpcName: string, streamName: string, handler: StreamHandlerFunc<T, any, any>, deserializer: DeserializerFunc): void {
      const rpcHandlers = this.streamHandlers.get(rpcName);
      if (rpcHandlers) {
        if (rpcHandlers.has(streamName)) {
          throw new Error("Stream handler for " + rpcName + "." + streamName + " is already registered");
        }
        rpcHandlers.set(streamName, handler);
      }

      this.streamDeserializers.get(rpcName)?.set(streamName, deserializer);
    }

    /** Handles one incoming RPC request. */
    async handleRequest(props: T, rpcName: string, operationName: string, adapter: HTTPAdapter): Promise<void> {
      if (!adapter) {
        throw new Error("HTTPAdapter is required");
      }

      let rawInput: unknown;
      try {
        rawInput = await adapter.json();
      } catch (error) {
        this.writeProcResponse(adapter, {
          ok: false,
          error: new VdlError({
            message: "Invalid request body",
            details: { originalError: String(error) },
          }),
        });
        return;
      }

      const operation = this.operationDefs.get(rpcName)?.get(operationName);
      if (!operation) {
        this.writeProcResponse(adapter, {
          ok: false,
          error: new VdlError({
            message: "Invalid operation: " + rpcName + "." + operationName,
            code: "INVALID_OPERATION",
            category: "ClientError",
          }),
        });
        return;
      }

      const abortController = new AbortController();
      adapter.onClose(() => abortController.abort());

      const ctx = new HandlerContext<T, unknown>(
        props,
        rawInput,
        abortController.signal,
        operation,
      );

      if (operation.type === "stream") {
        await this.handleStreamRequest(ctx, rpcName, operationName, adapter);
        return;
      }

      let response: Response<unknown>;
      try {
        const output = await this.handleProcRequest(ctx, rpcName, operationName);
        response = { ok: true, output };
      } catch (error) {
        response = {
          ok: false,
          error: this.resolveErrorHandler(rpcName)(ctx, error),
        };
      }

      this.writeProcResponse(adapter, response);
    }

    /** Resolves the effective error handler for one RPC service. */
    private resolveErrorHandler(rpcName: string): ErrorHandlerFunc<T> {
      const rpcHandler = this.rpcErrorHandlers.get(rpcName);
      if (rpcHandler) {
        return rpcHandler;
      }

      if (this.globalErrorHandler) {
        return this.globalErrorHandler;
      }

      return (_ctx, error) => asError(error);
    }

    /** Executes one procedure including all middleware layers. */
    private async handleProcRequest(c: HandlerContext<T, unknown>, rpcName: string, procName: string): Promise<unknown> {
      const baseHandler = this.procHandlers.get(rpcName)?.get(procName);
      const deserialize = this.procDeserializers.get(rpcName)?.get(procName);
      if (!baseHandler || !deserialize) {
        throw new Error(rpcName + "." + procName + " procedure not implemented");
      }

      c.input = await deserialize(c.input);

      let next: GlobalHandlerFunc<T> = (ctx) => baseHandler(ctx as HandlerContext<T, any>);

      const procMws = this.procMiddlewares.get(rpcName)?.get(procName) ?? [];
      if (procMws.length > 0) {
        let procNext = baseHandler;
        for (let index = procMws.length - 1; index >= 0; index -= 1) {
          procNext = procMws[index](procNext);
        }
        next = (ctx) => procNext(ctx as HandlerContext<T, any>);
      }

      const rpcMws = this.rpcMiddlewares.get(rpcName) ?? [];
      for (let index = rpcMws.length - 1; index >= 0; index -= 1) {
        next = rpcMws[index](next);
      }

      for (let index = this.globalMiddlewares.length - 1; index >= 0; index -= 1) {
        next = this.globalMiddlewares[index](next);
      }

      return next(c);
    }

    /** Executes one stream including middleware, emission, and SSE lifecycle handling. */
    private async handleStreamRequest(c: HandlerContext<T, unknown>, rpcName: string, streamName: string, adapter: HTTPAdapter): Promise<void> {
      const baseHandler = this.streamHandlers.get(rpcName)?.get(streamName);
      const deserialize = this.streamDeserializers.get(rpcName)?.get(streamName);
      if (!baseHandler || !deserialize) {
        this.writeProcResponse(adapter, {
          ok: false,
          error: new VdlError({
            message: rpcName + "." + streamName + " not implemented",
            code: "NOT_IMPLEMENTED",
          }),
        });
        return;
      }

      try {
        c.input = await deserialize(c.input);
      } catch (error) {
        this.writeProcResponse(adapter, {
          ok: false,
          error: asError(error),
        });
        return;
      }

      adapter.setHeader("Content-Type", "text/event-stream");
      adapter.setHeader("Cache-Control", "no-cache");
      adapter.setHeader("Connection", "keep-alive");

      let closed = false;
      adapter.onClose(() => {
        closed = true;
      });

      const safeWrite = (data: string) => {
        if (closed || c.signal.aborted) {
          return;
        }
        adapter.write(data);
        adapter.flush?.();
      };

      let pingInterval = this.globalStreamConfig.pingIntervalMs || 30000;
      const rpcConfig = this.rpcStreamConfigs.get(rpcName);
      if (rpcConfig?.pingIntervalMs) {
        pingInterval = rpcConfig.pingIntervalMs;
      }
      const streamConfig = this.streamConfigs.get(rpcName)?.get(streamName);
      if (streamConfig?.pingIntervalMs) {
        pingInterval = streamConfig.pingIntervalMs;
      }
      if (pingInterval <= 0) {
        pingInterval = 30000;
      }

      const pingTimer = setInterval(() => {
        if (closed || c.signal.aborted) {
          clearInterval(pingTimer);
          return;
        }

        safeWrite(": ping\\n\\n");
      }, pingInterval);

      const cleanup = () => {
        clearInterval(pingTimer);
        closed = true;
        adapter.end();
      };

      const baseEmit: EmitFunc<T, any, unknown> = async (_ctx, output) => {
        safeWrite("data: " + JSON.stringify({ ok: true, output }) + "\\n\\n");
      };

      let emitFinal = baseEmit;
      const emitMws = this.streamEmitMiddlewares.get(rpcName)?.get(streamName) ?? [];
      for (let index = emitMws.length - 1; index >= 0; index -= 1) {
        emitFinal = emitMws[index](emitFinal);
      }

      let next: GlobalHandlerFunc<T> = (ctx) =>
        baseHandler(ctx as HandlerContext<T, any>, emitFinal) as Promise<unknown>;

      const streamMws = this.streamMiddlewares.get(rpcName)?.get(streamName) ?? [];
      if (streamMws.length > 0) {
        let streamNext = baseHandler;
        for (let index = streamMws.length - 1; index >= 0; index -= 1) {
          streamNext = streamMws[index](streamNext);
        }
        next = (ctx) => streamNext(ctx as HandlerContext<T, any>, emitFinal) as Promise<unknown>;
      }

      const rpcMws = this.rpcMiddlewares.get(rpcName) ?? [];
      for (let index = rpcMws.length - 1; index >= 0; index -= 1) {
        next = rpcMws[index](next);
      }

      for (let index = this.globalMiddlewares.length - 1; index >= 0; index -= 1) {
        next = this.globalMiddlewares[index](next);
      }

      try {
        await next(c);
      } catch (error) {
        const mapped = this.resolveErrorHandler(rpcName)(c, error);
        safeWrite("data: " + JSON.stringify({ ok: false, error: mapped }) + "\\n\\n");
      } finally {
        cleanup();
      }
    }

    /** Writes one standard JSON procedure response. */
    private writeProcResponse(adapter: HTTPAdapter, response: Response<unknown>): void {
      adapter.setHeader("Content-Type", "application/json");
      adapter.write(JSON.stringify(response));
      adapter.end();
    }
  }
`
);

// src/stages/emit/files/server/generate.ts
function generateServerFile(context) {
  const g = newGenerator().withSpaces(2);
  g.line(
    `import * as vdlTypes from ${JSON.stringify(context.options.typesImport)};`
  );
  g.break();
  g.raw(renderCatalogSource(context));
  g.break();
  g.raw(renderCoreSource());
  g.break();
  g.raw(renderServerRuntimeSource());
  g.break();
  renderServerFacade(g, context);
  return {
    path: "server.ts",
    content: renderTypeScriptFile(g.toString())
  };
}
__name(generateServerFile, "generateServerFile");
function renderServerFacade(g, context) {
  writeDocComment(g, {
    fallback: "Server provides the high-level, type-safe API for building a VDL RPC server."
  });
  g.line("export class Server<T = unknown> {");
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line("public readonly rpcs: ServerRPCRegistry<T>;");
    g.break();
    g.line("constructor() {");
    g.block(() => {
      g.line(
        "this.intServer = new InternalServer<T>(VDLProcedures, VDLStreams);"
      );
      g.line("this.rpcs = new ServerRPCRegistry<T>(this.intServer);");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Registers a global middleware that runs for every procedure and stream."
    });
    g.line("use(mw: GlobalMiddlewareFunc<T>): void {");
    g.block(() => {
      g.line("this.intServer.addGlobalMiddleware(mw);");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Sets the global stream configuration for all streams."
    });
    g.line("setStreamConfig(cfg: StreamConfig): void {");
    g.block(() => {
      g.line("this.intServer.setGlobalStreamConfig(cfg);");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Sets the global error handler used by all RPC services."
    });
    g.line("setErrorHandler(fn: ErrorHandlerFunc<T>): void {");
    g.block(() => {
      g.line("this.intServer.setGlobalErrorHandler(fn);");
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: "Processes one incoming RPC request using the provided HTTP adapter."
    });
    g.line("async handleRequest(");
    g.block(() => {
      g.line("props: T,");
      g.line("rpcName: string,");
      g.line("operationName: string,");
      g.line("httpAdapter: HTTPAdapter,");
    });
    g.line("): Promise<void> {");
    g.block(() => {
      g.line(
        "return this.intServer.handleRequest(props, rpcName, operationName, httpAdapter);"
      );
    });
    g.line("}");
  });
  g.line("}");
  g.break();
  writeDocComment(g, {
    fallback: "Top-level registry exposing every generated RPC service."
  });
  g.line("export class ServerRPCRegistry<T> {");
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line("constructor(intServer: InternalServer<T>) {");
    g.block(() => {
      g.line("this.intServer = intServer;");
    });
    g.line("}");
    g.break();
    for (const service of context.services) {
      renderServiceAccessor(g, service);
    }
  });
  g.line("}");
  g.break();
  for (const service of context.services) {
    renderServiceClass(g, service);
    renderProcedureRegistry2(g, service);
    renderStreamRegistry2(g, service);
    for (const procedure of service.procedures) {
      renderProcedureEntry(g, procedure);
    }
    for (const stream of service.streams) {
      renderStreamEntry(g, stream);
    }
  }
}
__name(renderServerFacade, "renderServerFacade");
function renderServiceAccessor(g, service) {
  writeDocComment(g, {
    doc: service.doc,
    annotations: service.annotations,
    fallback: `Access the ${service.name} RPC service.`
  });
  g.line(
    `${service.accessorName}(): Server${service.name}RPC<T> { return new Server${service.name}RPC<T>(this.intServer); }`
  );
  g.break();
}
__name(renderServiceAccessor, "renderServiceAccessor");
function renderServiceClass(g, service) {
  writeDocComment(g, {
    doc: service.doc,
    annotations: service.annotations,
    fallback: `Typed registration surface for the ${service.name} RPC service.`
  });
  g.line(`export class Server${service.name}RPC<T> {`);
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line(`public readonly procs: Server${service.name}Procs<T>;`);
    g.line(`public readonly streams: Server${service.name}Streams<T>;`);
    g.break();
    g.line("constructor(intServer: InternalServer<T>) {");
    g.block(() => {
      g.line("this.intServer = intServer;");
      g.line(`this.procs = new Server${service.name}Procs<T>(intServer);`);
      g.line(`this.streams = new Server${service.name}Streams<T>(intServer);`);
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: `Registers a middleware for every ${service.name} operation.`
    });
    g.line("use(mw: GlobalMiddlewareFunc<T>): void {");
    g.block(() => {
      g.line(
        `this.intServer.addRPCMiddleware(${JSON.stringify(service.name)}, mw);`
      );
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: `Sets the default stream configuration for ${service.name}.`
    });
    g.line("setStreamConfig(cfg: StreamConfig): void {");
    g.block(() => {
      g.line(
        `this.intServer.setRPCStreamConfig(${JSON.stringify(service.name)}, cfg);`
      );
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: `Sets an RPC-specific error handler for ${service.name}.`
    });
    g.line("setErrorHandler(fn: ErrorHandlerFunc<T>): void {");
    g.block(() => {
      g.line(
        `this.intServer.setRPCErrorHandler(${JSON.stringify(service.name)}, fn);`
      );
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}
__name(renderServiceClass, "renderServiceClass");
function renderProcedureRegistry2(g, service) {
  writeDocComment(g, {
    fallback: `Registry exposing every generated procedure entry for ${service.name}.`
  });
  g.line(`export class Server${service.name}Procs<T> {`);
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line(
      "constructor(intServer: InternalServer<T>) { this.intServer = intServer; }"
    );
    g.break();
    for (const procedure of service.procedures) {
      writeDocComment(g, {
        doc: procedure.doc,
        annotations: procedure.annotations,
        fallback: `Registers the ${service.name}.${procedure.name} procedure.`
      });
      g.line(
        `${procedure.serverMethodName}(): Proc${service.name}${procedure.name}Entry<T> { return new Proc${service.name}${procedure.name}Entry<T>(this.intServer); }`
      );
      g.break();
    }
  });
  g.line("}");
  g.break();
}
__name(renderProcedureRegistry2, "renderProcedureRegistry");
function renderStreamRegistry2(g, service) {
  writeDocComment(g, {
    fallback: `Registry exposing every generated stream entry for ${service.name}.`
  });
  g.line(`export class Server${service.name}Streams<T> {`);
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line(
      "constructor(intServer: InternalServer<T>) { this.intServer = intServer; }"
    );
    g.break();
    for (const stream of service.streams) {
      writeDocComment(g, {
        doc: stream.doc,
        annotations: stream.annotations,
        fallback: `Registers the ${service.name}.${stream.name} stream.`
      });
      g.line(
        `${stream.serverMethodName}(): Stream${service.name}${stream.name}Entry<T> { return new Stream${service.name}${stream.name}Entry<T>(this.intServer); }`
      );
      g.break();
    }
  });
  g.line("}");
  g.break();
}
__name(renderStreamRegistry2, "renderStreamRegistry");
function renderProcedureEntry(g, operation) {
  const inputType = renderRuntimeTypeReference2(operation.inputTypeName);
  const outputType = renderRuntimeTypeReference2(operation.outputTypeName);
  const inputHelper = renderRuntimeHelperReference2(operation.inputTypeName);
  g.line(`export class Proc${operation.rpcName}${operation.name}Entry<T> {`);
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line(
      "constructor(intServer: InternalServer<T>) { this.intServer = intServer; }"
    );
    g.break();
    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Registers a typed middleware for ${operation.rpcName}.${operation.name}.`
    });
    g.line(
      `use(mw: ProcMiddlewareFunc<T, ${inputType}, ${outputType}>): void {`
    );
    g.block(() => {
      g.line("const adapted: ProcMiddlewareFunc<T, any, any> = (next) => {");
      g.block(() => {
        g.line("return async (cGeneric) => {");
        g.block(() => {
          g.line(
            `const typedNext: ProcHandlerFunc<T, ${inputType}, ${outputType}> = async (c) => {`
          );
          g.block(() => {
            g.line("cGeneric.props = c.props;");
            g.line("cGeneric.input = c.input;");
            g.line(`return (await next(cGeneric)) as ${outputType};`);
          });
          g.line("};");
          g.line("const typedChain = mw(typedNext);");
          g.line(
            `const cSpecific = new HandlerContext<T, ${inputType}>(cGeneric.props, cGeneric.input as ${inputType}, cGeneric.signal, cGeneric.operation);`
          );
          g.line("return typedChain(cSpecific);");
        });
        g.line("};");
      });
      g.line("};");
      g.line(
        `this.intServer.addProcMiddleware(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, adapted);`
      );
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Registers the business handler for ${operation.rpcName}.${operation.name}.`
    });
    g.line(
      `handle(handler: ProcHandlerFunc<T, ${inputType}, ${outputType}>): void {`
    );
    g.block(() => {
      g.line(
        "const adaptedHandler: ProcHandlerFunc<T, any, any> = async (cGeneric) => {"
      );
      g.block(() => {
        g.line(
          `const cSpecific = new HandlerContext<T, ${inputType}>(cGeneric.props, cGeneric.input as ${inputType}, cGeneric.signal, cGeneric.operation);`
        );
        g.line("return handler(cSpecific);");
      });
      g.line("};");
      g.break();
      g.line("const deserializer: DeserializerFunc = async (raw) => {");
      g.block(() => {
        g.line(`const error = ${inputHelper}.validate(raw);`);
        g.line("if (error !== null) {");
        g.block(() => {
          g.line(
            'throw new VdlError({ message: error, code: "INVALID_INPUT", category: "ValidationError" });'
          );
        });
        g.line("}");
        g.line(`return ${inputHelper}.hydrate(raw as ${inputType});`);
      });
      g.line("};");
      g.line(
        `this.intServer.setProcHandler(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, adaptedHandler, deserializer);`
      );
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}
__name(renderProcedureEntry, "renderProcedureEntry");
function renderStreamEntry(g, operation) {
  const inputType = renderRuntimeTypeReference2(operation.inputTypeName);
  const outputType = renderRuntimeTypeReference2(operation.outputTypeName);
  const inputHelper = renderRuntimeHelperReference2(operation.inputTypeName);
  g.line(`export class Stream${operation.rpcName}${operation.name}Entry<T> {`);
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line(
      "constructor(intServer: InternalServer<T>) { this.intServer = intServer; }"
    );
    g.break();
    writeDocComment(g, {
      fallback: `Sets the stream configuration for ${operation.rpcName}.${operation.name}.`
    });
    g.line("setConfig(cfg: StreamConfig): void {");
    g.block(() => {
      g.line(
        `this.intServer.setStreamConfig(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, cfg);`
      );
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Registers a typed middleware for ${operation.rpcName}.${operation.name}.`
    });
    g.line(
      `use(mw: StreamMiddlewareFunc<T, ${inputType}, ${outputType}>): void {`
    );
    g.block(() => {
      g.line("const adapted: StreamMiddlewareFunc<T, any, any> = (next) => {");
      g.block(() => {
        g.line("return async (cGeneric, emitGeneric) => {");
        g.block(() => {
          g.line(
            `const typedNext: StreamHandlerFunc<T, ${inputType}, ${outputType}> = async (c, emit) => {`
          );
          g.block(() => {
            g.line("cGeneric.props = c.props;");
            g.line("cGeneric.input = c.input;");
            g.line("return next(cGeneric, emitGeneric);");
          });
          g.line("};");
          g.line("const typedChain = mw(typedNext);");
          g.line(
            `const emitSpecific: EmitFunc<T, ${inputType}, ${outputType}> = async (_c, output) => emitGeneric(cGeneric, output);`
          );
          g.line(
            `const cSpecific = new HandlerContext<T, ${inputType}>(cGeneric.props, cGeneric.input as ${inputType}, cGeneric.signal, cGeneric.operation);`
          );
          g.line("return typedChain(cSpecific, emitSpecific);");
        });
        g.line("};");
      });
      g.line("};");
      g.line(
        `this.intServer.addStreamMiddleware(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, adapted);`
      );
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      fallback: `Registers a typed emit middleware for ${operation.rpcName}.${operation.name}.`
    });
    g.line(
      `useEmit(mw: EmitMiddlewareFunc<T, ${inputType}, ${outputType}>): void {`
    );
    g.block(() => {
      g.line("const adapted: EmitMiddlewareFunc<T, any, any> = (next) => {");
      g.block(() => {
        g.line("return async (cGeneric, outputGeneric) => {");
        g.block(() => {
          g.line(
            `const typedNext: EmitFunc<T, ${inputType}, ${outputType}> = async (c, output) => {`
          );
          g.block(() => {
            g.line("cGeneric.props = c.props;");
            g.line("cGeneric.input = c.input;");
            g.line("return next(cGeneric, output);");
          });
          g.line("};");
          g.line("const emitChain = mw(typedNext);");
          g.line(
            `const cSpecific = new HandlerContext<T, ${inputType}>(cGeneric.props, cGeneric.input as ${inputType}, cGeneric.signal, cGeneric.operation);`
          );
          g.line(
            `return emitChain(cSpecific, outputGeneric as ${outputType});`
          );
        });
        g.line("};");
      });
      g.line("};");
      g.line(
        `this.intServer.addStreamEmitMiddleware(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, adapted);`
      );
    });
    g.line("}");
    g.break();
    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Registers the business handler for ${operation.rpcName}.${operation.name}.`
    });
    g.line(
      `handle(handler: StreamHandlerFunc<T, ${inputType}, ${outputType}>): void {`
    );
    g.block(() => {
      g.line(
        "const adaptedHandler: StreamHandlerFunc<T, any, any> = async (cGeneric, emitGeneric) => {"
      );
      g.block(() => {
        g.line(
          `const emitSpecific: EmitFunc<T, ${inputType}, ${outputType}> = async (_c, output) => emitGeneric(cGeneric, output);`
        );
        g.line(
          `const cSpecific = new HandlerContext<T, ${inputType}>(cGeneric.props, cGeneric.input as ${inputType}, cGeneric.signal, cGeneric.operation);`
        );
        g.line("return handler(cSpecific, emitSpecific);");
      });
      g.line("};");
      g.break();
      g.line("const deserializer: DeserializerFunc = async (raw) => {");
      g.block(() => {
        g.line(`const error = ${inputHelper}.validate(raw);`);
        g.line("if (error !== null) {");
        g.block(() => {
          g.line(
            'throw new VdlError({ message: error, code: "INVALID_INPUT", category: "ValidationError" });'
          );
        });
        g.line("}");
        g.line(`return ${inputHelper}.hydrate(raw as ${inputType});`);
      });
      g.line("};");
      g.line(
        `this.intServer.setStreamHandler(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, adaptedHandler, deserializer);`
      );
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}
__name(renderStreamEntry, "renderStreamEntry");
function renderRuntimeTypeReference2(typeName) {
  return typeName ? `vdlTypes.${typeName}` : "Void";
}
__name(renderRuntimeTypeReference2, "renderRuntimeTypeReference");
function renderRuntimeHelperReference2(typeName) {
  return typeName ? `vdlTypes.${typeName}` : "Void";
}
__name(renderRuntimeHelperReference2, "renderRuntimeHelperReference");

// src/stages/emit/files/server/node-adapter.ts
function generateNodeAdapterFile(context) {
  const g = newGenerator().withSpaces(2);
  g.line(
    `import type { HTTPAdapter, Server } from ${JSON.stringify(formatImportPath("../server", context.options.importExtension))};`
  );
  g.line('import type { IncomingMessage, ServerResponse } from "node:http";');
  g.break();
  g.raw(NODE_ADAPTER.trim());
  return {
    path: "adapters/node.ts",
    content: renderTypeScriptFile(g.toString())
  };
}
__name(generateNodeAdapterFile, "generateNodeAdapterFile");
var NODE_ADAPTER = dedent2(
  /* ts */
  `
  /**
   * NodeAdapter implements HTTPAdapter for Node.js HTTP environments.
   *
   * This adapter works with Node.js \`IncomingMessage\` and \`ServerResponse\` objects
   * used by Express, Fastify, native \`http.createServer\`, and similar frameworks.
   *
   * It supports:
   * - JSON body parsing (manual buffering or pre-parsed by middleware)
   * - Streaming responses (SSE)
   * - Connection close detection
   */
  export class NodeAdapter implements HTTPAdapter {
    private readonly req: IncomingMessage;
    private readonly res: ServerResponse;
    private readonly parsedBody: unknown;
    private bodyPromise: Promise<unknown> | null;
    private readonly closeCallbacks: Array<() => void>;
    private closed: boolean;

    /**
     * Creates a new NodeAdapter.
     *
     * @param req - The Node.js IncomingMessage (request)
     * @param res - The Node.js ServerResponse
     * @param parsedBody - Optional pre-parsed body (from Express body-parser, etc.)
     */
    constructor(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown) {
      this.req = req;
      this.res = res;
      this.parsedBody = parsedBody;
      this.bodyPromise = null;
      this.closeCallbacks = [];
      this.closed = false;

      // Listen for premature client disconnect (aborted connection)
      // The 'close' event on res fires when the underlying connection is closed
      // We use 'aborted' on req to detect if the client closed the connection early
      req.on("aborted", () => {
        this.closed = true;
        for (const callback of this.closeCallbacks) {
          callback();
        }
      });

      // The 'close' event on res is fired when the response has been sent
      // OR when the underlying connection is closed before finishing
      // We only care about premature closes, not normal completion
      res.on("close", () => {
        // Only mark closed if we haven't finished writing
        if (!this.res.writableFinished) {
          this.closed = true;
          for (const callback of this.closeCallbacks) {
            callback();
          }
        }
      });

      // If no pre-parsed body, start buffering immediately to avoid missing data events
      if (parsedBody === undefined) {
        this.startBodyBuffering();
      }
    }

    /** Starts buffering the request body immediately. */
    private startBodyBuffering(): void {
      const chunks: Buffer[] = [];

      this.bodyPromise = new Promise<unknown>((resolve, reject) => {
        this.req.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        this.req.on("end", () => {
          try {
            const bodyString = Buffer.concat(chunks).toString("utf-8");
            if (!bodyString || bodyString.trim() === "") {
              resolve({});
              return;
            }

            resolve(JSON.parse(bodyString));
          } catch (error) {
            reject(new Error("Failed to parse JSON body: " + String(error)));
          }
        });

        this.req.on("error", (error) => {
          reject(error);
        });
      });
    }

    /** Returns the parsed JSON request body. */
    async json(): Promise<unknown> {
      if (this.parsedBody !== undefined) {
        return this.parsedBody;
      }

      return this.bodyPromise ?? {};
    }

    /** Sets a response header. */
    setHeader(key: string, value: string): void {
      if (!this.res.headersSent) {
        this.res.setHeader(key, value);
      }
    }

    /** Writes data to the response body. */
    write(data: string): void {
      if (this.closed || this.res.writableEnded) {
        return;
      }

      this.res.write(data);
    }

    /** Flushes buffered response data when the host supports it. */
    flush(): void {
      if (this.closed || this.res.writableEnded) {
        return;
      }

      const response = this.res as ServerResponse & {
        flush?: () => void;
        flushHeaders?: () => void;
      };

      response.flush?.();

      if (!this.res.headersSent) {
        response.flushHeaders?.();
      }
    }

    /** Ends the response. */
    end(): void {
      if (!this.res.writableEnded) {
        this.res.end();
      }
    }

    /** Registers a callback for when the underlying connection closes. */
    onClose(callback: () => void): void {
      this.closeCallbacks.push(callback);
      if (this.closed) {
        callback();
      }
    }
  }

  /**
   * Extracts RPC name and operation name from a URL path.
   *
   * @param url - The request URL (e.g., "/rpc/Service/Echo")
   * @param prefix - Optional path prefix to strip (e.g., "/rpc")
   * @returns Object with rpcName and operationName, or null if parsing fails
   */
  export function parseNodeRpcPath(
    url: string,
    prefix?: string,
  ): { rpcName: string; operationName: string } | null {
    let pathname = url.split("?")[0] ?? url;

    if (prefix) {
      const normalizedPrefix = prefix.startsWith("/") ? prefix : "/" + prefix;
      if (pathname.startsWith(normalizedPrefix)) {
        pathname = pathname.slice(normalizedPrefix.length);
      }
    }

    const segments = pathname.replace(/^\\/+|\\/+$/gu, "").split("/");
    if (segments.length < 2) {
      return null;
    }

    const operationName = segments.pop();
    const rpcName = segments.pop();
    if (!rpcName || !operationName) {
      return null;
    }

    return { rpcName, operationName };
  }

/**
 * Options for createNodeHandler.
 */
export interface NodeHandlerOptions {
  /**
   * URL path prefix to strip before parsing RPC/operation names.
   * Example: "/rpc" or "/api/v1"
   */
  prefix?: string;
}

  /**
   * Creates a Node.js HTTP request handler for a VDL Server.
   *
   * This handler can be used with:
   * - Native \`http.createServer()\`
   * - Express: \`app.use('/rpc', handler)\` or \`app.all('/rpc/*', handler)\`
   * - Fastify: \`fastify.all('/rpc/*', handler)\`
   * - Any Node.js HTTP framework
   *
   * @example
   * \`\`\`typescript
   * import { createServer } from "http";
   * import { Server } from "./gen/server";
   * import { createNodeHandler } from "./gen/adapters/node";
   *
   * const server = new Server<MyContext>();
   * // ... register handlers ...
   *
   * const handler = createNodeHandler(server, {
   *   prefix: "/rpc",
   * });
   *
   * // Native http
   * createServer(async (req, res) => {
   *   await handler(req, res);
   * }).listen(3000);
   *
   * // Express
   * app.use('/rpc', async (req, res, next) => {
   *   try {
   *     await handler(req, res);
   *   } catch (err) {
   *     next(err);
   *   }
   * });
   * \`\`\`
   *
   * @param server - The VDL Server instance
   * @param createContext - Optional function to create the context (props) from req/res
   * @param options - Handler options including path prefix
   * @returns An async function that handles Node.js HTTP requests
   */
  export function createNodeHandler<T = unknown>(
    server: Server<T>,
    createContext?: (req: IncomingMessage, res: ServerResponse) => T | Promise<T>,
    options?: NodeHandlerOptions,
  ): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
    const prefix = options?.prefix;

    return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
      const parsed = parseNodeRpcPath(req.url ?? "/", prefix);
      if (!parsed) {
        if (!res.headersSent) {
          res.writeHead(404, { "Content-Type": "application/json" });
        }

        res.end(
          JSON.stringify({
            ok: false,
            error: {
              code: "NOT_FOUND",
              message:
                "Invalid RPC path. Expected: /[prefix/]rpcName/operationName",
            },
          }),
        );
        return;
      }

      const reqWithBody = req as IncomingMessage & { body?: unknown };
      const adapter = new NodeAdapter(req, res, reqWithBody.body);

      let props: T;
      try {
        props = createContext
          ? await createContext(req, res)
          : (undefined as T);
      } catch (error) {
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
        }

        res.end(
          JSON.stringify({
            ok: false,
            error: {
              code: "CONTEXT_ERROR",
              message: "Failed to create request context",
              details: { originalError: String(error) },
            },
          }),
        );
        return;
      }

      try {
        await server.handleRequest(
          props,
          parsed.rpcName,
          parsed.operationName,
          adapter,
        );
      } catch (error) {
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
        }

        if (!res.writableEnded) {
          res.end(
            JSON.stringify({
              ok: false,
              error: {
                code: "INTERNAL_ERROR",
                message: "Internal server error",
                details: { originalError: String(error) },
              },
            }),
          );
        }
      }
    };
  }
`
);

// src/stages/emit/generate-files.ts
function generateFiles(context) {
  if (context.procedures.length === 0 && context.streams.length === 0) {
    return [];
  }
  return compact([
    context.options.target === "client" ? generateClientFile(context) : generateServerFile(context),
    context.options.target === "server" ? generateNodeAdapterFile(context) : void 0,
    context.options.target === "server" ? generateFetchAdapterFile(context) : void 0
  ]);
}
__name(generateFiles, "generateFiles");

// src/shared/naming.ts
function toInlineTypeName(parentTypeName, fieldName) {
  return `${parentTypeName}${pascalCase(fieldName)}`;
}
__name(toInlineTypeName, "toInlineTypeName");
function toClientOperationMethodName(rpcName, operationName) {
  return `${camelCase(rpcName)}${pascalCase(operationName)}`;
}
__name(toClientOperationMethodName, "toClientOperationMethodName");
function toStreamResponseTypeName(operationTypeName) {
  return `${operationTypeName}Response`;
}
__name(toStreamResponseTypeName, "toStreamResponseTypeName");

// src/stages/model/build-context.ts
function createGeneratorContext(options) {
  const services = [];
  for (const typeDef of options.input.ir.types) {
    if (!getAnnotation(typeDef.annotations, "rpc")) {
      continue;
    }
    services.push(buildServiceDescriptor(typeDef));
  }
  const procedures = [];
  const streams = [];
  for (const service of services) {
    procedures.push(...service.procedures);
    streams.push(...service.streams);
  }
  return {
    errors: [],
    context: {
      input: options.input,
      schema: options.input.ir,
      options: options.generatorOptions,
      services,
      procedures,
      streams
    }
  };
}
__name(createGeneratorContext, "createGeneratorContext");
function buildServiceDescriptor(typeDef) {
  var _a2;
  const operations = [];
  for (const field of (_a2 = typeDef.typeRef.objectFields) != null ? _a2 : []) {
    const operation = buildOperationDescriptor(typeDef, field);
    if (operation) {
      operations.push(operation);
    }
  }
  return {
    name: typeDef.name,
    accessorName: camelCase(typeDef.name),
    position: typeDef.position,
    doc: typeDef.doc,
    deprecated: getDeprecatedMessage2(typeDef.annotations),
    annotations: filterOperationalAnnotations(typeDef.annotations, "rpc"),
    operations,
    procedures: operations.filter((operation) => operation.kind === "proc"),
    streams: operations.filter((operation) => operation.kind === "stream")
  };
}
__name(buildServiceDescriptor, "buildServiceDescriptor");
function buildOperationDescriptor(serviceType, field) {
  const isProc = Boolean(getAnnotation(field.annotations, "proc"));
  const isStream = Boolean(getAnnotation(field.annotations, "stream"));
  if (!isProc && !isStream || isProc && isStream) {
    return void 0;
  }
  const inputField = findOperationField(field, "input");
  const outputField = findOperationField(field, "output");
  const operationTypeName = toInlineTypeName(serviceType.name, field.name);
  return {
    kind: isProc ? "proc" : "stream",
    rpcName: serviceType.name,
    rpcAccessorName: camelCase(serviceType.name),
    name: field.name,
    clientMethodName: toClientOperationMethodName(serviceType.name, field.name),
    serverMethodName: field.name,
    operationTypeName,
    streamResponseTypeName: toStreamResponseTypeName(operationTypeName),
    inputTypeName: inputField ? toInlineTypeName(operationTypeName, inputField.name) : void 0,
    outputTypeName: outputField ? toInlineTypeName(operationTypeName, outputField.name) : void 0,
    position: field.position,
    doc: field.doc,
    deprecated: getDeprecatedMessage2(field.annotations),
    annotations: filterOperationalAnnotations(
      field.annotations,
      isProc ? "proc" : "stream"
    ),
    inputField,
    outputField
  };
}
__name(buildOperationDescriptor, "buildOperationDescriptor");
function findOperationField(operationField, name) {
  var _a2;
  return (_a2 = operationField.typeRef.objectFields) == null ? void 0 : _a2.find(
    (field) => field.name === name
  );
}
__name(findOperationField, "findOperationField");
function getDeprecatedMessage2(annotations) {
  const argument = getAnnotationArg(annotations, "deprecated");
  if (!getAnnotation(annotations, "deprecated")) {
    return void 0;
  }
  if (!argument) {
    return "";
  }
  return unwrapLiteral(argument);
}
__name(getDeprecatedMessage2, "getDeprecatedMessage");
function filterOperationalAnnotations(annotations, marker) {
  return annotations.filter((annotation) => annotation.name !== marker);
}
__name(filterOperationalAnnotations, "filterOperationalAnnotations");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/options/get-option-string.js
function getOptionString(options, key, defaultValue) {
  const value = options === null || options === void 0 ? void 0 : options[key];
  return value === void 0 ? defaultValue : value;
}
__name(getOptionString, "getOptionString");

// src/stages/options/resolve.ts
function resolveGeneratorOptions(input) {
  const targetRaw = getOptionString(input.options, "target", "").trim();
  const typesImport = getOptionString(input.options, "typesImport", "").trim();
  const importExtensionRaw = getOptionString(input.options, "importExtension", "js").trim();
  const errors = [];
  const target = isGeneratorTarget(targetRaw) ? targetRaw : void 0;
  const importExtension = isImportExtension(importExtensionRaw) ? importExtensionRaw : void 0;
  if (!typesImport) {
    errors.push({
      message: 'Missing required option "typesImport". Point it to the output generated by varavelio/vdl-plugin-ts.'
    });
  }
  if (!target) {
    errors.push({
      message: 'Missing or invalid option "target". Use either "client" or "server".'
    });
  }
  if (!importExtension) {
    errors.push({
      message: `Invalid option "importExtension". Use one of: ${IMPORT_EXTENSION_VALUES.map((value) => JSON.stringify(value)).join(", ")}.`
    });
  }
  if (errors.length > 0 || !target || !importExtension) {
    return { errors };
  }
  return {
    errors: [],
    options: {
      target,
      typesImport,
      importExtension
    }
  };
}
__name(resolveGeneratorOptions, "resolveGeneratorOptions");
function isGeneratorTarget(value) {
  return value === "client" || value === "server";
}
__name(isGeneratorTarget, "isGeneratorTarget");
function isImportExtension(value) {
  return IMPORT_EXTENSION_VALUES.includes(value);
}
__name(isImportExtension, "isImportExtension");

// src/generate.ts
function generate(input) {
  try {
    const optionsResult = resolveGeneratorOptions(input);
    if (optionsResult.errors.length > 0 || !optionsResult.options) {
      return { errors: optionsResult.errors };
    }
    const rpcValidationErrors = validateIrForRpc(input.ir);
    if (rpcValidationErrors) {
      return { errors: rpcValidationErrors };
    }
    const contextResult = createGeneratorContext({
      input,
      generatorOptions: optionsResult.options
    });
    if (contextResult.errors.length > 0 || !contextResult.context) {
      return { errors: contextResult.errors };
    }
    return {
      files: generateFiles(contextResult.context)
    };
  } catch (error) {
    return {
      errors: [toPluginOutputError(error)]
    };
  }
}
__name(generate, "generate");

// src/index.ts
var generate2 = definePlugin((input) => generate(input));
