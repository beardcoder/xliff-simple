# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an XLIFF parser and writer library built with TypeScript. The project is in early development with a minimal codebase structure.

## Development Commands

**Build**

```bash
bun run build
```

Uses `bunup` to build the TypeScript source into distributable JavaScript and type declarations in the `dist/` directory.

**Development Mode (Watch)**

```bash
bun run dev
```

Runs bunup in watch mode for continuous rebuilding during development.

**Type Checking**

```bash
bun run type-check
```

Runs TypeScript compiler to check types without emitting files.

## Architecture

### Build System

- **Runtime**: Bun (v1.3.3+)
- **Bundler**: bunup (v0.16.10) - handles transpilation and bundling
- **TypeScript**: Configured with strict mode and isolated declarations

### TypeScript Configuration

- Target: ES2023
- Module system: ESM with `"type": "module"` in package.json
- Uses `moduleResolution: "bundler"` and `verbatimModuleSyntax`
- Strict mode enabled with additional safety flags:
  - `noUncheckedIndexedAccess`
  - `noFallthroughCasesInSwitch`
  - `noImplicitOverride`
- Isolated declarations required for publishing

### Project Structure

- `src/` - Source TypeScript files
- `dist/` - Build output (gitignored)
- Entry point: `src/index.ts`

### Package Exports

The library is configured as an ESM package with typed exports:

- Main export: `./dist/index.js` with types at `./dist/index.d.ts`
- TypeScript is an optional peer dependency
