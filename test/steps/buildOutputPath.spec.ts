import { describe, it, expect } from 'vitest';
import { buildOutputPath } from '../../src/steps/buildOutputPath.js';

describe('buildOutputPath', () => {
  describe('flattened output (no preservePaths)', () => {
    it('returns filename with hash', () => {
      const result = buildOutputPath({
        absPath: '/project/src/components/header/logo.svg',
        hash: 'a1b2c3d4',
        preservePaths: undefined,
        projectRoot: '/project',
      });
      expect(result).toBe('logo.a1b2c3d4.svg');
    });

    it('returns filename without hash when hash is empty', () => {
      const result = buildOutputPath({
        absPath: '/project/src/components/header/logo.svg',
        hash: '',
        preservePaths: undefined,
        projectRoot: '/project',
      });
      expect(result).toBe('logo.svg');
    });
  });

  describe('preserved paths', () => {
    it('strips preservePaths base and keeps rest', () => {
      const result = buildOutputPath({
        absPath: '/project/src/components/header/logo.svg',
        hash: 'a1b2c3d4',
        preservePaths: 'src',
        projectRoot: '/project',
      });
      expect(result).toBe('components/header/logo.a1b2c3d4.svg');
    });

    it('uses full relative path when preservePaths not in path', () => {
      const result = buildOutputPath({
        absPath: '/project/lib/icons/logo.svg',
        hash: 'a1b2c3d4',
        preservePaths: 'src',
        projectRoot: '/project',
      });
      expect(result).toBe('lib/icons/logo.a1b2c3d4.svg');
    });

    it('handles preservePaths with leading slash', () => {
      const result = buildOutputPath({
        absPath: '/project/src/components/logo.svg',
        hash: 'abc123',
        preservePaths: '/src',
        projectRoot: '/project',
      });
      expect(result).toBe('components/logo.abc123.svg');
    });

    it('handles preservePaths with trailing slash', () => {
      const result = buildOutputPath({
        absPath: '/project/src/components/logo.svg',
        hash: 'abc123',
        preservePaths: 'src/',
        projectRoot: '/project',
      });
      expect(result).toBe('components/logo.abc123.svg');
    });
  });

  describe('edge cases', () => {
    it('handles files in project root', () => {
      const result = buildOutputPath({
        absPath: '/project/logo.svg',
        hash: 'abc123',
        preservePaths: undefined,
        projectRoot: '/project',
      });
      expect(result).toBe('logo.abc123.svg');
    });

    it('normalizes Windows-style paths to forward slashes', () => {
      const result = buildOutputPath({
        absPath: '/project/src/components/logo.svg',
        hash: 'abc123',
        preservePaths: 'src',
        projectRoot: '/project',
      });
      // Result should always use forward slashes
      expect(result).not.toContain('\\');
      expect(result).toBe('components/logo.abc123.svg');
    });
  });
});
