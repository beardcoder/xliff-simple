# Contributing to xliff-simple

Thank you for your interest in contributing to xliff-simple!

## Development Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/xliff-simple.git
cd xliff-simple
```

2. **Install dependencies**

```bash
bun install
```

3. **Run tests**

```bash
bun test
```

## Development Workflow

### Making Changes

1. Create a new branch for your feature/fix:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes
3. Run linter and tests:

```bash
bun run lint
bun run type-check
bun test
```

4. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in parser"
git commit -m "docs: update README"
```

**Commit Types:**

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or modifications
- `chore:` - Build process or tooling changes

### Code Quality

All commits are automatically checked by:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Tests** - Unit tests

These checks run via git hooks before each commit.

### Pull Requests

1. Push your branch to GitHub
2. Create a Pull Request
3. Wait for CI checks to pass
4. Address any review feedback

## Project Structure

```
xliff-simple/
├── src/
│   ├── index.ts          # Public API exports
│   ├── types.ts          # TypeScript type definitions
│   ├── parser.ts         # XLIFF parsing logic
│   ├── writer.ts         # XLIFF writing logic
│   ├── validator.ts      # XLIFF validation logic
│   └── *.test.ts         # Test files
├── dist/                 # Built output (gitignored)
└── .github/workflows/    # CI/CD workflows
```

## Testing

- Write tests for all new features
- Ensure all tests pass before submitting PR
- Aim for high test coverage
- Test both XLIFF 1.2 and 2.0 formats

```bash
# Run tests
bun test

# Run tests in watch mode
bun test --watch
```

## Building

```bash
# Build once
bun run build

# Build and watch for changes
bun run dev
```

## Release Process

Releases are handled by maintainers using `release-it`:

```bash
bun run release        # Patch version
bun run release:minor  # Minor version
bun run release:major  # Major version
```

## Questions?

Feel free to open an issue for any questions or concerns!
