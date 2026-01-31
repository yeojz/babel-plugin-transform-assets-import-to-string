import type { PluginObj, NodePath, types } from '@babel/core';
import type { ImportDeclaration, CallExpression } from '@babel/types';
import { transform } from './transform.js';
import type { PluginOptions, CopyCache } from './types.js';

const DEFAULT_EXTENSIONS = ['.gif', '.jpeg', '.jpg', '.png', '.svg'];

function isRequireStatement(path: NodePath<CallExpression>): boolean {
  const callee = path.get('callee');
  return (
    !Array.isArray(callee) &&
    callee.isIdentifier() &&
    callee.node.name === 'require'
  );
}

function isValidArgument(path: NodePath<CallExpression>): boolean {
  const args = path.get('arguments');
  const arg = args[0];
  return arg !== undefined && arg.isStringLiteral();
}

interface PluginState {
  opts: PluginOptions;
  filename: string;
  cwd: string;
}

// Module-level cache shared across all files in a build
let buildCache: CopyCache | null = null;

export default function plugin(babel: {
  types: typeof types;
}): PluginObj<PluginState> {
  const t = babel.types;
  return {
    name: 'transform-assets-import-to-string',
    pre() {
      // Initialize cache at start of build if not exists
      if (!buildCache) {
        buildCache = {
          pathMap: new Map(),
          outputMap: new Map(),
        };
      }
    },
    post() {
      // Clear cache after build completes
      // Note: This runs per-file, so we don't clear here
      // Cache persists for the entire build
    },
    visitor: {
      ImportDeclaration(
        nodePath: NodePath<ImportDeclaration>,
        state: PluginState
      ) {
        const opts: PluginOptions = {
          baseUri: '',
          extensions: DEFAULT_EXTENSIONS,
          hashLength: 8,
          ...state.opts,
        };

        const projectRoot = state.cwd || process.cwd();

        transform(
          {
            path: nodePath,
            filename: state.filename,
            value: nodePath.node.source.value,
            callee: 'import',
          },
          opts,
          t,
          buildCache!,
          projectRoot
        );
      },
      CallExpression(nodePath: NodePath<CallExpression>, state: PluginState) {
        if (isRequireStatement(nodePath) && isValidArgument(nodePath)) {
          const args = nodePath.get('arguments');
          const arg = args[0];

          if (!arg.isStringLiteral()) return;

          const opts: PluginOptions = {
            baseUri: '',
            extensions: DEFAULT_EXTENSIONS,
            hashLength: 8,
            ...state.opts,
          };

          const projectRoot = state.cwd || process.cwd();

          transform(
            {
              path: nodePath,
              filename: state.filename,
              value: arg.node.value,
              callee: 'require',
            },
            opts,
            t,
            buildCache!,
            projectRoot
          );
        }
      },
    },
  };
}

// Export for testing - allows resetting cache between test runs
export function resetBuildCache(): void {
  buildCache = null;
}

export type { PluginOptions } from './types.js';
