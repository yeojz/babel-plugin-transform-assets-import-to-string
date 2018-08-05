import path from 'path';
import { transformFileSync } from 'babel-core';

const SOURCE = process.env.SOURCE_PATH || 'src';
const plugin = path.join(__dirname, '..', SOURCE, 'index.js');

console.log('[SOURCE FILE] ', SOURCE + '/index.js'); //eslint-disable-line

export function transformFile(file, config = {}) {
  const babelOptions = {
    babelrc: false,
    presets: [],
    plugins: [[plugin, config]]
  };
  return transformFileSync(file, babelOptions);
}

export function resolveFixture(filename) {
  return path.resolve(__dirname, 'fixtures', filename);
}

export function transformFixture(filename, config) {
  return transformFile(resolveFixture(filename), config).code;
}
