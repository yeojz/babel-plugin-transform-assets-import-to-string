import crypto from 'node:crypto';
import fs from 'node:fs';

/**
 * Compute SHA1 content hash of a file
 * @param absPath - Absolute path to the file
 * @param hashLength - Number of hex characters to return (0 = no hash)
 * @returns Hash string or empty string if hashLength is 0
 */
export function computeFileHash(absPath: string, hashLength: number): string {
  if (hashLength === 0) {
    return '';
  }

  const content = fs.readFileSync(absPath);

  const hash = crypto
    .createHash('sha1')
    .update(content)
    .digest('hex')
    .slice(0, hashLength);

  return hash;
}
