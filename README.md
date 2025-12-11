# xliff-simple

[![npm version](https://badge.fury.io/js/xliff-simple.svg)](https://www.npmjs.com/package/xliff-simple)
[![CI](https://github.com/beardcoder/xliff-simple/workflows/CI/badge.svg)](https://github.com/beardcoder/xliff-simple/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

A simple, minimal TypeScript library for reading, writing, and validating XLIFF (XML Localization Interchange File Format) files. Supports both XLIFF 1.2 and 2.0 with seamless conversion between versions.

## Features

- 📖 Parse XLIFF 1.2 and 2.0 files
- ✍️ Write XLIFF 1.2 and 2.0 files
- 🔄 Convert between XLIFF versions seamlessly
- ✅ Validate XLIFF documents
- 🎯 TypeScript support with full type definitions
- 🪶 Minimal and simple API
- ⚡ Fast XML processing with fast-xml-parser
- 🎨 Customizable output formatting

## Installation

```bash
npm install xliff-simple
```

or

```bash
bun add xliff-simple
```

or

```bash
yarn add xliff-simple
```

## Usage

### Parsing XLIFF Files

```typescript
import { parse } from 'xliff-simple';

const xliffContent = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
    <file id="f1">
        <unit id="hello">
            <segment>
                <source>Hello World</source>
            </segment>
        </unit>
    </file>
</xliff>`;

const document = parse(xliffContent);
console.log(document.version); // '2.0'
console.log(document.files[0]?.units[0]?.source); // 'Hello World'
```

### Writing XLIFF Files

```typescript
import { write, type XliffDocument } from 'xliff-simple';

const document: XliffDocument = {
  version: '2.0',
  files: [
    {
      id: 'f1',
      sourceLanguage: 'en',
      targetLanguage: 'de',
      units: [
        {
          id: 'hello',
          source: 'Hello World',
          target: 'Hallo Welt',
          state: 'final',
        },
      ],
    },
  ],
};

const xliff = write(document);
console.log(xliff);
```

### Converting Between Versions

```typescript
import { parse, write } from 'xliff-simple';

// Parse XLIFF 1.2
const xliff12 = parse(xliff12Content);

// Write as XLIFF 2.0
const xliff20Content = write(xliff12, '2.0');
```

### Validating XLIFF Documents

```typescript
import { validate } from 'xliff-simple';

const result = validate(document);

if (result.valid) {
  console.log('Document is valid');
} else {
  console.error('Validation errors:', result.errors);
}
```

### Customizing Output with Writer Options

```typescript
import { write, type WriterOptions } from 'xliff-simple';

const options: WriterOptions = {
  format: true, // Pretty-print output (default: true)
  indent: '  ', // Use 2-space indentation (default: 4 spaces)
  suppressXmlDeclaration: false, // Include XML declaration (default: false)
};

const xml = write(document, undefined, options);
```

**Available Options:**

- `format` (boolean): Enable pretty-printing with indentation. Set to `false` for minified output. Default: `true`
- `indent` (string): Indentation string (e.g., `'  '`, `'    '`, `'\t'`). Default: `'    '` (4 spaces)
- `suppressXmlDeclaration` (boolean): Omit the XML declaration (`<?xml ... ?>`). Default: `false`
- `ignoreAttributes` (boolean): Control attribute handling. Default: `false`
- `attributeNamePrefix` (string): Prefix for XML attributes. Default: `'@_'`

**Examples:**

```typescript
// Minified output
const minified = write(doc, undefined, { format: false });

// Tab indentation
const tabbed = write(doc, undefined, { indent: '\t' });

// No XML declaration (useful for embedding)
const noDecl = write(doc, undefined, { suppressXmlDeclaration: true });

// Combine version conversion with options
const converted = write(doc, '1.2', { indent: '  ' });
```

## API

### `parse(xmlContent: string): XliffDocument`

Parses an XLIFF XML string and returns a normalized document structure.

### `write(document: XliffDocument, targetVersion?: XliffVersion, options?: WriterOptions): string`

Writes an XLIFF document to an XML string.

**Parameters:**

- `document`: The XLIFF document to write
- `targetVersion` (optional): Target XLIFF version (`'1.2'` or `'2.0'`). If specified, converts the document to that version
- `options` (optional): Writer configuration options for controlling output format

**Returns:** XML string

### `validate(document: XliffDocument): ValidationResult`

Validates an XLIFF document and returns validation errors if any.

## Types

### `XliffDocument`

```typescript
interface XliffDocument {
  version: '1.2' | '2.0';
  files: TranslationFile[];
}
```

### `TranslationFile`

```typescript
interface TranslationFile {
  id: string;
  sourceLanguage: string;
  targetLanguage?: string;
  original?: string;
  datatype?: string;
  date?: string;
  productName?: string;
  units: TranslationUnit[];
}
```

### `TranslationUnit`

```typescript
interface TranslationUnit {
  id: string;
  source: string;
  target?: string;
  state?: 'initial' | 'translated' | 'reviewed' | 'final';
  note?: string;
}
```

### `WriterOptions`

```typescript
interface WriterOptions {
  format?: boolean;
  indent?: string;
  suppressXmlDeclaration?: boolean;
  ignoreAttributes?: boolean;
  attributeNamePrefix?: string;
}
```

## Development

### Setup

```bash
# Install dependencies
bun install
```

### Available Scripts

```bash
# Run tests
bun test

# Build for production
bun run build

# Development mode (watch)
bun run dev

# Type check
bun run type-check

# Lint code
bun run lint

# Lint and auto-fix
bun run lint:fix
```

### Code Quality

This project uses:

- **ESLint** - TypeScript linting with recommended rules
- **Prettier** - Code formatting with consistent style
- **Husky** - Git hooks for quality checks
- **lint-staged** - Run linters on staged files before commit

All code is automatically checked and formatted on commit via git hooks.

### Releasing

This project uses [release-it](https://github.com/release-it/release-it) for automated releases with conventional changelog generation.

**Release Process:**

```bash
# Patch release (0.1.0 -> 0.1.1)
bun run release

# Minor release (0.1.0 -> 0.2.0)
bun run release:minor

# Major release (0.1.0 -> 1.0.0)
bun run release:major
```

**What happens during a release:**

1. Runs linter, type check, and tests
2. Bumps version in package.json
3. Generates/updates CHANGELOG.md
4. Builds the project
5. Creates a git commit and tag
6. Pushes to GitHub
7. Creates a GitHub release
8. Publishes to npm (if running from GitHub Actions)

**GitHub Actions:**

- **CI Workflow**: Runs on every push and PR (lint, test, build)
- **Publish Workflow**: Automatically publishes to npm when a tag is pushed

**First-time setup:**

1. Add `NPM_TOKEN` to GitHub repository secrets
2. Generate token at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
3. Enable GitHub releases in repository settings

## License

MIT
