# VDL RPC TypeScript Plugin

## Summary

VDL is the open-source cross-language definition engine for modern stacks. Define your data structures, APIs, contracts, and generate type-safe code for your backend and frontend instantly.

This project contains a VDL plugin written in TypeScript that generates RPC-specific TypeScript code from annotation-based VDL services.

It intentionally does not generate business types, enums, or constants. Those come from `varavelio/vdl-plugin-ts`, and this plugin consumes that output through the required `typesImport` option.

To create the plugin, we are using the VDL Plugin SDK. It is IMPERATIVE that you download and read the manual for using the SDK BEFORE starting ANY task, as it defines and explains many important things. It is also important that you use the manual information when writing tests or any utility code, as it contains helpers that should be used whenever possible to avoid duplicating code and keep the code of all VDL plugins in a similar way.

VDL Plugin SDK manual URL (download and read it): https://vdl-plugin-sdk.varavel.com/llms.txt

## Maintaining this Document

After completing any task, review this file and update it if you made structural changes or discovered patterns worth documenting. Only add information that helps understand how to work with the project. Avoid implementation details, file listings, or trivial changes. This is a general guide, not a changelog.

When updating this document, do so with the context of the entire document in mind; do not simply add new sections at the end, but place them where they make the most sense within the context of the document.

## Working Notes

- Keep implementations aligned with SDK patterns from the manual.
- Use the SDK utility functions when possible to avoid duplicating code.
- Prefer SDK-native plugin errors (`fail`, `assert`, `PluginError`) and rely on `definePlugin` for top-level error normalization instead of maintaining custom error wrappers.
- Keep stage APIs fail-fast: resolve/model helpers should return concrete values and throw SDK errors when invalid, leaving top-level normalization to `definePlugin`.
- The source is organized by stages: `options` -> `model` -> `emit`, with shared helpers in `src/shared/`.
- `src/stages/emit/files/client/` and `src/stages/emit/files/server/` keep target-specific emit logic separate, with runtime source isolated per target.
- Generated RPC code should reuse `vdl-plugin-ts` runtime helpers for validation and hydration instead of re-implementing business type logic.
- Keep generated module exports intentional: expose user-facing entry points, but keep internal registries/runtime helpers unexported unless they are part of the external API contract.
- `e2e/fixtures/` contains static end-to-end fixtures ported from the old RPC test corpus. Each fixture is self-contained and validated by running VDL generation, TypeScript compilation, and runtime execution.
- Keep the E2E orchestrator readable by separating fixture discovery and execution phases (`clean -> generate -> typecheck -> runtime`) into small helpers.
