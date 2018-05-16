import path from 'path';
import filePath from './steps/filePath';
import fileHash from './steps/fileHash';
import replaceNode from './steps/replaceNode';

function transform(scope, options) {
  const ext = path.extname(scope.value);

  if (!options.extensions || options.extensions.indexOf(ext) < 0) {
    return;
  }

  const dir = path.dirname(path.resolve(scope.filename));
  const absPath = path.resolve(dir, scope.value);

  let fp = filePath(absPath, options);
  fp = fileHash(fp, absPath, options);

  replaceNode(scope, `${options.baseUri}${fp}`);
}

export default transform;
