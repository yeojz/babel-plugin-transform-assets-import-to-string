import { describe, it, expect, vi, beforeEach } from 'vitest';
import plugin, { resetBuildCache } from '../src/index.js';

// Mock the transform function
vi.mock('../src/transform.js', () => ({
  transform: vi.fn(),
}));

import { transform } from '../src/transform.js';

describe('plugin', () => {
  const mockTypes = {
    stringLiteral: vi.fn(),
    variableDeclaration: vi.fn(),
    variableDeclarator: vi.fn(),
    identifier: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetBuildCache();
  });

  it('exports a function that returns a plugin object', () => {
    const result = plugin({ types: mockTypes as never });
    expect(result).toHaveProperty('name', 'transform-assets-import-to-string');
    expect(result).toHaveProperty('visitor');
    expect(result.visitor).toHaveProperty('ImportDeclaration');
    expect(result.visitor).toHaveProperty('CallExpression');
  });

  it('has pre and post hooks', () => {
    const result = plugin({ types: mockTypes as never });
    expect(result).toHaveProperty('pre');
    expect(result).toHaveProperty('post');
  });

  describe('ImportDeclaration visitor', () => {
    it('calls transform for import statements', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.ImportDeclaration as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        node: {
          source: { value: './logo.svg' },
        },
      };

      const mockState = {
        opts: { baseUri: 'https://cdn.example.com' },
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      // Initialize cache via pre hook
      pluginInstance.pre?.call(mockState as never);

      visitor(mockPath, mockState);

      expect(transform).toHaveBeenCalledWith(
        {
          path: mockPath,
          filename: '/project/src/file.js',
          value: './logo.svg',
          callee: 'import',
        },
        expect.objectContaining({
          baseUri: 'https://cdn.example.com',
          extensions: ['.gif', '.jpeg', '.jpg', '.png', '.svg'],
          hashLength: 8,
        }),
        mockTypes,
        expect.objectContaining({
          pathMap: expect.any(Map),
          outputMap: expect.any(Map),
        }),
        '/project',
      );
    });

    it('uses process.cwd() when state.cwd is not set', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.ImportDeclaration as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        node: {
          source: { value: './logo.svg' },
        },
      };

      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: undefined,
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      expect(transform).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        process.cwd(),
      );
    });
  });

  describe('CallExpression visitor', () => {
    it('calls transform for require statements with string literal', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.CallExpression as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        get: vi.fn((key: string) => {
          if (key === 'callee') {
            return {
              isIdentifier: () => true,
              node: { name: 'require' },
            };
          }
          if (key === 'arguments') {
            return [
              {
                isStringLiteral: () => true,
                node: { value: './icon.svg' },
              },
            ];
          }
        }),
      };

      const mockState = {
        opts: { baseUri: 'https://cdn.example.com' },
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      expect(transform).toHaveBeenCalledWith(
        {
          path: mockPath,
          filename: '/project/src/file.js',
          value: './icon.svg',
          callee: 'require',
        },
        expect.objectContaining({
          baseUri: 'https://cdn.example.com',
        }),
        mockTypes,
        expect.anything(),
        '/project',
      );
    });

    it('skips non-require call expressions', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.CallExpression as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        get: vi.fn((key: string) => {
          if (key === 'callee') {
            return {
              isIdentifier: () => true,
              node: { name: 'someFunction' },
            };
          }
          if (key === 'arguments') {
            return [
              {
                isStringLiteral: () => true,
                node: { value: './icon.svg' },
              },
            ];
          }
        }),
      };

      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      expect(transform).not.toHaveBeenCalled();
    });

    it('skips require with non-string-literal argument', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.CallExpression as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        get: vi.fn((key: string) => {
          if (key === 'callee') {
            return {
              isIdentifier: () => true,
              node: { name: 'require' },
            };
          }
          if (key === 'arguments') {
            return [
              {
                isStringLiteral: () => false,
                node: { type: 'Identifier', name: 'variable' },
              },
            ];
          }
        }),
      };

      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      expect(transform).not.toHaveBeenCalled();
    });

    it('skips require with no arguments', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.CallExpression as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        get: vi.fn((key: string) => {
          if (key === 'callee') {
            return {
              isIdentifier: () => true,
              node: { name: 'require' },
            };
          }
          if (key === 'arguments') {
            return [];
          }
        }),
      };

      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      expect(transform).not.toHaveBeenCalled();
    });

    it('skips when callee is not an identifier', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.CallExpression as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        get: vi.fn((key: string) => {
          if (key === 'callee') {
            return {
              isIdentifier: () => false,
              node: { type: 'MemberExpression' },
            };
          }
          if (key === 'arguments') {
            return [
              {
                isStringLiteral: () => true,
                node: { value: './icon.svg' },
              },
            ];
          }
        }),
      };

      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      expect(transform).not.toHaveBeenCalled();
    });

    it('skips when callee is an array (edge case)', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.CallExpression as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        get: vi.fn((key: string) => {
          if (key === 'callee') {
            return [{ isIdentifier: () => true, node: { name: 'require' } }];
          }
          if (key === 'arguments') {
            return [
              {
                isStringLiteral: () => true,
                node: { value: './icon.svg' },
              },
            ];
          }
        }),
      };

      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      expect(transform).not.toHaveBeenCalled();
    });

    it('handles argument that changes isStringLiteral result (defensive check)', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.CallExpression as (
        path: unknown,
        state: unknown,
      ) => void;

      let callCount = 0;
      const mockArg = {
        isStringLiteral: () => {
          callCount++;
          // First call (in isValidArgument) returns true, second call returns false
          return callCount === 1;
        },
        node: { value: './icon.svg' },
      };

      const mockPath = {
        get: vi.fn((key: string) => {
          if (key === 'callee') {
            return {
              isIdentifier: () => true,
              node: { name: 'require' },
            };
          }
          if (key === 'arguments') {
            return [mockArg];
          }
        }),
      };

      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      // Should not call transform due to the defensive check
      expect(transform).not.toHaveBeenCalled();
    });

    it('uses process.cwd() when state.cwd is not set in require', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.CallExpression as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        get: vi.fn((key: string) => {
          if (key === 'callee') {
            return {
              isIdentifier: () => true,
              node: { name: 'require' },
            };
          }
          if (key === 'arguments') {
            return [
              {
                isStringLiteral: () => true,
                node: { value: './icon.svg' },
              },
            ];
          }
        }),
      };

      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: undefined,
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      expect(transform).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        process.cwd(),
      );
    });
  });

  describe('cache management', () => {
    it('initializes cache in pre hook', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.ImportDeclaration as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        node: { source: { value: './logo.svg' } },
      };

      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      expect(transform).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          pathMap: expect.any(Map),
          outputMap: expect.any(Map),
        }),
        expect.anything(),
      );
    });

    it('reuses cache across multiple files in same build', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.ImportDeclaration as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        node: { source: { value: './logo.svg' } },
      };

      const mockState1 = {
        opts: {},
        filename: '/project/src/file1.js',
        cwd: '/project',
      };

      const mockState2 = {
        opts: {},
        filename: '/project/src/file2.js',
        cwd: '/project',
      };

      pluginInstance.pre?.call(mockState1 as never);
      visitor(mockPath, mockState1);

      const firstCacheArg = (transform as ReturnType<typeof vi.fn>).mock
        .calls[0][3];

      pluginInstance.pre?.call(mockState2 as never);
      visitor(mockPath, mockState2);

      const secondCacheArg = (transform as ReturnType<typeof vi.fn>).mock
        .calls[1][3];

      expect(firstCacheArg).toBe(secondCacheArg);
    });

    it('resetBuildCache clears the cache', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const visitor = pluginInstance.visitor!.ImportDeclaration as (
        path: unknown,
        state: unknown,
      ) => void;

      const mockPath = {
        node: { source: { value: './logo.svg' } },
      };

      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      const firstCacheArg = (transform as ReturnType<typeof vi.fn>).mock
        .calls[0][3];

      resetBuildCache();

      pluginInstance.pre?.call(mockState as never);
      visitor(mockPath, mockState);

      const secondCacheArg = (transform as ReturnType<typeof vi.fn>).mock
        .calls[1][3];

      expect(firstCacheArg).not.toBe(secondCacheArg);
    });

    it('post hook exists and can be called', () => {
      const pluginInstance = plugin({ types: mockTypes as never });
      const mockState = {
        opts: {},
        filename: '/project/src/file.js',
        cwd: '/project',
      };

      // Should not throw
      expect(() => pluginInstance.post?.call(mockState as never)).not.toThrow();
    });
  });
});
