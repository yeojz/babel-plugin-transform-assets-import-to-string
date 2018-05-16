import path from 'path';

function filePath(absPath, options) {
  const file = absPath.split(options.baseDir || path.sep).pop();

  if (!options.baseDir) {
    return options.baseUri ? '/' + file : file;
  }

  const fileName = options.flatten ? path.basename(file) : file;

  return path
    .join(options.baseDir, fileName)
    .replace(/\\/g, '/')
    .replace(/\/\/g/, '/');
}

export default filePath;
