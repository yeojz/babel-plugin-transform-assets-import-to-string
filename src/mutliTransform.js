import path from 'path';
import nanomatch from 'nanomatch';

function getRelativePath(filename) {
  return path.relative(process.cwd(), path.resolve(filename));
}

function interpolate(to, result) {
  return result.reduceRight((str, value, idx) => {
    const pos = '\\$\\{' + (idx + 1) + '\\}';
    return str.replace(new RegExp(pos, 'g'), value);
  }, to);
}

function getVariableName(node) {
  if (node.specifiers && node.specifiers[0] && node.specifiers[0].local) {
    return node.specifiers[0].local.name;
  }
}

function replaceNode(scope, value) {
  const content = scope.types.StringLiteral(value);

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

  const filepath = getRelativePath(scope.filename);

  options.rules.some(rule => {
    const result = nanomatch.capture(rule.match, filepath);

    if (result) {
      const value = interpolate(rule.to, result);
      replaceNode(scope, value);
      return true;
    }
    return false;
  });
}

export default transform;
