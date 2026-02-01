import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';
import { transform } from '../src/transform.js';
import type { TransformScope, PluginOptions, CopyCache } from '../src/types.js';

// Mock the steps
vi.mock('../src/steps/fileHash.js', () => ({
  computeFileHash: vi.fn(() => 'abc12345'),
}));

vi.mock('../src/steps/buildOutputPath.js', () => ({
  buildOutputPath: vi.fn(() => 'logo.abc12345.svg'),
}));

vi.mock('../src/steps/copyFile.js', () => ({
  copyFile: vi.fn(),
}));

vi.mock('../src/steps/replaceNode.js', () => ({
  replaceNode: vi.fn(),
}));

import { computeFileHash } from '../src/steps/fileHash.js';
import { buildOutputPath } from '../src/steps/buildOutputPath.js';
import { copyFile } from '../src/steps/copyFile.js';
import { replaceNode } from '../src/steps/replaceNode.js';

describe('transform', () => {
  const mockTypes = {} as never;
  let cache: CopyCache;

  beforeEach(() => {
    vi.clearAllMocks();
    cache = { pathMap: new Map(), outputMap: new Map() };
  });

  it('skips files with non-matching extensions', () => {
    const scope: TransformScope = {
      path: {} as TransformScope['path'],
      filename: '/project/src/file.js',
      value: './module.js',
      callee: 'import',
    };

    const options: PluginOptions = {
      extensions: ['.png', '.svg'],
    };

    transform(scope, options, mockTypes, cache, '/project');

    expect(replaceNode).not.toHaveBeenCalled();
  });

  it('skips files when extensions option is undefined', () => {
    const scope: TransformScope = {
      path: {} as TransformScope['path'],
      filename: '/project/src/file.js',
      value: './image.png',
      callee: 'import',
    };

    const options: PluginOptions = {
      extensions: undefined,
    };

    transform(scope, options, mockTypes, cache, '/project');

    expect(replaceNode).not.toHaveBeenCalled();
  });

  it('skips node_modules paths', () => {
    const scope: TransformScope = {
      path: {} as TransformScope['path'],
      filename: '/project/node_modules/pkg/file.js',
      value: './icon.svg',
      callee: 'import',
    };

    const options: PluginOptions = {
      extensions: ['.svg'],
    };

    transform(scope, options, mockTypes, cache, '/project');

    expect(replaceNode).not.toHaveBeenCalled();
  });

  it('transforms matching file and replaces node', () => {
    const scope: TransformScope = {
      path: {} as TransformScope['path'],
      filename: '/project/src/file.js',
      value: './logo.svg',
      callee: 'import',
    };

    const options: PluginOptions = {
      extensions: ['.svg'],
      baseUri: 'https://cdn.example.com',
    };

    transform(scope, options, mockTypes, cache, '/project');

    expect(computeFileHash).toHaveBeenCalled();
    expect(buildOutputPath).toHaveBeenCalled();
    expect(replaceNode).toHaveBeenCalledWith(
      scope,
      'https://cdn.example.com/logo.abc12345.svg',
      mockTypes,
    );
  });

  it('calls copyFile when outputDir is set', () => {
    const scope: TransformScope = {
      path: {} as TransformScope['path'],
      filename: '/project/src/file.js',
      value: './logo.svg',
      callee: 'import',
    };

    const options: PluginOptions = {
      extensions: ['.svg'],
      outputDir: '/project/dist/assets',
    };

    transform(scope, options, mockTypes, cache, '/project');

    expect(copyFile).toHaveBeenCalledWith({
      absPath: path.resolve('/project/src', './logo.svg'),
      outputPath: 'logo.abc12345.svg',
      outputDir: '/project/dist/assets',
      cache,
    });
  });

  it('does not call copyFile when outputDir is not set', () => {
    const scope: TransformScope = {
      path: {} as TransformScope['path'],
      filename: '/project/src/file.js',
      value: './logo.svg',
      callee: 'import',
    };

    const options: PluginOptions = {
      extensions: ['.svg'],
    };

    transform(scope, options, mockTypes, cache, '/project');

    expect(copyFile).not.toHaveBeenCalled();
  });

  it('handles baseUri without trailing slash', () => {
    const scope: TransformScope = {
      path: {} as TransformScope['path'],
      filename: '/project/src/file.js',
      value: './logo.svg',
      callee: 'import',
    };

    const options: PluginOptions = {
      extensions: ['.svg'],
      baseUri: 'https://cdn.example.com/assets',
    };

    transform(scope, options, mockTypes, cache, '/project');

    expect(replaceNode).toHaveBeenCalledWith(
      scope,
      'https://cdn.example.com/assets/logo.abc12345.svg',
      mockTypes,
    );
  });

  it('handles baseUri with trailing slash', () => {
    const scope: TransformScope = {
      path: {} as TransformScope['path'],
      filename: '/project/src/file.js',
      value: './logo.svg',
      callee: 'import',
    };

    const options: PluginOptions = {
      extensions: ['.svg'],
      baseUri: 'https://cdn.example.com/assets/',
    };

    transform(scope, options, mockTypes, cache, '/project');

    expect(replaceNode).toHaveBeenCalledWith(
      scope,
      'https://cdn.example.com/assets/logo.abc12345.svg',
      mockTypes,
    );
  });

  it('uses default hashLength of 8 when not specified', () => {
    const scope: TransformScope = {
      path: {} as TransformScope['path'],
      filename: '/project/src/file.js',
      value: './logo.svg',
      callee: 'import',
    };

    const options: PluginOptions = {
      extensions: ['.svg'],
    };

    transform(scope, options, mockTypes, cache, '/project');

    expect(computeFileHash).toHaveBeenCalledWith(
      path.resolve('/project/src', './logo.svg'),
      8,
    );
  });

  it('uses custom hashLength when specified', () => {
    const scope: TransformScope = {
      path: {} as TransformScope['path'],
      filename: '/project/src/file.js',
      value: './logo.svg',
      callee: 'import',
    };

    const options: PluginOptions = {
      extensions: ['.svg'],
      hashLength: 12,
    };

    transform(scope, options, mockTypes, cache, '/project');

    expect(computeFileHash).toHaveBeenCalledWith(
      path.resolve('/project/src', './logo.svg'),
      12,
    );
  });
});
