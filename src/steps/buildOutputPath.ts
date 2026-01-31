import path from 'node:path';

export interface BuildOutputPathOptions {
  absPath: string;
  hash: string;
  preservePaths: string | undefined;
  projectRoot: string;
}

export function buildOutputPath(options: BuildOutputPathOptions): string {
  const { absPath, hash, preservePaths, projectRoot } = options;

  const ext = path.extname(absPath);
  const basename = path.basename(absPath, ext);
  const hashedName = hash ? `${basename}.${hash}${ext}` : `${basename}${ext}`;

  if (!preservePaths) {
    return hashedName;
  }

  // Normalize preservePaths: strip leading/trailing slashes
  const normalizedBase = preservePaths.replace(/^\/|\/$/g, '');

  // Get relative path from project root
  const relativePath = path.relative(projectRoot, absPath);

  // Find the preservePaths segment in the path
  const segments = relativePath.split(path.sep);
  const baseIndex = segments.indexOf(normalizedBase);

  let dirPath: string;
  if (baseIndex !== -1) {
    // Strip everything up to and including the base
    dirPath = segments.slice(baseIndex + 1, -1).join('/');
  } else {
    // Base not found, use full relative directory path
    dirPath = path.dirname(relativePath).split(path.sep).join('/');
  }

  if (dirPath && dirPath !== '.') {
    return `${dirPath}/${hashedName}`;
  }

  return hashedName;
}
