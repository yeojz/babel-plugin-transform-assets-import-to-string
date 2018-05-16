import crypto from 'crypto';
import fs from 'fs';

function fileHash(fp, absPath, options) {
  if (options.hash !== 1) {
    return fp;
  }
  const content = fs.readFileSync(absPath, 'utf8').trim();

  const hash = crypto
    .createHash('sha1')
    .update(content, 'utf8')
    .digest('hex')
    .slice(0, 8);

  return `${fp}?${hash}`;
}

export default fileHash;
