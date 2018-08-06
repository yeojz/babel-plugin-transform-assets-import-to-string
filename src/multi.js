import multiTransform from './mutliTransform';

const defaultOptions = {
  baseUri: '',
  extensions: ['.gif', '.jpeg', '.jpg', '.png', '.svg'],
  rules: [
    {
      pattern: '**/assets/**/*',
      to: '/${3}'
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

function createScope(path, state, types) {
  return {
    path,
    types,
    filename: state.file.opts.filename,
    value: path.node.source.value,
  }
}

function transformAssets({ types }) {
  return {
    pre() {
      this.pluginManifest = {};
      this.pluginOptions = formatOptions(this.opts);
    },
    visitor: {
      ImportDeclaration(path, state) {
        const scope = createScope(path, state, types);
        multiTransform(scope, this.pluginOptions);
      },
      // CallExpression(path, state) {
      //   if (isRequireStatement(path) && isValidArgument(path)) {

      //   }
      }
    },
    post() {
      // write manifest
    }
  };
}

export default transformAssets;
