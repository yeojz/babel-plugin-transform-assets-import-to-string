import fs from 'node:fs';
import path from 'node:path';
import type { CopyCache } from '../types.js';

export interface CopyFileOptions {
  absPath: string;
  outputPath: string;
  outputDir: string;
  cache: CopyCache;
}

export function copyFile(options: CopyFileOptions): void {
  const { absPath, outputPath, outputDir, cache } = options;

  // Check if already copied from this source
  if (cache.pathMap.has(absPath)) {
    return;
  }

  // Check for collision (different source, same output)
  const existingSource = cache.outputMap.get(outputPath);
  if (existingSource && existingSource !== absPath) {
    throw new Error(
      `Filename collision detected (hashLength is 0)\n` +
        `  - ${existingSource}\n` +
        `  - ${absPath}\n` +
        `  Both would output to: ${path.join(outputDir, outputPath)}\n` +
        `  Consider enabling hashLength or renaming one of the files.`,
    );
  }

  // Build full destination path
  const destPath = path.join(outputDir, outputPath);
  const destDir = path.dirname(destPath);

  // Create directories if needed
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy the file
  fs.copyFileSync(absPath, destPath);

  // Update cache
  cache.pathMap.set(absPath, outputPath);
  cache.outputMap.set(outputPath, absPath);
}
