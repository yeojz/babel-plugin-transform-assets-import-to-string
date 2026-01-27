# Modernization Design: babel-plugin-transform-assets-import-to-string

## Overview

Modernize the library to use TypeScript, Vitest, Turbo, and support the latest Babel 7.x.

## Decisions

| Decision | Choice |
|----------|--------|
| Node.js support | Node 20+ only |
| Package structure | Single package with Turbo for task orchestration |
| Distribution format | Dual ESM + CJS |
| Build tool | tsup |
| Test framework | Vitest |
| Test organization | Separate `test/` directory (migrated from current structure) |
| Babel compatibility | Babel 7.20+ only |

---

## Section 1: Project Structure

```
babel-plugin-transform-assets-import-to-string/
├── src/
│   ├── index.ts              # Main plugin entry (visitor definitions)
│   ├── transform.ts          # Transformation orchestration
│   ├── types.ts              # TypeScript types & interfaces
│   └── steps/
│       ├── filePath.ts       # Path resolution logic
│       ├── fileHash.ts       # SHA1 hash generation
│       └── replaceNode.ts    # AST node replacement
├── test/
│   ├── index.spec.ts         # Migrated test suite
│   ├── transformCode.ts      # Test helper
│   └── fixtures/             # Keep existing test fixtures
├── dist/                     # Built output (gitignored)
│   ├── index.js              # ESM entry
│   ├── index.cjs             # CJS entry
│   └── index.d.ts            # Type declarations
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── turbo.json
├── vitest.config.ts
└── README.md
```

The structure mirrors the current `src/` layout but with TypeScript. The `lib/` output folder becomes `dist/` (modern convention).

---

## Section 2: Package Configuration

**package.json:**

```json
{
  "name": "babel-plugin-transform-assets-import-to-string",
  "version": "2.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "engines": {
    "node": ">=20"
  }
}
```

**Dependencies:**

| Type | Package | Purpose |
|------|---------|---------|
| peer | `@babel/core` ^7.20.0 | Babel runtime (user provides) |
| dev | `@babel/core` ^7.20.0 | For testing |
| dev | `@types/babel__core` ^7 | TypeScript types for Babel plugin API |
| dev | `typescript` ~5.5 | Type checking |
| dev | `tsup` | Build ESM + CJS |
| dev | `vitest` | Test runner |
| dev | `turbo` | Task orchestration |
| dev | `prettier` | Formatting |
| dev | `eslint` + `typescript-eslint` | Linting |

**Note:** `@babel/core` becomes a peer dependency. `@babel/types` has built-in TypeScript types, but `@babel/core` and `@babel/traverse` still require `@types/*` packages.

---

## Section 3: Turbo & Scripts

**turbo.json:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "outputs": []
    }
  }
}
```

**npm scripts:**

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src test",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo",
    "check": "turbo lint typecheck test"
  }
}
```

**Workflow:**
- `npm run check` - Runs lint, typecheck, and test in parallel (via Turbo)
- `npm run build` - Builds with caching; subsequent builds skip if source unchanged
- Turbo provides local caching out of the box

---

## Section 4: TypeScript Types

**src/types.ts:**

```typescript
import type { PluginObj, NodePath } from '@babel/core';
import type { ImportDeclaration, CallExpression } from '@babel/types';

export interface PluginOptions {
  /** Base URL prefix (e.g., "https://cdn.example.com") */
  baseUri?: string;
  /** Directory path to extract from file path */
  baseDir?: string;
  /** File extensions to transform (default: ['.gif', '.jpeg', '.jpg', '.png', '.svg']) */
  extensions?: string[];
  /** Remove directory structure from paths */
  flatten?: boolean;
  /** Append SHA1 hash as query param (set to 1 to enable) */
  hash?: number;
}

export interface TransformContext {
  filename: string;
  opts: PluginOptions;
}

export type ImportNodePath = NodePath<ImportDeclaration>;
export type RequireNodePath = NodePath<CallExpression>;
```

---

## Section 5: Plugin Implementation

**src/index.ts:**

```typescript
import type { PluginObj } from '@babel/core';
import type { PluginOptions } from './types.js';
import { transformImport, transformRequire } from './transform.js';

const DEFAULT_EXTENSIONS = ['.gif', '.jpeg', '.jpg', '.png', '.svg'];

export default function plugin(): PluginObj<{ opts: PluginOptions }> {
  return {
    name: 'transform-assets-import-to-string',
    visitor: {
      ImportDeclaration(path, state) {
        const opts = { extensions: DEFAULT_EXTENSIONS, ...state.opts };
        transformImport(path, state.filename, opts);
      },
      CallExpression(path, state) {
        const opts = { extensions: DEFAULT_EXTENSIONS, ...state.opts };
        transformRequire(path, state.filename, opts);
      },
    },
  };
}

export type { PluginOptions } from './types.js';
```

**Key changes from current JS:**
- Explicit return type `PluginObj` for type safety
- Named export of `PluginOptions` type for consumer autocomplete
- ESM imports with `.js` extensions (required for ESM compatibility)
- Default options handled inline

---

## Section 6: Vitest Test Setup

**vitest.config.ts:**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.spec.ts'],
  },
});
```

**test/transformCode.ts:**

```typescript
import { transformSync } from '@babel/core';
import plugin from '../src/index.js';
import type { PluginOptions } from '../src/types.js';

export function transformCode(code: string, opts: PluginOptions = {}, filename = '/src/file.js') {
  const result = transformSync(code, {
    filename,
    plugins: [[plugin, opts]],
    configFile: false,
  });
  return result?.code ?? '';
}
```

**test/index.spec.ts (pattern):**

```typescript
import { describe, it, expect } from 'vitest';
import { transformCode } from './transformCode.js';

describe('babel-plugin-transform-assets-import-to-string', () => {
  describe('import statements', () => {
    it('transforms asset import to string', () => {
      const input = `import icon from './assets/icon.png';`;
      const output = transformCode(input, { baseUri: 'https://cdn.example.com' });

      expect(output).toContain('const icon = "https://cdn.example.com');
      expect(output).toContain('icon.png"');
    });

    it('ignores non-asset imports', () => {
      const input = `import React from 'react';`;
      const output = transformCode(input);

      expect(output).toContain('import React from');
    });
  });
});
```

---

## Section 7: Remaining Configuration

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**tsup.config.ts:**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
});
```

---

## Migration Checklist

### Files to Delete
- [ ] `.babelrc` (tsup handles build)
- [ ] `.nycrc` (Vitest has built-in coverage)
- [ ] `lib/` directory (replaced by `dist/`)

### Files to Create
- [ ] `tsconfig.json`
- [ ] `tsup.config.ts`
- [ ] `turbo.json`
- [ ] `vitest.config.ts`
- [ ] `src/types.ts`

### Files to Migrate (JS → TS)
- [ ] `src/index.js` → `src/index.ts`
- [ ] `src/transform.js` → `src/transform.ts`
- [ ] `src/steps/filePath.js` → `src/steps/filePath.ts`
- [ ] `src/steps/fileHash.js` → `src/steps/fileHash.ts`
- [ ] `src/steps/replaceNode.js` → `src/steps/replaceNode.ts`
- [ ] `test/index.spec.js` → `test/index.spec.ts`
- [ ] `test/transformCode.js` → `test/transformCode.ts`

### Files to Update
- [ ] `package.json` (dependencies, scripts, exports, engines)
- [ ] `.gitignore` (add `dist/`, `.turbo/`)
- [ ] `README.md` (usage examples, version requirements)
- [ ] `.eslintrc.json` → `eslint.config.js` (flat config with typescript-eslint)

### Version Change
- 1.2.0 → 2.0.0 (breaking: Node 20+, ESM primary)
