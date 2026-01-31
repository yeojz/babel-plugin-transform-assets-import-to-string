import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { computeFileHash } from '../../src/steps/fileHash.js';

describe('computeFileHash', () => {
  const fixturesDir = path.resolve(import.meta.dirname, '..', 'fixtures');

  it('returns hash of specified length', () => {
    const iconPath = path.resolve(import.meta.dirname, '..', 'icon.svg');
    const hash = computeFileHash(iconPath, 8);
    expect(hash).toHaveLength(8);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('returns empty string when hashLength is 0', () => {
    const iconPath = path.resolve(import.meta.dirname, '..', 'icon.svg');
    const hash = computeFileHash(iconPath, 0);
    expect(hash).toBe('');
  });

  it('returns consistent hash for same file', () => {
    const iconPath = path.resolve(import.meta.dirname, '..', 'icon.svg');
    const hash1 = computeFileHash(iconPath, 8);
    const hash2 = computeFileHash(iconPath, 8);
    expect(hash1).toBe(hash2);
  });

  it('returns different hash for different files', () => {
    const icon1 = path.resolve(fixturesDir, 'import-image.js');
    const icon2 = path.resolve(fixturesDir, 'require-image.js');
    const hash1 = computeFileHash(icon1, 8);
    const hash2 = computeFileHash(icon2, 8);
    expect(hash1).not.toBe(hash2);
  });

  it('respects custom hashLength', () => {
    const iconPath = path.resolve(import.meta.dirname, '..', 'icon.svg');
    const hash12 = computeFileHash(iconPath, 12);
    expect(hash12).toHaveLength(12);
  });
});
