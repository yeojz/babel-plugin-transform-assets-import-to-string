import transform from './transform2';

function isRequireStatement(p) {
  const callee = p.get('callee');
  if (!callee.isIdentifier() || !callee.equals('name', 'require')) {
    return false;
  }
  return true;
}

function isValidArgument(p) {
  const arg = p.get('arguments')[0];
  if (!arg || !arg.isStringLiteral()) {
    return false;
  }
  return true;
}

function transformAssets({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(p, state) {
        transform(p, t, state, p.node.source.value, 'import');
      },
      CallExpression(p, state) {
        if (isRequireStatement(p) && isValidArgument(p)) {
          const arg = p.get('arguments')[0];
          transform(p, t, state, arg.node.value, 'require');
        }
      }
    }
  }
}

export default transformAssets;
