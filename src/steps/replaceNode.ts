import type { types } from '@babel/core';
import type { TransformScope } from '../types.js';

function getVariableName(
  node: ReturnType<typeof types.importDeclaration>,
): string | undefined {
  if (node.specifiers?.[0]?.type === 'ImportDefaultSpecifier') {
    return node.specifiers[0].local.name;
  }
  return undefined;
}

export function replaceNode(
  scope: TransformScope,
  uri: string,
  t: typeof types,
): void {
  const content = t.stringLiteral(uri);

  if (scope.callee === 'require') {
    scope.path.replaceWith(content);
    return;
  }

  const importPath = scope.path as import('@babel/core').NodePath<
    ReturnType<typeof types.importDeclaration>
  >;
  const variableName = getVariableName(importPath.node);

  if (variableName) {
    scope.path.replaceWith(
      t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(variableName), content),
      ]),
    );
  }
}
