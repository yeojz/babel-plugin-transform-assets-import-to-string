import transform from './transform';

const defaultOptions = {
  baseUri: '',
  extensions: ['.gif', '.jpeg', '.jpg', '.png', '.svg'],
  flatten: false
};

function isRequireStatement(p) {
  const callee = p.get('callee');
  return callee.isIdentifier() && callee.equals('name', 'require');
}

function isValidArgument(p) {
  const arg = p.get('arguments')[0];
  return arg && arg.isStringLiteral();
}

function initOptions(cache, state) {
  if (cache) {
    return cache;
  }

  return Object.assign({}, defaultOptions, state.opts);
}

function transformAssets({ types: t }) {
  return {
    pre() {
      this.optionCache = null;
    },
    post() {
      this.optionCache = null;
    },
    visitor: {
      ImportDeclaration(p, state) {
        this.optionCache = initOptions(this.optionCache, state);

        transform(
          {
            path: p,
            types: t,
            filename: state.file.opts.filename,
            value: p.node.source.value,
            callee: 'import'
          },
          this.optionCache
        );
      },
      CallExpression(p, state) {
        if (isRequireStatement(p) && isValidArgument(p)) {
          const arg = p.get('arguments')[0];
          this.optionCache = initOptions(this.optionCache, state);

          transform(
            {
              path: p,
              types: t,
              filename: state.file.opts.filename,
              value: arg.node.value,
              callee: 'require'
            },
            this.optionCache
          );
        }
      }
    }
  };
}

export default transformAssets;
