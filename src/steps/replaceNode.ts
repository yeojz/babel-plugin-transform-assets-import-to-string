import type { types as t } from '@babel/core';
import type { TransformScope } from '../types.js';

function getVariableName(node: t.ImportDeclaration): string | undefined {
  if (node.specifiers?.[0]?.type === 'ImportDefaultSpecifier') {
    return node.specifiers[0].local.name;
  }
  return undefined;
}

export function replaceNode(
  scope: TransformScope,
  uri: string,
  types: typeof t
): void {
  const content = types.stringLiteral(uri);

  if (scope.callee === 'require') {
    scope.path.replaceWith(content);
    return;
  }

  const importPath = scope.path as import('@babel/core').NodePath<t.ImportDeclaration>;
  const variableName = getVariableName(importPath.node);

  if (variableName) {
    scope.path.replaceWith(
      types.variableDeclaration('const', [
        types.variableDeclarator(types.identifier(variableName), content),
      ])
    );
  }
}
