import path from 'path';
import mm from 'micromatch';

const ROOT_DIR = process.env.PWD;

function getRelativePath(scope) {
  const dir = path.dirname(path.resolve(scope.filename));
  const absPath = path.resolve(dir, scope.value);
  return path.relative(ROOT_DIR, absPath);
}

function interpolate(str, resultset) {
  return str.replace(/\$(\d+)/g, (_, num) => resultset[num] || '');
}

function getVariableName(node) {
  if (node.specifiers && node.specifiers[0] && node.specifiers[0].local) {
    return node.specifiers[0].local.name;
  }
}

function replaceNode(scope, value) {
  const content = scope.types.StringLiteral(value);

  if (scope.callee === 'require') {
    scope.path.replaceWith(content);
    return;
  }

  const variableName = getVariableName(scope.path.node);
  if (variableName) {
    scope.path.replaceWith(
      scope.types.variableDeclaration('const', [
        scope.types.variableDeclarator(
          scope.types.identifier(variableName),
          content
        )
      ])
    );
  }
}

function transform(scope, options) {
  const ext = path.extname(scope.value);

  if (options.extensions.indexOf(ext) < 0) {
    return;
  }

  const filepath = getRelativePath(scope);

  options.rules.some(rule => {
    const result = mm.capture(rule.pattern, filepath, options.matchOptions);
    if (!result) {
      return false;
    }
    const value = interpolate(rule.to, result);
    replaceNode(scope, options.baseUri + value);
    return true;
  });
}

export default transform;
