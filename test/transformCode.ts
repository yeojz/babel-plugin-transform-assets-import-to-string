import path from 'node:path';
import { transformFileSync } from '@babel/core';
import type { PluginOptions } from '../src/types.js';

const pluginPath = path.resolve(import.meta.dirname, '..', 'dist', 'index.cjs');

// Import from the compiled CJS module to ensure we reset the same cache
// instance that the plugin uses at runtime
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { resetBuildCache } = require(pluginPath) as {
  resetBuildCache: () => void;
};

export function transformCode(
  file: string,
  config: PluginOptions = {}
): { code: string | null | undefined } {
  // Reset cache between test runs
  resetBuildCache();

  const result = transformFileSync(file, {
    babelrc: false,
    configFile: false,
    plugins: [[pluginPath, config]],
  });

  return { code: result?.code };
}

export function getFixtures(name: string): string {
  return path.resolve(import.meta.dirname, 'fixtures', name);
}
