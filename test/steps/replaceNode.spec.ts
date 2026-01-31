import { describe, it, expect, vi } from 'vitest';
import { replaceNode } from '../../src/steps/replaceNode.js';
import type { TransformScope } from '../../src/types.js';

describe('replaceNode', () => {
  const mockTypes = {
    stringLiteral: vi.fn((value: string) => ({ type: 'StringLiteral', value })),
    variableDeclaration: vi.fn((kind: string, declarations: unknown[]) => ({
      type: 'VariableDeclaration',
      kind,
      declarations,
    })),
    variableDeclarator: vi.fn((id: unknown, init: unknown) => ({
      type: 'VariableDeclarator',
      id,
      init,
    })),
    identifier: vi.fn((name: string) => ({ type: 'Identifier', name })),
  };

  describe('require statements', () => {
    it('replaces require with string literal', () => {
      const replaceWith = vi.fn();
      const scope: TransformScope = {
        path: { replaceWith } as unknown as TransformScope['path'],
        filename: '/test/file.js',
        value: './image.png',
        callee: 'require',
      };

      replaceNode(scope, 'https://cdn.example.com/image.abc123.png', mockTypes as never);

      expect(mockTypes.stringLiteral).toHaveBeenCalledWith(
        'https://cdn.example.com/image.abc123.png'
      );
      expect(replaceWith).toHaveBeenCalledWith({
        type: 'StringLiteral',
        value: 'https://cdn.example.com/image.abc123.png',
      });
    });
  });

  describe('import statements', () => {
    it('replaces import with variable declaration when default specifier exists', () => {
      const replaceWith = vi.fn();
      const scope: TransformScope = {
        path: {
          replaceWith,
          node: {
            specifiers: [
              {
                type: 'ImportDefaultSpecifier',
                local: { name: 'myImage' },
              },
            ],
          },
        } as unknown as TransformScope['path'],
        filename: '/test/file.js',
        value: './image.png',
        callee: 'import',
      };

      replaceNode(scope, 'https://cdn.example.com/image.abc123.png', mockTypes as never);

      expect(mockTypes.identifier).toHaveBeenCalledWith('myImage');
      expect(mockTypes.variableDeclaration).toHaveBeenCalledWith('const', expect.any(Array));
      expect(replaceWith).toHaveBeenCalled();
    });

    it('does not replace when no default specifier', () => {
      const replaceWith = vi.fn();
      const scope: TransformScope = {
        path: {
          replaceWith,
          node: {
            specifiers: [],
          },
        } as unknown as TransformScope['path'],
        filename: '/test/file.js',
        value: './image.png',
        callee: 'import',
      };

      replaceNode(scope, 'https://cdn.example.com/image.abc123.png', mockTypes as never);

      expect(replaceWith).not.toHaveBeenCalled();
    });

    it('does not replace when specifier is not ImportDefaultSpecifier', () => {
      const replaceWith = vi.fn();
      const scope: TransformScope = {
        path: {
          replaceWith,
          node: {
            specifiers: [
              {
                type: 'ImportNamespaceSpecifier',
                local: { name: 'myImage' },
              },
            ],
          },
        } as unknown as TransformScope['path'],
        filename: '/test/file.js',
        value: './image.png',
        callee: 'import',
      };

      replaceNode(scope, 'https://cdn.example.com/image.abc123.png', mockTypes as never);

      expect(replaceWith).not.toHaveBeenCalled();
    });
  });
});
