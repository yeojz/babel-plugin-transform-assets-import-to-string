import path from 'path';

module.exports = {
  input: path.join(__dirname, 'src', 'index.js'),
  output: {
    file: path.join(__dirname, 'lib', 'index.js'),
    format: 'cjs',
    external: ['path', 'crypto', 'fs']
  }
};
