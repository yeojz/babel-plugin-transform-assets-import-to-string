import type { NodePath } from '@babel/core';
import type {
  ImportDeclaration,
  CallExpression,
  StringLiteral,
  VariableDeclaration,
} from '@babel/types';

export interface PluginOptions {
  /** Base URL prefix (e.g., "https://cdn.example.com/assets") */
  baseUri?: string;
  /** Directory to copy assets to (enables file copying when set) */
  outputDir?: string;
  /** File extensions to transform (default: ['.gif', '.jpeg', '.jpg', '.png', '.svg']) */
  extensions?: string[];
  /** Content hash length in filename (default: 8, set 0 to disable) */
  hashLength?: number;
  /** Path base to strip when preserving paths (flattens if not set) */
  preservePaths?: string;
}

export interface TransformScope {
  path: NodePath<ImportDeclaration> | NodePath<CallExpression>;
  filename: string;
  value: string;
  callee: 'import' | 'require';
}

export type ReplacementNode = StringLiteral | VariableDeclaration;

/** Internal state for tracking copied files during a build */
export interface CopyCache {
  /** Maps absolute source path to output relative path */
  pathMap: Map<string, string>;
  /** Maps output filename to source path (for collision detection) */
  outputMap: Map<string, string>;
}
