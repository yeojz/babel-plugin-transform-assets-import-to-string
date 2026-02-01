import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { transformCode, getFixtures } from './transformCode.js';

describe('babel-plugin-transform-assets-import-to-string', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'babel-plugin-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('URI transformation (no outputDir)', () => {
    it('transforms import with baseUri and default hash', () => {
      const result = transformCode(getFixtures('import-nested.js'), {
        baseUri: 'https://cdn.example.com/assets',
      });
      // Hash is content-based, so we check the pattern
      expect(result.code).toMatch(
        /const logo = "https:\/\/cdn\.example\.com\/assets\/logo\.[a-f0-9]{8}\.svg";/,
      );
    });

    it('transforms import without baseUri', () => {
      const result = transformCode(getFixtures('import-nested.js'));
      expect(result.code).toMatch(/const logo = "logo\.[a-f0-9]{8}\.svg";/);
    });

    it('transforms import with hashLength: 0', () => {
      const result = transformCode(getFixtures('import-nested.js'), {
        baseUri: 'https://cdn.example.com/assets',
        hashLength: 0,
      });
      expect(result.code).toBe(
        'const logo = "https://cdn.example.com/assets/logo.svg";',
      );
    });

    it('transforms import with preservePaths', () => {
      const result = transformCode(getFixtures('import-nested.js'), {
        baseUri: 'https://cdn.example.com/assets',
        preservePaths: 'fixtures',
      });
      expect(result.code).toMatch(
        /const logo = "https:\/\/cdn\.example\.com\/assets\/components\/header\/logo\.[a-f0-9]{8}\.svg";/,
      );
    });

    it('transforms require statements', () => {
      const result = transformCode(getFixtures('require-image.js'), {
        baseUri: 'https://cdn.example.com/assets',
      });
      expect(result.code).toMatch(
        /const test = "https:\/\/cdn\.example\.com\/assets\/icon\.[a-f0-9]{8}\.svg";/,
      );
    });

    it('skips non-matching extensions', () => {
      const result = transformCode(getFixtures('import-no-ext.js'));
      expect(result.code).toBe("import test from 'something';");
    });

    it('skips require with non-matching extensions', () => {
      const result = transformCode(getFixtures('require-no-ext.js'));
      expect(result.code).toBe("const test = require('something');");
    });
  });

  describe('file copying (with outputDir)', () => {
    it('copies file to outputDir', () => {
      transformCode(getFixtures('import-nested.js'), {
        baseUri: 'https://cdn.example.com/assets',
        outputDir: tempDir,
      });

      const files = fs.readdirSync(tempDir);
      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/^logo\.[a-f0-9]{8}\.svg$/);
    });

    it('copies file with preserved paths', () => {
      transformCode(getFixtures('import-nested.js'), {
        baseUri: 'https://cdn.example.com/assets',
        outputDir: tempDir,
        preservePaths: 'fixtures',
      });

      const destPath = path.join(tempDir, 'components', 'header');
      expect(fs.existsSync(destPath)).toBe(true);

      const files = fs.readdirSync(destPath);
      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/^logo\.[a-f0-9]{8}\.svg$/);
    });

    it('creates outputDir if it does not exist', () => {
      const nestedOutput = path.join(tempDir, 'nested', 'output');

      transformCode(getFixtures('import-nested.js'), {
        outputDir: nestedOutput,
      });

      expect(fs.existsSync(nestedOutput)).toBe(true);
    });
  });

  describe('custom extensions', () => {
    it('respects custom extensions list', () => {
      const result = transformCode(getFixtures('import-nested.js'), {
        extensions: ['.png'], // svg not included
      });
      // Should not transform since .svg is not in extensions
      expect(result.code).toMatch(/import logo from/);
    });
  });

  describe('hashLength options', () => {
    it('uses custom hashLength', () => {
      const result = transformCode(getFixtures('import-nested.js'), {
        hashLength: 12,
      });
      expect(result.code).toMatch(/logo\.[a-f0-9]{12}\.svg/);
    });

    it('produces consistent hash for same file', () => {
      const result1 = transformCode(getFixtures('import-nested.js'));
      const result2 = transformCode(getFixtures('import-nested.js'));
      expect(result1.code).toBe(result2.code);
    });
  });
});
