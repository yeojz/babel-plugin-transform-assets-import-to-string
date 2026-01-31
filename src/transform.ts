import path from 'node:path';
import type { types as t } from '@babel/core';
import { computeFileHash } from './steps/fileHash.js';
import { buildOutputPath } from './steps/buildOutputPath.js';
import { copyFile } from './steps/copyFile.js';
import { replaceNode } from './steps/replaceNode.js';
import type { PluginOptions, TransformScope, CopyCache } from './types.js';

export function transform(
  scope: TransformScope,
  options: PluginOptions,
  types: typeof t,
  cache: CopyCache,
  projectRoot: string
): void {
  const ext = path.extname(scope.value);

  if (!options.extensions || !options.extensions.includes(ext)) {
    return;
  }

  const dir = path.dirname(path.resolve(scope.filename));
  const absPath = path.resolve(dir, scope.value);

  // Skip node_modules
  if (absPath.includes('node_modules')) {
    return;
  }

  // Compute content hash
  const hashLength = options.hashLength ?? 8;
  const hash = computeFileHash(absPath, hashLength);

  // Build output path
  const outputPath = buildOutputPath({
    absPath,
    hash,
    preservePaths: options.preservePaths,
    projectRoot,
  });

  // Copy file if outputDir is set
  if (options.outputDir) {
    copyFile({
      absPath,
      outputPath,
      outputDir: options.outputDir,
      cache,
    });
  }

  // Build final URI
  const baseUri = options.baseUri || '';
  const separator = baseUri && !baseUri.endsWith('/') ? '/' : '';
  const uri = `${baseUri}${separator}${outputPath}`;

  replaceNode(scope, uri, types);
}
