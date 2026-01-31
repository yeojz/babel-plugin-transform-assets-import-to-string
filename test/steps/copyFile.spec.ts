import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { copyFile, type CopyFileOptions } from '../../src/steps/copyFile.js';
import type { CopyCache } from '../../src/types.js';

describe('copyFile', () => {
  let tempDir: string;
  let cache: CopyCache;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'babel-plugin-test-'));
    cache = {
      pathMap: new Map(),
      outputMap: new Map(),
    };
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('copies file to outputDir', () => {
    const sourcePath = path.resolve(import.meta.dirname, '..', 'icon.svg');
    const options: CopyFileOptions = {
      absPath: sourcePath,
      outputPath: 'icon.abc123.svg',
      outputDir: tempDir,
      cache,
    };

    copyFile(options);

    const destPath = path.join(tempDir, 'icon.abc123.svg');
    expect(fs.existsSync(destPath)).toBe(true);
  });

  it('creates nested directories when needed', () => {
    const sourcePath = path.resolve(import.meta.dirname, '..', 'icon.svg');
    const options: CopyFileOptions = {
      absPath: sourcePath,
      outputPath: 'components/header/icon.abc123.svg',
      outputDir: tempDir,
      cache,
    };

    copyFile(options);

    const destPath = path.join(tempDir, 'components', 'header', 'icon.abc123.svg');
    expect(fs.existsSync(destPath)).toBe(true);
  });

  it('skips copy when same source already copied', () => {
    const sourcePath = path.resolve(import.meta.dirname, '..', 'icon.svg');
    const options: CopyFileOptions = {
      absPath: sourcePath,
      outputPath: 'icon.abc123.svg',
      outputDir: tempDir,
      cache,
    };

    copyFile(options);
    const firstStat = fs.statSync(path.join(tempDir, 'icon.abc123.svg'));

    // Second copy should be skipped
    copyFile(options);
    const secondStat = fs.statSync(path.join(tempDir, 'icon.abc123.svg'));

    expect(firstStat.mtimeMs).toBe(secondStat.mtimeMs);
  });

  it('updates cache after copying', () => {
    const sourcePath = path.resolve(import.meta.dirname, '..', 'icon.svg');
    const options: CopyFileOptions = {
      absPath: sourcePath,
      outputPath: 'icon.abc123.svg',
      outputDir: tempDir,
      cache,
    };

    copyFile(options);

    expect(cache.pathMap.get(sourcePath)).toBe('icon.abc123.svg');
    expect(cache.outputMap.get('icon.abc123.svg')).toBe(sourcePath);
  });

  describe('collision detection (hashLength: 0)', () => {
    it('throws error when different files have same output path', () => {
      const sourcePath1 = path.resolve(import.meta.dirname, '..', 'icon.svg');
      const sourcePath2 = path.resolve(import.meta.dirname, '..', 'fixtures', 'import-image.js');

      // First file
      copyFile({
        absPath: sourcePath1,
        outputPath: 'duplicate.svg',
        outputDir: tempDir,
        cache,
      });

      // Second file with same output path should throw
      expect(() => {
        copyFile({
          absPath: sourcePath2,
          outputPath: 'duplicate.svg',
          outputDir: tempDir,
          cache,
        });
      }).toThrow(/Filename collision detected/);
    });

    it('allows same file to be copied to same output path', () => {
      const sourcePath = path.resolve(import.meta.dirname, '..', 'icon.svg');

      copyFile({
        absPath: sourcePath,
        outputPath: 'icon.svg',
        outputDir: tempDir,
        cache,
      });

      // Same source to same output should not throw
      expect(() => {
        copyFile({
          absPath: sourcePath,
          outputPath: 'icon.svg',
          outputDir: tempDir,
          cache,
        });
      }).not.toThrow();
    });
  });
});
