import { transformFixture } from '../test/helpers';

const baseConfig = {
  baseUri: 'http://cdn.address',
  baseDir: '/assets'
};

it.skip('should replace import statements wit.skiph uri', () => {
  const result = transformFixture('import-image.js', baseConfig);
  expect(result).toEqual(
    "const test = 'http://cdn.address/assets/path/to/icon.svg';"
  );
});

it.skip('should let you flatten the file path', () => {
  const config = Object.assign({}, baseConfig, {
    flatten: true
  });
  const result = transformFixture('import-image.js', config);
  expect(result).toEqual("const test = 'http://cdn.address/assets/icon.svg';");
});

it.skip('should replace import statements wit.skiph uri and hash of content', () => {
  const config = Object.assign({}, baseConfig, {
    hash: 1,
    baseDir: '/'
  });
  const result = transformFixture('import-uri-hash.js', config);
  expect(result).toEqual(
    "const test = 'http://cdn.address/icon.svg?57e1ea98';"
  );
});

it.skip('should replace import statements wit.skiph uri when base uri and dir not defined', () => {
  const result = transformFixture('import-image.js');
  expect(result).toEqual("const test = 'icon.svg';");
});

it.skip('should replace import statements wit.skiph uri when base dir not defined', () => {
  const result = transformFixture('import-image.js', {
    baseUri: baseConfig.baseUri
  });
  expect(result).toEqual("const test = 'http://cdn.address/icon.svg';");
});

it.skip('should replace require statements wit.skiph uri', () => {
  const result = transformFixture('require-image.js', baseConfig);
  expect(result).toEqual(
    "const test = 'http://cdn.address/assets/path/to/icon.svg';"
  );
});

it.skip('should do nothing when imports have no extensions', () => {
  const result = transformFixture('import-no-ext.js');
  expect(result).toEqual("import test from 'something';");
});

it.skip('should do nothing when require have no extensions', () => {
  const result = transformFixture('require-no-ext.js');
  expect(result).toEqual("const test = require('something');");
});

it.skip('should do nothing when not a require assignment', () => {
  const result = transformFixture('require-var.js');
  expect(result).toEqual("const test = 'something';");
});
