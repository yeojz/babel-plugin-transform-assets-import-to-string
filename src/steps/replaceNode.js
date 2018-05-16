function getVariableName(node) {
  if (node.specifiers && node.specifiers[0] && node.specifiers[0].local) {
    return node.specifiers[0].local.name;
  }
}

function replaceNode(scope, uri) {
  const content = scope.types.StringLiteral(uri);

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

export default replaceNode;
