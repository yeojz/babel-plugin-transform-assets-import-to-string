import multiTransform from './mutliTransform';

const defaultOptions = {
  baseUri: '',
  extensions: ['.gif', '.jpeg', '.jpg', '.png', '.svg'],
  matchOptions: {},
  rules: [
    {
      pattern: '**/*',
      to: '$1'
    }
  ]
};

function formatOptions(opts) {
  return Object.assign({}, defaultOptions, opts);
}

function isRequireStatement(path) {
  const callee = path.get('callee');
  return callee.isIdentifier() && callee.equals('name', 'require');
}

function isValidArgument(path) {
  const arg = path.get('arguments')[0];
  return arg && arg.isStringLiteral();
}

function transformAssets({ types }) {
  return {
    pre() {
      this.pluginManifest = {};
      this.pluginOptions = formatOptions(this.opts);
    },
    visitor: {
      ImportDeclaration(path, state) {
        const scope = {
          path,
          types,
          filename: state.file.opts.filename,
          value: path.node.source.value,
          callee: 'import'
        };

        multiTransform(scope, this.pluginOptions);
      },
      CallExpression(path, state) {
        if (isRequireStatement(path) && isValidArgument(path)) {
          const arg = path.get('arguments')[0];
          const scope = {
            path,
            types,
            filename: state.file.opts.filename,
            value: arg.node.value,
            callee: 'require'
          };

          multiTransform(scope, this.pluginOptions);
        }
      }
    },
    post() {
      // write manifest
    }
  };
}

export default transformAssets;
